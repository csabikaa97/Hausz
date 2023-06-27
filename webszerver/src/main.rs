use actix_web::cookie::Cookie;
use actix_web::{
    web, App, HttpServer, 
    HttpRequest, HttpResponse, 
    http::uri::Authority
};
use actix_form_data::{Field, Form};
use env_logger::Env;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use std::io::Error;
use std::io::ErrorKind;

mod mime_types;
mod backend;
mod fajlok;
 
static LOG_PREFIX: &str                         = "[ SZERVER ] ";
static IP: &str                                 = "0.0.0.0";
static PORT_HTTP: u16                           = 8080;
static PORT_HTTPS: u16                          = 4443;
pub static DOMAIN: &str                         = "hausz.stream";
pub static SESSION_LEJÁRATI_IDEJE_MP: i64       = 60*60*24*7;
pub static SESSSION_AZONOSÍTÓ_HOSSZ: usize      = 94;
pub static HAUSZ_TS_TOKEN_IGENYLES_CD: i64      = 60*60*24*3;
pub const MAX_FÁJL_MÉRET: usize                 = 1024*1024*10;
pub static MEGOSZTO_ADATBAZIS_URL: &str         = "mysql://root:root@172.20.128.10/hausz_megoszto";
pub static FELHASZNALOK_ADATBAZIS_URL: &str     = "mysql://root:root@172.20.128.10/hausz_felhasznalok";
pub static HAUSZ_TS_ADATBAZIS_URL: &str         = "mysql://root:root@172.20.128.10/hausz_ts";

async fn post_kérés_kezelő(request: HttpRequest) -> HttpResponse {
    println!("NEW POST REQUEST: {:?}", request);
    HttpResponse::Ok().body("OK")
}

fn form_adat_érték_kereső(form_adat: &str, kulcs: &str) -> Option<String> {
    let start_index = match form_adat.find(format!("name=\"{}\"\r\n\r\n", kulcs).as_str()) {
        None => {
            println!("{}form_adat_érték_kereső hiba: nem található kulcs: {}", LOG_PREFIX, kulcs);
            return None;
        },
        Some(index) => index + format!("name=\"{}\"\r\n\r\n", kulcs).len()
    };

    let mut érték = String::new();
    for karakter in form_adat[start_index..].chars() {
        if karakter == '\r' || karakter == '\n' {
            break;
        }
        érték.push(karakter);
    }
    Some(érték)
}

async fn belépés_kezelő(request: HttpRequest, form: String) -> HttpResponse {
    if !form.contains("login") || !form.contains("username") || !form.contains("password") {
        return HttpResponse::BadRequest().body("{\"eredmeny\": \"hiba\", \"valasz\":\"Nem megfelelő form adatok\"}");
    }

    let login_ellenőrzés_regex = match regex::Regex::new(r#""login"(\r\n){2}yes"#) {
        Err(_) => {
            println!("{}login_ellenőrzés_regex összeállítása közben hiba történt", LOG_PREFIX);
            return HttpResponse::BadRequest().body("{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: login_ellenőrzés_regex összeállítása közben\"}");
        },
        Ok(regex) => regex,
    };
    if !login_ellenőrzés_regex.is_match(&form) {
        return HttpResponse::BadRequest().body("{\"eredmeny\": \"hiba\", \"valasz\":\"Nem megfelelő form adatok\"}");
    }

    let megadott_felhasznélónév = match form_adat_érték_kereső(&form, "username") {
        None => {
            println!("{}form_adat_érték_kereső hiba", LOG_PREFIX);
            return HttpResponse::BadRequest().body("{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: form_adat_érték_kereső hiba: megadott_felhasznélónév\"}");
        },
        Some(érték) => érték,
    };

    let megadott_jelszó = match form_adat_érték_kereső(&form, "password") {
        None => {
            println!("{}form_adat_érték_kereső hiba", LOG_PREFIX);
            return HttpResponse::BadRequest().body("{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: form_adat_érték_kereső hiba: megadott_jelszó\"}");
        },
        Some(érték) => érték,
    };

    let felhasználó_session_azonosítója = match request.cookie("session_azonosito") {
        None => None,
        Some(cookie) => Some(cookie.value().to_owned()),
    };

    match backend::belépés(megadott_felhasznélónév, megadott_jelszó, felhasználó_session_azonosítója) {
        Err(e) => {
            println!("{}belépés hiba: {}", LOG_PREFIX, e);
            HttpResponse::BadRequest().body(format!("{{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: {}\"}}", e))
        },
        Ok((válasz, session_azonosító)) => {
            let session_azonosító_cookie = Cookie::build("session_azonosito", session_azonosító)
                .domain(DOMAIN)
                .path("/")
                .expires(time::OffsetDateTime::now_utc() + time::Duration::seconds(SESSION_LEJÁRATI_IDEJE_MP))
                .finish();
            let mut visszatérési_érték = HttpResponse::Ok().body(válasz);
            match visszatérési_érték.add_cookie(&session_azonosító_cookie) {
                Err(e) => {
                    println!("{}belépés hiba: {}", LOG_PREFIX, e);
                    HttpResponse::BadRequest().body(format!("{{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: {}\"}}", e))
                },
                Ok(_) => visszatérési_érték,
            }
        },
    }
}

async fn kérés_kezelő(request: HttpRequest) -> HttpResponse {
    let _scheme = request.connection_info().scheme();
    let host = match request.head().headers().get("host") {
        Some(host) => match host.to_str() {
            Ok(eredmény) => eredmény,
            Err(_) => DOMAIN,
        },
        None => DOMAIN,
    };
    let uri = request.uri();
    let authority_tmp: Authority;
    let authority = match uri.authority() {
        Some(authority) => authority,
        None => {
            authority_tmp = Authority::from_static(DOMAIN);
            &authority_tmp
        }
    }.as_str();
    let path = request.path();
    let query_string = request.query_string();
    let query_elemek = backend::query_szöveg_feldolgozása(request.query_string());

    let felhasználó_jelenlegi_cookie_azonosítója = match request.cookie("session_azonosito") {
        None => None,
        Some(cookie) => Some(cookie.value().to_owned()),
    };

    if !authority.contains(DOMAIN) {
        let new_uri = format!("https://{}{}{}{}",
            DOMAIN,
            path, 
            if query_string.len() > 0 {"?"} else {""}, 
            query_string
        );
        println!("{}Redirecting {} -> {}", LOG_PREFIX, uri, new_uri);
        return HttpResponse::Found()
            .append_header(("Location", format!("{}", new_uri)))
            .finish();
    }

    if request.connection_info().scheme() != "https" {
        let new_uri = format!("https://{}{}{}{}",
            host, 
            path, 
            if query_string.len() > 0 {"?"} else {""},
            query_string
        );
        println!("{}Redirecting {} -> {}", LOG_PREFIX, uri, new_uri);
        return HttpResponse::Found()
            .append_header(("Location", format!("{}", new_uri)))
            .finish();
    }

    for elem in &query_elemek {
        match elem.0 {
            "fajlok" => return backend::fájlok_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója),
            "tarhely" => return backend::szerver_tarhely_statusz_lekérdezése(),
            "statusz" => return backend::beléptető_rendszer_állapot_lekérdezése(request),
            "logout" => return backend::kijelentkezés(felhasználó_jelenlegi_cookie_azonosítója),
            "szerver_statusz" => return backend::teamspeak_szerver_státusz_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója),
            "token_informacio" => return backend::teamspeak_token_információ_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója),
            "uj_token_igenylese" => return backend::teamspeak_új_token_igénylése(felhasználó_jelenlegi_cookie_azonosítója),
            "letoltes" => return match backend::megosztó_fájl_letöltés(query_elemek, felhasználó_jelenlegi_cookie_azonosítója) {
                Err(e) => {
                    println!("{}letoltes hiba: {}", LOG_PREFIX, e);
                    HttpResponse::BadRequest().body(format!("{{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: {}\"}}", e))
                },
                Ok(válasz) => válasz,
            },
            _ => (),
        }
    }

    let path = path.trim_start_matches('/').trim_end_matches('/');
    let fájlnév = "../public/".to_owned() + fajlok::hozzárendelt_fájl(path);

    let kiterjesztés = match fájlnév.split('.').last() {
        Some(kiterjesztés) => kiterjesztés,
        None => "",
    };
    let mime = mime_types::mime_type_megállapítása(kiterjesztés);
    
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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("{}Starting web server", LOG_PREFIX);

    let belépés_form = Form::<(), Error>::new()
        .field("login", Field::text())
        .field("username", Field::text())
        .field("password", Field::text());

    println!("{:?}", belépés_form);

    env_logger::init_from_env(Env::default().default_filter_or("info"));

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
            .service(
                web::resource("/include/belepteto_rendszer.php")
                    .route(web::post().to(belépés_kezelő))
                    .route(web::get().to(kérés_kezelő)),
            )
            .service(
                web::resource("/megoszto/megoszto.php")
                    .route(web::post().to(backend::megosztó_kezelő))
                    .route(web::get().to(kérés_kezelő)),
            )
            .service(
                web::resource("/")
                    .route(web::post().to(post_kérés_kezelő))
                    .route(web::get().to(kérés_kezelő)),
            )
            .default_service(web::route().to(kérés_kezelő))
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
        .default_service(web::route().to(kérés_kezelő))
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