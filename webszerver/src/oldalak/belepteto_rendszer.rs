use actix_web::HttpResponse;
use crate::{session::Session, alap_fuggvenyek::{isset, list_key}, backend::lekerdezesek::{új_session_beillesztése, session_törlése}};
use crate::alap_fuggvenyek::exit_error;
use crate::alap_fuggvenyek::exit_ok;

static LOG_PREFIX: &str = "[belepteto] ";

pub fn belepteto_rendszer(post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session) -> HttpResponse {
    if isset("get_salt", post.clone()) {
        let salt_username: String;
        if session.loggedin == "yes".to_string() {
            salt_username = session.username;
        } else {
            salt_username = list_key("username", post);
        }

        let salt = match crate::backend::lekerdezesek::salt_lekerdezese(salt_username.as_str()) {
            Ok(result) => result,
            Err(err) => {
                println!("{}\"error\": \"{}\"", LOG_PREFIX, err);
                return HttpResponse::BadRequest().body(exit_error(format!("\"hiba\": \"Nem sikerült a salt lekérdezése.\"")));
            }
        };

        return HttpResponse::Ok().body(exit_ok(format!("\"salt\": \"{}\"", salt)));
    }

    if isset("login", post.clone()) {
        if !isset("username", post.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("\"hiba\": \"Nem adtál meg felhasználónevet.\"")));
        }
        if !isset("sha256_password", post.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("\"hiba\": \"Nem adtál meg jelszót.\"")));
        }

        let username = list_key("username", post.clone());
        let password = list_key("sha256_password", post.clone());
        
        let felhasznalo = match crate::backend::lekerdezesek::felhasznalo_lekerdezese(crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok::Felhasználónév(username.clone())) {
            Ok(Some(result)) => result,
            Ok(None) => {
                return HttpResponse::BadRequest().body(exit_error(format!("Hibás felhasználónév vagy jelszó.")));
            },
            Err(err) => {
                println!("{}\"error\": \"{}\"", LOG_PREFIX, err);
                return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült a salt lekérdezése az adatbázisból.")));
            }
        };

        let password_in_db = match crate::alap_fuggvenyek::get_password_part(crate::alap_fuggvenyek::JelszoReszek::Password, felhasznalo.sha256_jelszó.as_str()) {
            Ok(result) => result,
            Err(err) => {
                println!("{}\"error\": \"{}\"", LOG_PREFIX, err);
                return HttpResponse::BadRequest().body(exit_error(format!("\"hiba\": \"Nem sikerült a jelszó ellenőrzése.\"")));
            }
        };

        if password != password_in_db {
            println!("{}Jelszavak nem egyeznek! ({}) ({})", LOG_PREFIX, password, password_in_db);
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás felhasználónév vagy jelszó.")));
        }

        let új_cookie = crate::backend::session_azonosito_generator::random_új_session_azonosító();

        match új_session_beillesztése(új_cookie.clone(), felhasznalo) {
            Ok(_) => {},
            Err(hiba) => {
                println!("{}Hiba a session beillesztésekor: ({})", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("\"hiba\": \"Belső hiba.\"")));
            }
        }

        let cookie = actix_web::cookie::Cookie::build("hausz_session", új_cookie)
            .path("/")
            .secure(true)
            .http_only(true)
            .same_site(actix_web::cookie::SameSite::Strict)
            .max_age(time::Duration::seconds(259200))
            .finish();

        let mut valasz = HttpResponse::Ok()
            .body(exit_ok(format!("Sikeres belépés.")));

        match valasz.add_cookie(&cookie) {
            Ok(result) => result,
            Err(err) => {
                println!("{}\"error\": \"{}\"", LOG_PREFIX, err);
                return HttpResponse::BadRequest().body(exit_error(format!("\"hiba\": \"Nem sikerült a cookie hozzáadása.\"")));
            }
        };

        return valasz;
    }

    if isset("statusz", get.clone()) {
        if session.loggedin != "yes".to_string() {
            return HttpResponse::Ok().body(exit_error(format!("\"eredmeny\": \"hiba\", \"valasz\":\"Nem vagy belépve\"")));
        }

        return HttpResponse::Ok()
            .body(format!(
                    "{{\"eredmeny\": \"ok\", \"session_loggedin\": \"{}\", \"session_username\": \"{}\", \"session_user_id\": {}, \"session_admin\": \"{}\"}}", 
                    session.loggedin,
                    session.username,
                    session.user_id,
                    session.admin,
                ));
    }

    if isset("logout", get.clone()) {
        match session_törlése(session.cookie, session.user_id) {
            Ok(_) => { return HttpResponse::Ok().body(exit_ok(format!("\"eredmeny\": \"ok\", \"valasz\":\"Sikeres kilépés.\""))); },
            Err(hiba) => {
                println!("{}Hiba a session törlésekor: ({})", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("\"hiba\": \"Belső hiba.\"")));
            }
        }
    }

    println!("{}Ismeretlen szándék: POST=({:?}) GET=({:?})", LOG_PREFIX, post, get);
    HttpResponse::BadRequest().body(exit_error(format!("Ismeretlen szándék")))
}