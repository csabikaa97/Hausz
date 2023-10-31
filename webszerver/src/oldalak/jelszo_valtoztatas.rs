use actix_web::HttpResponse;
use regex::Regex;
use crate::{session::Session, alap_fuggvenyek::{isset, log_bejegyzes, list_key, JelszoReszek, get_password_part}, backend::lekerdezesek::{általános_query_futtatás, felhasznalo_lekerdezese}};
use crate::alap_fuggvenyek::exit_error;
use crate::alap_fuggvenyek::exit_ok;
use crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok;

static LOG_PREFIX: &str = "[jelsz_vál] ";

pub async fn jelszó_változtatás(post: Vec<(String, String)>, session: Session) -> HttpResponse {
    // die_if( !isset($_SESSION['loggedin']), "Nem vagy belépve.");
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve.")));
    }
    //     $result_username_check = query_futtatas("SELECT * FROM users WHERE id = '" . $_SESSION['user_id'] . "'");
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

    //     $row = $result_username_check->fetch_assoc();
    
    //     die_if( mysqli_num_rows($result_username_check) <= 0, "Nem ellenőrizhető a jelszó (a megadott felhasználónév nem létezik)");
    
    //     if( isset($_POST['jelenlegi_jelszo_sha256']) ) {
    let megadott_sha256_jelszo = list_key("jelenlegi_jelszo_sha256", post.clone());
    if megadott_sha256_jelszo.len() <= 0 {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem lett elküldve a jelenlegi jelszó hash")));
    }
    //         $password_hash_in_db = explode('$', $row['sha256_password']);
    //         $password_hash_in_db = $password_hash_in_db[3];
    let password_hash_in_db = match get_password_part(JelszoReszek::Password, felhasználó.sha256_jelszó.as_str()) {
        Ok(x) => x,
        Err(hiba) => {
            println!("{} get_password_part hiba (834181): {}", LOG_PREFIX, hiba);
            return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
        }
    };
    //         die_if( $_POST['jelenlegi_jelszo_sha256'] != $password_hash_in_db, "Nem egyezik a jelenlegi jelszó hash" );
    //     }
    if password_hash_in_db != megadott_sha256_jelszo.as_str() {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem egyezik a jelenlegi jelszó hash")));
    }
    
    
    //     if( isset($_POST['jelenlegi_jelszo']) ) {
    let jelenlegi_jelszó = list_key("jelenlegi_jelszo", post.clone());
    if jelenlegi_jelszó.len() > 0 {
        //         die_if( !password_verify($_POST['jelenlegi_jelszo'], $row['password']), 'Helytelen jelenlegi jelszót adtál meg.');
        //     }
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

    //     if( isset($_POST['uj_jelszo_sha256']) ) {
    if isset("uj_jelszo_sha256", post.clone()) {
        let megadott_jelszo = list_key("uj_jelszo_sha256", post.clone());
        //         die_if( strlen($_POST['uj_jelszo_sha256']) != 64, 'Hibás jelszó hash lett elküldve a szervernek');
        
        if megadott_jelszo.len() != 64 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás formátumú jelszó hash lett elküldve a szervernek")));
        }
        //         die_if( preg_match('/[^a-zA-Z0-9]/', $_POST['uj_jelszo_sha256']), 'Illegális karaktert tartalmaz a jelszó hashelése');
        match Regex::new(r"[^a-zA-Z0-9]").unwrap().is_match(megadott_jelszo.as_str()) {
            true => {
                return HttpResponse::BadRequest().body(exit_error(format!("Illegális karaktert tartalmaz a jelszó hash formája")));
            },
            false => {}
        }

        //         die_if( !isset($_POST['uj_jelszo_sha256_salt']), 'Nem lett elküldve a jelszó hasheléséhez szükséges salt');
        if !isset("uj_jelszo_sha256_salt", post.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem lett elküldve a jelszó hasheléséhez szükséges salt")));
        }
        if list_key("uj_jelszo_sha256_salt", post.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem lett elküldve a jelszó hasheléséhez szükséges salt")));
        }
        //         die_if( strlen($_POST['uj_jelszo_sha256_salt']) != 64, 'Hibás salt lett elküldve a szervernek');
        if list_key("uj_jelszo_sha256_salt", post.clone()).len() != 64 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás formátumú salt lett elküldve a szervernek")));
        }
        //         die_if( preg_match('/[^a-zA-Z0-9]/', $_POST['uj_jelszo_sha256_salt']), 'Illegális karaktert tartalmaz a salt');
        match Regex::new(r"[^a-zA-Z0-9]").unwrap().is_match(list_key("uj_jelszo_sha256_salt", post.clone()).as_str()) {
            true => {
                return HttpResponse::BadRequest().body(exit_error(format!("Illegális karaktert tartalmaz a salt")));
            },
            false => {}
        }
    }
    
    
    //         die_if( $_POST['uj_jelszo_sha256'] != $_POST['uj_jelszo_sha256_megerosites'], "Nem egyeznek a jelszó hashek" );
    if list_key("uj_jelszo_sha256", post.clone()) != list_key("uj_jelszo_sha256_megerosites", post.clone()) {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem egyeznek a jelszó hashek")));
    }
    //         $result_change = query_futtatas('update hausz_megoszto.users set sha256_password = "$SHA$'.$_POST['uj_jelszo_sha256_salt'].'$'.$_POST['uj_jelszo_sha256'].'" where id = "'.$_SESSION['user_id'].'";');
    //     }
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
    
    //     exit_ok('A jelszavad sikeresen meg lett változtatva');
    //     log_bejegyzes("hausz_alap", "jelszó változtatás", "", $_SESSION['username']);
    log_bejegyzes("alap", "jelszó változtatás", "", session.username);

    return HttpResponse::Ok().body(exit_ok(format!("A jelszavad sikeresen meg lett változtatva")));
}