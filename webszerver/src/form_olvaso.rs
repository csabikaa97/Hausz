use std::str::from_utf8;

use actix_multipart::Multipart;
use futures_util::{TryStreamExt, StreamExt};

static LOG_PREFIX: &str = "[form_olva] ";

pub async fn form_olvasó(payload: &mut Multipart) -> Vec<(String, String)> {
    let mut returnvalue = Vec::new();

    let mut jelenlegi_kulcs: String;

    while let Some(mut field) = payload.try_next().await.unwrap_or(None) {
        let content_disposition;
        {
            content_disposition = (&field).content_disposition(); 
        }

        let name = match content_disposition.get_name() {
            Some(name) => {
                jelenlegi_kulcs = format!("{name}");
                name.to_string()
            },
            None => {
                continue;
            }
        };
        
        if name.as_str() == "fileToUpload" {
            panic!("{}Rossz POST sorrend: Jelenlegi: (fileToUpload) ({:?})", LOG_PREFIX, returnvalue);
        }

        let mut bytes = Vec::new();

        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            bytes.append(&mut data.to_vec());
        }
        
        let bytes_string = match from_utf8(&bytes) {
            Ok(v) => v,
            Err(e) =>{
                println!("{}Invalid UTF-8 sequence: ({})", LOG_PREFIX, e);
                continue;
            }
        };
        returnvalue.push((jelenlegi_kulcs, bytes_string.to_string()));

        if name.as_str() == "filename" {
            return returnvalue;
        }
    }

    return returnvalue;
}

pub fn get_olvasó(query: String) -> Vec<(String, String)> {
    let mut returnvalue = Vec::new();

    let query = query.split("&");

    for q in query.clone() {
        let mut q = q.split("=");

        let key = match q.next() {
            Some(key) => key.to_string(),
            None => continue,
        };
        let value = match q.next() {
            Some(value) => value.to_string(),
            None => {
                returnvalue.push((key, "".to_owned()));
                continue;
            },
        };

        returnvalue.push((key, value));
    }

    return returnvalue;
}