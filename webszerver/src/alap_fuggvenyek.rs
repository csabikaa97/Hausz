use mysql::MySqlError;

static LOG_PREFIX: &str = "[alap_függ] ";

#[derive(Debug)]
pub enum JelszoReszek {
    Salt,
    Password,
}

pub enum FelhasználóAzonosítóAdatok {
    Felhasználónév(String),
    Azonosító(i32),
}

pub fn isset(keresett_kulcs: &str, post: Vec<(String, String)>) -> bool {
    for (kulcs, _) in post.clone() {
        if kulcs == keresett_kulcs.to_owned() {
            return true;
        }
    }
    return false;
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
    let buffer = if szoveg.chars().nth(0) != "\"".chars().nth(0) && szoveg.chars().nth(0) != "'".chars().nth(0) && szoveg.chars().nth(0) != "[".chars().nth(0) {
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