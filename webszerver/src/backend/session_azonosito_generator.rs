use rand::prelude::*;

pub fn random_új_session_azonosító() -> String {
    let mut rng = rand::thread_rng();
    let mut session_azonosító = String::new();
    for _ in 0..64 {
        let karakter = rng.gen_range(0..crate::SESSSION_AZONOSÍTÓ_HOSSZ);
        if karakter < 10 {
            session_azonosító.push((karakter + 48) as u8 as char);
        } else if karakter < 36 {
            session_azonosító.push((karakter + 55) as u8 as char);
        } else {
            session_azonosító.push((karakter + 61) as u8 as char);
        }
    }

    return session_azonosító;
}