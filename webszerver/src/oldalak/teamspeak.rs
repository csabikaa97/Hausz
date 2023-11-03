use std::process::Command;

use actix_web::HttpResponse;
use regex::Regex;
use crate::LOG_PREFIX;
use crate::alap_fuggvenyek::exit_ok;
use crate::alap_fuggvenyek::log_bejegyzes;
use crate::backend::AdatbázisEredményFelhasználóToken;
use crate::backend::lekerdezesek::teamspeak_token_lekérdezése;
use crate::backend::lekerdezesek::általános_query_futtatás;
use crate::session::Session;
use crate::alap_fuggvenyek::isset;

use crate::alap_fuggvenyek::exit_error;

pub async fn teamspeak_oldal(get: Vec<(String, String)>, session: Session) -> HttpResponse {
    // die_if( !isset($_SESSION['loggedin']), 'Nem vagy belépve');
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }
    
    //     if( isset($_GET['token_informacio']) ) {
    if isset("token_informacio", get.clone()) {
    //         $result = query_futtatas('');
        let token = match teamspeak_token_lekérdezése(session.user_id) {
            Ok(x) => {
                match x {
                    Some(y) => y,
                    None => {
                        return HttpResponse::BadRequest().body(exit_error(format!("Jelenleg nincs jogosultsági tokened")));
                    }
                }
            },
            Err(hiba) => {
                println!("{}Hiba az adatbázis lekérdezésekor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        let jogosult_uj_token_keresre = if token.datediff > crate::HAUSZ_TS_TOKEN_IGENYLES_CD_NAP { "igen" } else { "nem" };

        return HttpResponse::Ok().body(exit_ok(format!("\"token\": \"{}\", \"jogosult_uj_token_keresere\": \"{}\"", token.token, jogosult_uj_token_keresre)));
    //         die_if( $result->num_rows <= 0, "Jelenleg nincs jogosultsági tokened.");
    //         $row = $result->fetch_assoc();
    //         exit_ok('"token": "'.$row['token'].'", "jogosult_uj_token_keresere": "'.(intval($row['kulonbseg']) > 5 ? 'igen' : 'nem').'"');
    //     }
    }
    
    //     if( isset($_GET['uj_token_igenylese']) ) {
    if isset("uj_token_igenylese", get.clone()) {
        //         $eredmeny = shell_exec('/var/www/forras/teamspeak/create_token.sh');
        //         $eredmeny = preg_replace('/\s+/', '', $eredmeny);
        //         $eredmeny = preg_replace('/(.*)tokenid2=0token=(.*)error(.*)/', '$2', $eredmeny);
        let create_token_sh_kimenete = match Command::new("/webszerver/create_token.sh").output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a create_token.sh futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        let eredmeny = String::from_utf8_lossy(&create_token_sh_kimenete.stdout);
        let eredmeny = Regex::new(r"\s+").unwrap().replace_all(&eredmeny, "");
        let eredmeny = eredmeny.trim();
        let token = match Regex::new(r"tokenid2=0token=(.*)error") {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a regex létrehozásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        let token = match token.captures(eredmeny) {
            Some(x) => x,
            None => {
                println!("{}Hiba a token kiolvasásakor: {}", LOG_PREFIX, eredmeny);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        let token = match token.get(1) {
            Some(x) => x.as_str(),
            None => {
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        
        //         $result = query_futtatas('select datediff(now(), generalasi_datum) as kulonbseg from hausz_ts.felhasznalo_tokenek where user_id = '.$_SESSION['user_id'].';');
        let jelenlegi_token = match teamspeak_token_lekérdezése(session.user_id) {
            Ok(x) => {
                match x {
                    Some(y) => y,
                    None => {
                        AdatbázisEredményFelhasználóToken {
                            felhasználó_azonosító: session.user_id,
                            token: "".to_string(),
                            datediff: 99999999,
                        }
                    },
                }
            },
            Err(hiba) => {
                println!("{}Hiba az adatbázis lekérdezésekor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        //         if($result->num_rows > 0) {
        //             $row = $result->fetch_assoc();
        //             die_if( $row['kulonbseg'] == 0, 'Csak 5 naponként lehet új tokent igényelni. A jelenlegi tokened ma készült.');
        if jelenlegi_token.datediff == 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Csak {} naponként lehet új tokent igényelni. A jelenlegi tokened ma készült.", crate::HAUSZ_TS_TOKEN_IGENYLES_CD_NAP)));
        }
        //             die_if( $row['kulonbseg'] < 5, 'Csak 5 naponként lehet új tokent igényelni. A jelenlegi tokened '.$row['kulonbseg'].' napja készült.');
        if jelenlegi_token.datediff < crate::HAUSZ_TS_TOKEN_IGENYLES_CD_NAP {
            return HttpResponse::BadRequest().body(exit_error(format!("Csak {} naponként lehet új tokent igényelni. A jelenlegi tokened {} napja készült.", crate::HAUSZ_TS_TOKEN_IGENYLES_CD_NAP, jelenlegi_token.datediff)));
        }

        //             query_futtatas('delete from hausz_ts.felhasznalo_tokenek where user_id = '.$_SESSION['user_id']);
        match általános_query_futtatás(format!("DELETE FROM hausz_ts.felhasznalo_tokenek WHERE user_id = {}", session.user_id)) {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a query futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        //         $result = query_futtatas("insert into hausz_ts.felhasznalo_tokenek (user_id, token, generalasi_datum) values (".$_SESSION['user_id'].", '".$eredmeny."', now());");
        match általános_query_futtatás(format!("INSERT INTO hausz_ts.felhasznalo_tokenek (user_id, token, generalasi_datum) VALUES ({}, '{}', now())", session.user_id, token)) {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a query futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        //         log_bejegyzes("teamspeak szerver", "új token készítés", $eredmeny, $_SESSION['username']);
        //         exit_ok('Új token generálása kész');
        log_bejegyzes("teamspeak szerver", "új token készítés", token, session.username);
        return HttpResponse::Ok().body(exit_ok(format!("Új token generálása kész")));
    }
        
    //     if( isset($_GET['felhasznalok']) ) {
    if isset("felhasznalok", get.clone()) {
        //         $van_online_felhasznalo = false;
        let mut van_online_felhasznalo = false;

        //         $eredmeny = shell_exec('/var/www/forras/teamspeak/list_clients.sh');
        let list_clients_sh_kimenete = match Command::new("/webszerver/list_clients.sh").output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a list_clients.sh futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        //         $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
        let eredmeny = String::from_utf8_lossy(&list_clients_sh_kimenete.stdout);
        let eredmeny = eredmeny.trim();
        //         $eredmeny = preg_replace('/[\n\r]/', ' ', $eredmeny);
        let eredmeny = Regex::new(r"[\n\r]").unwrap().replace_all(&eredmeny, " ");
        //         $eredmeny = explode('|', $eredmeny);
        let eredmeny = eredmeny.split("|");
        //         $felhasznalok = array();
        let mut felhasználók = Vec::new();
        //         foreach($eredmeny as $sor) {
        //             $sor = preg_replace('/(.*)client_nickname=(.*) client_type=(.*)/', '$2', $sor);
        //             if($sor != "serveradmin") {
        //                 $sor = preg_replace('/\\\s/', ' ', $sor);
        //                 $sor = preg_replace('/\\\p/', '|', $sor);
        //                 array_push($felhasznalok, $sor);
        //                 $van_online_felhasznalo = true;
        //             }
        //         }
        for sor in eredmeny {
            let sor = Regex::new(r"(.*)client_nickname=(.*) client_type=(.*)").unwrap().replace_all(sor, "$2");
            if sor != "serveradmin" {
                let sor = Regex::new(r"\\\s").unwrap().replace_all(&sor, " ");
                let sor = Regex::new(r"\\\p").unwrap().replace_all(&sor, "|");
                felhasználók.push(sor.to_string());
                //                 $van_online_felhasznalo = true;
                van_online_felhasznalo = true;
            }
        }

        //         if( !$van_online_felhasznalo) {
        if !van_online_felhasznalo {
            //             exit_ok('"felhasznalok": 0');
            return HttpResponse::Ok().body(exit_ok(format!("\"felhasznalok\": 0")));
        } else {
            //         $buffer = '"felhasznalok": [{"felhasznalonev": "'.$felhasznalok[0].'"}';
            //         for ($i=1; $i < count($felhasznalok); $i++) {
            //             $buffer .= ', {"felhasznalonev": "'.$felhasznalok[$i].'"}';
            //         }
            //         exit_ok($buffer.']');
            //     }
            let buffer = format!("\"felhasznalok\": [{{\"felhasznalonev\": \"{}\"}}", felhasználók[0]);
            let mut buffer = buffer.to_string();
            for i in 1..felhasználók.len() {
                buffer = format!("{}, {{\"felhasznalonev\": \"{}\"}}", buffer, felhasználók[i]);
            }
            buffer = format!("{}]", buffer);
            return HttpResponse::Ok().body(exit_ok(buffer));
        }
    }
    
    //     if( isset($_GET['szerver_statusz']) ) {
    if isset("szerver_statusz", get.clone()) {
        //         $buffer = "";
        let buffer = "";
        //         $eredmeny = shell_exec("/var/www/forras/teamspeak/check_telnet.sh");
        let check_telnet_sh_kimenete = match Command::new("/webszerver/check_telnet.sh").output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a check_telnet.sh futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        //         $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
        let eredmeny = String::from_utf8_lossy(&check_telnet_sh_kimenete.stdout);
        let eredmeny = eredmeny.trim();

        let buffer_check_telnet: String;
        //         if(preg_match('/(.*)elcome to the TeamSpeak 3 ServerQuery interface(.*)/', $eredmeny, $matches)) {
        match Regex::new(r"(.*)elcome to the TeamSpeak 3 ServerQuery interface(.*)") {
            Ok(x) => {
                match x.captures(&eredmeny) {
                    Some(_) => {
                        buffer_check_telnet = format!("\"folyamat_ok\": true, \"telnet_ok\": true");
                    },
                    None => {
                        buffer_check_telnet = format!("\"folyamat_ok\": false, \"telnet_ok\": false");
                    },
                }
            }
            Err(hiba) => {
                println!("{}Hiba a regex létrehozásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        //         $eredmeny = "";
        //         $eredmeny = shell_exec("uptime");
                
        //         $buffer .= preg_replace(    '/(.*)load average: ([0-9]\.[0-9][0-9]), ([0-9]\.[0-9][0-9]), ([0-9]\.[0-9][0-9])(.*)/'
        //         , ', "processzor_1perc": $2, "processzor_5perc": $3, "processzor_15perc": $4'
        //         , $eredmeny);
        let uptime_kimenete = match Command::new("uptime").output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba az uptime futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        let uptime_kimenete = String::from_utf8_lossy(&uptime_kimenete.stdout);
        let uptime_kimenete = uptime_kimenete.trim();
        let buffer_uptime = match Regex::new(r"(.*)load average: ([0-9]\.[0-9][0-9]), ([0-9]\.[0-9][0-9]), ([0-9]\.[0-9][0-9])(.*)") {
            Ok(x) => {
                x.replace_all(&uptime_kimenete, "\"processzor_1perc\": $2, \"processzor_5perc\": $3, \"processzor_15perc\": $4")
            },
            Err(hiba) => {
                println!("{}Hiba a regex létrehozásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        //         $eredmeny = shell_exec('free');
        let meminfo_kimenet = match Command::new("cat")
            .arg("/proc/meminfo")
            .output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a \"cat /proc/meminfo\" parancs futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        //         $eredmeny = preg_replace('/\n/', ' ', $eredmeny);
        //         $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
        let meminfo_kimenet = String::from_utf8_lossy(&meminfo_kimenet.stdout);
        let meminfo_kimenet = meminfo_kimenet.trim();

        /* FORMAT:a
            MemTotal:        4027860 kB
            MemFree:          417952 kB
            MemAvailable:    2104620 kB
            Buffers:           64840 kB
            Cached:          1963308 kB
            SwapCached:         3592 kB
            Active:          1450820 kB
         */

        // find MemTotal: and copy the number after it
        let memoria_osszes = Regex::new(r"MemTotal:\s+([0-9]+)\s+kB")
            .unwrap()
            .captures(&meminfo_kimenet)
            .unwrap()
            .get(1).unwrap().as_str();
        let memoria_szabad = Regex::new(r"MemFree:\s+([0-9]+)\s+kB")
            .unwrap()
            .captures(&meminfo_kimenet)
            .unwrap()
            .get(1).unwrap().as_str();
        let swap_osszes = Regex::new(r"SwapTotal:\s+([0-9]+)\s+kB")
            .unwrap()
            .captures(&meminfo_kimenet)
            .unwrap()
            .get(1).unwrap().as_str();
        let swap_szabad = Regex::new(r"SwapFree:\s+([0-9]+)\s+kB")
            .unwrap()
            .captures(&meminfo_kimenet)
            .unwrap()
            .get(1).unwrap().as_str();

        let memoria_osszes = memoria_osszes.parse::<f32>().unwrap();
        let memoria_szabad = memoria_szabad.parse::<f32>().unwrap();
        let swap_osszes = swap_osszes.parse::<f32>().unwrap();
        let swap_szabad = swap_szabad.parse::<f32>().unwrap();
        
        let memoria_arany = (memoria_osszes - memoria_szabad) / memoria_osszes;
                
        let swap_arany = (swap_osszes - swap_szabad) / swap_osszes;
        

        //         $tarhely2 = shell_exec('df -B1');
        let df_kimenete = match Command::new("df").arg("-B1").output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a df -B1 parancs futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        //         $tarhely2 = preg_replace('/[\n\r]/', '', $tarhely2);
        let df_kimenete = String::from_utf8_lossy(&df_kimenete.stdout);
        let df_kimenete = df_kimenete.trim();
        let df_kimenete = Regex::new(r"[\n\r]").unwrap().replace_all(&df_kimenete, "");
        //         $hasznalt = preg_replace('/.*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*/', '$3', $tarhely2);
        let hasznalt = Regex::new(r".*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*").unwrap().replace_all(&df_kimenete, "$3");
        //         $elerheto = preg_replace('/.*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*/', '$4', $tarhely2);
        let elerheto = Regex::new(r".*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*").unwrap().replace_all(&df_kimenete, "$4");
        //         $hasznalt = floatval($hasznalt);
        let hasznalt = hasznalt.parse::<f32>().unwrap();
        //         $elerheto = floatval($elerheto);
        let elerheto = elerheto.parse::<f32>().unwrap();
        //         $tarhely_beteltseg = $hasznalt / ($hasznalt + $elerheto);
        let tarhely_beteltseg = hasznalt / (hasznalt + elerheto);
                
        //         $buffer .= ', "memoria_hasznalat": '.$memoria_arany.', "swap_hasznalat": '.$swap_arany.', "lemez_hasznalat": '.$tarhely_beteltseg;
        let buffer_memoria_tarhely = format!("{}, \"memoria_hasznalat\": {}, \"swap_hasznalat\": {}, \"lemez_hasznalat\": {}", buffer, memoria_arany, swap_arany, tarhely_beteltseg);

        return HttpResponse::Ok().body(exit_ok(format!("{},{}{}", buffer_uptime, buffer_check_telnet, buffer_memoria_tarhely)));
    }
            
            
            
    //         exit_ok($buffer);
    //     }
    return HttpResponse::BadRequest().body(exit_error(format!("Ismeretlen szándék (128261)")));
}
