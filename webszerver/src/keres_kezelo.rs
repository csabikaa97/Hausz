use std::io::Write;
use actix_multipart::Multipart;
use actix_web::HttpResponse;
use actix_web::HttpRequest;
use crate::alap_fuggvenyek::get_gyorsítótár;
use crate::alap_fuggvenyek::save_gyorsítótár;
use crate::oldalak::admin_oldal::admin_oldal;
use crate::oldalak::fiok_varazslo::teamspeak_fiók_varázsló_oldal;
use crate::oldalak::jelszo_valtoztatas::jelszó_változtatás;
use crate::oldalak::meghivo::meghívó;
use crate::oldalak::megoszto::megosztó;
use crate::oldalak::minecraft::minecraft;
use crate::oldalak::teamspeak::teamspeak_oldal;
use crate::oldalak::beallitasok::push_ertesites_adatok_mentese;
use crate::oldalak::beallitasok::push_ertesites_kuldese;
use crate::session::Session;
use crate::alap_fuggvenyek::isset;
use crate::fajlok::hozzárendelt_fájl;
use crate::mime_types::mime_type_megállapítása;
use flate2::Compression;
use flate2::write::GzEncoder;

use crate::oldalak::belepteto_rendszer::*;
use crate::oldalak::regisztracio::*;

static LOG_PREFIX: &str = "[kérés_kez] ";

pub async fn keres_kezelo(payload: Multipart, post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session, request: HttpRequest) -> HttpResponse {
    let start = std::time::Instant::now();

    let returnvalue = tenyleges_keres_kezelo(payload, post, get, session, request.clone());

    let _elapsed = start.elapsed();

    return returnvalue.await;
}

pub async fn tenyleges_keres_kezelo(payload: Multipart, post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session, request: HttpRequest) -> HttpResponse {
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
        return regisztráció(post, get, session).await;
    }
    if isset("generate_salt", get.clone()) {
        return regisztráció(post, get, session).await;
    }

    // meghívó
    if isset("meghivo_adatok", get.clone()) {
        return meghívó(post, get, session).await;
    }
    if isset("uj_meghivo", get.clone()) {
        return meghívó(post, get, session).await;
    }

    // minecraft
    if isset("felhasznalonev_info", get.clone()) {
        return minecraft(post, get, session).await;
    }
    if isset("felhasznalonev_valtoztatas", get.clone()) {
        return minecraft(post, get, session).await;
    }
    if isset("jatekos_lista", get.clone()) {
        return minecraft(post, get, session).await;
    }

    // megosztó
    if isset("tarhely", get.clone()) {
        return megosztó(payload, post, get, session).await;
    }
    if isset("fajlok", get.clone()) {
        return megosztó(payload, post, get, session).await;
    }
    if isset("submit", post.clone()) {
        return megosztó(payload, post, get, session).await;
    }
    if isset("letoltes", get.clone()) {
        return megosztó(payload, post, get, session).await;
    }
    if isset("atnevezes", get.clone()) {
        return megosztó(payload, post, get, session).await;
    }
    if isset("members_only_csere", get.clone()) {
        return megosztó(payload, post, get, session).await;
    }
    if isset("privat_status_csere", get.clone()) {
        return megosztó(payload, post, get, session).await;
    }
    if isset("delete", get.clone()) {
        return megosztó(payload, post, get, session).await;
    }
    if isset("kulcs_ellenorzese", get.clone()) {
        return megosztó(payload, post, get, session).await;
    }

    // jelszó változatás
    if isset("uj_jelszo_sha256_salt", post.clone()) {
        return jelszó_változtatás(post, session).await;
    }

    // teamspeak oldal
    if isset("token_informacio", get.clone()) {
        return teamspeak_oldal(get, session).await;
    }
    if isset("uj_token_igenylese", get.clone()) {
        return teamspeak_oldal(get, session).await;
    }
    if isset("felhasznalok", get.clone()) {
        return teamspeak_oldal(get, session).await;
    }
    if isset("szerver_statusz", get.clone()) {
        return teamspeak_oldal(get, session).await;
    }

    // teamspeak fiók varázsló oldal
    if isset("fiok_lista_lekerese", get.clone()) {
        return teamspeak_fiók_varázsló_oldal(post, get, session).await;
    }
    if isset("igenyles", get.clone()) {
        return teamspeak_fiók_varázsló_oldal(post, get, session).await;
    }

    // admin oldal
    if isset("aktivalas", get.clone()) {
        return admin_oldal(get, session).await;
    }
    if isset("elutasitas", get.clone()) {
        return admin_oldal(get, session).await;
    }
    if isset("torles", get.clone()) {
        return admin_oldal(get, session).await;
    }
    if isset("aktivalando_fiokok", get.clone()) {
        return admin_oldal(get, session).await;
    }
    if isset("fiokok", get.clone()) {
        return admin_oldal(get, session).await;
    }
    if isset("admin_csere", get.clone()) {
        return admin_oldal(get, session).await;
    }
    if isset("log", get.clone()) {
        return admin_oldal(get, session).await;
    }
    if isset("parancs", get.clone()) {
        return admin_oldal(get, session).await;
    }
    if isset("teamspeak_jogosultsag_igenylesek", get.clone()) {
        return admin_oldal(get, session).await;
    }
    if isset("teamspeak_jogosultsag_jovahagyas", get.clone()) {
        return admin_oldal(get, session).await;
    }
    if isset("teamspeak_jogosultsag_elutasitas", get.clone()) {
        return admin_oldal(get, session).await;
    }

    // beállítások oldal
    if isset("push_ertesites_adatok_mentese", get.clone()) {
        return push_ertesites_adatok_mentese(post, session).await;
    }
    if isset("push_ertesites_kuldese", post.clone()) {
        return push_ertesites_kuldese(post, session).await;
    }

    let path = request.path();
    let fájlnév = crate::konfig().webszerver.fajlok_eleresi_utvonala.to_owned() + hozzárendelt_fájl(path);
    
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
        Err(_) => {
            match std::fs::read(&fájlnév) {
                Ok(tartalom) => {
                    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
                    match encoder.write_all(tartalom.as_slice()) {
                        Ok(_) => {
                            match encoder.finish() {
                                Ok(compressed_bytes) => {
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