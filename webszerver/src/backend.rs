use actix_web::HttpResponse;
use actix_web::HttpRequest;
use mysql::*;
use mysql::prelude::*;
use std::process::Command;
use regex::Regex;
use bcrypt;
use actix_web::cookie::Cookie;
use std::fs::File;
use std::io::Read;

use crate::mime_types;

mod session_azonosito_generator;

static LOG_PREFIX: &str = "[ADATBÁZIS] ";
static ERVENYTELEN_COOKIE: &str = "ez_a_cookie_nem_letezik";

pub struct AdatbázisEredményFájl {
    azonosító: u32,
    felhasználó_azonosító: u32,
    felhasználó_megjelenő_név: String,
    felhasználónév: String,
    fájlnév: String,
    hozzáadás_dátuma: String,
    méret: u32,
    privát: u8,
    titkosított: u8,
    titkosítás_kulcs: String,
}

pub struct AdatbázisEredményFelhasználó {
    azonosító: u32,
    felhasználónév: String,
    jelszó: String,
    email: String,
    admin: String,
    megjelenő_név: String,
}

pub struct AdatbázisEredménySession {
    azonosító: u32,
    session_kulcs: String,
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

pub fn fájlok_lekérdezése(felhasználó_cookie_azonosítója: Option<String>) -> HttpResponse {
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError()
                .body(format!("{{\"eredmeny\": \"hiba\", \"uzenet\":\"Hiba az adatbázishoz való csatlakozáskor: {}\"}}", err));
        }
    };

    let fájlok = match conn.query_map(
            "SELECT users.megjeleno_nev, user_id, files.titkositott, files.id AS 'id', files.size, filename, added, username, private, files.titkositas_kulcs FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC",
            |(
                megjeleno_nev, 
                user_id, 
                titkositott, 
                id, 
                size, 
                filename, 
                added, 
                username, 
                private, 
                titkositas_kulcs)|
            AdatbázisEredményFájl {
                felhasználó_megjelenő_név: megjeleno_nev,
                felhasználó_azonosító: user_id,
                titkosított: titkositott,
                azonosító: id,
                méret: size,
                fájlnév: filename,
                hozzáadás_dátuma: added,
                felhasználónév: username,
                privát: private,
                titkosítás_kulcs: titkositas_kulcs,
            },
        ) {
            Ok(fájlok) => fájlok,
            Err(err) => {
                println!("{}Hiba az adatbázis lekérdezésekor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().finish();
            }
        };

    let felhasználó_jelenlegi_cookie_azonosítója = match felhasználó_cookie_azonosítója {
        None => String::from(ERVENYTELEN_COOKIE),
        Some(cookie) => cookie,
    };

    let jelenlegi_felhasználó = cookie_gazdájának_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója);

    let mut fájlok_szöveg = String::new();

    let mut valid_fájlok_száma = 0;
    for fájl in fájlok {
        match (fájl.privát, &jelenlegi_felhasználó) {
            (1, Some(jelenlegi_felhasználó)) => {
                if jelenlegi_felhasználó.azonosító != fájl.felhasználó_azonosító {
                    continue;
                }
            },
            (1, None) => {
                continue;
            },
            _ => {}
        }

        if valid_fájlok_száma > 0 {
            fájlok_szöveg.push_str(",");
        }

        fájlok_szöveg.push_str(&format!(
            "{{\"megjeleno_nev\": \"{}\", \"titkositott\": {}, \"id\": {}, \"size\": {}, \"filename\": \"{}\", \"added\": \"{}\", \"username\": \"{}\", \"private\": {}}}",
            fájl.felhasználó_megjelenő_név,
            fájl.titkosított,
            fájl.azonosító,
            fájl.méret,
            fájl.fájlnév,
            fájl.hozzáadás_dátuma,
            fájl.felhasználó_azonosító,
            fájl.privát,
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

pub fn cookie_gazdájának_lekérdezése(cookie_azonosító: String) -> Option<AdatbázisEredményFelhasználó> {
    let mut conn = match csatlakozás(crate::FELHASZNALOK_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            return None;
        }
    };

    let session = match conn.query_map(
        format!("SELECT azonosito, session_kulcs, datum AS eltelt_masodpercek FROM sessionok WHERE session_kulcs = '{}' AND TIMESTAMPDIFF(SECOND, datum, now(6)) < {}", cookie_azonosító, crate::SESSION_LEJÁRATI_IDEJE_MP),
        |(azonosito, session_azonosito, datum)| {
            AdatbázisEredménySession {
                azonosító: azonosito,
                session_kulcs: session_azonosito,
                dátum: datum,
            }
        }
    ) {
        Ok(sessionök) => {
            if sessionök.len() == 0 {
                return None;
            } else {
                match sessionök.into_iter().nth(0) {  
                    None => {
                        return None;
                    },
                    Some(session) => session,
                }
            }
        },
        Err(err) => {
            println!("{}Hiba a sessionök lekérdezésekor: {}", LOG_PREFIX, err);
            return None;
        }
    };

    match conn.query_map(
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
            None => { return None; },
            Some(felhasználó) => { return Some(felhasználó); },
        },
        Err(err) => {
            println!("{}Hiba a felhasználók lekérdezésekor: {}", LOG_PREFIX, err);
            return None;
        }
    };
}

pub fn teamspeak_szerver_státusz_lekérdezése(felhasználó_cookie_azonosítója: Option<String>) -> HttpResponse {
    let felhasználó_jelenlegi_cookie_azonosítója = match felhasználó_cookie_azonosítója {
        None => {
            return HttpResponse::BadRequest().body("{\"eredmeny\": \"hiba\", \"valasz\": \"Nem vagy belépve.\"}");
        },
        Some(cookie) => cookie,
    };

    match cookie_gazdájának_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója) {
        None => {
            return HttpResponse::BadRequest().body("{\"eredmeny\": \"hiba\", \"valasz\": \"Nem vagy belépve.\"}");
        },
        Some(_) => {},
    }

    let check_telnet_sh_státusza = Command::new("./check_telnet.sh")
        .arg("file.txt")
        .status()
        .expect("failed to execute process");

    let telnet_státusz = check_telnet_sh_státusza.success();

    let uptime_kimenete = match Command::new("uptime")
        .output() {
            Ok(output) => String::from_utf8_lossy(&output.stdout).into_owned(),
            Err(err) => {
                println!("{}Uptime parancs futtatása sikertelen!: {}", LOG_PREFIX, err);
                String::from("21:30  up 7 days,  6:34, 1 user, load averages: 2.60 2.38 2.40")
            },
        };

    let uptime_load_average_regex = Regex::new(r"load averages: ([0-9\.]*) ([0-9\.]*) ([0-9\.]*)").unwrap();
    let uptime_load_averages = uptime_load_average_regex.captures(&uptime_kimenete.as_str()).unwrap();
    let processzor_1perc = uptime_load_averages.get(1).unwrap().as_str().parse::<f32>().unwrap();
    let processzor_5perc = uptime_load_averages.get(2).unwrap().as_str().parse::<f32>().unwrap();
    let processzor_15perc = uptime_load_averages.get(3).unwrap().as_str().parse::<f32>().unwrap();

    let free_parancs_kimenete = match Command::new("free")
        .arg("-m")
        .output() {
            Ok(output) => String::from_utf8_lossy(&output.stdout).into_owned(),
            Err(err) => {
                println!("{}Free parancs futtatása sikertelen!: {}", LOG_PREFIX, err);
                String::from("")
            },
        };

    let free_memória_regex = Regex::new(r"Mem:[ \t]*([0-9])[ \t]*([0-9])[ \t]*([0-9])[ \t]*([0-9])[ \t]*([0-9])[ \t]*([0-9])").unwrap();
    let free_memória = free_memória_regex.captures(&free_parancs_kimenete.as_str()).unwrap();
    let memória_használat = free_memória.get(2).unwrap().as_str().parse::<f32>().unwrap() / free_memória.get(1).unwrap().as_str().parse::<f32>().unwrap();

    let free_swap_regex = Regex::new(r"Swap:[ \t]*([0-9])[ \t]*([0-9])[ \t]*([0-9])").unwrap();
    let free_swap = free_swap_regex.captures(&free_parancs_kimenete.as_str()).unwrap();
    let swap_használat = free_swap.get(2).unwrap().as_str().parse::<f32>().unwrap() / free_swap.get(1).unwrap().as_str().parse::<f32>().unwrap();

    let df_parancs_kimenete = match Command::new("df")
        .arg("-B1")
        .output() {
            Ok(output) => String::from_utf8_lossy(&output.stdout).into_owned(),
            Err(err) => {
                println!("{}df parancs futtatása sikertelen!: {}", LOG_PREFIX, err);
                String::from("")
            },
        };
    let df_regex = Regex::new(r".*(overlay|/dev/xvda1|/dev/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*").unwrap();
    let df = df_regex.captures(&df_parancs_kimenete.as_str()).unwrap();
    let lemez_használat = df.get(3).unwrap().as_str().parse::<f32>().unwrap() / df.get(2).unwrap().as_str().parse::<f32>().unwrap();
    
    HttpResponse::Ok()
        .body(format!("{{\"eredmeny\": \"ok\", \"folyamat_ok\": {}, \"telnet_ok\": {}, \"processzor_1perc\": {}, \"processzor_5perc\": {}, \"processzor_15perc\": {}, \"memoria_hasznalat\": {}, \"swap_hasznalat\": {}, \"lemez_hasznalat\": {}}}", 
            telnet_státusz, telnet_státusz, processzor_1perc, processzor_5perc, processzor_15perc, memória_használat, swap_használat, lemez_használat))
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
    let felhasználó_session_azonosítója = match request.cookie("session_azonosito") {
        None => {
            return HttpResponse::Ok()
            .body("{\"eredmeny\": \"hiba\", \"valasz\":\"Nem vagy belépve\"}");
        },
        Some(cookie) => cookie.value().to_owned(),
    };

    match cookie_gazdájának_lekérdezése(felhasználó_session_azonosítója) {
        Some(felhasználó) => {
            return HttpResponse::Ok()
            .body(format!("{{\"eredmeny\": \"ok\", \"session_loggedin\": \"yes\", \"session_username\": \"{}\", \"megjeleno_nev\": \"{}\", \"session_admin\": \"{}\"}}", felhasználó.felhasználónév, felhasználó.megjelenő_név, felhasználó.admin));
        },
        None => {
            return HttpResponse::Ok()
            .body("{\"eredmeny\": \"hiba\", \"valasz\":\"Nem vagy belépve\"}");
        }
    }
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

pub fn megosztó_fájl_letöltés(query_elemek: Vec<(&str, &str)>, felhasználó_cookie_azonosítója: Option<String>) -> std::result::Result<HttpResponse, String> {    
    let mut fájl_azonosító: &str = "-1";
    for elem in &query_elemek {
        match elem.0 {
            "file_id" => { fájl_azonosító = elem.1; },
            _ => (),
        }
    }

    if fájl_azonosító == "-1" {
        return Err(format!("{}Nincs megadva fájl azonosító", LOG_PREFIX));
    }

    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Err(e) => {
            let hiba = format!("{}Hiba az adatbázishoz történő csatlakozás közben: {}", LOG_PREFIX, e);
            println!("{}", hiba);
            return Err(hiba);
        },
        Ok(conn) => conn,
    };

    let fájlok = match conn.query_map(format!("SELECT * FROM files WHERE id = {}", fájl_azonosító), 
    |(id, user_id, filename, added, size, private, titkositott, titkositas_kulcs)| {
        AdatbázisEredményFájl {
            azonosító: id,
            felhasználó_azonosító: user_id,
            fájlnév: filename,
            hozzáadás_dátuma: added,
            méret: size,
            privát: private,
            titkosított: titkositott,
            titkosítás_kulcs: titkositas_kulcs,
            felhasználónév: String::from(""),
            felhasználó_megjelenő_név: String::from(""),
        }
    }) {
        Err(err) => {
            let hiba = format!("{}Hiba a fájlok lekérdezésekor: {}", LOG_PREFIX, err);
            println!("{}", hiba);
            return Err(hiba);
        }
        Ok(fájlok) => fájlok,
    };

    let adatbázis_fájl = match fájlok.first() {
        None => {
            let hiba = format!("{}Nincs ilyen fájl az adatbázisban", LOG_PREFIX);
            println!("{}", hiba);
            return Err(hiba);
        },
        Some(fájl) => fájl,
    };

    let felhasználó_jelenlegi_cookie_azonosítója = match felhasználó_cookie_azonosítója {
        None => String::from(ERVENYTELEN_COOKIE),
        Some(cookie_azonosító) => cookie_azonosító,
    };

    let felhasználó = cookie_gazdájának_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója);

    match (felhasználó, adatbázis_fájl.privát, adatbázis_fájl.felhasználó_azonosító) {
        (None, 1, _) => {
            let hiba = format!("{}A letöltendő fájl privát", LOG_PREFIX);
            println!("{}", hiba);
            return Err(hiba);
        },
        (Some(felhasználó), 1, _) => {
            if felhasználó.azonosító != adatbázis_fájl.felhasználó_azonosító {
                let hiba = format!("{}Nincs jogosultságod a letöltésre", LOG_PREFIX);
                println!("{}", hiba);
                return Err(hiba);
            }
        },
        (_,_,_) => (),
    }

    let kiterjesztés = match adatbázis_fájl.fájlnév.split('.').last() {
        Some(kiterjesztés) => kiterjesztés,
        None => "",
    };
    let mime = mime_types::mime_type_megállapítása(kiterjesztés);

    let mut fájl = match File::open(format!("/public/megoszto/fajlok/{}", adatbázis_fájl.fájlnév.clone())) {
        Err(err) => {
            let hiba = format!("{}Hiba a fájl megnyitásakor: {}", LOG_PREFIX, err);
            println!("{}", hiba);
            return Err(hiba);
        },
        Ok(fájl) => fájl,
    };

    let mut buffer: Vec<u8> = Vec::new();
    match fájl.read_to_end(&mut buffer) {
        Err(err) => {
            let hiba = format!("{}Hiba a fájl beolvasásakor: {}", LOG_PREFIX, err);
            println!("{}", hiba);
            return Err(hiba);
        },
        Ok(_) => {},
    };

    Ok(HttpResponse::Ok()
        .content_type(mime)
        .append_header(("Content-disposition", format!("attachment; filename=\"{}\"", adatbázis_fájl.fájlnév)))
        .append_header(("Content-Length", format!("{}", buffer.len())))
        .body(buffer)
    )
}

pub fn kijelentkezés(felhasználó_cookie_azonosítója: Option<String>) -> HttpResponse {
    let felhasználó_jelenlegi_cookie_azonosítója: String;
    match felhasználó_cookie_azonosítója {
        None => {
            let hiba = format!("{}Nincs megadva session azonosító", LOG_PREFIX);
            println!("{}", hiba);
            return HttpResponse::InternalServerError().body(format!("{}", hiba));
        },
        Some(érték) => {
            felhasználó_jelenlegi_cookie_azonosítója = érték;
        },
    }

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