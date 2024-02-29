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
    if session.loggedin != "yes" {
        return HttpResponse::BadRequest().body(exit_error(format!("Nem vagy belépve")));
    }
    
    if isset("token_informacio", get.clone()) {
        let token = match teamspeak_token_lekérdezése(session.user_id) {
            Ok(x) => {
                match x {
                    Some(y) => y,
                    None => {
                        return HttpResponse::BadRequest().body(exit_error(format!("Jelenleg nincs jogosultsági tokened.")));
                    }
                }
            },
            Err(hiba) => {
                println!("{}Hiba az adatbázis lekérdezésekor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        let jogosult_uj_token_keresre = if token.datediff > crate::konfig().webszerver.hausz_ts_token_igenyles_cd_nap { "igen" } else { "nem" };

        return HttpResponse::Ok().body(exit_ok(format!("\"token\": \"{}\", \"jogosult_uj_token_keresere\": \"{}\"", token.token, jogosult_uj_token_keresre)));
    }
    
    if isset("uj_token_igenylese", get.clone()) {
        let create_token_sh_kimenete = match Command::new("/hausz/webszerver/scriptek/teamspeak_token_keszites.sh").output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a create_token.sh futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        if !create_token_sh_kimenete.status.success() {
            println!("{} A create_token.sh script visszatérési kódja nem 0 volt, hanem: {}", LOG_PREFIX, create_token_sh_kimenete.status);
            return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
        }

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
        if jelenlegi_token.datediff == 0 {
            return HttpResponse::BadRequest().body(exit_error(format!("Csak {} naponként lehet új tokent igényelni. A jelenlegi tokened ma készült.", crate::konfig().webszerver.hausz_ts_token_igenyles_cd_nap)));
        }
        if jelenlegi_token.datediff < crate::konfig().webszerver.hausz_ts_token_igenyles_cd_nap {
            return HttpResponse::BadRequest().body(exit_error(format!("Csak {} naponként lehet új tokent igényelni. A jelenlegi tokened {} napja készült.", crate::konfig().webszerver.hausz_ts_token_igenyles_cd_nap, jelenlegi_token.datediff)));
        }

        match általános_query_futtatás(format!("DELETE FROM hausz_ts.felhasznalo_tokenek WHERE user_id = {}", session.user_id)) {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a query futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        match általános_query_futtatás(format!("INSERT INTO hausz_ts.felhasznalo_tokenek (user_id, token, generalasi_datum) VALUES ({}, '{}', now())", session.user_id, token)) {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a query futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        log_bejegyzes("teamspeak szerver", "új token készítés", token, session.username);
        return HttpResponse::Ok().body(exit_ok(format!("Új token generálása kész")));
    }
        
    if isset("felhasznalok", get.clone()) {
        let mut van_online_felhasznalo = false;

        let list_clients_sh_kimenete = match Command::new("/hausz/webszerver/scriptek/teamspeak_kliens_lista.sh").output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a list_clients.sh futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        if !list_clients_sh_kimenete.status.success()  {
            println!("{} Nem 0 a visszatérési kódja a scriptnek, hanem: {}", LOG_PREFIX, list_clients_sh_kimenete.status);
            return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
        }

        let eredmeny = String::from_utf8_lossy(&list_clients_sh_kimenete.stdout);
        let eredmeny = eredmeny.trim();
        let eredmeny = Regex::new(r"[\n\r\s]").unwrap().replace_all(&eredmeny, " ");
        let eredmeny = Regex::new(r"\\s").unwrap().replace_all(&eredmeny, " ");let eredmeny = eredmeny.split("|");
        let mut felhasználók = Vec::new();

        for sor in eredmeny {
            let sor = Regex::new(r"(.*)client_nickname=(.*) client_type=(.*)").unwrap().replace_all(sor, "$2");
            if sor != "serveradmin" {
                felhasználók.push(sor.to_string());
                van_online_felhasznalo = true;
            }
        }

        if !van_online_felhasznalo {
            return HttpResponse::Ok().body(exit_ok(format!("\"felhasznalok\": 0")));
        } else {
            let buffer = format!("\"felhasznalok\": [{{\"felhasznalonev\": \"{}\"}}", felhasználók[0]);
            let mut buffer = buffer.to_string();
            for i in 1..felhasználók.len() {
                buffer = format!("{}, {{\"felhasznalonev\": \"{}\"}}", buffer, felhasználók[i]);
            }
            buffer = format!("{}]", buffer);
            return HttpResponse::Ok().body(exit_ok(buffer));
        }
    }
    
    if isset("szerver_statusz", get.clone()) {
        let buffer = "";
        let check_telnet_sh_kimenete = match Command::new("/hausz/webszerver/scriptek/teamspeak_telnet_statusz.sh").output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a check_telnet.sh futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        let eredmeny = String::from_utf8_lossy(&check_telnet_sh_kimenete.stdout);
        let eredmeny = eredmeny.trim();

        let buffer_check_telnet: String;
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

        let meminfo_kimenet = match Command::new("cat")
            .arg("/proc/meminfo")
            .output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a \"cat /proc/meminfo\" parancs futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };
        let meminfo_kimenet = String::from_utf8_lossy(&meminfo_kimenet.stdout);
        let meminfo_kimenet = meminfo_kimenet.trim();

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
        
        let df_kimenete = match Command::new("df").arg("-B1").output() {
            Ok(x) => x,
            Err(hiba) => {
                println!("{}Hiba a df -B1 parancs futtatásakor: {}", LOG_PREFIX, hiba);
                return HttpResponse::InternalServerError().body(exit_error(format!("Belső hiba.")));
            },
        };

        let df_kimenete = String::from_utf8_lossy(&df_kimenete.stdout);
        let df_kimenete = df_kimenete.trim();
        let df_kimenete = Regex::new(r"[\n\r]").unwrap().replace_all(&df_kimenete, "");
        let hasznalt = Regex::new(r".*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*").unwrap().replace_all(&df_kimenete, "$3");
        let elerheto = Regex::new(r".*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*").unwrap().replace_all(&df_kimenete, "$4");
        let hasznalt = hasznalt.parse::<f32>().unwrap();
        let elerheto = elerheto.parse::<f32>().unwrap();
        let tarhely_beteltseg = hasznalt / (hasznalt + elerheto);
                
        let buffer_memoria_tarhely = format!("{}, \"memoria_hasznalat\": {}, \"swap_hasznalat\": {}, \"lemez_hasznalat\": {}", buffer, memoria_arany, swap_arany, tarhely_beteltseg);

        return HttpResponse::Ok().body(exit_ok(format!("{},{}{}", buffer_uptime, buffer_check_telnet, buffer_memoria_tarhely)));
    }
    
    return HttpResponse::BadRequest().body(exit_error(format!("Ismeretlen szándék (128261)")));
}
