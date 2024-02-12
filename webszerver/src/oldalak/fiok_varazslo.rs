use actix_web::HttpResponse;
use crate::alap_fuggvenyek::exit_ok;
use crate::alap_fuggvenyek::list_key;
use crate::alap_fuggvenyek::log_bejegyzes;
use crate::backend::lekerdezesek::teamspeak_felhasználók_lekérdezése;
use crate::backend::lekerdezesek::általános_query_futtatás;
use crate::session::Session;
use crate::alap_fuggvenyek::isset;

use crate::alap_fuggvenyek::exit_error;

static LOG_PREFIX: &str = "[fiok_vará] ";

pub async fn teamspeak_fiók_varázsló_oldal(post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session) -> HttpResponse {
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }

    if isset("fiok_lista_lekerese", get.clone()) {
        let mut buffer = "\"fiokok\": [".to_string();
        let felhasználók = match teamspeak_felhasználók_lekérdezése() {
            Ok(felhasználók) => felhasználók,
            Err(err) => {
                return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni a felhasználókat: {}", err)));
            },
        };
        if felhasználók.len() <= 0 {
            return HttpResponse::BadRequest().body(exit_ok(format!("\"fiokok_szama\": 0")));
        }

        
        let mut i = 0;
        for felhasználó in &felhasználók {
            if i > 0 {
                buffer += ", ";
            }
            buffer += &format!("{{\"client_id\": {}, \"client_nickname\": \"{}\"}}", felhasználó.client_id, felhasználó.client_nickname);
            i = i + 1;
        }

        return HttpResponse::Ok().body(exit_ok(format!("\"fiokok_szama\": {}, {}]", felhasználók.len(), buffer)));
    }
    if isset("igenyles", get.clone()) {
        match általános_query_futtatás(
            format!("INSERT INTO hausz_ts.jogosultsag_igenylesek (hausz_felhasznalo_id, igenyles_datuma, igenyelt_fiokok, igenyelt_fiok_idk, jelenlegi_fiok_kivalasztott) VALUES ({}, now(6), '{}', '{}', {})"
                , session.user_id
                , list_key("fiok_nevek", post.clone())
                , list_key("fiok_idk", post.clone())
                , list_key("jelenlegi_fiok_kivalasztott", post.clone())
        )) {
            Ok(_) => {},
            Err(err) => {
                println!("{}Nem sikerült lekérdezni a felhasználókat: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba")));
            },
        }

        log_bejegyzes("teamspeak szerver", "Jogosultság igénylése", format!("Fióknevek: Jelenlegi: {} <- {}", list_key("jelenlegi_fiok_kivalasztott", post.clone()), list_key("fiok_nevek", post.clone())).as_str(), session.username).await;
        return HttpResponse::Ok().body(exit_ok(format!("Igénylés sikeresen elküldve")));
    }
    return HttpResponse::BadRequest().body(exit_error(format!("Ismeretlen szándék")));
}