use actix_web::HttpResponse;
use crate::alap_fuggvenyek::{exit_ok, list_key};
use crate::exit_error;
use crate::backend::ertesites_kuldes::push_értesítés_api_kulcs_alapján;

use crate::{alap_fuggvenyek::isset, session::Session};

use super::ertesites_kuldes::push_értesítés_id_alapján;

static LOG_PREFIX: &str = "[push_küld] ";

pub async fn push_ertesites_kuldese(post: Vec<(String, String)>, session: Session) -> HttpResponse {
    if !isset("cim", post.clone()) {
        return HttpResponse::BadRequest().body(exit_error(format!("Nincs megadva cím")));
    }

    if !isset("uzenet", post.clone()) {
        return HttpResponse::BadRequest().body(exit_error(format!("Nincs megadva üzenet")));
    }

    if isset("api_kulcs", post.clone()) {
        match push_értesítés_api_kulcs_alapján(list_key("cim", post.clone()), list_key("uzenet", post.clone()), list_key("api_kulcs", post.clone())).await {
            Ok(_) => {
                return HttpResponse::Ok().body(exit_ok(format!("Push értesítés sikeresen kiküldve")));
            },
            Err(err) => {
                println!("{}Hiba a push értesítése küldésekore: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba")));
            }
        }
    }

    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve, és nincs megadva API kulcs sem")));
    }

    match push_értesítés_id_alapján(list_key("cim", post.clone()), list_key("uzenet", post.clone()), session.user_id).await {
        Ok(_) => {
            return HttpResponse::Ok().body(exit_ok(format!("Push értesítés(ek) sikeresen kiküldve")));
        },
        Err(err) => {
            println!("{}Hiba a push értesítése küldésekore: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba")));
        }
    }
}