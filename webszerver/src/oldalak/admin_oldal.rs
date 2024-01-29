use std::process::Command;

use actix_web::HttpResponse;
use mysql::prelude::Queryable;
use crate::LOG_PREFIX;
use crate::alap_fuggvenyek::exit_ok;
use crate::alap_fuggvenyek::list_key;
use crate::alap_fuggvenyek::log_bejegyzes;
use crate::backend::AdatbázisEredményTeamspeakJogosultság;
use crate::backend::AdatbázisEredményTeamspeakJogosultságIgénylés;
use crate::backend::lekerdezesek::felhasznalo_lekerdezese;
use crate::backend::lekerdezesek::felhasználók_lekérdezése;
use crate::backend::lekerdezesek::igényelt_felhasználók_lekérdezése;
use crate::backend::lekerdezesek::log_bejegyzések_lekérdezése;
use crate::backend::lekerdezesek::teamspeak_jogosultság_igénylések_lekérdezése;
use crate::backend::lekerdezesek::általános_query_futtatás;
use crate::session::Session;
use crate::alap_fuggvenyek::isset;

use crate::alap_fuggvenyek::exit_error;

pub async fn admin_oldal(get: Vec<(String, String)>, session: Session) -> HttpResponse {
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }
    if session.admin != "igen" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy rendszergazda")));
    }
    if isset("aktivalas", get.clone()) {
        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Az id helytelenül van, vagy nincs megadva")));
        }
    
        let igényelt_felhasználók = match igényelt_felhasználók_lekérdezése() {
            Ok(igényelt_felhasználók) => igényelt_felhasználók,
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni az igényelt felhasználókat"))),
        };
        
        for igényelt_felhasználó in igényelt_felhasználók {
            if igényelt_felhasználó.request_id == list_key("id", get.clone()).parse::<u32>().unwrap() {
                match általános_query_futtatás(format!("CALL hausz_megoszto.add_user({});", igényelt_felhasználó.request_id)) {
                    Ok(_) => (),
                    Err(hiba) => {
                        println!("{}Hiba az igényelt felhasználó hozzáadásakor: {}", LOG_PREFIX, hiba);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                    }
                }

                log_bejegyzes("hausz_alap", "fiók aktiválás", format!("[{}] - {}", igényelt_felhasználó.request_id, igényelt_felhasználó.username).as_str(), session.username.clone());
                return HttpResponse::Ok().body(exit_ok(format!("Aktiválás sikeres")));
            }
        }

        return HttpResponse::BadRequest().body(exit_error(format!("Nem található ilyen igényelt felhasználó")));
    }

    if isset("elutasitas", get.clone()) {
        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Az id helytelenül van, vagy nincs megadva")));
        }

        let igényelt_felhasználók = match igényelt_felhasználók_lekérdezése() {
            Ok(igényelt_felhasználók) => igényelt_felhasználók,
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni az igényelt felhasználókat"))),
        };
        
        for igényelt_felhasználó in igényelt_felhasználók {
            if igényelt_felhasználó.request_id == list_key("id", get.clone()).parse::<u32>().unwrap() {
                match általános_query_futtatás(format!("DELETE FROM hausz_megoszto.users_requested WHERE request_id = {}", igényelt_felhasználó.request_id)) {
                    Ok(_) => (),
                    Err(hiba) => {
                        println!("{}Hiba az igényelt felhasználó törlésekor: {}", LOG_PREFIX, hiba);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Hiba az igényelt felhasználó törlésekor: {}", hiba)));
                    }
                }
            }
        }

        return HttpResponse::Ok().body(exit_ok(format!("Elutasítás sikeres")));
    }

    if isset("torles", get.clone()) {
        if list_key("user_id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Az user_id helytelenül van, vagy nincs megadva")));
        }

        let felhasználó = match felhasznalo_lekerdezese(crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok::Azonosító(list_key("user_id", get.clone()).parse::<u32>().unwrap())) {
            Ok(felhasználó) => {
                match felhasználó {
                    Some(felhasználó) => felhasználó,
                    None => return HttpResponse::BadRequest().body(exit_error(format!("Nem található ilyen felhasználó"))),
                }
            },
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni a felhasználót"))),
        };
        match általános_query_futtatás(format!("DELETE FROM hausz_megoszto.users WHERE id = {}", felhasználó.azonosító)) {
            Ok(_) => (),
            Err(hiba) => {
                println!("{}Hiba a felhasználó törlésekor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a felhasználó törlésekor: {}", hiba)));
            }
        }

        log_bejegyzes("hausz_alap", "fiók törlés", format!("[{}] - {}", felhasználó.azonosító, felhasználó.felhasználónév).as_str(), session.username.clone());
        return HttpResponse::Ok().body(exit_ok(format!("Törlés sikeres")));
    }

    if isset("aktivalando_fiokok", get.clone()) {
        let aktiválandó_fiókok = match igényelt_felhasználók_lekérdezése() {
            Ok(igényelt_felhasználók) => igényelt_felhasználók,
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni az igényelt felhasználókat"))),
        };

        if aktiválandó_fiókok.len() <= 0 {
            return HttpResponse::Ok().body(exit_error(format!("Nincs aktiválandó fiók")));
        }

        let mut első_fiók = true;
        let mut buffer = String::from("\"valasz\": [");
    
        for aktiválandó_fiók in aktiválandó_fiókok {
            if első_fiók {
                első_fiók = false;
            } else {
                buffer += format!(",").as_str();
            }
            buffer += format!("{{\"request_id\": {}, \"username\": \"{}\", \"megjeleno_nev\": \"{}\", \"email\": \"{}\"}}", 
                aktiválandó_fiók.request_id, 
                aktiválandó_fiók.username, 
                aktiválandó_fiók.megjeleno_nev, 
                aktiválandó_fiók.email
            ).as_str();
        }
        buffer += "]";
        return HttpResponse::Ok().body(exit_ok(buffer));
    }

    if isset("fiokok", get.clone()) {
        let mut buffer = String::from("\"valasz\": [");
        let felhasználók = match felhasználók_lekérdezése() {
            Ok(felhasználók) => felhasználók,
            Err(_) => return HttpResponse::Ok().body(exit_ok(format!("Nem sikerült lekérdezni a felhasználókat"))),
        };

        if felhasználók.len() <= 0 {
            return HttpResponse::Ok().body(exit_error(format!("Nincs aktív felhasználó")));
        }

        let mut első_felhasználó = true;
    
        for felhasználó in felhasználók {
            if első_felhasználó {
                első_felhasználó = false;
            } else {
                buffer += format!(",").as_str();
            }
            buffer += format!("{{\"id\": \"{}\", \"username\": \"{}\", \"megjeleno_nev\": \"{}\", \"email\": \"{}\", \"admin\": \"{}\"}}", 
                felhasználó.azonosító, 
                felhasználó.felhasználónév, 
                felhasználó.megjelenő_név, 
                felhasználó.email, 
                felhasználó.admin
            ).as_str();
        }

        buffer += "]";
        return HttpResponse::Ok().body(exit_ok(buffer));
    }

    if isset("admin_csere", get.clone()) {
        if !isset("id", get.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem adtál meg felhasználói azonosítót")));
        }
        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás felhasználói azonosító")));
        }

        let felhasználó = match felhasznalo_lekerdezese(crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok::Azonosító(list_key("id", get.clone()).parse::<u32>().unwrap())) {
            Ok(felhasználó) => {
                match felhasználó {
                    Some(felhasználó) => felhasználó,
                    None => return HttpResponse::BadRequest().body(exit_error(format!("Nem található ilyen felhasználó"))),
                }
            },
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni a felhasználót"))),
        };

        let uj_ertek = if felhasználó.admin == "igen" { "'nem'" } else { "'igen'" };
        match általános_query_futtatás(format!("UPDATE hausz_megoszto.users SET admin = {} WHERE id = {}", uj_ertek, felhasználó.azonosító)) {
            Ok(_) => (),
            Err(hiba) => {
                println!("{}Hiba a felhasználó admin státuszának változtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a felhasználó admin státuszának változtatásakor: {}", hiba)));
            }
        };

        log_bejegyzes("hausz_admin", "admin státusz csere", 
            format!("[{}] - {}: {}"
                , felhasználó.azonosító
                , felhasználó.felhasználónév
                , if session.admin == "igen" { "nem" } else { "igen" } ).as_str(), 
            session.username.clone());
        return HttpResponse::Ok().body(exit_ok(format!("Admin státusz változtatás kész")));
    }

    if isset("log", get.clone()) {
        let log_bejegyzések = match log_bejegyzések_lekérdezése() {
            Ok(log_bejegyzések) => log_bejegyzések,
            Err(hiba) => {
                println!("{}Nem sikerült lekérdezni a log bejegyzéseket: {}", LOG_PREFIX, hiba);
                return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni a log bejegyzéseket")));
            }
        };
        if log_bejegyzések.len() <= 0 {
            return HttpResponse::Ok().body(exit_error(format!("Nincs jelenleg log")));
        }
        let mut első_log_bejegyzés = true;
        let mut buffer = String::from("\"valasz\": [");
        for log_bejegyzés in log_bejegyzések {
            if első_log_bejegyzés {
                első_log_bejegyzés = false;
            } else {
                buffer += format!(",").as_str();
            }
            buffer += format!("{{\"id\": \"{}\", \"szolgaltatas\": \"{}\", \"bejegyzes\": \"{}\", \"komment\": \"{}\", \"felhasznalo\": \"{}\", \"datum\": \"{}\"}}", 
                log_bejegyzés.id, 
                log_bejegyzés.szolgaltatas, 
                log_bejegyzés.bejegyzes, 
                log_bejegyzés.komment, 
                log_bejegyzés.felhasznalo, 
                log_bejegyzés.datum
            ).as_str();
        }
        buffer += "]";
        return HttpResponse::Ok().body(exit_ok(buffer));
    }

    if isset("parancs", get.clone()) {
        if list_key("parancs", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Parancs paraméter helytelen")));
        }

        let parancs_kimenete = match Command::new("sh")
                .arg("-c")
                .arg(list_key("parancs", get.clone()))
                .output() {
            Ok(parancs_kimenete) => parancs_kimenete,
            Err(hiba) => {
                println!("{}Hiba a parancs futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a parancs futtatásakor: {}", hiba)));
            }
        };
        let mut buffer = format!(">>> {}<br>", list_key("parancs", get.clone()));
        let parancs_kimenete = String::from_utf8_lossy(&parancs_kimenete.stdout);
        for sor in parancs_kimenete.lines() {
            buffer += format!("{}<br>", sor).as_str();
        }
        buffer += "<br>";
        return HttpResponse::Ok().body(exit_ok(buffer));
    }


    if isset("teamspeak_jogosultsag_igenylesek", get.clone()) {
        let igénylések = match teamspeak_jogosultság_igénylések_lekérdezése() {
            Ok(igénylések) => igénylések,
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni a Teamspeak jogosultság igényléseket"))),
        };

        if igénylések.len() <= 0 {
            return HttpResponse::Ok().body(exit_ok(format!("\"igenylesek_szama\": 0")));
        }

        let mut buffer = format!("\"igenylesek_szama\": {}, \"valasz\": [", igénylések.len());
        let mut első_igénylés = true;
        for igénylés in igénylések {
            if első_igénylés {
                első_igénylés = false;
            } else {
                buffer += format!(",").as_str();
            }

            let felhasználónév = match felhasznalo_lekerdezese(crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok::Azonosító(igénylés.hausz_felhasznalo_id)) {
                Ok(felhasználó) => {
                    match felhasználó {
                        Some(felhasználó) => felhasználó.felhasználónév,
                        None => String::from(""),
                    }
                },
                Err(_) => String::from(""),
            };
            buffer += format!("{{\"id\": \"{}\", \"username\": \"{}\", \"igenyles_datuma\": \"{}\", \"igenyelt_fiokok\": \"{}\", \"igenyelt_fiok_idk\": \"{}\"}},", 
                igénylés.id,
                felhasználónév,
                igénylés.igenyles_datuma, 
                igénylés.igenyelt_fiokok, 
                igénylés.igenyelt_fiok_idk
            ).as_str();
        }
        buffer += "]";
        return HttpResponse::Ok().body(exit_ok(buffer));
    }

    if isset("teamspeak_jogosultsag_jovahagyas", get.clone()) {
        if !isset("id", get.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem adtál meg igénylés azonosítót")));
        }
            
        let igénylések = match teamspeak_jogosultság_igénylések_lekérdezése() {
            Ok(igénylések) => igénylések,
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni a Teamspeak jogosultság igényléseket"))),
        };

        let mut jóváhagyandó_igénylés = AdatbázisEredményTeamspeakJogosultságIgénylés {
            id: 0,
            igenyles_datuma: "".to_string(),
            hausz_felhasznalo_id: 0,
            igenyelt_fiokok: "".to_string(),
            igenyelt_fiok_idk: "".to_string(),
            jelenlegi_fiok_kivalasztott: 0,
        };
        let mut létezik = false;
        for igénylés in igénylések {
            if igénylés.id == list_key("id", get.clone()).parse::<u32>().unwrap() {
                jóváhagyandó_igénylés = igénylés;
                létezik = true;
                break;
            }
        }

        if !létezik {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem található ilyen igénylés")));
        }

        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás igénylés azonosító")));
        }
            
        let mut conn = match mysql::Conn::new(crate::konfig().webszerver.hausz_teamspeak_adatbazis_url.as_str()) {
            Ok(conn) => conn,
            Err(hiba) => {
                println!("{}Hiba a MySQL adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a MySQL adatbázishoz való csatlakozáskor: {}", hiba)));
            }
        };

        let igényelt_jogosultságok = match conn.query_map(format!("SELECT DISTINCT group_server_to_client.group_id, groups_server.name FROM group_server_to_client LEFT OUTER JOIN groups_server ON groups_server.group_id = group_server_to_client.group_id WHERE id1 IN ({})", jóváhagyandó_igénylés.igenyelt_fiok_idk),
            |(group_id, name)|
                AdatbázisEredményTeamspeakJogosultság {
                    id: group_id,
                    jogosultsag_nev: name
                }
            ) {
            Ok(igényelt_felhasználók) => igényelt_felhasználók,
            Err(hiba) => {
                println!("{}Hiba a Teamspeak jogosultság igénylés lekérdezésekor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a Teamspeak jogosultság igénylés lekérdezésekor: {}", hiba)));
            }
        };

        let mut parancs = format!(r#"
            expect << EOF
            set timeout 2
            spawn telnet {} 10011
            expect -re ".*command\."
            send "login serveradmin {}\\r"
            expect -re ".*msg=ok"
            send "use sid=1\\r"
            expect -re ".*msg=ok"
            send "use port=9987\\r"
            expect -re ".*msg=ok"
        "#, crate::konfig().webszerver.hausz_teamspeak_szerver_ip, crate::privát_konfig().webszerver.hausz_teamspeak_admin_jelszo);

        for jogosultság in igényelt_jogosultságok {
            parancs += format!("send \"servergroupaddclient sgid={} cldbid={}\\r\"\n", jogosultság.id, jóváhagyandó_igénylés.jelenlegi_fiok_kivalasztott).as_str();
            parancs += format!("expect -re \"(.*error id=2561.*|.*msg=ok.*)\"\n").as_str();
        }
    
        parancs += format!("send \"use sid=1\\r\"\n").as_str();
        parancs += format!("expect -re \".*msg=ok\"\n").as_str();
        parancs += format!("\nEOF").as_str();
    
        let parancs_kimenete = match Command::new("/bin/sh")
                .arg("-c")
                .arg(parancs.clone())
                .output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a parancs futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a parancs futtatásakor: {}", hiba)));
            }
        };
        if parancs_kimenete.status.code().unwrap() != 0 {
            return HttpResponse::InternalServerError().body(exit_error(format!("Parancs futtatás hiba!!!: {}", parancs)));
        }
        
        for törlendő_kliens in jóváhagyandó_igénylés.igenyelt_fiok_idk.split(",") {
            if törlendő_kliens != jóváhagyandó_igénylés.jelenlegi_fiok_kivalasztott.to_string() && törlendő_kliens.len() > 0 {
                match conn.query_drop(format!("DELETE FROM teamspeak.clients WHERE client_id = {}", törlendő_kliens)) {
                    Ok(_) => (),
                    Err(hiba) => {
                        println!("{}Hiba a Teamspeak kliens törlésekor: {}", LOG_PREFIX, hiba);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a Teamspeak kliens törlésekor: {}", hiba)));
                    }
                };
            }
        }
    
        match általános_query_futtatás(format!("DELETE FROM hausz_ts.jogosultsag_igenylesek WHERE id = {}", list_key("id", get.clone()))) {
            Ok(_) => (),
            Err(hiba) => {
                println!("{}Hiba a Teamspeak jogosultság igénylés törlésekor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a Teamspeak jogosultság igénylés törlésekor: {}", hiba)));
            }
        };
        return HttpResponse::Ok().body(exit_ok(format!("DONE")));
    }

    if isset("teamspeak_jogosultsag_elutasitas", get.clone()) {
        if !isset("id", get.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem adtál meg igénylés azonosítót")));
        }
        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás igénylés azonosító")));
        }
        
        match általános_query_futtatás(format!("DELETE FROM hausz_ts.jogosultsag_igenylesek WHERE id = {}", list_key("id", get.clone()))) {
            Ok(_) => (),
            Err(hiba) => {
                println!("{}Hiba a Teamspeak jogosultság igénylés törlésekor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a Teamspeak jogosultság igénylés törlésekor: {}", hiba)));
            }
        };

        return HttpResponse::Ok().body(exit_ok(format!("DONE")));
    }

    return HttpResponse::BadRequest().body(exit_error(format!("Ismeretlen szándék")));
}