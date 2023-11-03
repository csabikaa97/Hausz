use actix_web::HttpResponse;
use mysql::*;
use mysql::prelude::*;
use crate::alap_fuggvenyek::exit_error;

use crate::session::Session;

pub mod session_azonosito_generator;
pub mod lekerdezesek;

static LOG_PREFIX: &str = "[backend  ] ";

pub struct AdatbázisEredményTeamspeakFelhasználó {
    pub client_id: u32,
    pub client_nickname: String,
}
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
    pub felhasználó_azonosító: u32,
    pub token: String,
    pub datediff: u32,
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
    pub request_id: u32,
    pub username: String,
    pub password: String,
    pub sha256_password: String,
    pub email: String,
    pub megjeleno_nev: String,
}

pub struct AdatbázisEredménySession {
    azonosító: u32,
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
        format!("SELECT azonosito AS eltelt_masodpercek FROM sessionok WHERE session_kulcs = '{}' AND TIMESTAMPDIFF(SECOND, datum, now(6)) < {}", cookie_azonosító, crate::SESSION_LEJÁRATI_IDEJE_MP),
        |azonosito| {
            AdatbázisEredménySession {
                azonosító: azonosito,
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
        format!("SELECT id, COALESCE(username, ''), COALESCE(password, ''), COALESCE(email, ''), admin, COALESCE(megjeleno_nev, ''), COALESCE(sha256_password, ''), COALESCE(minecraft_username, ''), minecraft_islogged, minecraft_lastlogin FROM users WHERE id = {}", session.azonosító),
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