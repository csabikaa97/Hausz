use mysql::MySqlError;
use crate::alap_fuggvenyek::get_password_part;
use crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok;
use crate::backend::csatlakozás;
use mysql::*;
use mysql::prelude::*;

use super::AdatbázisEredményFelhasználó;
use super::AdatbázisEredményIgényeltFelhasználó;

pub fn meghívó_létezik(meghivo: String) -> Result<bool> {
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", crate::LOG_PREFIX, err);
            return Err(err);
        }
    };

    // query: SELECT meghivo FROM meghivok WHERE meghivo = '{}'
    let meghívók = match conn.query_map(
            format!("SELECT meghivo FROM meghivok WHERE meghivo = '{}'", meghivo),
            |meghivo: String| meghivo
        ) {
            Ok(eredmény) => eredmény,
            Err(err) => {
                println!("{}Hiba az adatbázis lekérdezésekor: {}", crate::LOG_PREFIX, err);
                return Err(err);
            }
        };

    match meghívók.first() {
        Some(meghívó) => meghívó,
        None => {
            println!("{}Nincs ilyen meghívó ({})", crate::LOG_PREFIX, meghivo);
            return Ok(false);
        }
    };

    Ok(true)
}

pub fn igényelt_felhasznalo_lekerdezese(felhasználónév: String) -> Result<AdatbázisEredményIgényeltFelhasználó> {
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", crate::LOG_PREFIX, err);
            return Err(err);
        }
    };

    let lekérdezés_szűrés: String = format!("WHERE username='{}'", felhasználónév);

    let felhasználók = match conn.query_map(
            format!("SELECT request_id, username, COALESCE(password, ''), COALESCE(sha256_password, ''), COALESCE(email, ''), COALESCE(megjeleno_nev, '') FROM users_requested {}", lekérdezés_szűrés),
            |(
                request_id,
                username,
                password,
                sha256_password,
                email,
                megjeleno_nev,
            )| AdatbázisEredményIgényeltFelhasználó {
                request_id,
                username,
                password,
                sha256_password,
                email,
                megjeleno_nev,
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
            return Err(mysql::Error::MySqlError(MySqlError {
                state: "HY000".to_owned(),
                code: 0,
                message: "Nincs ilyen felhasználó".to_owned(),
            }));
        }
    };

    Ok(AdatbázisEredményIgényeltFelhasználó {
        request_id: felhasználó.request_id,
        username: felhasználó.username.clone(),
        password: felhasználó.password.clone(),
        sha256_password: felhasználó.sha256_password.clone(),
        email: felhasználó.email.clone(),
        megjeleno_nev: felhasználó.megjeleno_nev.clone(),
    })
}

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
            return Err(mysql::Error::MySqlError(MySqlError {
                state: "HY000".to_owned(),
                code: 0,
                message: "Nincs ilyen felhasználó".to_owned(),
            }));
        }
    };

    let salt = match get_password_part(crate::alap_fuggvenyek::JelszoReszek::Salt, felhasználó.sha256_jelszó.as_str()) {
        Ok(result) => result,
        Err(hiba) => {
            return Err(hiba);
        }
    };

    Ok(salt)
}

pub fn általános_query_futtatás(query: String) -> Result<String> {
    let mut conn = match csatlakozás(crate::MEGOSZTO_ADATBAZIS_URL) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", crate::LOG_PREFIX, err);
            return Err(err);
        }
    };

    match conn.exec_drop(
        query,
        ()
    ) {
        Err(hiba) => { return Err(hiba); },
        Ok(_) => { return Ok("Sikeres lekérdezés".to_owned()) }
    }
}