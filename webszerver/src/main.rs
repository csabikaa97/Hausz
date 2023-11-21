use actix_multipart::Multipart;
use actix_web::{
    web, App, HttpServer, 
    HttpRequest, HttpResponse
};
use konfiguracio::KonfigurációsFájl;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use std::fs;
use std::io::Error;
use std::io::ErrorKind;
use std::sync::Mutex;
use toml;
use crate::konfiguracio::PrivátWebszerverKonfiguráció;
use crate::alap_fuggvenyek::exit_error;

mod backend;
mod fajlok;
mod form_olvaso;
mod keres_kezelo;
mod session;
mod alap_fuggvenyek;
mod oldalak;
pub mod mime_types;
pub mod konfiguracio;
use konfiguracio::PrivátKonfigurációsFájl;

static LOG_PREFIX: &str = "[ActixMain] ";

static STATIKUS_FÁJL_GYORSÍTÓTÁR: Mutex<Vec<(String, Vec<u8>)>> = Mutex::new(Vec::new());

static KONFIGURÁCIÓS_FÁJL: Mutex<Vec<KonfigurációsFájl>> = Mutex::new(Vec::new());
static PRIVÁT_KONFIGURÁCIÓS_FÁJL: Mutex<Vec<PrivátKonfigurációsFájl>> = Mutex::new(Vec::new());

pub fn konfig() -> KonfigurációsFájl {
    return KONFIGURÁCIÓS_FÁJL.lock().unwrap()[0].clone();
}

pub fn privát_konfig() -> PrivátKonfigurációsFájl {
    return PRIVÁT_KONFIGURÁCIÓS_FÁJL.lock().unwrap()[0].clone();
}

async fn post_kérés_kezelő(request: HttpRequest, mut payload: Multipart) -> HttpResponse {
    let content_type = match request.headers().get("content-type") {
        None => return HttpResponse::BadRequest().body(exit_error(format!("Nincs content-type header"))),
        Some(content_type) => content_type,
    };

    let content_type = match content_type.to_str() {
        Err(e) => return HttpResponse::BadRequest().body(exit_error(format!("{}", e))),
        Ok(content_type) => content_type,
    };
    if !content_type.starts_with("multipart/form-data;") {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem multipart/form-data")));
    }

    let cookie: String = match request.cookie("hausz_session") {
        None => {
            "".to_string()
        }
        Some(cookies) => {
            if cookies.value().len() == 0 {
                return HttpResponse::BadRequest().body(exit_error(format!("Üres cookie")));
            }

            cookies.value().to_string()
        }
    };

    let adatok: backend::AdatbázisEredményFelhasználó;
    let session_adatok: session::Session;

    match backend::cookie_gazdájának_lekérdezése(cookie.clone()) {
        Some(eredmeny) => {
            adatok = eredmeny;
            
            session_adatok = session::Session {
                loggedin: "yes".to_string(),
                username: adatok.felhasználónév,
                admin: adatok.admin,
                user_id: adatok.azonosító,
                cookie: cookie.clone(),
                minecraft_username: adatok.minecraft_username,
            };
        }
        None => {
            session_adatok = session::Session {
                loggedin: "no".to_string(),
                username: "".to_string(),
                admin: "".to_string(),
                user_id: 0,
                cookie: "".to_string(),
                minecraft_username: "".to_string(),
            };
        },
    }

    let form_adatok = form_olvaso::form_olvasó(&mut payload).await;
    let get_adatok = form_olvaso::get_olvasó(request.query_string().to_string());

    keres_kezelo::keres_kezelo(payload, form_adatok, get_adatok, session_adatok, request).await
}

async fn get_kérés_kezelő(request: HttpRequest, payload: Multipart) -> HttpResponse {
    let form_adatok = Vec::new();
    let get_adatok = form_olvaso::get_olvasó(request.query_string().to_string());

    let session_adatok: session::Session;

    let cookie: String = match request.cookie("hausz_session") {
        None => {
            "".to_string()
        }
        Some(cookies) => {
            if cookies.value().len() == 0 {
                return HttpResponse::BadRequest().body(exit_error(format!("Üres cookie")));
            }

            cookies.value().to_string()
        }
    };

    let adatok: backend::AdatbázisEredményFelhasználó;

    match backend::cookie_gazdájának_lekérdezése(cookie.clone()) {
        Some(eredmeny) => {
            adatok = eredmeny;
            
            session_adatok = session::Session {
                loggedin: "yes".to_string(),
                username: adatok.felhasználónév,
                admin: adatok.admin,
                user_id: adatok.azonosító,
                cookie: cookie.clone(),
                minecraft_username: adatok.minecraft_username,
            };
        }
        None => {
            session_adatok = session::Session {
                loggedin: "no".to_string(),
                username: "".to_string(),
                admin: "".to_string(),
                user_id: 0,
                cookie: "".to_string(),
                minecraft_username: "".to_string(),
            };
        },
    }

    keres_kezelo::keres_kezelo(payload, form_adatok, get_adatok, session_adatok, request).await
}

async fn kérés_metódus_választó(request: HttpRequest, payload: Multipart) -> HttpResponse {
    let method = request.method();

    match method.to_owned() {
        actix_web::http::Method::GET => return get_kérés_kezelő(request, payload).await,
        actix_web::http::Method::POST => return post_kérés_kezelő(request, payload).await,
        _ => return HttpResponse::BadRequest().body(exit_error(format!("Ismeretlen metódus"))),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("{}Konfigurációs fájl beolvasása...", LOG_PREFIX);
    let config_fájl_tartalom = match fs::read_to_string("/hausz/webszerver/konfiguracio.toml") {
        Ok(tartalom) => tartalom,
        Err(e) => {
            panic!("{}Hiba a config fájl beolvasásakor: {}", LOG_PREFIX, e);
        }
    };

    let mut adatok: KonfigurációsFájl = match toml::from_str(&config_fájl_tartalom) {
        Ok(adatok) => adatok,
        Err(e) => {
            panic!("{}Hiba a config fájl feldolgozásakor: {}\nTartalom:\n{:?}", LOG_PREFIX, e, config_fájl_tartalom);
        }
    };

    if !adatok.webszerver.tanusitvanyok_eleresi_utvonala.starts_with("/") {
        panic!("{}A tanúsítványok elérési útvonala nem abszolút. ", LOG_PREFIX);
    }

    if !adatok.webszerver.tanusitvanyok_eleresi_utvonala.ends_with("/") {
        adatok.webszerver.tanusitvanyok_eleresi_utvonala.push('/');
    }

    println!("{}Konfigurációs fájl OK", LOG_PREFIX);

    let privát_config_fájl_tartalom = match fs::read_to_string("privat_konfiguracio.toml") {
        Ok(tartalom) => tartalom,
        Err(_) => {
            println!("{}Hiba a privát config fájl beolvasásakor", LOG_PREFIX);
            "".to_string()
        }
    };

    let privát_adatok: PrivátKonfigurációsFájl = match toml::from_str(&privát_config_fájl_tartalom) {
        Ok(adatok) => adatok,
        Err(_) => {
            println!("{}Hiba a privát config fájl feldolgozásakor", LOG_PREFIX);
            println!("{}A privát konfigurációs fájl értékei helyett az alap értékek lesznek használva.", LOG_PREFIX);
            PrivátKonfigurációsFájl {
                webszerver: PrivátWebszerverKonfiguráció {
                    hausz_teamspeak_admin_jelszo: "".to_string(),
                }
            }
        }
    };

    KONFIGURÁCIÓS_FÁJL.lock().unwrap().push(adatok);
    PRIVÁT_KONFIGURÁCIÓS_FÁJL.lock().unwrap().push(privát_adatok);
    
    println!("{}Webszerver indítása...", LOG_PREFIX);
    let mut builder = match SslAcceptor::mozilla_intermediate(SslMethod::tls()) {
        Ok(builder) => builder,
        Err(e) => {
            println!("{}Hiba a titkosítókulcsok beolvasásakor: {}", LOG_PREFIX, e);
            println!("{}Használt útvonal: ({})", LOG_PREFIX, konfig().webszerver.tanusitvanyok_eleresi_utvonala + "privkey.pem");
            return Err(Error::new(ErrorKind::Other, e));
        }
    };
    builder.set_private_key_file(konfig().webszerver.tanusitvanyok_eleresi_utvonala + "privkey.pem", SslFiletype::PEM).expect(&format!("{}Hiba a titkosítókulcs beállításakor", LOG_PREFIX));
   
    builder.set_certificate_chain_file(konfig().webszerver.tanusitvanyok_eleresi_utvonala + "fullchain.pem").expect(&format!("{}Hiba a tanúsítvány beállításakor", LOG_PREFIX));

    let https_server = match HttpServer::new(move || {
            App::new()
            .default_service(web::route().to(kérés_metódus_választó))
        })
        .workers(10)
        .bind_openssl(format!("{}:{}", konfig().webszerver.ip, konfig().webszerver.port_https), builder) {
            Ok(server) => {
                println!("{}HTTPS webszerver elindítva - {}:{}", LOG_PREFIX, konfig().webszerver.ip, konfig().webszerver.port_https);
                server
            },
            Err(e) => {
                println!("{}Hiba a HTTPS szerver indításakor: {}", LOG_PREFIX, e);
                return Err(Error::new(ErrorKind::Other, e));
            }
        };

    let http_server = match HttpServer::new(|| {
        App::new()
        .default_service(web::route().to(kérés_metódus_választó))
    })
        .workers(10)
        .bind(format!("{}:{}", konfig().webszerver.ip, konfig().webszerver.port_http)) {
            Ok(server) => {
                println!("{}HTTP webszerver elindítva - {}:{}", LOG_PREFIX, konfig().webszerver.ip, konfig().webszerver.port_http);
                server
            },
            Err(e) => {
                println!("{}Hiba a HTTP szerver indításakor: {}", LOG_PREFIX, e);
                return Err(Error::new(ErrorKind::Other, e));
            }
        };

    match futures::join!(https_server.run(), http_server.run()) {
        (Ok(_), Ok(_)) => (),
        (Err(e), _) => {
            println!("{}Hiba a HTTPS future futtatásakor: {}", LOG_PREFIX, e);
            return Err(Error::new(ErrorKind::Other, e));
        },
        (_, Err(e)) => {
            println!("{}Hiba a HTTP future futtatásakor: {}", LOG_PREFIX, e);
            return Err(Error::new(ErrorKind::Other, e));
        }
    }

    Ok(())
}