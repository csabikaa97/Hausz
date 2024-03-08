/// <reference path="../komponensek/alap_fuggvenyek.ts" />
/// <reference path="../komponensek/belepteto_rendszer.ts" />
/// <reference path="../komponensek/topbar.ts" />

function fiok_varazslo_dialog_megnyitasa() {
    obj('fiok_varazslo_dialog').showModal();
}

function fiok_varazslo_dialog_bezarasa() {
    obj('fiok_varazslo_dialog').close();
}

function meghivo_dialog_megnyitasa() {
    obj('meghivo_dialog').showModal();
}

function meghivo_dialog_bezarasa() {
    obj('meghivo_dialog').close();
}

function jelszo_valtoztatas_dialog_megnyitasa() {
    obj('jelszo_valtoztatas_dialog').showModal();
}

function jelszo_valtoztatas_dialog_bezarasa() {
    obj('jelszo_valtoztatas_dialog').close();
}

function meghivo_frissites() {
    if( session_loggedin == "yes" ) {
        let show_elems = document.getElementsByClassName("require-login");
        for (let i = 0; i < show_elems.length; i++) {
            let elem = show_elems[i];
            elem.classList.remove("nodisplay");
        }
        let hide_elems = document.getElementsByClassName("without-login");
        for (let i = 0; i < hide_elems.length; i++) {
            let elem = hide_elems[i];
            elem.classList.add("nodisplay");
        }
        szinkron_keres("/kezelo/meghivo.🦀?meghivo_adatok", "", (uzenet) => {
            let meghivo_adatok = obj("meghivo_adatok");
            if( uzenet.eredmeny == 'ok' ) {
                if(uzenet.meghivok_szama == 0) {
                    meghivo_adatok.innerHTML = `<p>Jelenleg nincs meghívód</p>
                    <button class="gomb no-border szint-2 kerekites-15" onclick="uj_meghivo()">Új meghívó generálása</button>`;
                } else {
                    let meghivo = uzenet.meghivok[0];
                    let buffer = `
                        <p>Jelenleg használható meghívód:   ${meghivo}</p>`;
                    meghivo_adatok.innerHTML = buffer;
                }
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    } else {
        let show_elems = document.getElementsByClassName("without-login");
        for (let i = 0; i < show_elems.length; i++) {
            let elem = show_elems[i];
            elem.classList.remove("nodisplay");
        }
        let hide_elems = document.getElementsByClassName("require-login");
        for (let i = 0; i < hide_elems.length; i++) {
            let elem = hide_elems[i];
            elem.classList.add("nodisplay");
        }
    }
}

function uj_api_kulcs_letrehozasa() {
    let megjegyzés = obj('api_kulcs_megjegyzes').value;

    let post_adatok = new FormData();
    post_adatok.append('api_kulcs_megjegyzes', megjegyzés);

    szinkron_keres("/beallitasok/beallitasok.🦀?uj_api_kulcs_keszitese", post_adatok, (uzenet) => {
        if(uzenet.eredmeny == 'ok') {
            uj_valasz_mutatasa(5000, "ok", uzenet.valasz);
            api_kulcsok_frissitese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function api_kulcsok_frissitese() {
    if(session_loggedin !== "yes") {
        obj('api_kulcsok').innerHTML = "";
    }

    let buffer = "<tr><th>Kulcs</th><th>Megjegyzés</th><th></th></tr>";

    szinkron_keres("/beallitasok/beallitasok.🦀?api_kulcsok_lekerdezese", "", (uzenet) => {
        if(uzenet.eredmeny == 'ok') {
            if(uzenet.valasz.length <= 0) {
                buffer += `<tr><td colspan="2">Nincsenek jelenleg API kulcsok</td><td></td></tr>`;
            } else {
                uzenet.valasz.forEach(elem => {
                    buffer += `<tr><td>${elem.kulcs}</td><td>${elem.megjegyzes}</td></tr>`;
                });
            }
            obj('api_kulcsok').innerHTML = buffer;
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

async function push_api_adatok_frissitese() {
    if(session_loggedin !== "yes") {
        obj('push_adatok').innerHTML = "";
    }

    let adatok: string[] = [];
    try {
        let workerek = await navigator.serviceWorker.getRegistrations();
        for(let i = 0; i < workerek.length; i++) {
            let adat = await workerek[i].pushManager.getSubscription();
            adatok = [...adatok, JSON.stringify(adat)];
        }
    }
    catch (err) {
        console.error(err);
    }

    let buffer = "<tr><th>Adat</th><th>Megjegyzés</th><th></th><th></th></tr>";

    szinkron_keres("/beallitasok/beallitasok.🦀?push_ertesites_adatok_lekerdezese", "", (uzenet) => {
        if(uzenet.eredmeny == 'ok') {
            if(uzenet.valasz.length <= 0) {
                buffer += `<tr><td colspan="2">Nincsenek jelenleg Push API adatok</td><td></td><td></td></tr>`;
            } else {
                for (let i = 0; i < uzenet.valasz.length; i++) {
                    const elem = uzenet.valasz[i];
                    let sajat_adat = false;
                    for (let i = 0; i < adatok.length; i++) {
                        const adat = adatok[i];
                        console.log("\"" + adat + "\" === \"" + JSON.stringify(elem.adat) + "\"")
                        if(adat === JSON.stringify(elem.adat)) {
                            sajat_adat = true;
                            break;
                        }
                    }
                    buffer += `<tr><td>${(JSON.stringify(elem.adat)).slice(0,20)}...</td><td>${elem.megjegyzes}</td><td id="torles_gomb_${i}">❌</td><td>${sajat_adat ? "<- Ez a böngésző" : ""}</td></tr>`;
                }
            }
            obj('push_adatok').innerHTML = buffer;

            setTimeout(() => {
                for (let i = 0; i < uzenet.valasz.length; i++) {
                    const elem = uzenet.valasz[i];
                    obj("torles_gomb_" + i).addEventListener("click", () => {
                        push_subscription_adat_torlese(elem.adat).then(() => {
                            uj_valasz_mutatasa(5000, "ok", "Push API adatok törlése sikeres");
                            push_api_adatok_frissitese();
                        }).catch(() => {
                            uj_valasz_mutatasa(5000, "hiba", "Push API adatok törlése sikertelen");
                        });
                    });
                }
            }, 100);
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

async function belepteto_rendszer_frissult() {
    jelszo_valtoztatas_frissites();
    meghivo_frissites();
    api_kulcsok_frissitese();
    push_api_adatok_frissitese();
    fiok_varazslo_frissites();
}

function jelszo_valtoztatas_frissites() {
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

    szinkron_keres("/kezelo/regisztracio.🦀?generate_salt", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            let uj_jelszo_salt = uzenet.valasz;
            let post_parameterek = new FormData();

            post_parameterek.append('uj_jelszo_sha256_salt', uj_jelszo_salt);

            let jelszo_hash = crypto_konyvtar.hash_keszites( obj('uj_jelszo').value );
            let salted_hash = crypto_konyvtar.hash_keszites( jelszo_hash + uj_jelszo_salt );
            post_parameterek.append('uj_jelszo_sha256', salted_hash);
            
            let jelszo_hash_megerosites = crypto_konyvtar.hash_keszites( obj('uj_jelszo_megerosites').value );
            let salted_hash_megerosites = crypto_konyvtar.hash_keszites( jelszo_hash_megerosites + uj_jelszo_salt );
            post_parameterek.append('uj_jelszo_sha256_megerosites', salted_hash_megerosites);
            
            let post_parameterek_salt_keres = new FormData();
            post_parameterek_salt_keres.append('get_salt', 'yes');
            
            szinkron_keres("/include/belepteto_rendszer.🦀", post_parameterek_salt_keres, (uzenet) => {
                if(uzenet.eredmeny == 'ok') {
                    let jelenlegi_salt = uzenet.salt;

                    let jelenlegi_jelszo_hash = crypto_konyvtar.hash_keszites( obj('jelenlegi_jelszo').value );
                    let jelenlegi_salted_hash = crypto_konyvtar.hash_keszites( jelenlegi_jelszo_hash + jelenlegi_salt );

                    post_parameterek.append('jelenlegi_jelszo_sha256', jelenlegi_salted_hash);
                } else {
                    post_parameterek.append('jelenlegi_jelszo', obj('jelenlegi_jelszo').value);
                }

                post_parameterek.append('uj_jelszo', obj('uj_jelszo').value);
                post_parameterek.append('uj_jelszo_megerosites', obj('uj_jelszo_megerosites').value);

                szinkron_keres("/kezelo/jelszo_valtoztatas.🦀", post_parameterek, (uzenet) => {
                    if( uzenet.eredmeny == 'ok' ) {
                        obj('jelszo_valtoztatas_doboz').style.display = 'none';
                        obj('hibaNemVagyBelepveDoboz').style.display = 'none';
                        obj('ok_jelszo_valtoztatas_sikeres').style.display = 'block';
                    } else {
                        uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
                    }
                });
            });
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

function uj_meghivo() {
    szinkron_keres("/kezelo/meghivo.🦀?uj_meghivo", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uj_valasz_mutatasa(5000, "ok", uzenet.valasz);
            meghivo_frissites();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function fiok_varazslo_frissites() {
    if( session_loggedin == 'yes' ) {
        obj('varazslo').style.display = 'block';
        obj('nincs_belepve_leiras').style.display = 'none';
        fiok_lista_frissitese();
    } else {
        obj('varazslo').style.display = 'none';
        obj('nincs_belepve_leiras').style.display = 'block';
    }
}

function fiok_lista_frissitese() {
    szinkron_keres("/teamspeak/fiok_varazslo/fiok_varazslo.🦀?fiok_lista_lekerese", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            obj('fiok_lista_toltes_animacio').style.display = 'none';
            obj('interaktiv_resz').style.display = 'block';
            if( uzenet.fiokok_szama <= 0 ) {
                return;
            } else {
                let fiok_lista = obj('fiok_lista');
                fiok_lista.innerHTML = '';
                let buffer = "<tr><th>Jelenlegi<br>fiókod</th><th>Régi<br>fiókok</th><th>Fiók neve</th></tr>";
                uzenet.fiokok.forEach(fiok => {
                    buffer += `<tr style="margin: 0px;">`;
                    buffer += `<td><input class="kozepre" type="radio" name="jelenlegi" value="${fiok.client_nickname}" id="${fiok.client_id}" /></td>`;
                    buffer += `<td><input class="kozepre" type="checkbox" name="fiok_${fiok.client_id}" value="${fiok.client_nickname}" id="${fiok.client_id}" /></td>`;
                    buffer += `<td><label id="label_fiok_${fiok.client_id}" for="fiok_${fiok.client_id}">${fiok.client_nickname} <font style="opacity: 0.5;">(${fiok.client_id})</font></label>`;
                    buffer += `</td></tr>`;
                });

                fiok_lista.innerHTML = buffer;
            }
        }
    });
}

function szoveg_tartalmazas(szoveg1: string, szoveg2: string) {
    let cserelendo_karakterek = [
        ['á', 'a'],
        ['é', 'e'],
        ['í', 'i'],
        ['ó', 'o'],
        ['ö', 'o'],
        ['ő', 'o'],
        ['ú', 'u'],
        ['ü', 'u'],
        ['ű', 'u']
    ];

    szoveg1 = szoveg1.toLowerCase();
    szoveg2 = szoveg2.toLowerCase();

    cserelendo_karakterek.forEach(karakter => {
        szoveg1 = szoveg1.replace(karakter[0], karakter[1]);
        szoveg2 = szoveg2.replace(karakter[0], karakter[1]);
    });

    return szoveg1.indexOf(szoveg2) != -1;
}

function fiok_filter_frissites() {
    let fiokok = document.querySelectorAll('#fiok_lista input');
    let filter = obj('fiok_szures_mezo').value.toLowerCase();
    fiokok.forEach(fiok => {
        let fiok_value = fiok.getAttribute('value');
        if( fiok_value == null ) {
            throw new Error('fiok_value null!');
        }
        if( szoveg_tartalmazas(fiok_value, filter) || filter == '' ) {
            discardNull(discardNull(fiok.parentElement).parentElement).setAttribute('style', 'display: table-row');
        } else {
            discardNull(discardNull(fiok.parentElement).parentElement).setAttribute('style', 'display: none');
        }
    });
}

function igenyles() {
    let post_data = new FormData();
    let fiok_idk = '';
    let fiok_nevek = '';
    let fiokok = document.querySelectorAll('#fiok_lista input');
    fiokok.forEach(fiok => {
        if( (<HTMLInputElement> fiok).checked ) {
            let helyi_fiok_id = fiok.getAttribute('id');
            if(helyi_fiok_id == null) {
                throw new Error('fiok_id null!');
            }
            if( fiok_idk.indexOf(helyi_fiok_id) == -1 ) {
                fiok_idk += fiok.getAttribute('id') + ',';
                fiok_nevek += fiok.getAttribute('value') + ',';
            }
        }
    });

    let jelenlegi_fiok_kivalasztott;
    let jelenlegi_fiok = document.querySelectorAll('input[name="jelenlegi"]');
    jelenlegi_fiok.forEach(fiok => {
        if( (<HTMLInputElement> fiok).checked ) {
            jelenlegi_fiok_kivalasztott = fiok.getAttribute('id');
        }
    });

    fiok_idk = fiok_idk.slice(0, -1);
    fiok_nevek = fiok_nevek.slice(0, -1);

    if( fiok_idk == '' ) {
        alert('Nem jelöltél ki egyetlen fiókot sem!');
        return;
    }

    post_data.append('fiok_idk', fiok_idk);
    post_data.append('fiok_nevek', fiok_nevek);
    post_data.append('jelenlegi_fiok_kivalasztott', jelenlegi_fiok_kivalasztott);

    szinkron_keres("/teamspeak/fiok_varazslo/fiok_varazslo.🦀?igenyles", post_data, (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            obj('varazslo').style.display = 'none';
            obj('sikeres_igenyles').style.display = 'block';
        }
    });
}

function funkciok_ellenorzese() {
    if('serviceWorker' in navigator) {
        obj("serviceworker_support").innerHTML = '🟢';
    } else {
        obj("serviceworker_support").innerHTML = '🔴';
    }

    if('Notification' in window) {
        obj("notification_support").innerHTML = '🟢';
    } else {
        obj("notification_support").innerHTML = '🔴';
    }

    Notification.requestPermission().then((permission) => {
        if(permission != 'granted') {
            uj_valasz_mutatasa(5000, "hiba", "Az értesítések engedélyezése sikertelen");
            obj("notification_sending_support").innerHTML = '🔴';
        } else {
            obj("notification_sending_support").innerHTML = '🟢';
        }
    });
}

async function serviceworker_bejegyzese() {
    uj_valasz_mutatasa(3000, "", "Serviceworker telepítése folyamatban...");
    const registration = await navigator.serviceWorker.register('/serviceworker.js');
    console.log({registration});
    uj_valasz_mutatasa(3000, "ok", "Serviceworker telepítése sikeres");
}

function push_subscription_adat_torlese(push_subscription_adat: PushSubscription | null) {
    if(push_subscription_adat == null) {
        throw new Error('push_subscription_adat null!');
    }
    let form_adatok = new FormData();
    form_adatok.append("push_subscription_adat", (JSON.stringify(push_subscription_adat)));
    return fetch('/beallitasok/beallitasok.🦀?push_ertesites_adatok_torlese', {
        method: "POST",
        body: form_adatok,
    });
}

function serviceworkerek_torlese() {
    try {
        navigator.serviceWorker.getRegistrations().then((telepitett_workerek) => {
            if(telepitett_workerek.length <= 0) {
                uj_valasz_mutatasa(5000, "hiba", "Nincsen telepített Serviceworker");
                return;
            }
            for (let i = 0; i < telepitett_workerek.length; i++) {
                const worker = telepitett_workerek[i];

                worker.pushManager.getSubscription().then((push_subscription_adat) => {
                    push_subscription_adat_torlese(push_subscription_adat).then(() => {
                        worker.unregister();
                        console.log(i + ". serviceworker adatbzásiból és böngészőből történő törlése sikeres")
                    }).catch(() => {
                        console.error("Hiba a " + i + ". serviceworker adatbzásiból történő törlésekor")
                    });
                })
                .catch(() => {
                    worker.unregister();
                    console.log(i + ". serviceworker csak böngészőből történő törlése sikeres")
                });
            }
            uj_valasz_mutatasa(3000, "ok", "Serviceworkerek törlése sikeres!");
        });
    }
    catch (err) {
        uj_valasz_mutatasa(5000, "hiba", "Hiba a Serviceworkerek törlése közben: " + {err});
    }
}

var vanKisbetu = false;
var vanNagybetu = false;
var vanSzam = false;
var vanKulonlegesKarakter = false;
var ujJelszavakEgyeznek = false;
var jelszoErossegFrissitesIdozito;

topbar_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult );