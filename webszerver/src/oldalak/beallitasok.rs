use actix_web::HttpResponse;
use crate::alap_fuggvenyek::{exit_ok, isset, list_key};
use crate::{alap_fuggvenyek::exit_error, session::Session};
use crate::backend::lekerdezesek::általános_query_futtatás;
use crate::backend::ertesites_kuldes::teszt_értesítés;
use crate::backend::lekerdezesek::saját_push_api_kulcsok_lekérése;
use crate::backend::lekerdezesek::saját_push_adatok_lekérése;

static LOG_PREFIX: &str = "[push_noti] ";

pub async fn új_api_kulcs_készítése(post: Vec<(String, String)>, session: Session) -> HttpResponse {
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }

    if !isset("api_kulcs_megjegyzes", post.clone()) {
        return HttpResponse::BadRequest().body(exit_error(format!("Nincs megadva API kulcs megjegyzés")));
    }

    match általános_query_futtatás(format!(
        "INSERT INTO push_ertesites_api_kulcsok (felhasznalo_azonosito, kulcs, megjegyzes) VALUES ({}, '{}', '{}')", 
        session.user_id,
        crate::backend::session_azonosito_generator::random_új_session_azonosító(),
        list_key("api_kulcs_megjegyzes", post.clone())
    )) {
        Ok(_) => {
            return HttpResponse::Ok().body(exit_ok(format!("Az API kulcs elkészítése sikeres")));
        },
        Err(err) => {
            println!("{}Nem sikerült az API kulcs mentése: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Nem sikerült az API kulcs elkészítése")));
        }
    }
}
pub async fn push_értesítés_adatok_törlése(post: Vec<(String, String)>, session: Session) -> HttpResponse {
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }

    if !isset("push_subscription_adat", post.clone()) {
        return HttpResponse::BadRequest().body(exit_error(format!("Nincs megadva keresendő subscription adat")));
    }

    match általános_query_futtatás(format!("DELETE FROM push_ertesites_adatok WHERE adatok = '{}'", list_key("push_subscription_adat", post.clone()))) {
        Ok(_) => {
            return HttpResponse::Ok().body(exit_ok(format!("Push értesítés adat törlése sikeres")));
        },
        Err(err) => {
            println!("{}Nem sikerült a push értesítés adat törlése: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Nem sikerült a push értesítés adat törlése")));
        }
    }
}

pub async fn push_értesítés_adatok_lekérdezése(session: Session) -> HttpResponse {
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }

    let push_adatok = match saját_push_adatok_lekérése(session.user_id) {
        Ok(kulcsok) => kulcsok,
        Err(err) => {
            println!("{}Hiba a saját push API kulcsok lekérése közben: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba")));
        }
    };

    let mut buffer = String::new();

    for push_adat in push_adatok {
        buffer += format!(
            "{}{{\"adat\": {}, \"megjegyzes\": \"{}\"}}",
                if buffer.len() == 0 {""} else {", "},
                push_adat.adatok,
                push_adat.megjegyzes
        ).as_str();
    }

    return HttpResponse::Ok().body(format!("{{\"eredmeny\": \"ok\", \"valasz\": [{}]}}", buffer));
}

pub async fn api_kulcsok_lekerdezese(session: Session) -> HttpResponse {
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }

    let api_kulcsok = match saját_push_api_kulcsok_lekérése(session.user_id) {
        Ok(kulcsok) => kulcsok,
        Err(err) => {
            println!("{}Hiba a saját push API kulcsok lekérése közben: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba")));
        }
    };

    let mut buffer = String::new();

    for kulcs in api_kulcsok {
        buffer += format!(
            "{}{{\"kulcs\": \"{}\", \"megjegyzes\": \"{}\"}}",
                if buffer.len() == 0 {""} else {", "},
                kulcs.kulcs,
                kulcs.megjegyzes
        ).as_str();
    }

    return HttpResponse::Ok().body(format!("{{\"eredmeny\": \"ok\", \"valasz\": [{}]}}", buffer));
}

pub async fn push_ertesites_adatok_mentese(post: Vec<(String, String)>, session: Session) -> HttpResponse {
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve.")));
    }

    let azonosito = session.user_id;
    let adatok = list_key("adatok", post.clone());
    let megjegyzes = list_key("megjegyzes", post.clone());

    let query = format!(
        "INSERT INTO `push_ertesites_adatok` (`felhasznalo_azonosito`, `adatok`, `megjegyzes`) VALUES ({}, '{}', '{}')",
            azonosito,
            adatok,
            megjegyzes
    );
    match általános_query_futtatás(query.clone()) {
        Ok(_) => {},
        Err(err) => {
            println!("{}Hiba a push adatok mentésekor: {}\nQuery:\n{}", LOG_PREFIX, err, query);
            return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
        }
    }

    std::thread::sleep(std::time::Duration::from_secs(4));

    let mut szoveg = "A push adatok sikeresen el lettek mentve".to_string();

    match teszt_értesítés(adatok).await {
        Ok(_) => {
            szoveg += ", és teszt értesítés sikeresen el lett elküldve.";
        },
        Err(err) => {
            println!("{}Hiba az értesítés küldésekor: {}", LOG_PREFIX, err);
            szoveg += ", de a teszt értesítés küldése közben hiba történt.";
        }
    }

    return HttpResponse::Ok().body(exit_ok(szoveg));
}

