use mysql::MySqlError;

use crate::backend::lekerdezesek::általános_query_futtatás;

static LOG_PREFIX: &str = "[alap_függ] ";

#[derive(Debug)]
pub enum JelszoReszek {
    Salt,
    Password,
}

pub enum FelhasználóAzonosítóAdatok {
    Felhasználónév(String),
    Azonosító(u32),
}

pub fn isset(keresett_kulcs: &str, post: Vec<(String, String)>) -> bool {
    for (kulcs, _) in post.clone() {
        if kulcs == keresett_kulcs.to_owned() {
            return true;
        }
    }
    return false;
}

pub fn get_gyorsítótár(keresett_kulcs: &str) -> Result<Vec<u8>, String> {
    let dsa = match crate::STATIKUS_FÁJL_GYORSÍTÓTÁR.lock() {
        Ok(dsa) => dsa.clone(),
        Err(err) => {
            return Err(format!("Nem sikerült elérni a gyorsítótárat: {}", err));
        },
    };
    for (kulcs, érték) in dsa {
        if kulcs == keresett_kulcs.to_owned() {
            return Ok(érték);
        }
    }
    return Err("Nincs ilyen kulcs a gyorsítótárban".to_owned());
}

pub fn save_gyorsítótár(kulcs: String, érték: Vec<u8>) {
    crate::STATIKUS_FÁJL_GYORSÍTÓTÁR.lock().unwrap().push((kulcs, érték));
}

pub fn list_key(key: &str, post: Vec<(String, String)>) -> String {
    for (kulcs, ertek) in post {
        if kulcs == key.to_string() { return ertek; }
    }
    return "".to_string();
}

pub fn get_password_part(resz: JelszoReszek, password: &str) -> Result<String, mysql::error::Error> {
    if password.len() != 134 {
        return Err(mysql::Error::MySqlError(MySqlError {
            state: "HY000".to_owned(),
            code: 0,
            message: format!("Nem megfelelő a jelszó hossza az adatbázisban: ({}) ({})", password.len(), password),
        }));
    }

    if &password[0..5] != "$SHA$" {
        return Err(mysql::Error::MySqlError(MySqlError {
            state: "HY000".to_owned(),
            code: 0,
            message: "Nem megfelelő a jelszó formátuma az adatbázisban".to_owned(),
        }));
    }

    match resz {
        JelszoReszek::Salt => {
            let salt = password[5..69].to_owned();
            return Ok(salt);
        },
        JelszoReszek::Password => {
            let jelszo = password[70..134].to_owned();
            return Ok(jelszo);
        },
    }
}

pub fn exit_ok(szoveg: String) -> String {
    let buffer = String::new();
    let buffer = buffer + "{\"eredmeny\": \"ok\", ";
    let buffer = if szoveg.chars().nth(0) != Some('"') && szoveg.chars().nth(0) != Some('\'') && szoveg.chars().nth(0) != Some('[') {
        buffer + "\"valasz\":\"" + &szoveg + "\"}"
    } else {
        buffer + &szoveg + "}"
    };
    return buffer;
}

pub fn exit_error(szoveg: String) -> String {
    let mut buffer = "{\"eredmeny\": \"hiba\", ".to_string();
    if szoveg.chars().nth(0) != "\"".chars().nth(0) && szoveg.chars().nth(0) != "'".chars().nth(0) { 
        buffer = buffer + "\"valasz\":\"" + &szoveg + "\"}";
    } else {
        buffer = buffer + &szoveg + "}";
    }
    return buffer;
}

pub fn log_bejegyzes(szolgaltatas: &str, bejegyzes: &str, komment: &str, felhasznalo: String) {
    let query = format!("INSERT INTO hausz_log.log (szolgaltatas, bejegyzes, komment, felhasznalo, datum) values ('{}', '{}', '{}', '{}', now(6));", szolgaltatas, bejegyzes, komment, felhasznalo);
    match általános_query_futtatás(query.clone()) {
        Ok(_) => {},
        Err(err) => {
            println!("{}Nem sikerült a log bejegyzés: ({}) ({})", LOG_PREFIX, query, err);
        },
    }
}