use crate::konfig;
use reqwest;
use crate::backend::AdatbázisEredményPushadatok;
use mysql::prelude::*;
use super::csatlakozás;

static LOG_PREFIX: &str = "[push_küld] ";

pub async fn teszt_értesítés(adatok: String) -> Result<(), String> {
    push_értesítés_adatok_alapján(adatok, "teszt".to_string(), "Teszt értesítés".to_string()).await?;

    Ok(())
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
            Ok(_) => {
                println!("{}Értesítés sikeresen elküldve a felhasználónak: {}", LOG_PREFIX, push_adat.felhasznalo_azonosito);
            },
            Err(err) => {
                println!("{}Hiba az értesítés küldésekor: {}", LOG_PREFIX, err);
            }
        }
    }

    Ok(())
}