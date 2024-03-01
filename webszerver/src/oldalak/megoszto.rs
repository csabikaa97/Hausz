use std::{process::Command, fs::{File, self}, io::Write};

use actix_multipart::Multipart;
use actix_web::HttpResponse;
use futures_util::TryStreamExt;
use regex::Regex;
use crate::{session::Session, alap_fuggvenyek::{isset, log_bejegyzes, list_key}, backend::{lekerdezesek::{általános_query_futtatás, fájl_lekérdezése_név_alapján, fájl_lekérdezése_id_alapján}, saját_fájlok_lekérdezése}, mime_types::mime_type_megállapítása, konfig};
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

        let adatbázis_fájl = match fájl_lekérdezése_id_alapján(fájl_azonosító) {
            Some(fájl) => fájl,
            None => {
                return HttpResponse::BadRequest().body(exit_error(format!("Nem létezik ilyen fájl, vagy belső hiba történt.")));
            }
        };

        if adatbázis_fájl.felhasználó_azonosító != session.user_id && adatbázis_fájl.privát == 1 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy jogosult a fájl eléréshez.")));
        }

        if session.loggedin != "yes" && adatbázis_fájl.members_only == 1 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy jogosult a fájl eléréshez.")));
        }

        let kiterjesztés = match adatbázis_fájl.fájlnév.split('.').last() {
            Some(kiterjesztés) => kiterjesztés,
            None => "",
        };
        let mime = mime_type_megállapítása(kiterjesztés);

        let mut fájl = match File::open(format!("{}megoszto/fajlok/{}", konfig().webszerver.fajlok_eleresi_utvonala, adatbázis_fájl.fájlnév.clone())) {
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
                let meg_mindig_base64 = match base64::engine::general_purpose::STANDARD.decode(&buffer) {
                    Ok(plaintext) => plaintext,
                    Err(err) => {
                        let hiba = format!("{}Hiba a fájl dekódolásakor: {}", LOG_PREFIX, err);
                        println!("{}", hiba);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                    }
                };

                let ez_mar_nyers_adat = match base64::engine::general_purpose::STANDARD.decode(&meg_mindig_base64) {
                    Ok(plaintext) => plaintext,
                    Err(err) => {
                        let hiba = format!("{}Hiba a fájl 2. dekódolásakor: {}", LOG_PREFIX, err);
                        println!("{}", hiba);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                    }
                };

                let kulcs_string = list_key("titkositas_feloldasa_kulcs", post.clone());
                let mut kulcs: [u8;32] = [0; 32];
                for i in 0..kulcs_string.len() {
                    kulcs[i] = kulcs_string.as_bytes()[i];
                }
                for i in kulcs_string.len()..32 {
                    kulcs[i] = 0;
                }
                let iv = "aaaaaaaaaaaaaaaa".as_bytes();

                let decoded_file = match openssl::symm::decrypt(openssl::symm::Cipher::aes_256_cbc(), &kulcs, Some(iv), &ez_mar_nyers_adat) {
                    Ok(plaintext) => {
                        plaintext
                    },
                    Err(err) => {
                        println!("{} OpenSSL decrypt hiba: {}", LOG_PREFIX, err);
                        return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült a fájl dekódolása.")));
                    },
                };
    
                return HttpResponse::Ok()
                .append_header(("Content-disposition", format!("attachment; filename=\"{}\"", adatbázis_fájl.fájlnév)))
                .append_header(("Content-Length", format!("{}", ez_mar_nyers_adat.len())))
                .append_header(("Cache-Control", "public, max-age=9999999, immutable"))
                .append_header(("X-Robots-Tag", "noindex"))
                .content_type(mime)
                .body(decoded_file);
            }

            return HttpResponse::Ok().body(exit_ok(format!("A fájl titkosítása feloldva.")));
        }

        let titkositott_content_dispositon = if adatbázis_fájl.titkosított != 0 { "titkositott_" } else { "" };

        return HttpResponse::Ok()
            .append_header(("Content-disposition", format!("attachment; filename=\"{}{}\"", titkositott_content_dispositon, adatbázis_fájl.fájlnév)))
            .append_header(("Content-Length", format!("{}", buffer.len())))
            .append_header(("Cache-Control", "public, max-age=9999999, immutable"))
            .append_header(("X-Robots-Tag", "noindex"))
            .content_type(mime)
            .body(buffer);
    }

    if isset("kulcs_ellenorzese", get.clone()) {
        if list_key("kulcs", post.clone()).len() != 64 {
            println!("{}KULCS: {}", LOG_PREFIX, list_key("kulcs", post.clone()));
            return HttpResponse::BadRequest().body(exit_error(format!("Nem megfelelő hosszúságú a megadott kulcs.")));
        }
        if list_key("file_id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem adtál meg fájl azonosítót.")));
        }
        

        let fájl = match fájl_lekérdezése_id_alapján(list_key("file_id", get.clone())) {
            Some(fájl) => fájl,
            None => {
                return HttpResponse::BadRequest().body(exit_error(format!("Nem létezik ilyen fájl.")));
            }
        };

        if fájl.titkosított != 2 {
            return HttpResponse::BadRequest().body(exit_error(format!("A fájl nem titkosított, vagy nem a 2-es verziójú titkosítással lett zárolva.")));
        }

        if fájl.titkositasi_kulcs_hash != list_key("kulcs", post.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem jó kulcsot adtál meg.")));
        }

        return HttpResponse::Ok().body(exit_ok(format!("A megadott kulcs helyes.")));
    }

    if isset("submit", post.clone()) {
        if list_key("filename", post.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem válaszottál ki fájlt a feltöltéshez.")));
        }
        let filename = list_key("filename", post.clone());
        let filename = filename.replace("'", "");
        let filename = filename.replace("\"", "");
        let filename = filename.replace("|", "");

        match fájl_lekérdezése_név_alapján(filename.clone()) {
            None => {},
            Some(meglévő_fájl) => {
                if meglévő_fájl.felhasználó_azonosító != session.user_id {
                    return HttpResponse::BadRequest().body(exit_error(format!("Már létezik egy \"{}\" nevű fájl, amely nem a tiéd, ezért a feltöltés nem lehetséges.", filename)));
                }
                match fs::remove_file(format!("{}megoszto/fajlok/{}", konfig().webszerver.fajlok_eleresi_utvonala, filename)) {
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
                        HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
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

        let elérhető = match Regex::new(r".*(overlay)[\n\s]*([0-9]*)[\n\s]*([0-9]*)[\n\s]*([0-9]*).*") {
            Ok(regex) => regex,
            Err(err) => {
                println!("{} Hiba az elérhető tarhely értékének kinyeréséhez használandó regex létrehozásakor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().finish();
            }
        }.replace_all(&tarhely2, "$4");

        let elérhető = match elérhető.parse::<f64>() {
            Ok(elérhető) => elérhető,
            Err(err) => {
                println!("{}Hiba az elérhető tarhely értékének átalakításakor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().finish();
            }
        };

        if (elérhető - (list_key("fileToUpload", post.clone()).len() as f64) ) < MIN_ELÉRHETŐ_TÁRHELY_FELTÖLTÉSHEZ {
            return HttpResponse::BadRequest().body(exit_error(format!("Nincs elég tárhely a fájl feltöltéséhez ({} MB).", MIN_ELÉRHETŐ_TÁRHELY_FELTÖLTÉSHEZ / 1024.0 / 1024.0)));
        }

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

            let filepath = format!("{}megoszto/fajlok/{filename}", konfig().webszerver.fajlok_eleresi_utvonala);
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
            }
        }

        let private = match list_key("private", post.clone()).as_str() {
            "1" => 1,
            "0" => 0,
            &_ => 0,
        };
        let titkositas_kulcs = list_key("titkositas_kulcs", post.clone());
        let titkositott = match (list_key("titkositas_kulcs", post.clone()).len() > 0, list_key("titkositasi_kulcs_hash", post.clone()).len() > 0) {
            (true, true) => {
                return HttpResponse::BadRequest().body(exit_error(format!("Több verziójú titkosításhoz adtál meg kulcsot (v1 és v2).")));
            },
            (true, false) => 1,
            (false, true) => 2,
            (false, false) => 0,
        };
        let titkositasi_kulcs_hash = list_key("titkositasi_kulcs_hash", post.clone());
        let members_only = match list_key("members_only", post.clone()).as_str() {
            "1" => 1,
            "0" => 0,
            &_ => 0,
        };
        let query = format!(
            "INSERT INTO `files` (filename, added, user_id, size, private, titkositott, titkositas_kulcs, members_only, titkositasi_kulcs_hash) VALUES ('{}', NOW(6), {}, {}, {}, {}, '{}', {}, '{}');",
                filename,
                session.user_id,
                total_size,
                private,
                titkositott,
                titkositas_kulcs,
                members_only,
                titkositasi_kulcs_hash,
        );
        match általános_query_futtatás(query.clone()) {
            Ok(_) => {},
            Err(err) => {
                println!("{}Hiba a fájl feltöltésekor: {}\nQuery:\n{}", LOG_PREFIX, err, query);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        }
        
        log_bejegyzes("megoszto", "feltöltés", filename.as_str(), session.username);

        let azonosító = match fájl_lekérdezése_név_alapján(filename.clone()) {
            Some(fájl) => fájl.azonosító,
            None => {
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        };
        
        return HttpResponse::Ok().body(exit_ok(format!("\"id\": {}, \"fajlnev\": \"{}\"", azonosító, filename)));
    }

    if isset("fajlok", get.clone()) {
        return saját_fájlok_lekérdezése(session);
    }

    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve.")));
    }

    if isset("atnevezes", get.clone()) {
        if list_key("uj_nev", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hiányzó uj_nev paraméter.")));
        }
        if list_key("file_id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hiányzó file_id paraméter.")));
        }
        match fájl_lekérdezése_név_alapján(list_key("uj_nev", get.clone())) {
            Some(_) => {
                return HttpResponse::BadRequest().body(exit_error(format!("Már létezik fájl ezzel a névvel.")));
            },
            None => {},
        }
        let átnevezendő_fájl =match fájl_lekérdezése_id_alapján(list_key("file_id", get.clone())) {
            Some(eredmémny) => eredmémny,
            None => {
                return HttpResponse::BadRequest().body(exit_error(format!("Nem létezik az átnevezendő fájl.")));
            },
        };

        if átnevezendő_fájl.felhasználó_azonosító != session.user_id && átnevezendő_fájl.felhasználó_azonosító != 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem nevezheted át más fájljait.")));
        }
        if list_key("uj_nev", get.clone()).len() > 250 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem lehet az új név 250 karakternél hosszabb.")));
        }
        if Regex::new(r"[^a-zA-Z0-9_\-\.éáűőúöüóíÍÉÁŰŐÚÖÜÓ]").unwrap().is_match(list_key("uj_nev", get.clone()).as_str()) {
            return HttpResponse::BadRequest().body(exit_error(format!("Illegális karakterek vannak az új névben.")));
        }
        if list_key("uj_nev", get.clone()).contains(".") {
            println!("{}Nincs kiterjesztés: \"{}\"", LOG_PREFIX, list_key("uj_nev", get.clone()));
            return HttpResponse::BadRequest().body(exit_error(format!("Nincs kiterjesztés megadva az új névben.")));
        }
        
        match fs::rename(format!("{}megoszto/fajlok/{}", konfig().webszerver.fajlok_eleresi_utvonala, átnevezendő_fájl.fájlnév), format!("{}megoszto/fajlok/{}", konfig().webszerver.fajlok_eleresi_utvonala, list_key("uj_nev", get.clone()))) {
            Ok(_) => {},
            Err(err) => {
                println!("{}Hiba a fájl átnevezésekor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        }

        match általános_query_futtatás(format!("UPDATE files SET filename = '{}' WHERE id = {}", list_key("uj_nev", get.clone()), list_key("file_id", get.clone()))) {
            Ok(_) => {
                return HttpResponse::Ok().body(exit_ok(format!("A fájl sikeresen át lett nevezve.")));
            },
            Err(err) => {
                println!("{}Hiba a fájl átnevezésekor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        }
    }

    if isset("privat_statusz_csere", get.clone()) {
        if list_key("file_id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nincs megadva fájl azonosító.")));
        }

        let módosítandó_fájl = match fájl_lekérdezése_id_alapján(list_key("file_id", get.clone())) {
            Some(fájl) => fájl,
            None => {
                return HttpResponse::BadRequest().body(exit_error(format!("Nem létezik a változtatni kívánt fájl.")));
            }
        };

        if módosítandó_fájl.privát == 1 {
            match általános_query_futtatás(format!("UPDATE files SET private = 0 WHERE id = {}", list_key("file_id", get.clone()))) {
                Ok(_) => {
                    return HttpResponse::Ok().body(exit_ok(format!("A fájl publikussá tétele kész.")));
                },
                Err(err) => {
                    println!("{}Hiba a fájl publikussá tételekor: {}", LOG_PREFIX, err);
                    return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                }
            }
        } else {
            match általános_query_futtatás(format!("UPDATE files SET private = 1 WHERE id = {}", list_key("file_id", get.clone()))) {
                Ok(_) => {
                    return HttpResponse::Ok().body(exit_ok(format!("A fájl priváttá tétele kész.")));
                },
                Err(err) => {
                    println!("{}Hiba a fájl priváttá tételekor: {}", LOG_PREFIX, err);
                    return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                }
            }
        }
    }

    if isset("members_only_csere", get.clone()) {
        if list_key("file_id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Nincs megadva fájl azonosító.")));
        }

        let módosítandó_fájl = match fájl_lekérdezése_id_alapján(list_key("file_id", get.clone())) {
            Some(fájl) => fájl,
            None => {
                return HttpResponse::BadRequest().body(exit_error(format!("Nem létezik a változtatni kívánt fájl.")));
            }
        };

        if módosítandó_fájl.members_only == 1 {
            match általános_query_futtatás(format!("UPDATE files SET members_only = 0 WHERE id = {}", list_key("file_id", get.clone()))) {
                Ok(_) => {
                    return HttpResponse::Ok().body(exit_ok(format!("A fájl mindenki számára elérhetővé tétele kész.")));
                },
                Err(err) => {
                    println!("{}Hiba a fájl mindenki számára elérhetővé tételkor: {}", LOG_PREFIX, err);
                    return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                }
            }
        } else {
            match általános_query_futtatás(format!("UPDATE files SET members_only = 1 WHERE id = {}", list_key("file_id", get.clone()))) {
                Ok(_) => {
                    return HttpResponse::Ok().body(exit_ok(format!("A fájl csak Hausz tagok számára elérhetővé tétele kész.")));
                },
                Err(err) => {
                    println!("{}Hiba a fájl csak Hausz tagok számára elérhetővé tételkor: {}", LOG_PREFIX, err);
                }
            }
        }
    }

    if isset("delete", get.clone()) {
        let törlendő_fájl = match fájl_lekérdezése_id_alapján(list_key("file_id", get.clone())) {
            Some(fájl) => fájl,
            None => {
                return HttpResponse::BadRequest().body(exit_error(format!("Nem létezik fájl ilyen azonosítóval.")));
            }
        };
        
        if törlendő_fájl.felhasználó_azonosító != session.user_id {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem a tiéd a fájl, ezért azt nem törölheted.")));
        }

        match fs::remove_file(format!("{}megoszto/fajlok/{}", konfig().webszerver.fajlok_eleresi_utvonala, törlendő_fájl.fájlnév)) {
            Ok(_) => {},
            Err(err) => {
                println!("{}Hiba a fájl törlésekor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        }

        match általános_query_futtatás(format!("DELETE FROM files WHERE id = {}", list_key("file_id", get.clone()))) {
            Ok(_) => {},
            Err(err) => {
                println!("{}Hiba a fájl törlésekor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        }

        log_bejegyzes("megoszto", "törlés", format!("[{}] {}", list_key("file_id", get.clone()), törlendő_fájl.fájlnév).as_str(), session.username);
        return HttpResponse::Ok().body(exit_ok(format!("A fájl sikeresen törölve.")));
    }

    if isset("claim", get.clone()) {
        let claimelendő_fájl = match fájl_lekérdezése_id_alapján(list_key("file_id", get.clone())) {
            Some(fájl) => fájl,
            None => {
                return HttpResponse::BadRequest().body(exit_error(format!("Nem létezik fájl ilyen azonosítóval.")));
            }
        };

        if claimelendő_fájl.felhasználó_azonosító != 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("A fájl már hozzá van rendelve egy fiókhoz.")));
        }

        match általános_query_futtatás(format!("UPDATE files SET user_id = {} WHERE id = {}", session.user_id, list_key("file_id", get.clone()))) {
            Ok(_) => {},
            Err(err) => {
                println!("{}Hiba a fájl claimelésekor: {}", LOG_PREFIX, err);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            }
        }

        log_bejegyzes("megoszto", "claimelés", format!("[{}] {}", list_key("file_id", get.clone()), claimelendő_fájl.fájlnév).as_str(), session.username);
        return HttpResponse::Ok().body(exit_ok(format!("A '{}' nevű fájl sikeresen hozzá lett rendelve a fiókodhoz.", claimelendő_fájl.fájlnév)));
    }

    HttpResponse::Ok().body(exit_error(format!("Ismeretlen szándék")))
}