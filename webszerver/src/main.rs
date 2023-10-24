use actix_web::{
    web, App, HttpServer, 
    HttpRequest, HttpResponse
};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use std::io::Error;
use std::io::ErrorKind;
use crate::alap_fuggvenyek::exit_error;

mod mime_types;
mod backend;
mod fajlok;
mod form_olvaso;
mod keres_kezelo;
mod session;
mod alap_fuggvenyek;
mod oldalak;

static LOG_PREFIX: &str                         = "[szerver  ] ";
static IP: &str                                 = "0.0.0.0";
static PORT_HTTP: u16                           = 8080;
static PORT_HTTPS: u16                          = 4443;
pub static DOMAIN: &str                         = "hausz.stream";
pub static SESSION_LEJÁRATI_IDEJE_MP: i64       = 60*60*24*7;
pub static SESSSION_AZONOSÍTÓ_HOSSZ: usize      = 94;
pub static HAUSZ_TS_TOKEN_IGENYLES_CD: i64      = 60*60*24*3;
pub const MAX_FÁJL_MÉRET: usize                 = 1024*1024*10;
pub static MEGOSZTO_ADATBAZIS_URL: &str         = "mysql://root:root@172.20.128.10/hausz_megoszto";
pub static HAUSZ_TS_ADATBAZIS_URL: &str         = "mysql://root:root@172.20.128.10/hausz_ts";

async fn post_kérés_kezelő(request: HttpRequest, form: String) -> HttpResponse {
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

    let boundary = match content_type.split("boundary=").last() {
        None => return HttpResponse::BadRequest().body(exit_error(format!("Nincs boundary megadva"))),
        Some(boundary) => boundary,
    };

    println!("{} DEBUG: Boundary=({})", LOG_PREFIX, boundary);

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

    let form_adatok = form_olvaso::form_olvasó(form.clone(), boundary.to_owned());
    let get_adatok = form_olvaso::get_olvasó(request.query_string().to_string());

    keres_kezelo::keres_kezelo(form_adatok, get_adatok, session_adatok, request)
}

async fn get_kérés_kezelő(request: HttpRequest) -> HttpResponse {
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

    keres_kezelo::keres_kezelo(form_adatok, get_adatok, session_adatok, request)
}

async fn kérés_metódus_választó(request: HttpRequest, form: String) -> HttpResponse {
    let method = request.method();
    match method.to_owned() {
        actix_web::http::Method::GET => return get_kérés_kezelő(request).await,
        actix_web::http::Method::POST => return post_kérés_kezelő(request, form).await,
        _ => return HttpResponse::BadRequest().body(exit_error(format!("Ismeretlen metódus"))),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("{}Starting web server", LOG_PREFIX);

    let mut builder = match SslAcceptor::mozilla_intermediate(SslMethod::tls()) {
        Ok(builder) => builder,
        Err(e) => {
            println!("{}Hiba a titkosítókulcsok beolvasásakor: {}", LOG_PREFIX, e);
            return Err(Error::new(ErrorKind::Other, e));
        }
    };
    builder.set_private_key_file("../public/privkey.pem", SslFiletype::PEM).expect(&format!("{}Hiba a titkosítókulcs beállításakor", LOG_PREFIX));
   
    builder.set_certificate_chain_file("../public/fullchain.pem").expect(&format!("{}Hiba a tanúsítvány beállításakor", LOG_PREFIX));

    let https_server = match HttpServer::new(move || {
            App::new()
            .default_service(web::route().to(kérés_metódus_választó))
        })
        .workers(10)
        .bind_openssl(format!("{}:{}", IP, PORT_HTTPS), builder) {
            Ok(server) => {
                println!("{}Web server listening on {}:{}", LOG_PREFIX, IP, PORT_HTTPS);
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
        .bind(format!("{}:{}", IP, PORT_HTTP)) {
            Ok(server) => {
                println!("{}Web server listening on {}:{}", LOG_PREFIX, IP, PORT_HTTP);
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