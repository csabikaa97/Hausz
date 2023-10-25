use std::io::Write;
use actix_web::HttpResponse;
use actix_web::HttpRequest;
use crate::alap_fuggvenyek::get_gyorsítótár;
use crate::alap_fuggvenyek::save_gyorsítótár;
use crate::oldalak::meghivo::meghívó;
use crate::oldalak::minecraft;
use crate::session::Session;
use crate::alap_fuggvenyek::isset;
use crate::fajlok::hozzárendelt_fájl;
use crate::mime_types::mime_type_megállapítása;
use flate2::Compression;
use flate2::write::GzEncoder;

use crate::oldalak::belepteto_rendszer::*;
use crate::oldalak::regisztracio::*;

static LOG_PREFIX: &str = "[kérés_kez] ";

pub fn keres_kezelo(mut payload: Multipart, post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session, request: HttpRequest) -> HttpResponse {
    let start = std::time::Instant::now();

    let returnvalue = tenyleges_keres_kezelo(payload, post, get, session, request.clone());

    let elapsed = start.elapsed();
    println!("{}{} {}ms", LOG_PREFIX, request.clone().path(), elapsed.as_millis());

    return returnvalue;
}

pub fn tenyleges_keres_kezelo(mut payload: Multipart, post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session, request: HttpRequest) -> HttpResponse {
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
    
    let mut gzip = false;
    let beolvasott_fájl = match get_gyorsítótár(fájlnév.as_str()) {
        Ok(x) => {
            gzip = true;
            x
        },
        Err(hiba) => {
            println!("{}Nincs gyorsítótár: {}: ({})", LOG_PREFIX, fájlnév, hiba);
            match std::fs::read(&fájlnév) {
                Ok(tartalom) => {
                    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
                    match encoder.write_all(tartalom.as_slice()) {
                        Ok(_) => {
                            match encoder.finish() {
                                Ok(compressed_bytes) => {
                                    println!("{}Fájl sikeresen eltárolva a gyorsítótárban: {}", LOG_PREFIX, &fájlnév);
                                    save_gyorsítótár(fájlnév.clone(), compressed_bytes);
                                },
                                Err(hiba) => {
                                    println!("{}Hiba a fájl tartalmának tömörítésekor: {}: {}", LOG_PREFIX, &fájlnév, hiba);
                                }
                            };
                        },
                        Err(hiba) => {
                            println!("{}Hiba a fájl tartalmának tömörítésekor: {}: {}", LOG_PREFIX, &fájlnév, hiba);
                        },
                    }

                    tartalom
                },
        Err(e) => {
            println!("{}Hiba a fájl tartalmának beolvasásakor: {}: {}", LOG_PREFIX, &fájlnév, e);
            return HttpResponse::InternalServerError()
            .body(format!("{}Hiba a fájl tartalmának beolvasásakor: {}: {}", LOG_PREFIX, &fájlnév, e))
        }
            }
        },
    };

    if gzip {
        return HttpResponse::Ok()
            .insert_header(("content-type", mime))
            .insert_header(("content-encoding", "gzip"))
            .insert_header(("cache-control", "public, max-age=120"))
            .body(beolvasott_fájl);
    } else {
    return HttpResponse::Ok()
        .insert_header(("content-type", mime))
            .insert_header(("cache-control", "public, max-age=120"))
        .body(beolvasott_fájl);
    }
}