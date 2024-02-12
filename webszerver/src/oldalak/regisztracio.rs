use actix_web::HttpResponse;
use crate::{session::Session, alap_fuggvenyek::{isset, list_key, log_bejegyzes}, backend::{lekerdezesek::{felhasznalo_lekerdezese, igényelt_felhasznalo_lekerdezese, általános_query_futtatás, meghívó_létezik}, session_azonosito_generator::random_új_session_azonosító}};
use crate::alap_fuggvenyek::exit_error;
use crate::alap_fuggvenyek::exit_ok;

static LOG_PREFIX: &str = "[regiszt..] ";

pub async fn regisztráció(post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session) -> HttpResponse {
    if isset("generate_salt", get.clone()) {
        let salt = random_új_session_azonosító();
        return HttpResponse::Ok().body(exit_ok(salt));
    }
    
    if !isset("regisztracio", post.clone()) {
        return HttpResponse::BadRequest().body(exit_error(format!("Mi a parancs?")));
    }

    if list_key("regisztracio_username", post.clone()).len() == 0 {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem adtál meg felhasználónevet")));
    }
    if list_key("regisztracio_password", post.clone()).len() == 0 {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem adtál meg jelszót")));
    }
    if list_key("regisztracio_password_confirm", post.clone()).len() == 0 {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem erősítetted meg a jelszavad")));
    }
    if list_key("regisztracio_username", post.clone()).len() < 3 {
        return HttpResponse::BadRequest().body(exit_error(format!("Túl rövid a felhasználóneved (minimum 3 karakter hosszúnak kell lennie)")));
    }
    if list_key("regisztracio_password", post.clone()).len() < 5 {
        return HttpResponse::BadRequest().body(exit_error(format!("Túl rövid a jelszavad (minimum 5 karakter hosszúnak kell lennie)")));
    }
    if list_key("regisztracio_password", post.clone()) != list_key("regisztracio_password_confirm", post.clone()) {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem egyeznek a megadott jelszavak")));
    }
    if !list_key("regisztracio_email", post.clone()).contains('@') && list_key("regisztracio_email", post.clone()).len() > 0 {
        return HttpResponse::BadRequest().body(exit_error(format!("Helytelen e-mail cím formátum")));
    }
    if list_key("regisztracio_password_salt", post.clone()).len() == 0 {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem adtál meg jelszó saltot")));
    }

    let username = list_key("regisztracio_username", post.clone());
    let regex = regex::Regex::new(r#"["'`]"#).unwrap();
    if regex.is_match(&username) {
        return HttpResponse::BadRequest().body(exit_error(format!("Illegális karaktert tartalmaz a felhasználóneved ( \' \" ` ).")));
    }
    let regex = regex::Regex::new(r#"[^a-zA-Z0-9-_\.#áűőúüóöéí]"#).unwrap();
    if regex.is_match(&username) {
        return HttpResponse::BadRequest().body(exit_error(format!("Illegális karaktert tartalmaz a felhasználóneved")));
    }
    let email = list_key("regisztracio_email", post.clone());
    let regex = regex::Regex::new(r#"^\S+@\S+\.\S+$"#).unwrap();
    if !regex.is_match(&email) && email.len() > 0 {
        return HttpResponse::BadRequest().body(exit_error(format!("Helytelen e-mail cím formátum")));
    }

    let password = list_key("regisztracio_password", post.clone());
    let salt = list_key("regisztracio_password_salt", post.clone());

    match felhasznalo_lekerdezese(crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok::Felhasználónév(list_key("regisztracio_username", post.clone()))) {
        Err(_) => {},
        Ok(None) => {},
        Ok(Some(_)) => {
            return HttpResponse::BadRequest().body(exit_error(format!("Már létezik ilyen felhasználó")));
        },
    }

    match igényelt_felhasznalo_lekerdezese(username.clone()) {
        Err(_) => {},
        Ok(_) => {
            return HttpResponse::BadRequest().body(exit_error(format!("Ez a felhasználónév már meg lett igényelve")));
        },
    };

    let mut use_meghivo = false;
    let mut table = "users_requested";
    if list_key("regisztracio_meghivo", post.clone()).len() > 0 {
        match meghívó_létezik(list_key("regisztracio_meghivo", post.clone())) {
            Ok(eredmeny) => {
                match eredmeny {
                    true => {},
                    false => {
                        return HttpResponse::BadRequest().body(exit_error(format!("Ez a meghívó nem létezik")));
                    },
                }
            },
            Err(_) => {
                return HttpResponse::BadRequest().body(exit_error(format!("Hibás meghívókód")));
            },
        };
        use_meghivo = true;
        table = "users";
    }

    let mut query_add = format!("INSERT INTO hausz_megoszto.{} (username, sha256_password, email) VALUES ('{}', '$SHA${}${}', ", table, username, salt, password);
    if email.len() > 0 {
        query_add = format!("{}'{}');", query_add, email);
    } else {
        query_add = format!("{} null);", query_add);
    }
    match általános_query_futtatás(query_add.clone()) {
        Ok(_) => {},
        Err(err) => {
            println!("{}Hiba az adatbázis lekérdezésekor: (9) {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba az adatbázis lekérdezésekor: (9) {}", err)));
        },
    };

    let mut buffer = format!("{} - {}", 
        list_key("regisztracio_username", post.clone()), 
        list_key("regisztracio_email", post.clone())
    );

    if use_meghivo {
        match általános_query_futtatás(format!("DELETE FROM meghivok WHERE meghivo = '{}'", list_key("regisztracio_meghivo", post.clone()))) {
            Ok(_) => {},
            Err(err) => {
                println!("{}Nem sikerült a meghívó törlése: ({}) ({})", LOG_PREFIX, username, err);
            },
        }
        buffer = format!("{} - Meghivo: {}", buffer, list_key("regisztracio_meghivo", post.clone()));
    }

    log_bejegyzes("hausz_alap", "regisztráció", buffer.as_str(), session.username.clone()).await;

    return HttpResponse::Ok().body(exit_ok(format!("Sikeres regisztráció")));
}