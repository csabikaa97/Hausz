use std::{process::Command, fs::{File, self}, io::Write, fmt::format};

use actix_multipart::Multipart;
use actix_web::{HttpResponse, web::Bytes};
use futures_util::{TryStreamExt, StreamExt};
use regex::Regex;
use crate::{session::Session, alap_fuggvenyek::{isset, log_bejegyzes, list_key}, backend::{lekerdezesek::{általános_query_futtatás, saját_meghívók_lekérése, fájl_lekérdezése}, session_azonosito_generator::random_új_session_azonosító, saját_fájlok_lekérdezése}, mime_types::mime_type_megállapítása};
use crate::alap_fuggvenyek::exit_error;
use crate::alap_fuggvenyek::exit_ok;
use std::io::Read;
use base64::prelude::*;

static LOG_PREFIX: &str = "[megoszto ] ";
static MAX_FÁJL_MÉRET: usize = 1024 * 1024 * 10;
static MIN_ELÉRHETŐ_TÁRHELY_FELTÖLTÉSHEZ: f64 = 250.0 * 1024.0 * 1024.0;

pub async fn megosztó(mut payload: Multipart, post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session) -> HttpResponse {
    if isset("tarhely", get.clone()) {
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

    if isset("letoltes", get.clone()) {
        let fájl_azonosító = list_key("file_id", get.clone());

        if fájl_azonosító.len() <= 0 {
            println!("{}Nincs megadva fájl azonosító", LOG_PREFIX);
            return HttpResponse::BadRequest().body(exit_error(format!("Nincs megadva fájl azonosító")));
        }

        let adatbázis_fájl = match fájl_lekérdezése(fájl_azonosító) {
            Some(fájl) => fájl,
            None => {
                return HttpResponse::BadRequest().body(format!("Nem létezik ilyen fájl, vagy belső hiba történt."));
            }
        };

        if adatbázis_fájl.felhasználó_azonosító != session.user_id {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy jogosult a fájl eléréshez.")));
        }

        let kiterjesztés = match adatbázis_fájl.fájlnév.split('.').last() {
            Some(kiterjesztés) => kiterjesztés,
            None => "",
        };
        let mime = mime_type_megállapítása(kiterjesztés);

        let mut fájl = match File::open(format!("/public/megoszto/fajlok/{}", adatbázis_fájl.fájlnév.clone())) {
            Err(err) => {
                let hiba = format!("{}Hiba a fájl megnyitásakor: {}", LOG_PREFIX, err);
                println!("{}", hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
            Ok(fájl) => fájl,
        };

        let mut buffer: Vec<u8> = Vec::new();
        match fájl.read_to_end(&mut buffer) {
            Err(err) => {
                let hiba = format!("{}Hiba a fájl beolvasásakor: {}", LOG_PREFIX, err);
                println!("{}", hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
            Ok(_) => {},
        };

        if isset("titkositas_feloldasa_kulcs", post.clone()) {
            if adatbázis_fájl.titkosított != 1 {
                return HttpResponse::BadRequest().body(exit_error(format!("A fájl nem titkosított")));
            }

            match bcrypt::verify(list_key("titkositas_feloldasa_kulcs", post.clone()), &adatbázis_fájl.titkosítás_kulcs) {
                Ok(true) => {},
                Ok(false) => {
                    return HttpResponse::BadRequest().body(exit_error(format!("Nem jó titkosítási kulcs")));
                },
                Err(err) => {
                    let hiba = format!("{}Hiba a titkosítási kulcs ellenőrzésekor: {}", LOG_PREFIX, err);
                    println!("{}", hiba);
                    return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                }
            }

            if isset("letoltes", post.clone()) {
                let plaintext = match base64::engine::general_purpose::STANDARD.decode(&buffer) {
                    Ok(plaintext) => plaintext,
                    Err(err) => {
                        let hiba = format!("{}Hiba a fájl dekódolásakor: {}", LOG_PREFIX, err);
                        println!("{}", hiba);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                    }
                };
    
                let decoded_file = match openssl::symm::decrypt(openssl::symm::Cipher::aes_256_cbc(), list_key("titkositas_feloldasa_kulcs", post.clone()).as_bytes(), Some("aaaaaaaaaaaaaaaa".as_bytes()), &plaintext) {
                    Ok(plaintext) => plaintext,
                    Err(err) => {
                        let hiba = format!("{}Hiba a fájl dekódolásakor: {}", LOG_PREFIX, err);
                        println!("{}", hiba);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                    }
                };
    
                return HttpResponse::Ok()
                    .content_type(mime)
                    .append_header(("Content-disposition", format!("attachment; filename=\"titkositott_{}\"", adatbázis_fájl.fájlnév)))
                    .append_header(("Content-Length", format!("{}", plaintext.len())))
                    .append_header(("Cache-Control", "public, max-age=9999999, immutable"))
                    .append_header(("X-Robots-Tag", "noindex"))
                    .append_header(("Content-Type", mime))
                    .body(decoded_file);
            }

            return HttpResponse::Ok().body(exit_ok(format!("A fájl titkosítása feloldva.")));
        }

        return HttpResponse::Ok()
            .content_type(mime)
            .append_header(("Content-disposition", format!("attachment; filename=\"{}\"", adatbázis_fájl.fájlnév)))
            .append_header(("Content-Length", format!("{}", buffer.len())))
            .append_header(("Cache-Control", "public, max-age=9999999, immutable"))
            .append_header(("X-Robots-Tag", "noindex"))
            .append_header(("Content-Type", mime))
            .body(buffer);
    }

    if isset("submit", post.clone()) {
        if list_key("filename", post.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem válaszottál ki fájlt a feltöltéshez.")));
        }
        let filename = list_key("filename", post.clone());
        let filename = filename.replace("'", "");
        let filename = filename.replace("\"", "");
        let filename = filename.replace("|", "");

        match fájl_lekérdezése(filename.clone()) {
            None => {},
            Some(meglévő_fájl) => {
                if meglévő_fájl.felhasználó_azonosító != session.user_id {
                    return HttpResponse::BadRequest().body(exit_error(format!("Már létezik egy \"{}\" nevű fájl, amely nem a tiéd, ezért a feltöltés nem lehetséges.", filename)));
                }
                match fs::remove_file(format!("/public/megoszto/fajlok/{}", filename)) {
                    Ok(_) => {},
                    Err(err) => {
                        println!("{}Hiba a fájl törlésekor: {}", LOG_PREFIX, err);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                    }
                }
                match általános_query_futtatás(format!("DELETE FROM files WHERE id = {}", meglévő_fájl.azonosító)) {
                    Ok(_) => {},
                    Err(err) => {
                        println!("{}Hiba a fájl törlésekor: {}", LOG_PREFIX, err);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                    }
                }
            },
        };

        let tarhely2 = match Command::new("df")
        .arg("-B1")
        .output() {
            Ok(output) => output,
            Err(err) => {
                println!("{}Hiba a df parancs futtatásakor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        };

        let tarhely2 = String::from_utf8_lossy(&tarhely2.stdout);
        let tarhely2 = tarhely2.replace("\n", "");

        let hasznalt = match Regex::new(r".*(overlay|/dev/xvda1|/dev/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*") {
            Ok(regex) => regex,
            Err(err) => {
                println!("{} Hiba a foglalt tarhely értékének kinyeréséhez használandó regex létrehozásakor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().finish();
            }
        }.replace_all(&tarhely2, "$3");

        let elérhető = match Regex::new(r".*(overlay|/dev/xvda1|/dev/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*") {
            Ok(regex) => regex,
            Err(err) => {
                println!("{} Hiba az elérhető tarhely értékének kinyeréséhez használandó regex létrehozásakor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().finish();
            }
        }.replace_all(&tarhely2, "$4");

        let hasznalt = match hasznalt.parse::<f64>() {
            Ok(hasznalt) => hasznalt,
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

        if (elérhető - hasznalt - (list_key("fileToUpload", post.clone()).len() as f64) ) < MIN_ELÉRHETŐ_TÁRHELY_FELTÖLTÉSHEZ {
            return HttpResponse::BadRequest().body(exit_error(format!("Nincs elég tárhely a fájl feltöltéséhez ({} MB).", MIN_ELÉRHETŐ_TÁRHELY_FELTÖLTÉSHEZ / 1024.0 / 1024.0)));
        }

        /*
        
        if(strlen($_POST['titkositas_kulcs']) > 0) {
            $plaintext = file_get_contents($_FILES['fileToUpload']['tmp_name']);
            exec('rm "'.$_FILES['fileToUpload']['tmp_name'].'"', $output, $retval);
            die_if( $retval != 0, 'Eltávolítás nem sikerült.');
            $key = $_POST['titkositas_kulcs'];
            $cipher = "aes-256-cbc";
            die_if( !in_array($cipher, openssl_get_cipher_methods()), 'Nem lehet titkosítani, mert nem jó a titkosítási algoritmus.');
            $iv = "aaaaaaaaaaaaaaaa";
            $ciphertext = base64_encode(openssl_encrypt($plaintext, $cipher, $key, $options=0, $iv));
            ini_set('display_errors', 1);
            exec('touch "'.$target_file.'"', $output, $retval);
            die_if( $retval != 0, 'Fájl készítése sikertelen.');
            
            die_if( !file_put_contents($target_file, $ciphertext), 'Nem sikerül kiírni a fájlba a tartalmat: "'.$target_file.'"');
        } else {
            die_if( !move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file), 'Sikertelen volt a fájl feltöltése.');
        }
         */

        // TODO: TITKOSÍTÁS KLIENS OLDALON!!!

        let mut total_size: usize = 0;
        
        while let Some(mut field) = payload.try_next().await.unwrap_or(None) {
            let content_disposition = field.content_disposition(); 
    
            let name = match content_disposition.get_name() {
                Some(name) => {
                    name.to_string()
                },
                None => {
                    continue;
                }
            };

            let filepath = format!("/public/megoszto/fajlok/{filename}");
            let mut f = match std::fs::File::create(filepath.clone()) {
                Ok(f) => f,
                Err(err) => {
                    println!("{}Hiba a fájl megnyitásakor: {}", LOG_PREFIX, err);
                    continue;
                },
            };

            if name.as_str() == "fileToUpload" {
                while let Some(chunk) = field.try_next().await.unwrap_or(None) {
                    total_size += chunk.len();

                    if total_size > MAX_FÁJL_MÉRET {
                        match f.flush().map_err(|e| {
                            println!("{}Hiba a félkész feltöltendő fájl kiírása közben: {}", LOG_PREFIX, e);
                        }) {
                            Ok(_) => {},
                            Err(_) => {
                                println!("{}Hiba a félkész feltöltendő fájl kiírása közben", LOG_PREFIX);
                            },
                        }

                        match fs::remove_file(filepath.clone()) {
                            Ok(_) => {},
                            Err(err) => {
                                println!("{}Hiba a félkész feltöltendő fájl törlése közben: ({}) ({})", LOG_PREFIX, err, filepath);
                            },
                        }

                        return HttpResponse::BadRequest().body(exit_error(format!("A feltöltendő fájl túl nagy.")));
                    }

                    match f.write_all(&chunk).map_err(|e| {
                        println!("{}Hiba a fájl kiírása közben: {}", LOG_PREFIX, e);
                    }) {
                        Ok(_) => {},
                        Err(_) => {
                            println!("{}Hiba a fájl kiírása közben", LOG_PREFIX);
                            continue;
                        },
                    }
                }

                match f.flush().map_err(|e| {
                    println!("{}Hiba a fájl kiírása közben: {}", LOG_PREFIX, e);
                }) {
                    Ok(_) => {},
                    Err(_) => {
                        println!("{}Hiba a fájl kiírása közben", LOG_PREFIX);
                    },
                }
    
                println!("{}Fájl sikeresen kiírva lemezre: {}", LOG_PREFIX, filename);
            }
        }

        let private = list_key("private", post.clone());
        let titkositas_kulcs = list_key("titkositas_kulcs", post.clone());
        let titkositott = match list_key("titkositas_kulcs", post.clone()).len() > 0 {
            true => 1,
            false => 0,
        };
        let members_only = match list_key("members_only", post.clone()).as_str() {
            "1" => 1,
            "0" => 0,
            &_ => 0,
        };
        match általános_query_futtatás(format!(
            "INSERT INTO `files` (filename, added, user_id, size, private, titkositott, titkositas_kulcs, members_only) VALUES ('{}', NOW(6), {}, {}, {}, {}, '{}', {});",
                filename,
                session.user_id,
                total_size,
                private,
                titkositott,
                titkositas_kulcs,
                members_only,
        )) {
            Ok(_) => {},
            Err(err) => {
                println!("{}Hiba a fájl feltöltésekor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        }
        
        log_bejegyzes("megoszto", "feltöltés", filename.as_str(), session.username);
        
        return HttpResponse::Ok().body(exit_ok(format!("A '{}' nevű fájl sikeresen fel lett töltve.", filename)));
    }

    if isset("fajlok", get.clone()) {
        return saját_fájlok_lekérdezése(session);
    }
    HttpResponse::Ok().body(exit_error(format!("Ismeretlen szándék")))
}