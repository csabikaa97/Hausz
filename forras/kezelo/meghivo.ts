/// <reference path="../komponensek/alap_fuggvenyek.ts" />
/// <reference path="../komponensek/belepteto_rendszer.ts" />
/// <reference path="../komponensek/topbar.ts" />

function belepteto_rendszer_frissult() {
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
        szinkron_keres("/kezelo/meghivo.php?meghivo_adatok", "", (uzenet) => {
            let meghivo_adatok = document.getElementById("meghivo_adatok");
            if( uzenet.eredmeny == 'ok' ) {
                let meghivo = uzenet.meghivok[0];
                let buffer = `
                    <p>Jelenleg használható meghívód:   ${meghivo}</p>`;
                meghivo_adatok.innerHTML = buffer;
            } else {
                meghivo_adatok.innerHTML = `<p>Jelenleg nincs meghívód</p>
                <button class="gomb no-border szint-2 kerekites-15" onclick="uj_meghivo()">Új meghívó generálása</button>`;
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

function uj_meghivo() {
    szinkron_keres("/kezelo/meghivo.php?uj_meghivo", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            location.reload();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}
topbar_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult );
