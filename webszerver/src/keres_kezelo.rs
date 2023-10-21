use actix_web::HttpResponse;
use actix_web::HttpRequest;
use crate::session::Session;
use crate::alap_fuggvenyek::isset;
use crate::fajlok::hozzárendelt_fájl;
use crate::mime_types::mime_type_megállapítása;

use crate::oldalak::belepteto_rendszer::*;

static LOG_PREFIX: &str = "[kérés_kez] ";

pub fn keres_kezelo(post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session, request: HttpRequest) -> HttpResponse {
    if isset("login", post.clone()) {
        return belepteto_rendszer(post, get, session);
    }
    if isset("get_salt", post.clone()) {
        return belepteto_rendszer(post, get, session);
    }
    if isset("statusz", get.clone()) {
        return belepteto_rendszer(post, get, session);
    }
    if isset("logout", get.clone()) {
        return belepteto_rendszer(post, get, session);
    }

    for (key, _) in get.clone() {
        if key.len() == 0 {
            continue;
        }
        
        
    }

    let path = request.path();
    let fájlnév = "../public/".to_owned() + hozzárendelt_fájl(path);
    
    let kiterjesztés = match fájlnév.split('.').last() {
        Some(kiterjesztés) => kiterjesztés,
        None => "",
    };
    let mime = mime_type_megállapítása(kiterjesztés);
    
    let beolvasott_fájl = match std::fs::read(&fájlnév) {
        Ok(tartalom) => tartalom,
        Err(e) => {
            println!("{}Hiba a fájl tartalmának beolvasásakor: {}: {}", LOG_PREFIX, &fájlnév, e);
            return HttpResponse::InternalServerError()
            .body(format!("{}Hiba a fájl tartalmának beolvasásakor: {}: {}", LOG_PREFIX, &fájlnév, e))
        }
    };

    return HttpResponse::Ok()
        .insert_header(("content-type", mime))
        .body(beolvasott_fájl);
}