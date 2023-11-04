use actix_web::HttpResponse;
use regex::Regex;
use crate::{session::Session, alap_fuggvenyek::{isset, log_bejegyzes, list_key, JelszoReszek, get_password_part}, backend::lekerdezesek::{általános_query_futtatás, felhasznalo_lekerdezese}};
use crate::alap_fuggvenyek::exit_error;
use crate::alap_fuggvenyek::exit_ok;
use crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok;

static LOG_PREFIX: &str = "[jelsz_vál] ";

pub async fn jelszó_változtatás(post: Vec<(String, String)>, session: Session) -> HttpResponse {
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve.")));
    }
    let felhasználó = match felhasznalo_lekerdezese(FelhasználóAzonosítóAdatok::Azonosító(session.user_id)) {
        Ok(Some(x)) => x,
        Ok(None) => {
            println!("{}Nincs ilyen felhasználó az adatbázisban: {}", LOG_PREFIX, session.user_id);
            return HttpResponse::BadRequest().body(exit_error(format!("Nincs ilyen felhasználó az adatbázisban")));
        },
        Err(hiba) => {
            println!("{} Belső hiba: {}", LOG_PREFIX, hiba);
            return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
        }
    };

    
    
    let megadott_sha256_jelszo = list_key("jelenlegi_jelszo_sha256", post.clone());
    if megadott_sha256_jelszo.len() <= 0 {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem lett elküldve a jelenlegi jelszó hash")));
    }
    let password_hash_in_db = match get_password_part(JelszoReszek::Password, felhasználó.sha256_jelszó.as_str()) {
        Ok(x) => x,
        Err(hiba) => {
            println!("{} get_password_part hiba (834181): {}", LOG_PREFIX, hiba);
            return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
        }
    };
    if password_hash_in_db != megadott_sha256_jelszo.as_str() {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem egyezik a jelenlegi jelszó hash")));
    }
    
    
    let jelenlegi_jelszó = list_key("jelenlegi_jelszo", post.clone());
    if jelenlegi_jelszó.len() > 0 {
        match bcrypt::verify(jelenlegi_jelszó, felhasználó.jelszó.as_str()) {
            Ok(false) => {
                return HttpResponse::BadRequest().body(exit_error(format!("Helytelen jelenlegi jelszót adtál meg.")));
            },
            Ok(true) => {},
            Err(hiba) => {
                println!("{} Belső hiba: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        
        }
    }

    if isset("uj_jelszo_sha256", post.clone()) {
        let megadott_jelszo = list_key("uj_jelszo_sha256", post.clone());
        
        if megadott_jelszo.len() != 64 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás formátumú jelszó hash lett elküldve a szervernek")));
        }
        match Regex::new(r"[^a-zA-Z0-9]").unwrap().is_match(megadott_jelszo.as_str()) {
            true => {
                return HttpResponse::BadRequest().body(exit_error(format!("Illegális karaktert tartalmaz a jelszó hash formája")));
            },
            false => {}
        }

        if !isset("uj_jelszo_sha256_salt", post.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem lett elküldve a jelszó hasheléséhez szükséges salt")));
        }
        if list_key("uj_jelszo_sha256_salt", post.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem lett elküldve a jelszó hasheléséhez szükséges salt")));
        }
        if list_key("uj_jelszo_sha256_salt", post.clone()).len() != 64 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás formátumú salt lett elküldve a szervernek")));
        }
        match Regex::new(r"[^a-zA-Z0-9]").unwrap().is_match(list_key("uj_jelszo_sha256_salt", post.clone()).as_str()) {
            true => {
                return HttpResponse::BadRequest().body(exit_error(format!("Illegális karaktert tartalmaz a salt")));
            },
            false => {}
        }
    }
    
    
    if list_key("uj_jelszo_sha256", post.clone()) != list_key("uj_jelszo_sha256_megerosites", post.clone()) {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem egyeznek a jelszó hashek")));
    }
    match általános_query_futtatás(format!(
        "UPDATE hausz_megoszto.users SET sha256_password = '$SHA${}${}' WHERE id = {}"
            , list_key("uj_jelszo_sha256_salt", post.clone())
            , list_key("uj_jelszo_sha256", post.clone())
            , session.user_id
    )) {
        Ok(_) => {},
        Err(hiba) => {
            println!("{} Belső hiba: {}", LOG_PREFIX, hiba);
            return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
        }
    }
    
    log_bejegyzes("alap", "jelszó változtatás", "", session.username);

    return HttpResponse::Ok().body(exit_ok(format!("A jelszavad sikeresen meg lett változtatva")));
}