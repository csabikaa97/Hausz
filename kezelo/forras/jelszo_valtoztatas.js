function belepteto_rendszer_frissult() {
    if( session_loggedin == "yes" ) {
        obj('jelszo_valtoztatas_doboz').style.display = 'block';
        obj('hibaNemVagyBelepveDoboz').style.display = 'none';
    } else {
        obj('jelszo_valtoztatas_doboz').style.display = 'none';
        obj('hibaNemVagyBelepveDoboz').style.display = 'block';
    }
}

function jelszo_valtoztatasa(event) {
    event.preventDefault();

    jelszoErossegFrissitese();
    
    if( obj('uj_jelszo').value.length > 72 ) {
        alert('Túl hosszú a jelszavad. A használható karakterek maximális száma 72.');
        return;
    }

    if( !ujJelszavakEgyeznek ) {
        uj_valasz_mutatasa(5000, "hiba", "A megadott új jelszavak nem egyeznek");
        return;
    }
    
    if( !vanKisbetu || !vanNagybetu || !vanSzam || !vanKulonlegesKarakter ) {
        if( !confirm("A jelenlegi jelszavad nem biztonságos, mert nem felel meg a jelszókészítési irányelveknek. Biztosan ezt az új jeszót szeretnéd használni?") ) {
            return;
        }
    }


    let post_parameterek = new FormData();
    post_parameterek.append('uj_jelszo', obj('uj_jelszo').value);
    post_parameterek.append('uj_jelszo_megerosites', obj('uj_jelszo_megerosites').value);
    post_parameterek.append('jelenlegi_jelszo', obj('jelenlegi_jelszo').value);

    szinkron_keres("/kezelo/jelszo_valtoztatas.php", post_parameterek, (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            obj('jelszo_valtoztatas_doboz').style.display = 'none';
            obj('hibaNemVagyBelepveDoboz').style.display = 'none';
            obj('ok_jelszo_valtoztatas_sikeres').style.display = 'block';
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function jelszoErossegFrissitese() {
    let jelenlegi_jelszo = obj('uj_jelszo').value;

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
        if( obj('uj_jelszo').value == obj('uj_jelszo_megerosites').value ) {  ujJelszavakEgyeznek = true; }
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
    if( obj('uj_jelszo_megerosites').value.length > 0 ) {
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

topbar_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult );
