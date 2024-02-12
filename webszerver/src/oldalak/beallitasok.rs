use actix_web::HttpResponse;
use crate::session::Session;

pub async fn push_ertesites_adatok_mentese(post: Vec<(String, String)>, session: Session) -> HttpResponse {
    return HttpResponse::Ok().body("admin_oldal");
}

pub async fn push_ertesites_kuldese(post: Vec<(String, String)>, session: Session) -> HttpResponse {
    return HttpResponse::Ok().body("admin_oldal");
}

