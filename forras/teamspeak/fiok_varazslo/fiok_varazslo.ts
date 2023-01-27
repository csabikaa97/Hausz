/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// <reference path="/var/www/forras/komponensek/belepteto_rendszer.ts" />
/// <reference path="/var/www/forras/komponensek/topbar.ts" />

function belepteto_rendszer_frissult() {
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
    szinkron_keres("/teamspeak/fiok_varazslo/fiok_varazslo.php?fiok_lista_lekerese", "", (uzenet) => {
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
        if( szoveg_tartalmazas(fiok.getAttribute('value'), filter) || filter == '' ) {
            fiok.parentElement.parentElement.setAttribute('style', 'display: table-row');
        } else {
            fiok.parentElement.parentElement.setAttribute('style', 'display: none');
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
            if( fiok_idk.indexOf(fiok.getAttribute('id')) == -1 ) {
                fiok_idk += fiok.getAttribute('id') + ',';
                fiok_nevek += fiok.getAttribute('value') + ',';
            }
        }
    });

    let jelenlegi_fiok_kivalasztott = '';
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

    szinkron_keres("/teamspeak/fiok_varazslo/fiok_varazslo.php?igenyles", post_data, (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            obj('varazslo').style.display = 'none';
            obj('sikeres_igenyles').style.display = 'block';
        }
    });

}

topbar_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult );