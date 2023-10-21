use actix_web::HttpResponse;
use actix_web::HttpRequest;
use mysql::*;
use mysql::prelude::*;
use std::process::Command;
use regex::Regex;
use actix_web::cookie::Cookie;
use std::fs::File;
use std::io::Read;
use chrono::*;
use chrono::offset::Utc;
use std::os::unix::prelude::FileExt;
use actix_multipart::*;
use futures_util::StreamExt as _;
use crate::alap_fuggvenyek::exit_error;
use crate::alap_fuggvenyek::exit_ok;

use crate::mime_types;

pub mod session_azonosito_generator;
pub mod lekerdezesek;

static LOG_PREFIX: &str = "[backend  ] ";
static ERVENYTELEN_COOKIE: &str = "ervenytelen_cookie";
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

pub struct AdatbázisEredményFelhasználóToken {
    felhasználó_azonosító: u32,
    token: String,
    generálás_dátuma: String,
}

pub struct AdatbázisEredményFelhasználó {
    pub azonosító: u32,
    pub felhasználónév: String,
    pub jelszó: String,
    pub sha256_jelszó: String,
    pub email: String,
    pub admin: String,
    pub megjelenő_név: String,
    pub minecraft_username: String,
    pub minecraft_islogged: i16,
    pub minecraft_lastlogin: i64,
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
            "SELECT COALESCE(users.megjeleno_nev, ''), COALESCE(user_id, 0), files.titkositott, files.id AS 'id', files.size, filename, added, COALESCE(username, ''), private, files.titkositas_kulcs FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC",
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
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
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
        format!("SELECT id, username, password, email, admin, megjeleno_nev, sha256_password, minecraft_username, minecraft_islogged, minecraft_lastlogin FROM users WHERE id = {}", session.azonosító),
        |(azonosito, felhasznalonev, jelszo, email, admin, megjeleno_nev, sha256_password, minecraft_username, minecraft_islogged, minecraft_lastlogin)| {
            AdatbázisEredményFelhasználó {
                azonosító: azonosito,
                felhasználónév: felhasznalonev,
                jelszó: jelszo,
                email,
                admin,
                megjelenő_név: megjeleno_nev,
                sha256_jelszó: sha256_password,
                minecraft_username,
                minecraft_islogged,
                minecraft_lastlogin
            }
        }
    ) {
        Ok(felhasználó) => match felhasználó.into_iter().nth(0) {
            None => { return None; },
            Some(felhasználó) => { return Some(felhasználó); },
        },
        Err(err) => {
            println!("{}cooki_gazdájának_lekérdezése: Hiba a felhasználók lekérdezésekor: {}", LOG_PREFIX, err);
            return None;
        }
    };
}

pub fn teamspeak_token_információ_lekérdezése(felhasználó_cookie_azonosítója: Option<String>) -> HttpResponse {
    let felhasználó_jelenlegi_cookie_azonosítója = match felhasználó_cookie_azonosítója {
        None => {
            return HttpResponse::BadRequest().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Nem vagy belépve.\"}}")));
        },
        Some(cookie) => cookie,
    };

    let felhasználó = cookie_gazdájának_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója);

    match felhasználó {
        None => {
            return HttpResponse::BadRequest().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Nem vagy belépve.\"}}")));
        },
        Some(_) => {},
    }

    let mut conn = match csatlakozás(crate::HAUSZ_TS_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba az adatbázishoz való csatlakozáskor.\"}}")));
        }
    };

    let felhasználó_tokenek = match conn.query_map(
        format!("SELECT user_id, token, generalasi_datum FROM felhasznalo_tokenek WHERE user_id = {}", felhasználó.unwrap().azonosító),
        |(user_id, token, generalasi_datum)| {
            AdatbázisEredményFelhasználóToken {
                felhasználó_azonosító: user_id,
                token: token,
                generálás_dátuma: generalasi_datum,
            }
        }
    ) {
        Ok(felhasználó_tokenek) => felhasználó_tokenek,
        Err(err) => {
            println!("{}Hiba a felhasználó tokenek lekérdezésekor: {}", LOG_PREFIX, err);
            Vec::new()
        },
    };

    let felhasználó_tokenje = match felhasználó_tokenek.into_iter().nth(0) {
        None => {
            return HttpResponse::Ok().body(exit_ok(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Jelenleg nincs jogosultsági tokened.\"}}")));
        },
        Some(első_token) => első_token,
    };

    let generálás_dátuma = match DateTime::parse_from_str(&felhasználó_tokenje.generálás_dátuma.as_str(), "%Y-%m-%d %H:%M:%S") {
        Ok(generálás_dátuma) => generálás_dátuma,
        Err(err) => {
            println!("{}Hiba a generálás dátumának lekérdezésekor: dátum: {} Err: {}", LOG_PREFIX, felhasználó_tokenje.generálás_dátuma, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba a generálás dátumának lekérdezésekor.\"}}")));
        }
    };
    let token_cd_lejárt: bool = ( generálás_dátuma + chrono::Duration::seconds(crate::HAUSZ_TS_TOKEN_IGENYLES_CD) ) < Utc::now();

    HttpResponse::Ok()
        .body(format!("{{\"eredmeny\": \"ok\", \"token\": \"{}\", \"jogosult_uj_token_keresere\": \"{}\"}}", felhasználó_tokenje.token, if token_cd_lejárt { "igen" } else { "nem" }))
}

pub fn teamspeak_szerver_státusz_lekérdezése(felhasználó_cookie_azonosítója: Option<String>) -> HttpResponse {
    let felhasználó_jelenlegi_cookie_azonosítója = match felhasználó_cookie_azonosítója {
        None => {
            return HttpResponse::BadRequest().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Nem vagy belépve.\"}}")));
        },
        Some(cookie) => cookie,
    };

    match cookie_gazdájának_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója) {
        None => {
            return HttpResponse::BadRequest().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Nem vagy belépve.\"}}")));
        },
        Some(_) => {},
    }

    let check_telnet_kimenete = Command::new("/bin/sh")
        .arg("/webszerver/check_telnet.sh")
        .output()
        .expect("Hiba a telnet ellenőrzéséhez szükséges parancs futtatásakor!");

    let telnet_kimenet_regex = Regex::new(r"(.*)elcome to the TeamSpeak 3 ServerQuery interface(.*)").unwrap();
    let telnet_státusz = telnet_kimenet_regex.is_match(String::from_utf8_lossy(&check_telnet_kimenete.stdout).into_owned().as_str());

    let uptime_kimenete = match Command::new("uptime")
        .output() {
            Ok(output) => String::from_utf8_lossy(&output.stdout).into_owned(),
            Err(err) => {
                println!("{}Uptime parancs futtatása sikertelen!: {}", LOG_PREFIX, err);
                String::from("21:30  up 7 days,  6:34, 1 user, load average: 2.60 2.38 2.40")
            },
        };

    let uptime_load_average_regex = match Regex::new(r"load average: ([0-9\.]*), ([0-9\.]*), ([0-9\.]*)") {
        Ok(regex) => regex,
        Err(err) => {
            println!("{}Uptime regex elkészítése sikertelen: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba a szerver státuszának lekérdezésekor.\"}}")));
        },
    };
    let uptime_load_averages = match uptime_load_average_regex.captures(&uptime_kimenete.as_str()) {
        Some(captures) => captures,
        None => {
            println!("{}Uptime regex nem talált egyezést: '{}'", LOG_PREFIX, uptime_kimenete);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba a szerver státuszának lekérdezésekor.\"}}")));
        },
    };
    let processzor_1perc = match uptime_load_averages.get(1).unwrap().as_str().parse::<f32>() {
        Ok(perc) => perc,
        Err(err) => {
            println!("{}Uptime kimenet processzor_1perc-re alakítása sikertelen: '{}'", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba a szerver státuszának lekérdezésekor.\"}}")));
        },
    };
    let processzor_5perc = match uptime_load_averages.get(2).unwrap().as_str().parse::<f32>() {
        Ok(perc) => perc,
        Err(err) => {
            println!("{}Uptime kimenet processzor_5perc-re alakítása sikertelen: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba a szerver státuszának lekérdezésekor.\"}}")));
        },
    };
    let processzor_15perc = match uptime_load_averages.get(3).unwrap().as_str().parse::<f32>() {
        Ok(perc) => perc,
        Err(err) => {
            println!("{}Uptime kimenet processzor_15perc-re alakítása sikertelen: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba a szerver státuszának lekérdezésekor.\"}}")));
        },
    };

    let free_parancs_kimenete = match Command::new("free")
        .arg("-m")
        .output() {
            Ok(output) => String::from_utf8_lossy(&output.stdout).into_owned(),
            Err(err) => {
                println!("{}Free parancs futtatása sikertelen!: {}", LOG_PREFIX, err);
                String::from("")
            },
        };

    let free_memória_regex = Regex::new(r"Mem:[ \t]*([0-9]*)[ \t]*([0-9]*)[ \t]*([0-9]*)[ \t]*([0-9]*)[ \t]*([0-9]*)[ \t]*([0-9]*)").unwrap();
    let free_memória = free_memória_regex.captures(&free_parancs_kimenete.as_str()).unwrap();
    let memória_használat = free_memória.get(2).unwrap().as_str().parse::<f32>().unwrap() / free_memória.get(1).unwrap().as_str().parse::<f32>().unwrap();

    let free_swap_regex = Regex::new(r"Swap:[ \t]*([0-9]*)[ \t]*([0-9]*)[ \t]*([0-9]*)").unwrap();
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

pub fn teamspeak_új_token_igénylése(felhasználó_cookie_azonosítója: Option<String>) -> HttpResponse {
    let felhasználó_jelenlegi_cookie_azonosítója = match &felhasználó_cookie_azonosítója {
        None => String::from(""),
        Some(cookie) => cookie.to_owned(),
    };

    let felhasználó = cookie_gazdájának_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója);

    match (felhasználó_cookie_azonosítója, &felhasználó) {
        (None, _) => {
            return HttpResponse::Unauthorized().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Nem vagy belépve.\"}}")));
        }
        (Some(_), None) => {
            return HttpResponse::Unauthorized().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Nem vagy belépve.\"}}")));
        }
        (_, _) => (),
    }

    let mut conn = match csatlakozás(crate::HAUSZ_TS_ADATBAZIS_URL) {
        Err(err) => {
            println!("{}Hiba a Teamspeak adatbázishoz való csatlakozás során: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba az új TeamSpeak token igénylésekor.\"}}")));
        },
        Ok(conn) => conn,
    };

    let felhasználó = felhasználó.unwrap();

    match conn.query_drop(format!("DELETE FROM `felhasznalo_tokenek` WHERE `user_id` = {}", felhasználó.azonosító)) {
        Err(err) => {
            println!("{}Hiba a Teamspeak token törlésekor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba az új TeamSpeak token igénylésekor.\"}}")));
        },
        Ok(_) => (),
    }

    let create_token_sh_kimenete = Command::new("/bin/sh")
        .arg("/webszerver/create_token.sh")
        .output()
        .expect("Hiba a create_token.sh futtatásakor!");

    let create_token_sh_kimenete = String::from_utf8_lossy(&create_token_sh_kimenete.stdout).into_owned();

    let token_regex = Regex::new(r"token=(.*)[\r\n]*error").unwrap();

    let token = match token_regex.captures(&create_token_sh_kimenete) {
        None => {
            println!("{}Hiba a Teamspeak token létrehozásakor: Nem sikerült a token lekérdezése a create_token.sh kimenetéből. Kimenet: '{}'", LOG_PREFIX, create_token_sh_kimenete);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba az új TeamSpeak token igénylésekor.\"}}")));
        },
        Some(token) => token,
    };
    let token = match token.get(1) {
        None => {
            println!("{}Hiba a Teamspeak token létrehozásakor: Nem sikerült a token kinyerése a Captures-ből", LOG_PREFIX);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba az új TeamSpeak token igénylésekor.\"}}")));
        },
        Some(token) => token.as_str().replace("\r", ""),
    };

    match conn.query_drop(format!("INSERT INTO `felhasznalo_tokenek` (`user_id`, `token`, `generalasi_datum`) VALUES ({}, '{}', now(6))", felhasználó.azonosító, token)) {
        Err(err) => {
            println!("{}Hiba a Teamspeak token létrehozásakor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\": \"Hiba az új TeamSpeak token igénylésekor.\"}}")));
        },
        Ok(_) => (),
    }

    HttpResponse::Ok()
        .body(format!("{{\"eredmeny\": \"ok\", \"valasz\": \"Új token generálása kész\"}}"))
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

    let fájlok = match conn.query_map(format!("SELECT id, user_id, filename, added, size, private, titkositott, titkositas_kulcs FROM files WHERE id = {}", fájl_azonosító), 
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

pub async fn megosztó_kezelő(request: HttpRequest, mut küldött_adatok: Multipart) -> HttpResponse {
    let mut _fájl_méret = 0;
    let mut _fájl_privát = "0";
    let mut _fájl_titkosított = 0;
    let mut _fájl_titkosítási_kulcs = "";
    let mut _titkosítási_kulcs_chunk: actix_web::web::Bytes = actix_web::web::Bytes::new();
    let mut _private_chunk: actix_web::web::Bytes = actix_web::web::Bytes::new();
    let mut fájl_content_disposition;
    let mut _fájl_név = "";
    let mut _titkosítas_feloldása_kulcs: &str = "";
    let mut _titkosítas_feloldása_kulcs_chunk;

    while let Some(item) = küldött_adatok.next().await {
        let mut field = match item {
            Ok(field) => field,
            Err(_) => {
                println!("{}küldött_adatok.next() hiba", LOG_PREFIX);
                return HttpResponse::BadRequest().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: küldött_adatok.next() hiba\"}}")));
            }
        };

        while let Some(chunk) = field.next().await {
            let content_disposition = field.content_disposition();

            let chunk = match chunk {
                Ok(chunk) => chunk,
                Err(_) => {
                    println!("{}field.next() hiba", LOG_PREFIX);
                    return HttpResponse::BadRequest().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: field.next() hiba\"}}")));
                }
            };

            let mut fájl_field_van = false;
            
            println!("{}-- FIELD: {:?}", LOG_PREFIX, match content_disposition.get_name() {
                Some(name) => {
                    if name == "titkositas_feloldasa_kulcs" {
                        _titkosítas_feloldása_kulcs_chunk = chunk.clone();
                        match std::str::from_utf8(&_titkosítas_feloldása_kulcs_chunk) {
                            Ok(s) => { _titkosítas_feloldása_kulcs = s; },
                            Err(_) => { _titkosítas_feloldása_kulcs = "(Nem UTF-8 karakterek)" },
                        };
                    }
                    if name == "fileToUpload" { fájl_field_van = true; }
                    if name == "titkositas_kulcs" {
                        _fájl_titkosított = 1;
                        _titkosítási_kulcs_chunk = chunk.clone();
                        match std::str::from_utf8(&_titkosítási_kulcs_chunk) {
                            Ok(s) => { _fájl_titkosítási_kulcs = s; },
                            Err(_) => { _fájl_titkosítási_kulcs = "(Nem UTF-8 karakterek)" },
                        }; 
                    }
                    if name == "private" {
                        _private_chunk = chunk.clone();
                        _fájl_privát = match std::str::from_utf8(&_private_chunk) {
                            Ok(s) => s,
                            Err(_) => "(Nem UTF-8 karakterek)",
                        }; 
                    }
                    name
                },
                None => "Nincs field név",
            });

            if !fájl_field_van {
                println!("{}-- ÉRTÉK: {}", LOG_PREFIX, match std::str::from_utf8(&chunk) {
                    Ok(s) => s,
                    Err(_) => "(Nem UTF-8 karakterek)",
                });
            } else {
                fájl_content_disposition = content_disposition.clone();
                let fájlnév = match fájl_content_disposition.get_filename() {
                    Some(name) => name,
                    None => {
                        println!("{}fájl név megállapítása hiba", LOG_PREFIX);
                        return HttpResponse::BadRequest().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: fájl név hiba\"}}")));
                    }
                };

                _fájl_név = fájlnév;

                println!("{}-- FÁJL: '{}', Méret: {} B", LOG_PREFIX, fájlnév, chunk.len());
                _fájl_méret = chunk.len();

                let fájl = match std::fs::File::create(format!("/public/megoszto/fajlok/{}", fájlnév)) {
                    Ok(fájl) => fájl,
                    Err(_) => {
                        println!("{}fájl létrehozása hiba", LOG_PREFIX);
                        return HttpResponse::BadRequest().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: fájl létrehozása hiba\"}}")));
                    }
                };

                match fájl.write_all_at(&chunk, 0) {
                    Ok(_) => (),
                    Err(_) => {
                        println!("{}fájl írása hiba", LOG_PREFIX);
                        return HttpResponse::BadRequest().body(exit_error(format!("{{\"eredmeny\": \"hiba\", \"valasz\":\"Szerver hiba: fájl írása hiba\"}}")));
                    }
                };
            }
        }
    }

    let cookie_azonosító = match request.cookie("session_azonosito") {
        Some(cookie) => cookie.value().to_owned(),
        None => ERVENYTELEN_COOKIE.to_string(),
    };
    HttpResponse::Ok().body(exit_ok(format!("BACKEND: Letölés kezelő TODO")))

}

pub async fn feltöltés_kezelése(felhasználó: Option<AdatbázisEredményFelhasználó>, fájl_név: &str, fájl_méret: usize, fájl_privát: &str, fájl_titkosított: i32, fájl_titkosítási_kulcs: &str, _query_values_felhasználó_kiegészítés: &str) -> HttpResponse {
    let (query_values_felhasználó_kiegészítés, query_insert_felhasználó_kiegészítés) = match felhasználó {
        Some(felhasználó) => (format!(", {}", felhasználó.azonosító), format!(", user_id")),
        None => (String::from(""), String::from("")),
    };

    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            let hiba = format!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            println!("{}", hiba);
            return HttpResponse::InternalServerError().body(exit_error(format!("{}", hiba)));
        }
    };

    match conn.query_drop(format!("INSERT INTO files (filename, added, size, private, titkositott, titkositas_kulcs{}) VALUES ('{}', NOW(), {}, {}, {}, '{}'{})", 
        &query_insert_felhasználó_kiegészítés, &fájl_név, &fájl_méret, &fájl_privát, &fájl_titkosított, &fájl_titkosítási_kulcs, &query_values_felhasználó_kiegészítés)) {
            Ok(_) => (),
            Err(err) => {
                let hiba = format!("{}Hiba a fájl táblába való beszúráskor: {}", LOG_PREFIX, err);
                println!("{}", hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("{}", hiba)));
            }
    }

    HttpResponse::Ok()
        .body(format!("{{\"eredmeny\": \"ok\", \"valasz\":\"A '{}' nevű fájl sikeresen fel lett töltve.\"}}", &fájl_név))
}