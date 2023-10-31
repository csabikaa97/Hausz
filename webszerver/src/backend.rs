use actix_web::HttpResponse;
use mysql::*;
use mysql::prelude::*;
use std::process::Command;
use regex::Regex;
use chrono::*;
use chrono::offset::Utc;
use crate::alap_fuggvenyek::exit_error;
use crate::alap_fuggvenyek::exit_ok;

use crate::session::Session;

pub mod session_azonosito_generator;
pub mod lekerdezesek;

static LOG_PREFIX: &str = "[backend  ] ";
pub struct AdatbázisEredményFájl {
    pub azonosító: u32,
    pub felhasználó_azonosító: u32,
    pub felhasználó_megjelenő_név: String,
    pub felhasználónév: String,
    pub fájlnév: String,
    pub hozzáadás_dátuma: String,
    pub méret: u32,
    pub privát: u8,
    pub titkosított: u8,
    pub titkosítás_kulcs: String,
    pub members_only: u8,
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

pub struct AdatbázisEredményMinecraftFelhasználó {
    pub username: String,
    pub minecraft_username: String,
    pub minecraft_islogged: i16,
    pub minecraft_lastlogin: i64
}

pub struct AdatbázisEredményIgényeltFelhasználó {
    request_id: u32,
    username: String,
    password: String,
    sha256_password: String,
    email: String,
    megjeleno_nev: String,
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

pub fn saját_fájlok_lekérdezése(session: Session) -> HttpResponse {
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError()
                .body(exit_error(format!("Hiba az adatbázishoz való csatlakozáskor: {}", err)));
        }
    };

    let fájlok = match conn.query_map(
            format!("SELECT COALESCE(users.megjeleno_nev, ''), COALESCE(user_id, 0), files.titkositott, files.id AS 'id', files.size, filename, added, COALESCE(username, ''), private, COALESCE(files.titkositas_kulcs, ''), members_only FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC"),
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
                titkositas_kulcs,
                members_only)|
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
                members_only,
            },
        ) {
            Ok(fájlok) => fájlok,
            Err(err) => {
                println!("{}Hiba az adatbázis lekérdezésekor: (10) {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().finish();
            }
        };

    let mut fájlok_szöveg = String::new();

    let mut valid_fájlok_száma = 0;
    for fájl in fájlok {
        if fájl.azonosító != session.user_id && fájl.privát == 1 {
            continue;
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
            return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve.")));
        },
        Some(cookie) => cookie,
    };

    let felhasználó = cookie_gazdájának_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója);

    match felhasználó {
        None => {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve.")));
        },
        Some(_) => {},
    }

    let mut conn = match csatlakozás(crate::HAUSZ_TS_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba az adatbázishoz való csatlakozáskor.")));
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
            return HttpResponse::Ok().body(exit_ok(format!("Jelenleg nincs jogosultsági tokened.")));
        },
        Some(első_token) => első_token,
    };

    let generálás_dátuma = match DateTime::parse_from_str(&felhasználó_tokenje.generálás_dátuma.as_str(), "%Y-%m-%d %H:%M:%S") {
        Ok(generálás_dátuma) => generálás_dátuma,
        Err(err) => {
            println!("{}Hiba a generálás dátumának lekérdezésekor: dátum: {} Err: {}", LOG_PREFIX, felhasználó_tokenje.generálás_dátuma, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a generálás dátumának lekérdezésekor.")));
        }
    };
    let token_cd_lejárt: bool = ( generálás_dátuma + chrono::Duration::seconds(crate::HAUSZ_TS_TOKEN_IGENYLES_CD) ) < Utc::now();

    HttpResponse::Ok()
        .body(format!("{{\"eredmeny\": \"ok\", \"token\": \"{}\", \"jogosult_uj_token_keresere\": \"{}\"}}", felhasználó_tokenje.token, if token_cd_lejárt { "igen" } else { "nem" }))
}

pub fn teamspeak_szerver_státusz_lekérdezése(felhasználó_cookie_azonosítója: Option<String>) -> HttpResponse {
    let felhasználó_jelenlegi_cookie_azonosítója = match felhasználó_cookie_azonosítója {
        None => {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve.")));
        },
        Some(cookie) => cookie,
    };

    match cookie_gazdájának_lekérdezése(felhasználó_jelenlegi_cookie_azonosítója) {
        None => {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve.")));
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
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a szerver státuszának lekérdezésekor.")));
        },
    };
    let uptime_load_averages = match uptime_load_average_regex.captures(&uptime_kimenete.as_str()) {
        Some(captures) => captures,
        None => {
            println!("{}Uptime regex nem talált egyezést: '{}'", LOG_PREFIX, uptime_kimenete);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a szerver státuszának lekérdezésekor.")));
        },
    };
    let processzor_1perc = match uptime_load_averages.get(1).unwrap().as_str().parse::<f32>() {
        Ok(perc) => perc,
        Err(err) => {
            println!("{}Uptime kimenet processzor_1perc-re alakítása sikertelen: '{}'", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a szerver státuszának lekérdezésekor.")));
        },
    };
    let processzor_5perc = match uptime_load_averages.get(2).unwrap().as_str().parse::<f32>() {
        Ok(perc) => perc,
        Err(err) => {
            println!("{}Uptime kimenet processzor_5perc-re alakítása sikertelen: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a szerver státuszának lekérdezésekor.")));
        },
    };
    let processzor_15perc = match uptime_load_averages.get(3).unwrap().as_str().parse::<f32>() {
        Ok(perc) => perc,
        Err(err) => {
            println!("{}Uptime kimenet processzor_15perc-re alakítása sikertelen: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a szerver státuszának lekérdezésekor.")));
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
            return HttpResponse::Unauthorized().body(exit_error(format!("Nem vagy belépve.")));
        }
        (Some(_), None) => {
            return HttpResponse::Unauthorized().body(exit_error(format!("Nem vagy belépve.")));
        }
        (_, _) => (),
    }

    let mut conn = match csatlakozás(crate::HAUSZ_TS_ADATBAZIS_URL) {
        Err(err) => {
            println!("{}Hiba a Teamspeak adatbázishoz való csatlakozás során: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba az új TeamSpeak token igénylésekor.")));
        },
        Ok(conn) => conn,
    };

    let felhasználó = felhasználó.unwrap();

    match conn.query_drop(format!("DELETE FROM `felhasznalo_tokenek` WHERE `user_id` = {}", felhasználó.azonosító)) {
        Err(err) => {
            println!("{}Hiba a Teamspeak token törlésekor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba az új TeamSpeak token igénylésekor.")));
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
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba az új TeamSpeak token igénylésekor.")));
        },
        Some(token) => token,
    };
    let token = match token.get(1) {
        None => {
            println!("{}Hiba a Teamspeak token létrehozásakor: Nem sikerült a token kinyerése a Captures-ből", LOG_PREFIX);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba az új TeamSpeak token igénylésekor.")));
        },
        Some(token) => token.as_str().replace("\r", ""),
    };

    match conn.query_drop(format!("INSERT INTO `felhasznalo_tokenek` (`user_id`, `token`, `generalasi_datum`) VALUES ({}, '{}', now(6))", felhasználó.azonosító, token)) {
        Err(err) => {
            println!("{}Hiba a Teamspeak token létrehozásakor: {}", LOG_PREFIX, err);
            return HttpResponse::InternalServerError().body(exit_error(format!("Hiba az új TeamSpeak token igénylésekor.")));
        },
        Ok(_) => (),
    }

    HttpResponse::Ok()
        .body(format!("{{\"eredmeny\": \"ok\", \"valasz\": \"Új token generálása kész\"}}"))
}