use rand::prelude::*;
use rand_chacha::ChaCha20Rng;

static LOG_PREFIX: &str = "[COOKIEGEN] ";

pub fn random_új_session_azonosító() -> String {
    let mut rng = ChaCha20Rng::from_entropy();
    let mut session_azonosító = String::new();
    let használható_karakterek = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for _ in 0..64 {
        session_azonosító.push(használható_karakterek.chars().nth(rng.gen_range(0..használható_karakterek.len())).unwrap());
    }
    println!("{}Generált cookie: {}", LOG_PREFIX, session_azonosító);
    return session_azonosító;
}