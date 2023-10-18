use actix_web::HttpResponse;
use mysql::MySqlError;

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
            println!("Get password part ({}) ({:?}) = ({})", password, resz, password[6..70].to_owned());
            return Ok(password[6..70].to_owned());
        },
        JelszoReszek::Password => {
            println!("Get password part ({}) ({:?}) = ({})", password, resz, password[71..133].to_owned());
            return Ok(password[70..134].to_owned());
        },
    }
}