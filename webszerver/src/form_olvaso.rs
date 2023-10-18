use regex::Regex;

pub fn form_olvasó(form: String, boundary: String) -> Vec<(String, String)> {
    let mut returnvalue = Vec::new();

    let mut jelenlegi_kulcs = String::new();

    for line in form.lines() {
        if line.starts_with(boundary.as_str()) {
            continue;
        }
        if line.starts_with("Content-Disposition: form-data;") {
            let re = Regex::new(r#"name="(.*)""#).unwrap();
            let captures = re.captures(line).unwrap();
            let name = captures.get(1).unwrap().as_str();
            jelenlegi_kulcs = name.to_string();
            continue;
        }
        if line.len() == 0 { continue; }

        returnvalue.push((jelenlegi_kulcs.clone(), line.to_string()));
    }

    return returnvalue;
}

pub fn get_olvasó(query: String) -> Vec<(String, String)> {
    let mut returnvalue = Vec::new();

    // explode the string by delimiter "&"
    let query = query.split("&");

    
    // iterate over the string vector
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

    println!("query string: ({:?})", query);
    println!("Eredmény: ({:?})", returnvalue);

    return returnvalue;
}