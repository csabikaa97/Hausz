use actix_web::HttpResponse;
use mysql::MySqlError;
use crate::alap_fuggvenyek::get_password_part;
use crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok;
use crate::backend::csatlakozás;
use mysql::*;
use mysql::prelude::*;
use mysql::prelude;

use super::AdatbázisEredményFelhasználó;

pub fn új_session_beillesztése(cookie: String, felhasznalo: AdatbázisEredményFelhasználó) -> Result<String> {
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", crate::LOG_PREFIX, err);
            return Err(err);
        }
    };

    match conn.exec_drop(
        r"INSERT INTO sessionok (azonosito, session_kulcs, datum)
          VALUES (:azonosito, :session_kulcs, NOW(6))",
        params! {
            "azonosito" => felhasznalo.azonosító,
            "session_kulcs" => cookie
        }
    ) {
        Err(hiba) => { return Err(hiba); },
        Ok(_) => { return Ok("Cookie beillesztve".to_owned()) }
    }

}

pub fn session_törlése(cookie: String, user_id: u32) -> Result<String> {
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", crate::LOG_PREFIX, err);
            return Err(err);
        }
    };

    match conn.exec_drop(
        r"DELETE FROM sessionok WHERE session_kulcs=:session_kulcs AND azonosito=:azonosito",
        params! {
            "azonosito" => user_id,
            "session_kulcs" => cookie
        }
    ) {
        Err(hiba) => { return Err(hiba); },
        Ok(_) => { return Ok("Cookie törölve".to_owned()) }
    }

}

pub fn felhasznalo_lekerdezese(azonosító_adat: FelhasználóAzonosítóAdatok) -> Result<AdatbázisEredményFelhasználó> {
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", crate::LOG_PREFIX, err);
            return Err(err);
        }
    };

    let username: String;
    let azonosító_szám: i32;
    let lekérdezés_szűrés: String;
    match azonosító_adat {
        FelhasználóAzonosítóAdatok::Azonosító(eredmény) => {
            username = "".to_owned();
            azonosító_szám = eredmény;
            lekérdezés_szűrés = "WHERE id=".to_owned() + &azonosító_szám.to_string();
        },
        FelhasználóAzonosítóAdatok::Felhasználónév(felhasználónév) => {
            azonosító_szám = 0;
            username = felhasználónév;
            lekérdezés_szűrés = "WHERE username='".to_owned() + &username + "'";
        },
    };

    let felhasználók = match conn.query_map(
            format!("SELECT id, username, password, COALESCE(sha256_password, ''), COALESCE(email, ''), admin, megjeleno_nev, COALESCE(minecraft_username, ''), minecraft_islogged, minecraft_lastlogin FROM users {}", lekérdezés_szűrés),
            |(
                id,
                username,
                password,
                sha256_password,
                email,
                admin,
                megjeleno_nev,
                minecraft_username,
                minecraft_islogged,
                minecraft_lastlogin
            )| AdatbázisEredményFelhasználó {
                azonosító: id,
                felhasználónév: username,
                jelszó: password,
                sha256_jelszó: sha256_password,
                email,
                admin,
                megjelenő_név: megjeleno_nev,
                minecraft_username,
                minecraft_islogged,
                minecraft_lastlogin
            }
        ) {
            Ok(eredmény) => eredmény,
            Err(err) => {
                println!("{}Hiba az adatbázis lekérdezésekor: {}", crate::LOG_PREFIX, err);
                return Err(err);
            }
        };

    let felhasználó = match felhasználók.first() {
        Some(felhasználó) => felhasználó,
        None => {
            println!("{}Nincs ilyen felhasználó ({})", crate::LOG_PREFIX, username);
            return Err(mysql::Error::MySqlError(MySqlError {
                state: "HY000".to_owned(),
                code: 0,
                message: "Nincs ilyen felhasználó".to_owned(),
            }));
        }
    };

    Ok(AdatbázisEredményFelhasználó {
        azonosító: felhasználó.azonosító,
        felhasználónév: felhasználó.felhasználónév.clone(),
        jelszó: felhasználó.jelszó.clone(),
        sha256_jelszó: felhasználó.sha256_jelszó.clone(),
        email: felhasználó.email.clone(),
        admin: felhasználó.admin.clone(),
        megjelenő_név: felhasználó.megjelenő_név.clone(),
        minecraft_username: felhasználó.minecraft_username.clone(),
        minecraft_islogged: felhasználó.minecraft_islogged.clone(),
        minecraft_lastlogin: felhasználó.minecraft_lastlogin.clone(),
    })
}

pub fn salt_lekerdezese(salt_username: &str) -> Result<String> {
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", crate::LOG_PREFIX, err);
            return Err(err);
        }
    };

    let felhasználók = match conn.query_map(
            format!("SELECT id, username, password, COALESCE(sha256_password, ''), COALESCE(email, ''), admin, megjeleno_nev, COALESCE(minecraft_username, ''), minecraft_islogged, minecraft_lastlogin FROM users WHERE username='{}'", salt_username),
            |(
                id,
                username,
                password,
                sha256_password,
                email,
                admin,
                megjeleno_nev,
                minecraft_username,
                minecraft_islogged,
                minecraft_lastlogin
            )| AdatbázisEredményFelhasználó {
                azonosító: id,
                felhasználónév: username,
                jelszó: password,
                sha256_jelszó: sha256_password,
                email,
                admin,
                megjelenő_név: megjeleno_nev,
                minecraft_username,
                minecraft_islogged,
                minecraft_lastlogin
            }
        ) {
            Ok(felhasználók) => felhasználók,
            Err(err) => {
                println!("{}Hiba az adatbázis lekérdezésekor: {}", crate::LOG_PREFIX, err);
                return Err(err);
            }
        };

    let felhasználó = match felhasználók.first() {
        Some(felhasználó) => felhasználó,
        None => {
            println!("{}Nincs ilyen felhasználó ({})", crate::LOG_PREFIX, salt_username);
            return Err(mysql::Error::MySqlError(MySqlError {
                state: "HY000".to_owned(),
                code: 0,
                message: "Nincs ilyen felhasználó".to_owned(),
            }));
        }
    };

    // get the salt from $SHA$salt$password_hash
    let sha_password = &felhasználó.sha256_jelszó;
    if &sha_password[0..5] != "$SHA$" {
        println!("{}Nem megfelelő a jelszó formátuma az adatbázisban ({})", crate::LOG_PREFIX, salt_username);
        return Err(mysql::Error::MySqlError(MySqlError {
            state: "HY000".to_owned(),
            code: 0,
            message: "Nem megfelelő a jelszó formátuma az adatbázisban".to_owned(),
        }));
    }

    let password_in_db = sha_password.split("$").collect::<Vec<&str>>();
    let salt_in_db = password_in_db[2];

    Ok(salt_in_db.to_owned())
}
