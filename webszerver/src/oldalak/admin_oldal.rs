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
    // die_if( !isset( $_SESSION['loggedin'] ), 'Nem vagy belépve');
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }
    if session.admin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy rendszergazda")));
    }
    // die_if( $_SESSION['admin'] != "igen", 'Nem vagy rendszergazda');

    // if( isset($_GET['aktivalas']) ) {
    if isset("aktivalas", get.clone()) {
        //     die_if( strlen($_GET['id']) <= 0, 'Az id helytelenül van, vagy nincs megadva');
        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Az id helytelenül van, vagy nincs megadva")));
        }
    
        let igényelt_felhasználók = match igényelt_felhasználók_lekérdezése() {
            Ok(igényelt_felhasználók) => igényelt_felhasználók,
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni az igényelt felhasználókat"))),
        };
        
        //     $result = query_futtatas("SELECT * FROM hausz_megoszto.users_requested WHERE request_id = ".$_GET['id']);
        //     $row = $result->fetch_assoc();
        //     $aktivalt_felhasznalo = $row['username'];
        for igényelt_felhasználó in igényelt_felhasználók {
            if igényelt_felhasználó.request_id == list_key("id", get.clone()).parse::<u32>().unwrap() {
            
                //     $result = query_futtatas("call hausz_megoszto.add_user(".$_GET['id'].");");
                match általános_query_futtatás(format!("CALL hausz_megoszto.add_user({});", igényelt_felhasználó.request_id)) {
                    Ok(_) => (),
                    Err(hiba) => {
                        println!("{}Hiba az igényelt felhasználó hozzáadásakor: {}", LOG_PREFIX, hiba);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
                    }
                }

                //     log_bejegyzes("hausz_alap", "fiók aktiválás", '['.$_GET['id'].'] - '.$aktivalt_felhasznalo, $_SESSION['username']);
                //     exit_ok('Aktiválás sikeres');
                log_bejegyzes("hausz_alap", "fiók aktiválás", format!("[{}] - {}", igényelt_felhasználó.request_id, igényelt_felhasználó.username).as_str(), session.username.clone());
                return HttpResponse::Ok().body(exit_ok(format!("Aktiválás sikeres")));
            }
        }

        return HttpResponse::BadRequest().body(exit_error(format!("Nem található ilyen igényelt felhasználó")));
    }

    // if( isset($_GET['elutasitas']) ) {
    if isset("elutasitas", get.clone()) {
        //     die_if( strlen($_GET['id']) <= 0, 'Az id helytelenül van, vagy nincs megadva');
        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Az id helytelenül van, vagy nincs megadva")));
        }

        let igényelt_felhasználók = match igényelt_felhasználók_lekérdezése() {
            Ok(igényelt_felhasználók) => igényelt_felhasználók,
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni az igényelt felhasználókat"))),
        };
        
        //     $result = query_futtatas("SELECT * FROM hausz_megoszto.users_requested WHERE request_id = ".$_GET['id']);
        //     $row = $result->fetch_assoc();
        //     $elutasitott_felhasznalo = $row['username'];
        //     $result = query_futtatas("DELETE FROM hausz_megoszto.users_requested WHERE request_id = ".$_GET['id'].";");
        //     log_bejegyzes("hausz_alap", "fiók elutasítás", '['.$_GET['id'].'] - '.$elutasitott_felhasznalo, $_SESSION['username']);
        //     exit_ok('Elutasítás sikeres');
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
    }

    // if( isset($_GET['torles']) ) {
    if isset("torles", get.clone()) {
        //     die_if( strlen($_GET['user_id']) <= 0, 'A user_id helytelenül van, vagy nincs megadva');
        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Az id helytelenül van, vagy nincs megadva")));
        }

        //     $result = query_futtatas("SELECT * FROM hausz_megoszto.users WHERE id = ".$_GET['user_id']);
        let felhasználó = match felhasznalo_lekerdezese(crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok::Azonosító(list_key("user_id", get.clone()).parse::<u32>().unwrap())) {
            Ok(felhasználó) => {
                match felhasználó {
                    Some(felhasználó) => felhasználó,
                    None => return HttpResponse::BadRequest().body(exit_error(format!("Nem található ilyen felhasználó"))),
                }
            },
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni a felhasználót"))),
        };
        //     $row = $result->fetch_assoc();

        //     $torolt_felhasznalo = $row['username'];
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

    // if( isset($_GET['aktivalando_fiokok']) ) {
    if isset("aktivalando_fiokok", get.clone()) {
        //     $result = query_futtatas("SELECT * FROM hausz_megoszto.users_requested");
        let aktiválandó_fiókok = match igényelt_felhasználók_lekérdezése() {
            Ok(igényelt_felhasználók) => igényelt_felhasználók,
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni az igényelt felhasználókat"))),
        };

        //     die_if( $result->num_rows <= 0, "Nincs aktiválandó fiók");
        if aktiválandó_fiókok.len() <= 0 {
            return HttpResponse::Ok().body(format!("Nincs aktiválandó fiók"));
        }

        let mut első_fiók = true;
        //     $buffer = "";
        //     $buffer = '"valasz": [{"request_id": '.$row['request_id'].', "username": "'.$row['username'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "email": "'.$row['email'].'"}';
        let mut buffer = String::from("\"valasz\": [");
    
        //     $row = $result->fetch_assoc();
        //     while($row = $result->fetch_assoc()) {
        //         $buffer .= ', {"request_id": '.$row['request_id'].', "username": "'.$row['username'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "email": "'.$row['email'].'"}';
        //     }
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
        //     exit_ok($buffer.']');
        buffer += "]";
        return HttpResponse::Ok().body(exit_ok(buffer));
    }

    // if( isset($_GET['fiokok']) ) {
    if isset("fiokok", get.clone()) {
        //     $buffer = "";
        let mut buffer = String::from("\"valasz\": [");
        //     $result = query_futtatas("SELECT * FROM hausz_megoszto.users");
        //     $buffer = '"valasz": [{"id": "'.$row['id'].'", "username": "'.$row['username'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "email": "'.$row['email'].'", "admin": "'.$row['admin'].'"}';
        let felhasználók = match felhasználók_lekérdezése() {
            Ok(felhasználók) => felhasználók,
            Err(_) => return HttpResponse::Ok().body(exit_ok(format!("Nem sikerült lekérdezni a felhasználókat"))),
        };

        //     die_if( $result->num_rows <= 0, "Nincs aktív felhasználó");
        if felhasználók.len() <= 0 {
            return HttpResponse::Ok().body(format!("Nincs aktív felhasználó"));
        }

        let mut első_felhasználó = true;
    
        //     $row = $result->fetch_assoc();
        //     while($row = $result->fetch_assoc()) {
        //         $buffer .= ', {"id": "'.$row['id'].'", "username": "'.$row['username'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "email": "'.$row['email'].'", "admin": "'.$row['admin'].'"}';
        //     }
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

        //     exit_ok($buffer.']');
        // }
        buffer += "]";
        return HttpResponse::Ok().body(exit_ok(buffer));
    }

    // if( isset($_GET['admin_csere']) ) {
    if isset("admin_csere", get.clone()) {
        //     die_if( !isset($_GET['id']), "Nem adtál meg felhasználói azonosítót");
        if !isset("id", get.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem adtál meg felhasználói azonosítót")));
        }
        //     die_if( strlen($_GET['id']) <= 0, "Hibás felhasználói azonosító");
        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás felhasználói azonosító")));
        }

        //     $result = query_futtatas("SELECT * FROM hausz_megoszto.users WHERE id = ".$_GET['id']);
        let felhasználó = match felhasznalo_lekerdezese(crate::alap_fuggvenyek::FelhasználóAzonosítóAdatok::Azonosító(list_key("id", get.clone()).parse::<u32>().unwrap())) {
            Ok(felhasználó) => {
                match felhasználó {
                    Some(felhasználó) => felhasználó,
                    None => return HttpResponse::BadRequest().body(exit_error(format!("Nem található ilyen felhasználó"))),
                }
            },
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni a felhasználót"))),
        };

        //     $row = $result->fetch_assoc();
    
        //     $uj_ertek = "";
        //     if( $row['admin'] == NULL) {
        //         $uj_ertek = "'igen'";
        //     } else {
        //         $uj_ertek = 'null';
        //     }
        //     $result = query_futtatas("UPDATE hausz_megoszto.users SET admin = ".$uj_ertek.' WHERE id = '.$_GET['id']);
        //     log_bejegyzes('hausz_admin', 'admin státusz csere', '['.$_GET['id'].'] - '.$row['username'].': '.$uj_ertek, $_SESSION['username']);
        //     exit_ok('Admin státusz változtatás kész');
        let uj_ertek = if felhasználó.admin == "yes" { "'nem'" } else { "'yes'" };
        match általános_query_futtatás(format!("UPDATE hausz_megoszto.users SET admin = {} WHERE id = {}", uj_ertek, felhasználó.azonosító)) {
            Ok(_) => (),
            Err(hiba) => {
                println!("{}Hiba a felhasználó admin státuszának változtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a felhasználó admin státuszának változtatásakor: {}", hiba)));
            }
        };

        log_bejegyzes("hausz_admin", "admin státusz csere", format!("[{}] - {}: {}", felhasználó.azonosító, felhasználó.felhasználónév, uj_ertek).as_str(), session.username.clone());
        return HttpResponse::Ok().body(exit_ok(format!("Admin státusz változtatás kész")));
    }

    // if( isset($_GET['log']) ) {
    if isset("log", get.clone()) {
        //     $result = query_futtatas("SELECT * FROM hausz_log.log ORDER BY datum DESC LIMIT 100");
        let log_bejegyzések = match log_bejegyzések_lekérdezése() {
            Ok(log_bejegyzések) => log_bejegyzések,
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni a log bejegyzéseket"))),
        };
        //     die_if( $result->num_rows <= 0, "Nincs jelenleg log");
        if log_bejegyzések.len() <= 0 {
            return HttpResponse::Ok().body(exit_error(format!("Nincs jelenleg log")));
        }
        //     $row = $result->fetch_assoc();
        //     $buffer .= '"valasz": [{"id": "'.$row['id'].'", "szolgaltatas": "'.$row['szolgaltatas'].'", "bejegyzes": "'.$row['bejegyzes'].'", "komment": "'.$row['komment'].'", "felhasznalo": "'.$row['felhasznalo'].'", "datum": "'.$row['datum'].'"}';
        //     while($row = $result->fetch_assoc()) {
        //         $buffer .= ', {"id": "'.$row['id'].'", "szolgaltatas": "'.$row['szolgaltatas'].'", "bejegyzes": "'.$row['bejegyzes'].'", "komment": "'.$row['komment'].'", "felhasznalo": "'.$row['felhasznalo'].'", "datum": "'.$row['datum'].'"}';
        //     }
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
        //     exit_ok($buffer.']');
        buffer += "]";
        return HttpResponse::Ok().body(exit_ok(buffer));
    }

    // if( isset($_GET['parancs']) ) {
    if isset("parancs", get.clone()) {
        //     die_if( strlen( $_GET['parancs']) <= 0, "Parancs paraméter helytelen");
        if list_key("parancs", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Parancs paraméter helytelen")));
        }

        //     $eredmeny = "";
        //     exec($_GET['parancs'], $eredmeny, $retval);
        //     die_if( $retval != 0, "Parancs futtatás ".$_GET['parancs']);
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
        //     $buffer = '>>> '.$_GET['parancs'].'<br>';
        let mut buffer = format!(">>> {}<br>", list_key("parancs", get.clone()));
        //     foreach ($eredmeny as $sor) {
        //         $buffer .= $sor.'<br>';
        //     }
        let parancs_kimenete = String::from_utf8_lossy(&parancs_kimenete.stdout);
        for sor in parancs_kimenete.lines() {
            buffer += format!("{}<br>", sor).as_str();
        }
        //     $buffer .= '<br>';
        buffer += "<br>";
        //     exit_ok($buffer);
        return HttpResponse::Ok().body(exit_ok(buffer));
    }


    // if( isset($_GET['teamspeak_jogosultsag_igenylesek']) ) {
    if isset("teamspeak_jogosultsag_igenylesek", get.clone()) {
        //     $result = query_futtatas("SELECT hausz_ts.jogosultsag_igenylesek.id, username, igenyles_datuma, igenyelt_fiokok, igenyelt_fiok_idk FROM hausz_ts.jogosultsag_igenylesek LEFT OUTER JOIN hausz_megoszto.users ON hausz_ts.jogosultsag_igenylesek.hausz_felhasznalo_id = hausz_megoszto.users.id ORDER BY igenyles_datuma DESC");
        let igénylések = match teamspeak_jogosultság_igénylések_lekérdezése() {
            Ok(igénylések) => igénylések,
            Err(_) => return HttpResponse::BadRequest().body(exit_error(format!("Nem sikerült lekérdezni a Teamspeak jogosultság igényléseket"))),
        };

        //     if( $result->num_rows <= 0 ) {
        //         exit_ok('"igenylesek_szama": 0');
        //     }
        if igénylések.len() <= 0 {
            return HttpResponse::Ok().body(exit_error(format!("\"igenylesek_szama\": 0")));
        }

        let mut buffer = format!("\"igenylesek_szama\": {}, \"valasz\": [", igénylések.len());
        //     $buffer = '"igenylesek_szama": '.$result->num_rows.', ';
        //     $row = $result->fetch_assoc();
        //     $buffer .= '"valasz": [{"id": '.$row['id'].',"username": "'.$row['username'].'", "igenyles_datuma": "'.$row['igenyles_datuma'].'", "igenyelt_fiokok": "'.$row['igenyelt_fiokok'].'", "igenyelt_fiok_idk": "'.$row['igenyelt_fiok_idk'].'"}';
        //     while($row = $result->fetch_assoc()) {
        //         $buffer .= ', {"hausz_felhasznalo_id": "'.$row['hausz_felhasznalo_id'].'", "igenyles_datuma": "'.$row['igenyles_datuma'].'", "igenyelt_fiokok": "'.$row['igenyelt_fiokok'].'", "igenyelt_fiok_idk": "'.$row['igenyelt_fiok_idk'].'"}';
        //     }
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
        //     exit_ok($buffer.']');
        buffer += "]";
        return HttpResponse::Ok().body(exit_ok(buffer));
    }

    // if( isset($_GET['teamspeak_jogosultsag_jovahagyas']) ) {
    if isset("teamspeak_jogosultsag_jovahagyas", get.clone()) {
        //     die_if( !isset($_GET['id']), "Nem adtál meg igénylés azonosítót");
        if !isset("id", get.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem adtál meg igénylés azonosítót")));
        }
            
        //     $result = query_futtatas("SELECT * FROM hausz_ts.jogosultsag_igenylesek WHERE id = ".$_GET['id']);
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

        //     die_if( strlen($_GET['id']) <= 0, "Hibás igénylés azonosító");
        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás igénylés azonosító")));
        }
            
        //     $row = $result->fetch_assoc();
        //     $igenyelt_fiok_idk = $row['igenyelt_fiok_idk'];
    
        //     $jelenlegi_fiok_kivalasztott = $row['jelenlegi_fiok_kivalasztott'];
        /*
        TABLE: group_server_to_client
            group_id: uint
            server_id: uint
            id1: uint
            id2: uint
         */
        //     $result = query_futtatas("SELECT DISTINCT group_server_to_client.group_id, groups_server.name FROM group_server_to_client LEFT OUTER JOIN groups_server ON groups_server.group_id = group_server_to_client.group_id WHERE id1 IN (".$igenyelt_fiok_idk.")", "teamspeak");
        let mut conn = match mysql::Conn::new(crate::HAUSZ_TEAMSPEAK_ADATBAZIS_URL) {
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
        //     $parancs = <<< PARANCS_VEGE
        //     expect << EOF
        //     set timeout 2
        //     spawn telnet 172.20.128.15 10011
        //     expect -re ".*command\."
        //     send "login serveradmin zT3FOa4V\\r"
        //     expect -re ".*msg=ok"
        //     send "use sid=1\\r"
        //     expect -re ".*msg=ok"
        //     send "use port=9987\\r"
        //     expect -re ".*msg=ok"
    
        //     PARANCS_VEGE;

        let mut parancs = format!(r#"
            expect << EOF
            set timeout 2
            spawn telnet 172.20.128.15 10011
            expect -re ".*command\."
            send "login serveradmin {}\\r"
            expect -re ".*msg=ok"
            send "use sid=1\\r"
            expect -re ".*msg=ok"
            send "use port=9987\\r"
            expect -re ".*msg=ok"
        "#, crate::HAUSZ_TEAMSPEAK_ADMIN_JELSZO);

    
        //     while($row = $result->fetch_assoc()) {
        //         $parancs .= 'send "servergroupaddclient sgid='.$row['group_id'].' cldbid='.$jelenlegi_fiok_kivalasztott.'\r"'."\n";
        //         $parancs .= 'expect -re "(.*error id=2561.*|.*msg=ok.*)"'."\n";
        //     }
        for jogosultság in igényelt_jogosultságok {
            parancs += format!("send \"servergroupaddclient sgid={} cldbid={}\\r\"\n", jogosultság.id, jóváhagyandó_igénylés.jelenlegi_fiok_kivalasztott).as_str();
            parancs += format!("expect -re \"(.*error id=2561.*|.*msg=ok.*)\"\n").as_str();
        }
    
        //     $parancs .= 'send "use sid=1\\r"'."\n";
        //     $parancs .= 'expect -re ".*msg=ok"'."\n";
        //     $parancs .= "\nEOF";
        parancs += format!("send \"use sid=1\\r\"\n").as_str();
        parancs += format!("expect -re \".*msg=ok\"\n").as_str();
        parancs += format!("\nEOF").as_str();

    
        //     exec($parancs, $eredmeny, $retval);
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
        //     die_if( $retval != 0, "Parancs futtatás hiba!!!: ".$parancs);
        if parancs_kimenete.status.code().unwrap() != 0 {
            return HttpResponse::InternalServerError().body(exit_error(format!("Parancs futtatás hiba!!!: {}", parancs)));
        }
        
        //     $result = query_futtatas("SELECT DISTINCT group_server_to_client.group_id, groups_server.name FROM group_server_to_client LEFT OUTER JOIN groups_server ON groups_server.group_id = group_server_to_client.group_id WHERE id1 IN (".$igenyelt_fiok_idk.")", "teamspeak");
        //     $torlendo_kliensek = explode(",", $igenyelt_fiok_idk);
        //     foreach($torlendo_kliensek as $kliens_id) {
        //         if( $kliens_id != $jelenlegi_fiok_kivalasztott && strlen($kliens_id) > 0 ) {
        //             $result = query_futtatas("DELETE FROM clients WHERE client_id = ".$kliens_id, "teamspeak");
        //         }
        //     }
        for törlendő_kliens in jóváhagyandó_igénylés.igenyelt_fiok_idk.split(",") {
            if törlendő_kliens != jóváhagyandó_igénylés.jelenlegi_fiok_kivalasztott.to_string() && törlendő_kliens.len() > 0 {
                //         $result = query_futtatas("DELETE FROM clients WHERE client_id = ".$kliens_id, "teamspeak");
                match conn.query_drop(format!("DELETE FROM teamspeak.clients WHERE client_id = {}", törlendő_kliens)) {
                    Ok(_) => (),
                    Err(hiba) => {
                        println!("{}Hiba a Teamspeak kliens törlésekor: {}", LOG_PREFIX, hiba);
                        return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a Teamspeak kliens törlésekor: {}", hiba)));
                    }
                };
            }
        }
    
        //     $result = query_futtatas("DELETE FROM hausz_ts.jogosultsag_igenylesek WHERE id = ".$_GET['id']);
        match általános_query_futtatás(format!("DELETE FROM hausz_ts.jogosultsag_igenylesek WHERE id = {}", list_key("id", get.clone()))) {
            Ok(_) => (),
            Err(hiba) => {
                println!("{}Hiba a Teamspeak jogosultság igénylés törlésekor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Hiba a Teamspeak jogosultság igénylés törlésekor: {}", hiba)));
            }
        };
        //     exit_ok("DONE");
        return HttpResponse::Ok().body(exit_ok(format!("DONE")));
    }

    // if( isset($_GET['teamspeak_jogosultsag_elutasitas']) ) {
    if isset("teamspeak_jogosultsag_elutasitas", get.clone()) {
        //     die_if( !isset($_GET['id']), "Nem adtál meg igénylés azonosítót");
        if !isset("id", get.clone()) {
            return HttpResponse::BadRequest().body(exit_error(format!("Nem adtál meg igénylés azonosítót")));
        }
        //     die_if( strlen($_GET['id']) <= 0, "Hibás igénylés azonosító");
        if list_key("id", get.clone()).len() <= 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Hibás igénylés azonosító")));
        }
        
        //     $result = query_futtatas("DELETE FROM hausz_ts.jogosultsag_igenylesek WHERE id = ".$_GET['id']);
        //     exit_ok("DONE");
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