use serde::Deserialize;

#[derive(Deserialize)]
pub struct WebszerverKonfiguráció {
    pub ip: String,
    pub port_http: u16,
    pub port_https: u16,
    pub domain: String,
    pub session_lejarati_ideje_mp: i64,
    pub sesssion_azonosito_hossz: usize,
    pub hausz_ts_token_igenyles_cd_nap: u32,
    pub max_fajl_meret: usize,
    pub hausz_adatbazis_url_w: String,
    pub hausz_adatbazis_url_r: String,
    pub hausz_teamspeak_adatbazis_url: String,
    pub fajlok_eleresi_utvonala: String,
    pub tanusitvanyok_eleresi_utvonala: String,
    pub hausz_teamspeak_szerver_ip: String,
    pub push_szerver: String,
}

impl WebszerverKonfiguráció {
    pub fn new() -> WebszerverKonfiguráció {
        return WebszerverKonfiguráció {
            ip: "".to_string(),
            port_http: 0,
            port_https: 0,
            domain: "".to_string(),
            session_lejarati_ideje_mp: 0,
            sesssion_azonosito_hossz: 0,
            hausz_ts_token_igenyles_cd_nap: 0,
            max_fajl_meret: 0,
            hausz_adatbazis_url_w: "".to_string(),
            hausz_adatbazis_url_r: "".to_string(),
            hausz_teamspeak_adatbazis_url: "".to_string(),
            fajlok_eleresi_utvonala: "".to_string(),
            tanusitvanyok_eleresi_utvonala: "".to_string(),
            hausz_teamspeak_szerver_ip: "".to_string(),
            push_szerver: "".to_string(),
        };
    }

    pub fn clone(&self) -> WebszerverKonfiguráció {
        return WebszerverKonfiguráció {
            ip: self.ip.clone(),
            port_http: self.port_http,
            port_https: self.port_https,
            domain: self.domain.clone(),
            session_lejarati_ideje_mp: self.session_lejarati_ideje_mp,
            sesssion_azonosito_hossz: self.sesssion_azonosito_hossz,
            hausz_ts_token_igenyles_cd_nap: self.hausz_ts_token_igenyles_cd_nap,
            max_fajl_meret: self.max_fajl_meret,
            hausz_adatbazis_url_w: self.hausz_adatbazis_url_w.clone(),
            hausz_adatbazis_url_r: self.hausz_adatbazis_url_r.clone(),
            hausz_teamspeak_adatbazis_url: self.hausz_teamspeak_adatbazis_url.clone(),
            fajlok_eleresi_utvonala: self.fajlok_eleresi_utvonala.clone(),
            tanusitvanyok_eleresi_utvonala: self.tanusitvanyok_eleresi_utvonala.clone(),
            hausz_teamspeak_szerver_ip: self.hausz_teamspeak_szerver_ip.clone(),
            push_szerver: self.push_szerver.clone(),
        }
    }
}

#[derive(Deserialize)]
pub struct PrivátWebszerverKonfiguráció {
    pub hausz_teamspeak_admin_jelszo: String,
}

impl PrivátWebszerverKonfiguráció {
    pub fn new() -> PrivátWebszerverKonfiguráció {
        return PrivátWebszerverKonfiguráció {
            hausz_teamspeak_admin_jelszo: "".to_string(),
        };
    }

    pub fn clone(&self) -> PrivátWebszerverKonfiguráció {
        return PrivátWebszerverKonfiguráció {
            hausz_teamspeak_admin_jelszo: self.hausz_teamspeak_admin_jelszo.clone(),
        };
    }
}

#[derive(Deserialize)]
pub struct KonfigurációsFájl {
    pub webszerver: WebszerverKonfiguráció,
}

impl KonfigurációsFájl {
    pub fn new() -> KonfigurációsFájl {
        return KonfigurációsFájl {
            webszerver: WebszerverKonfiguráció::new(),
        };
    }

    pub fn clone(&self) -> KonfigurációsFájl {
        return KonfigurációsFájl {
            webszerver: WebszerverKonfiguráció::clone(&self.webszerver),
        };
    }
}

#[derive(Deserialize)]
pub struct PrivátKonfigurációsFájl {
    pub webszerver: PrivátWebszerverKonfiguráció,
}

impl PrivátKonfigurációsFájl {
    pub fn new() -> PrivátKonfigurációsFájl {
        return PrivátKonfigurációsFájl {
            webszerver: PrivátWebszerverKonfiguráció::new(),
        };
    }

    pub fn clone(&self) -> PrivátKonfigurációsFájl {
        return PrivátKonfigurációsFájl {
            webszerver: PrivátWebszerverKonfiguráció::clone(&self.webszerver),
        };
    }
}