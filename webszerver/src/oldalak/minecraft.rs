use actix_web::HttpResponse;
use crate::{session::Session, alap_fuggvenyek::{isset, log_bejegyzes, list_key}, backend::{lekerdezesek::{általános_query_futtatás, saját_meghívók_lekérése, minecraft_felhasználó_létezik, minecraft_játékosok_lekérdezése}, session_azonosito_generator::random_új_session_azonosító}};
use crate::alap_fuggvenyek::exit_error;
use crate::alap_fuggvenyek::exit_ok;

static LOG_PREFIX: &str = "[minecraft] ";

pub fn minecraft(post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session) -> HttpResponse {
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }

    if isset("felhasznalonev_info", get.clone()) {
        if session.minecraft_username.len() <= 0 {
            return HttpResponse::Ok().body(exit_error(format!("\"minecraft_username\": \"\"")));
        }

        return HttpResponse::Ok().body(exit_ok(format!("\"minecraft_username\": \"{}\"", session.minecraft_username)));
    }

    if isset("felhasznalonev_valtoztatas", get.clone()) {
        if list_key("uj_felhasznalonev", post.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nincs megadva új felhasználónév")));
        }
        let uj_felhasznalonev = list_key("uj_felhasznalonev", post.clone());

        if !regex::Regex::new(r"^([a-zA-Z0-9_]{3,16})$").unwrap().is_match(&uj_felhasznalonev) {
            return HttpResponse::BadRequest().body(exit_error(format!("A felhasználónév csak az angol ABC betűit, számokat, illetve '_' karaktert tartalmazhat, és 3-16 karakter hosszúnak kell lennie.")));
        }

        if match minecraft_felhasználó_létezik(uj_felhasznalonev.clone()) {
            Ok(eredmeny) => eredmeny,
            Err(hiba) => {
                println!("{}Hiba a minecraft_felhasználó_létezik függvényben: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        } {
            return HttpResponse::BadRequest().body(exit_error(format!("Már létezik ilyen Minecraft felhasználónév az adatbázisban.")));
        }

        match általános_query_futtatás(format!("UPDATE hausz_megoszto.users SET minecraft_username = '{}' WHERE id = {}", uj_felhasznalonev, session.user_id)) {
            Ok(_) => {},
            Err(hiba) => {
                println!("{}Hiba az általános_query_futtatás függvényben: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba: {}", hiba)));
            }
        }

        log_bejegyzes("hausz_alap", "Minecraft felhasználónév változtatás", uj_felhasznalonev.as_str(), session.username.clone());
        
        return HttpResponse::Ok().body(exit_ok(format!("Felhasználónév változtatás sikeres")));
    }

    if isset("jatekos_lista", get.clone()) {
        let felhasználók = match minecraft_játékosok_lekérdezése() {
            Ok(eredmeny) => eredmeny,
            Err(hiba) => {
                println!("{}Hiba a játékos lista lekérdezése közben: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        };

        if felhasználók.len() <= 0 {
            return HttpResponse::Ok().body(exit_ok(format!("\"jatekosok_szama\": {}", felhasználók.len())));
        }

        let mut eredmeny = format!("\"jatekosok_szama\": {}, \"jatekosok\": [", felhasználók.len());

        eredmeny += &format!("{{\"username\": \"{}\", \"minecraft_username\": \"{}\", \"minecraft_isLogged\": {}, \"minecraft_lastlogin\": {}}}", felhasználók[0].username, felhasználók[0].minecraft_username, felhasználók[0].minecraft_islogged, felhasználók[0].minecraft_lastlogin);
        for i in 1..felhasználók.len() {
            eredmeny += &format!(", {{\"username\": \"{}\", \"minecraft_username\": \"{}\", \"minecraft_isLogged\": {}, \"minecraft_lastlogin\": {}}}", felhasználók[i].username, felhasználók[i].minecraft_username, felhasználók[i].minecraft_islogged, felhasználók[i].minecraft_lastlogin);
        }

        eredmeny += "]";

        return HttpResponse::Ok().body(exit_ok(eredmeny));
    }

    println!("{}Ismeretlen szándék: ({:?}) ({:?})", LOG_PREFIX, get.clone(), post.clone());
    HttpResponse::BadRequest().body(exit_error(format!("Ismeretlen szándék")))
}
