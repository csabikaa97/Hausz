use actix_web::HttpResponse;
use crate::alap_fuggvenyek::{exit_ok, list_key};
use crate::{alap_fuggvenyek::exit_error, session::Session};
use crate::backend::lekerdezesek::általános_query_futtatás;
use crate::backend::ertesites_kuldes::teszt_értesítés;

static LOG_PREFIX: &str = "[push_noti] ";

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

pub async fn push_ertesites_kuldese(post: Vec<(String, String)>, session: Session) -> HttpResponse {
    return HttpResponse::Ok().body("admin_oldal");
}

