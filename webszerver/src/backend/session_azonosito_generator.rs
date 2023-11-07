use rand::prelude::*;
use rand_chacha::ChaCha20Rng;

pub fn random_új_session_azonosító() -> String {
    let mut rng = ChaCha20Rng::from_entropy();
    let mut session_azonosító = String::new();
    let használható_karakterek = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for _ in 0..64 {
        session_azonosító.push(használható_karakterek.chars().nth(rng.gen_range(0..használható_karakterek.len())).unwrap());
    }
    return session_azonosító;
}