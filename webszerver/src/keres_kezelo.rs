use actix_web::HttpResponse;
use actix_web::HttpRequest;
use crate::oldalak::meghivo::meghívó;
use crate::oldalak::minecraft;
use crate::session::Session;
use crate::alap_fuggvenyek::isset;
use crate::fajlok::hozzárendelt_fájl;
use crate::mime_types::mime_type_megállapítása;

use crate::oldalak::belepteto_rendszer::*;
use crate::oldalak::regisztracio::*;

static LOG_PREFIX: &str = "[kérés_kez] ";

pub fn keres_kezelo(post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session, request: HttpRequest) -> HttpResponse {
    // beléptető rendszer
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

    // regisztráció
    if isset("regisztracio", post.clone()) {
        return regisztráció(post, get, session);
    }
    if isset("generate_salt", get.clone()) {
        return regisztráció(post, get, session);
    }

    // meghívó
    if isset("meghivo_adatok", get.clone()) {
        return meghívó(post, get, session);
    }
    if isset("uj_meghivo", get.clone()) {
        return meghívó(post, get, session);
    }

    // minecraft
    if isset("felhasznalonev_info", get.clone()) {
        return crate::oldalak::minecraft::minecraft(post, get, session);
    }
    if isset("felhasznalonev_valtoztatas", get.clone()) {
        return crate::oldalak::minecraft::minecraft(post, get, session);
    }
    if isset("jatekos_lista", get.clone()) {
        return crate::oldalak::minecraft::minecraft(post, get, session);
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