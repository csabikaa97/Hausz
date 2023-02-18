use actix_web::HttpResponse;
use actix_web::HttpRequest;
use mysql::*;
use mysql::prelude::*;
use std::process::Command;
use regex::Regex;
use bcrypt;
use actix_web::cookie::Cookie;

mod session_azonosito_generator;

static LOG_PREFIX: &str = "[ADATBÁZIS] ";

struct AdatbázisEredményFájl {
    megjeleno_nev: String,
    titkositott: u8,
    id: u32,
    size: u32,
    filename: String,
    added: String,
    username: String,
    private: u8,
}

struct AdatbázisEredményFelhasználó {
    azonosító: u32,
    felhasználónév: String,
    jelszó: String,
    email: String,
    admin: String,
    megjelenő_név: String,
}

struct AdatbázisEredménySession {
    azonosító: u32,
    session_azonosíto: String,
    dátum: String,
}

fn csatlakozás(url: &str) -> Result<mysql::PooledConn> {
    let pool = match Pool::new(url) {
        Ok(pool) => pool,
        Err(err) => {
            return Err(err);
        }
    };
    match pool.get_conn() {
        Ok(conn) => Ok(conn),
        Err(err) => Err(err),
    }
}

pub fn fájlok_lekérdezése() -> HttpResponse {
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError()
                .body(format!("{{\"eredmeny\": \"hiba\", \"uzenet\":\"Hiba az adatbázishoz való csatlakozáskor: {}\"}}", err));
        }
    };

    let fájlok = match conn.query_map(
            "SELECT users.megjeleno_nev, files.titkositott, files.id AS 'id', files.size, filename, added, username, private FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC",
            |(megjeleno_nev, titkositott, id, size, filename, added, username, private)| AdatbázisEredményFájl {
                megjeleno_nev,
                titkositott,
                id,
                size,
                filename,
                added,
                username,
                private,
            },
        ) {
            Ok(fájlok) => fájlok,
            Err(err) => {
                println!("{}Hiba az adatbázis lekérdezésekor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().finish();
            }
        };

    let mut fájlok_szöveg = String::new();

    let mut valid_fájlok_száma = 0;
    for fájl in fájlok {
        if fájl.private == 1 && fájl.username != "admin" {
            // TODO: Amin helyett jelenlegi felhasználó
            continue;
        }

        if valid_fájlok_száma > 0 {
            fájlok_szöveg.push_str(",");
        }

        fájlok_szöveg.push_str(&format!(
            "{{\"megjeleno_nev\": \"{}\", \"titkositott\": {}, \"id\": {}, \"size\": {}, \"filename\": \"{}\", \"added\": \"{}\", \"username\": \"{}\", \"private\": {}}}",
            fájl.megjeleno_nev,
            fájl.titkositott,
            fájl.id,
            fájl.size,
            fájl.filename,
            fájl.added,
            fájl.username,
            fájl.private
        ));

        valid_fájlok_száma += 1;
    }

    if valid_fájlok_száma == 0 {
        return HttpResponse::Ok()
            .body("{\"eredmeny\": \"ok\", \"fajlok_szama\": 0, \"fajlok\": []}");
    } else {
        return HttpResponse::Ok()
            .body(format!("{{\"eredmeny\": \"ok\", \"fajlok_szama\": {}, \"fajlok\": [{}]}}", valid_fájlok_száma, fájlok_szöveg));
    }
}

pub fn szerver_tarhely_statusz_lekérdezése() -> HttpResponse {
    let output = match Command::new("df")
        .arg("-B1")
        .output() {
            Ok(output) => output,
            Err(err) => {
                println!("{}Hiba a df parancs futtatásakor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().finish();
            }
        };

    let tarhely = String::from_utf8_lossy(&output.stdout);
    let tarhely = tarhely.replace("\n", "");
    let foglalt = match regex::Regex::new(r".*(overlay|/dev/xvda1|/dev/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*") {
        Ok(regex) => regex,
        Err(err) => {
            println!("{} Hiba a foglalt tarhely értékének kinyeréséhez használandó regex létrehozásakor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().finish();
        }
    }.replace_all(&tarhely, "$3");
    let elérhető = match Regex::new(r".*(overlay|/dev/xvda1|/dev/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*") {
        Ok(regex) => regex,
        Err(err) => {
            println!("{} Hiba az elérhető tarhely értékének kinyeréséhez használandó regex létrehozásakor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().finish();
        }
    }.replace_all(&tarhely, "$4");
    let foglalt = match foglalt.parse::<f64>() {
        Ok(foglalt) => foglalt,
        Err(err) => {
            println!("{}Hiba a foglalt tarhely értékének átalakításakor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().finish();
        }
    };
    let elérhető = match elérhető.parse::<f64>() {
        Ok(elérhető) => elérhető,
        Err(err) => {
            println!("{}Hiba az elérhető tarhely értékének átalakításakor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().finish();
        }
    };

    return HttpResponse::Ok()
        .body(format!("{{\"eredmeny\": \"ok\", \"szabad_tarhely\": {}, \"foglalt_tarhely\": {}}}", elérhető, foglalt));
}

pub fn beléptető_rendszer_állapot_lekérdezése(request: HttpRequest) -> HttpResponse {
    let mut conn = match csatlakozás(crate::FELHASZNALOK_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError()
                .body(format!("{{\"eredmeny\": \"hiba\", \"uzenet\":\"Hiba az adatbázishoz való csatlakozáskor: {}\"}}", err));
        }
    };

    let felhasználó_session_azonosítója = match request.cookie("session_azonosito") {
        None => {
            return HttpResponse::Ok()
            .body("{\"eredmeny\": \"hiba\", \"valasz\":\"Nem vagy belépve\"}");
        },
        Some(cookie) => cookie.value().to_owned(),
    };

    let session = match conn.query_map(
        format!("SELECT azonosito, session_kulcs, datum AS eltelt_masodpercek FROM sessionok WHERE session_kulcs = '{}' AND TIMESTAMPDIFF(SECOND, datum, now(6)) < {}", felhasználó_session_azonosítója, crate::SESSION_LEJÁRATI_IDEJE_MP),
        |(azonosito, session_azonosito, datum)| {
            AdatbázisEredménySession {
                azonosító: azonosito,
                session_azonosíto: session_azonosito,
                dátum: datum,
            }
        }
    ) {
        Ok(sessionök) => {
            if sessionök.len() == 0 {
                return HttpResponse::Ok()
                    .body("{\"eredmeny\": \"hiba\", \"valasz\":\"Nem vagy belépve\"}");
            } else {
                match sessionök.into_iter().nth(0) {  
                    None => {
                        return HttpResponse::Ok()
                            .body("{\"eredmeny\": \"hiba\", \"valasz\":\"Nem vagy belépve\"}");
                    },
                    Some(session) => session,
                }
            }
        },
        Err(err) => {
            println!("{}Hiba a sessionök lekérdezésekor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError()
                .body(format!("{{\"eredmeny\": \"hiba\", \"uzenet\":\"Hiba a felhasználók lekérdezésekor: {}\"}}", err));
        }
    };

    let felhasználó = match conn.query_map(
        format!("SELECT azonosito, felhasznalonev, jelszo, COALESCE(email, ''), COALESCE(admin, ''), megjeleno_nev FROM felhasznalok WHERE azonosito = {}", session.azonosító),
        |(azonosito, felhasznalonev, jelszo, email, admin, megjeleno_nev)| {
            AdatbázisEredményFelhasználó {
                azonosító: azonosito,
                felhasználónév: felhasznalonev,
                jelszó: jelszo,
                email: email,
                admin: admin,
                megjelenő_név: megjeleno_nev,
            }
        }
    ) {
        Ok(felhasználó) => match felhasználó.into_iter().nth(0) {
            None => {
                return HttpResponse::Ok()
                    .body("{\"eredmeny\": \"hiba\", \"valasz\":\"Nem vagy belépve\"}");
            },
            Some(felhasználó) => felhasználó,
        },
        Err(err) => {
            println!("{}Hiba a felhasználók lekérdezésekor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError()
                .body(format!("{{\"eredmeny\": \"hiba\", \"uzenet\":\"Hiba a felhasználók lekérdezésekor: {}\"}}", err));
        }
    };

    return HttpResponse::Ok()
        .body(format!("{{\"eredmeny\": \"ok\", \"session_loggedin\": \"yes\", \"session_username\": \"{}\", \"megjeleno_nev\": \"{}\", \"session_admin\": \"{}\"}}", felhasználó.felhasználónév, felhasználó.megjelenő_név, felhasználó.admin));
}

pub fn belépés(megadott_felhasználónév: String, megadott_jelszó: String, felhasználó_session_azonosítója: Option<String>) -> std::result::Result<(String, String), String> {
    let mut conn = match csatlakozás(crate::FELHASZNALOK_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            return Err(format!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err));
        }
    };

    let felhasználók = match conn.query_map(
            format!("SELECT COALESCE(azonosito, ''), COALESCE(felhasznalonev, ''), COALESCE(jelszo, ''), COALESCE(email, ''), COALESCE(admin, ''), COALESCE(megjeleno_nev, '') FROM felhasznalok WHERE felhasznalonev = '{}'", megadott_felhasználónév),
            |(azonosito, felhasznalonev, jelszo, email, admin, megjeleno_nev)| {
                AdatbázisEredményFelhasználó {
                    azonosító: azonosito,
                    felhasználónév: felhasznalonev,
                    jelszó: jelszo,
                    email: email,
                    admin: admin,
                    megjelenő_név: megjeleno_nev,
                }
            }
    ) {
        Ok(felhasználók) => felhasználók,
        Err(err) => {
            println!("{}Hiba a felhasználók lekérdezésekor: {}", LOG_PREFIX, err);
            return Err(format!("{}Hiba a felhasználók lekérdezésekor: {}", LOG_PREFIX, err));
        }
    };

    if felhasználók.len() <= 0 {
        println!("{}Nincs ilyen felhasználó: {}", LOG_PREFIX, megadott_felhasználónév);
        return Err(format!("{}Nincs ilyen felhasználó: {}", LOG_PREFIX, megadott_felhasználónév));
    }

    let felhasználó = match felhasználók.into_iter().nth(0) {
        None => {
            println!("{}Nincs ilyen felhasználó: {}", LOG_PREFIX, megadott_felhasználónév);
            return Err(format!("{}Nincs ilyen felhasználó: {}", LOG_PREFIX, megadott_felhasználónév));
        },
        Some(felhasználó) => felhasználó,
    };

    let felhasználó_tényleges_jelszava = felhasználó.jelszó;

    match bcrypt::verify(megadott_jelszó, &felhasználó_tényleges_jelszava) {
        Ok(verified) => {
            if !verified {
                println!("{}Hibás megadott_jelszó", LOG_PREFIX);
                return Err(format!("{}Hibás megadott_jelszó", LOG_PREFIX));
            }
        },
        Err(err) => {
            println!("{}Hiba a megadott_jelszó ellenőrzésekor: {}", LOG_PREFIX, err);
            return Err(format!("{}Hiba a megadott_jelszó ellenőrzésekor: {}", LOG_PREFIX, err));
        }
    }

    let használandó_session_azonosító = match felhasználó_session_azonosítója {
        None => session_azonosito_generator::random_új_session_azonosító(),
        Some(azonosító) => azonosító,
    };

    match conn.query_drop(format!("INSERT INTO sessionok (azonosito, session_kulcs, datum) VALUES ({}, '{}', now(6))", felhasználó.azonosító, használandó_session_azonosító)) {
        Ok(_) => {},
        Err(err) => {
            println!("{}Hiba a session táblába való beszúráskor: {}", LOG_PREFIX, err);
            return Err(format!("{}Hiba a session táblába való beszúráskor: {}", LOG_PREFIX, err));
        }
    }

    return Ok((format!("{{\"eredmeny\": \"ok\", \"uzenet\":\"Sikeres belépés\"}}"), használandó_session_azonosító));
}

pub fn kijelentkezés(request: HttpRequest) -> HttpResponse {
    let felhasználó_jelenlegi_cookie_azonosítója = match request.cookie("session_azonosito") {
        None => {
            println!("{}Nincs session_azonosito cookie", LOG_PREFIX);
            return HttpResponse::BadRequest().body("{\"eredmeny\": \"hiba\", \"uzenet\":\"Nincs session_azonosito cookie\"}");
        },
        Some(cookie) => cookie.value().to_owned(),
    };

    let mut conn = match csatlakozás(crate::FELHASZNALOK_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            let hiba = format!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            println!("{}", hiba);
            return HttpResponse::InternalServerError().body(format!("{}", hiba));
        }
    };

    match conn.query_drop(format!("DELETE FROM sessionok WHERE session_kulcs = '{}'", &felhasználó_jelenlegi_cookie_azonosítója)) {
        Ok(_) => {},
        Err(err) => {
            let hiba = format!("{}Hiba a session táblából való törléskor: {}", LOG_PREFIX, err);
            println!("{}", hiba);
            return HttpResponse::InternalServerError().body(format!("{}", hiba));
        }
    }

    let session_azonosító_cookie = Cookie::new("session_azonosito", format!("; Domain={}; Max-age=0;", crate::DOMAIN));
    let mut visszatérési_érték = HttpResponse::Ok()
        .body("{\"eredmeny\": \"ok\", \"uzenet\":\"Sikeres kijelentkezés\"}");

    match visszatérési_érték.add_cookie(&session_azonosító_cookie) {
        Err(hiba) => {
            let hiba = format!("{}Hiba a cookie hozzáadásakor: {}", LOG_PREFIX, hiba);
            println!("{}", hiba);
            HttpResponse::InternalServerError().body(hiba)
        },
        Ok(_) => return visszatérési_érték,
    }
}