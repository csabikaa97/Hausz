use crate::konfig;
use reqwest;
use crate::backend::AdatbázisEredményPushadatok;
use mysql::prelude::*;
use super::csatlakozás;
use crate::backend::AdatbázisEredményPushApikulcs;

static LOG_PREFIX: &str = "[push_küld] ";

pub async fn teszt_értesítés(adatok: String) -> Result<(), String> {
    match push_értesítés_adatok_alapján(adatok, "teszt".to_string(), "Teszt értesítés".to_string()).await {
        Ok(_) => { Ok(()) },
        Err(err) => {
            Err(format!("{}Hiba a teszt értesítés kiküldésekor: {}", LOG_PREFIX, err))
        }
    }
}

pub async fn push_értesítés_adatok_alapján(adatok: String, cím: String, üzenet: String) -> Result<(), String> {
    let adat = format!("{{\"adatok\": {}, \"uzenet\": \"{}\", \"cim\": \"{}\"}}", adatok, üzenet, cím);
    let client = reqwest::Client::new();
    match client.post(format!("http://{}/ertesites_kuldese", konfig().webszerver.push_szerver).as_str())
        .header("Content-Type", "application/json")
        .body(adat)
        .send()
        .await {
            Ok(res) => res,
            Err(err) => {
                println!("{}Hiba a teszt értesítés küldésekor: {}", LOG_PREFIX, err);
                return Err(format!("Hiba a teszt értesítés küldésekor: {}", err));
            }
        };

    Ok(())
}

pub async fn push_értesítés_id_alapján(cím: String, üzenet: String, felhasználó_azonosító: u32) -> Result<(), String> {
    let mut conn = match csatlakozás(crate::konfig().webszerver.hausz_adatbazis_url_r.as_str()) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            return Err(format!("Hiba az adatbázishoz való csatlakozáskor: {}", err));
        }
    };

    let push_adatok = match conn.query_map(
            format!("SELECT felhasznalo_azonosito, adatok, megjegyzes FROM push_ertesites_adatok WHERE felhasznalo_azonosito = {}", felhasználó_azonosító).as_str(),
            |(
                felhasznalo_azonosito,
                adatok,
                megjegyzes
            )|
            AdatbázisEredményPushadatok {
                felhasznalo_azonosito,
                adatok,
                megjegyzes
            },
        ) {
            Ok(fájlok) => fájlok,
            Err(err) => {
                println!("{}Hiba az adatbázis lekérdezésekor: (10) {}", LOG_PREFIX, err);
                return Err(format!("Hiba az adatbázis lekérdezésekor: (10) {}", err));
            }
        };

    for push_adat in push_adatok {
        match push_értesítés_adatok_alapján(push_adat.adatok, cím.clone(), üzenet.clone()).await {
            Ok(_) => {},
            Err(err) => {
                println!("{}Hiba az értesítés küldésekor: {}", LOG_PREFIX, err);
            }
        }
    }

    Ok(())
}

pub async fn push_értesítés_api_kulcs_alapján(cím: String, üzenet: String, api_kulcs: String) -> Result<(), String> {
    let mut conn = match csatlakozás(crate::konfig().webszerver.hausz_adatbazis_url_r.as_str()) {
        Ok(conn) => conn,
        Err(err) => {
            println!("{}Hiba az adatbázishoz való csatlakozáskor: {}", LOG_PREFIX, err);
            return Err(format!("Hiba az adatbázishoz való csatlakozáskor: {}", err));
        }
    };

    let push_adatok = match conn.query_map(
            format!("SELECT felhasznalo_azonosito, kulcs, megjegyzes FROM push_ertesites_api_kulcsok WHERE kulcs = '{}'", api_kulcs).as_str(),
            |(
                felhasznalo_azonosito,
                kulcs,
                megjegyzes
            )|
            AdatbázisEredményPushApikulcs {
                felhasznalo_azonosito,
                kulcs,
                megjegyzes
            },
        ) {
            Ok(fájlok) => fájlok,
            Err(err) => {
                println!("{}Hiba az adatbázis lekérdezésekor: (10) {}", LOG_PREFIX, err);
                return Err(format!("Hiba az adatbázis lekérdezésekor: (10) {}", err));
            }
        };

    if push_adatok.len() <= 0 {
        println!("{}Nem létezik ilyen API kulcs: (13) {}", LOG_PREFIX, api_kulcs);
        return Err(format!("{}Nem létezik ilyen API kulcs: (13) {}", LOG_PREFIX, api_kulcs));
    }
        
    let push_adat = match push_adatok.first() {
        Some(x) => x,
        None => {
            println!("{}Hiba az adatbázis eredmény kiszedésekor: (12)", LOG_PREFIX);
            return Err(format!("Hiba az adatbázis eredmény kiszedésekor: (12)"));
        }
    };

    match push_értesítés_id_alapján(cím.clone(), üzenet.clone(), push_adat.felhasznalo_azonosito).await {
        Ok(_) => {},
        Err(err) => {
            println!("{}Hiba az értesítés küldésekor: {}", LOG_PREFIX, err);
        }
    }

    Ok(())
}