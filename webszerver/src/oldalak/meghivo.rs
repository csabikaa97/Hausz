use actix_web::HttpResponse;
use crate::{session::Session, alap_fuggvenyek::{isset, log_bejegyzes}, backend::{lekerdezesek::{általános_query_futtatás, saját_meghívók_lekérése}, session_azonosito_generator::random_új_session_azonosító}};
use crate::alap_fuggvenyek::exit_error;
use crate::alap_fuggvenyek::exit_ok;

static LOG_PREFIX: &str = "[meghivo  ] ";

pub fn meghívó(_: Vec<(String, String)>, get: Vec<(String, String)>, session: Session) -> HttpResponse {
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }

    if isset("meghivo_adatok", get.clone()) {
        let saját_meghívók = match saját_meghívók_lekérése(session.user_id) {
            Err(hiba) => {
                println!("{}Nem sikerült a saját meghívó lekérdezése: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Nem sikerült a saját meghívó lekérdezése")));
            },
            Ok(meghivo_vec) => meghivo_vec
        };

        let mut buffer = format!("\"meghivok_szama\": {}, \"meghivok\": [", saját_meghívók.len());

        if saját_meghívók.len() > 0 {
            buffer += &format!("\"{}\"", saját_meghívók.get(0).unwrap());

            for i in 1..saját_meghívók.len() {

                buffer += &format!(", \"{}\"", saját_meghívók.get(i).unwrap());
            }
        }

        buffer += "]";

        return HttpResponse::Ok().body(exit_ok(buffer));
    }

    if isset("uj_meghivo", get.clone()) {
        let meghivo = random_új_session_azonosító();

        match általános_query_futtatás(format!("DELETE FROM meghivok WHERE user_id = '{}'", session.user_id)) {
            Err(hiba) => {
                println!("{}Nem sikerült a meghívó törlése: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Nem sikerült a meghívó törlése")));
            },
            Ok(_) => {}
        }

        match általános_query_futtatás(format!("INSERT INTO meghivok (user_id, meghivo, request_date) VALUES ('{}', '{}', NOW(6))", session.user_id, meghivo)) {
            Err(hiba) => {
                println!("{}Nem sikerült a meghívó létrehozása: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Nem sikerült a meghívó létrehozása")));
            },
            Ok(_) => {}
        }

        log_bejegyzes("hausz_alap", "Meghívó készítés", &meghivo, session.username);

        return HttpResponse::Ok().body(exit_ok(format!("Új meghívó létrehozása sikeres")));
    }

    HttpResponse::Ok().body(exit_ok(format!("\"meghivok_szama\": 0")))
}