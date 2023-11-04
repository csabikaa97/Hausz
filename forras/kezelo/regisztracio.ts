/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// <reference path="/var/www/forras/komponensek/topbar.ts" />

function regisztracio_inditasa(event) {
    event.preventDefault();

    jelszoErossegFrissitese();

    if( !ujJelszavakEgyeznek ) {
        uj_valasz_mutatasa(5000, "hiba", "A megadott jelszavak nem egyeznek");
        return;
    }
    
    if( !vanKisbetu || !vanNagybetu || !vanSzam || !vanKulonlegesKarakter ) {
        if( !confirm("Az átalad megadott jelszó nem biztonságos, mert nem felel meg a jelszókészítési irányelveknek. Biztosan ezt a jeszót szeretnéd használni?") ) {
            return;
        }
    }

    let post_parameterek = new FormData();
    post_parameterek.append("regisztracio", "igen");
    post_parameterek.append("regisztracio_username", obj('regisztracio_username').value);
    if( typeof crypto_konyvtar !== 'undefined' ) {
        szinkron_keres("/kezelo/regisztracio.php?generate_salt", "", (uzenet) => {
            if( uzenet.eredmeny == 'ok' ) {
                let salt = uzenet.valasz;
                let jelszo_hash = crypto_konyvtar.hash_keszites(obj('regisztracio_password').value);
                let salted_hash = crypto_konyvtar.hash_keszites(jelszo_hash + salt);
                post_parameterek.append("regisztracio_password", salted_hash);
                post_parameterek.append("regisztracio_password_confirm", salted_hash);
                post_parameterek.append("regisztracio_password_salt", salt);

                post_parameterek.append("regisztracio_email", obj('regisztracio_email').value);
                post_parameterek.append("regisztracio_meghivo", obj('regisztracio_meghivo').value);

                szinkron_keres("/kezelo/regisztracio.php", post_parameterek, (uzenet) => {
                    if( uzenet.eredmeny == 'ok' ) {
                        obj('regisztracio_doboz').style.display = 'none';
                        obj('adatvedelmi_tajekoztato_doboz').style.display = 'none';
                        obj('regisztracio_siker_doboz').style.display = 'block';
                    } else {
                        uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
                    }
                });
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    } else {
        post_parameterek.append("regisztracio_password", obj('regisztracio_password').value);
        post_parameterek.append("regisztracio_password_confirm", obj('regisztracio_password_confirm').value);
        post_parameterek.append("regisztracio_email", obj('regisztracio_email').value);
        post_parameterek.append("regisztracio_meghivo", obj('regisztracio_meghivo').value);
        
        szinkron_keres("/kezelo/regisztracio.php", post_parameterek, (uzenet) => {
            if( uzenet.eredmeny == 'ok' ) {
                obj('regisztracio_doboz').style.display = 'none';
                obj('adatvedelmi_tajekoztato_doboz').style.display = 'none';
                obj('regisztracio_siker_doboz').style.display = 'block';
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    }


}

function adatvedelmi_tajekoztato_elolvasva() {
    obj('adatvedelmi_tajekoztato_elolvasva_gomb').style.visibility = 'hidden';
    obj('regisztracio_doboz').style.display = 'block';
}

function jelszoErossegFrissitese() {
    let jelenlegi_jelszo = obj('regisztracio_password').value;

    vanKisbetu = false;
    vanNagybetu = false;
    vanSzam = false;
    vanKulonlegesKarakter = false;
    ujJelszavakEgyeznek = false;

    for (let i = 0; i < jelenlegi_jelszo.length; i++) {
        let karakter = jelenlegi_jelszo[i];
        if( /[a-z]/g.test(jelenlegi_jelszo) ) {         vanKisbetu = true; }
        if( /[A-Z]/g.test(jelenlegi_jelszo) ) {         vanNagybetu = true; }
        if( /[0-9]/g.test(jelenlegi_jelszo) ) {         vanSzam = true; }
        if( /[^a-zA-Z0-9]/g.test(jelenlegi_jelszo) ) {  vanKulonlegesKarakter = true; }
        if( jelenlegi_jelszo == obj('regisztracio_password_confirm').value ) {  ujJelszavakEgyeznek = true; }
    }

    let buffer = "";

    if( vanKisbetu ) {
        buffer += "🟢 Kis betű</br>";
    } else {
        buffer += "🟠 Kis betű</br>";
    }
    if( vanNagybetu ) {
        buffer += "🟢 Nagy betű</br>";
    } else {
        buffer += "🟠 Nagy betű</br>";
    }
    if( vanSzam ) {
        buffer += "🟢 Szám</br>";
    } else {
        buffer += "🟠 Szám</br>";
    }
    if( vanKulonlegesKarakter ) {
        buffer += "🟢 Különleges karakter</br>";
    } else {
        buffer += "🟠 Különleges karakter</br>";
    }
    if( jelenlegi_jelszo.length > 10 ) {
        buffer += "🟢 Legalább 10 karakter hosszú</br>";
    } else {
        buffer += "🟠 Legalább 10 karakter hosszú</br>";
    }
    if( obj('regisztracio_password_confirm').value.length > 0 ) {
        if( ujJelszavakEgyeznek ) {
            buffer += "🟢 Új jelszavak egyeznek</br>";
        } else {
            buffer += "🔴 Új jelszavak egyeznek</br>";
        }
    } else {
        buffer += "⚫ Új jelszavak egyeznek</br>";
    }

    obj('jelszoErossegTippek').innerHTML = buffer;
}

function jelszoErossegFrissitesUtemezese() {
    jelszoErossegFrissitesIdozito = setTimeout(() => {
        jelszoErossegFrissitese();
    }, 500);
}

var vanKisbetu = false;
var vanNagybetu = false;
var vanSzam = false;
var vanKulonlegesKarakter = false;
var ujJelszavakEgyeznek = false;
var jelszoErossegFrissitesIdozito;

let crypto_konyvtar;
topbar_betoltese();