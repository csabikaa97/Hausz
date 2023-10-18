use actix_web::HttpResponse;
use crate::session::Session;
use crate::alap_fuggvenyek::isset;

use crate::oldalak::belepteto_rendszer::*;

pub fn keres_kezelo(post: Vec<(String, String)>, get: Vec<(String, String)>, session: Session) -> HttpResponse {
    if isset("login", post.clone()) {
        return belepteto_rendszer(post, get, session);
    }
    if isset("get_salt", post.clone()) {
        return belepteto_rendszer(post, get, session);
    }
    if isset("statusz", get.clone()) {
        return belepteto_rendszer(post, get, session);
    }
    if isset("logout", get.clone()) {
        return belepteto_rendszer(post, get, session);
    }

    HttpResponse::Ok().body("KERES_KEZELO TODO")
}