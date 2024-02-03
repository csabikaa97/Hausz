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

    jatekosnev_valtoztatas_doboz_frissitese();
    jatekos_lista_frissitese();
}

function jatekosnev_valtoztatas_doboz_frissitese() {
    szinkron_keres("/minecraft/minecraft.🦀?felhasznalonev_info", "", (uzenet) => {
        let felhasznalonev_doboz = document.getElementById("felhasznalonev_doboz");
        let buffer = `<p>A szerverhez történő csatlakozáshoz az ezen oldalon megadott játékosnévnek, és a játékban használt felhasználónévnek egyeznie kell.`;
        buffer += ` Ha nincsen eredeti Mojang vagy Microsoft fiókod, akkor ez a név tetszőleges, akármi lehet.`
        buffer += ` Eredeti fiók (Mojang / Microsoft) használata esetén be kell állítanod az eredeti játékosneved ezen az oldalon.`;
        if( uzenet.eredmeny == 'ok' ) {
            buffer += `
                <p>A jelenlegi játékosneved: <font style="font-weight: bold; font-size: 23px">${uzenet.minecraft_username}</font></p>
                <br>
                Új játékosnév: <input type="text" id="uj_felhasznalonev" placeholder="${uzenet.minecraft_username}" name="uj_felhasznalonev" />
                <br><br>
                <button class="gomb no-border szint-2 kerekites-15" onclick="felhasznalonev_valtoztatas()">Játékosnév megváltoztatása</button>`;
            felhasznalonev_doboz.innerHTML = buffer;
        } else {
            buffer += `
                <p>Jelenleg nincs beállítva Minecraft felhasználóneved, ezért nem fogsz tudni csatlakozni a szerverhez.<br>Adj meg alul egy felhasználónevet, és azt használd a Launcherben névként.</p>
                <br>
                Játékosnév: <input type="text" id="uj_felhasznalonev" placeholder="(üres)" name="uj_felhasznalonev" />
                <br><br>
                <button class="gomb no-border szint-2 kerekites-15" onclick="felhasznalonev_valtoztatas()">Játékosnév megváltoztatása</button>`;
            felhasznalonev_doboz.innerHTML = buffer;
        }
    });
}

function toggle_visibility(event, id) {
    event.preventDefault();

    let elem = document.getElementById(id);
    let displaySetting = elem.classList.contains("nodisplay");
    if( displaySetting ) {
        elem.classList.remove("nodisplay");
    } else {
        elem.classList.add("nodisplay");
    }
}

function jatekos_lista_frissitese() {
    szinkron_keres("/minecraft/minecraft.🦀?jatekos_lista", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            let buffer = `<table><tr><th>Játékos</th><th></th><th>Utolsó belépés</th></tr>`;
            let jatekosok = uzenet.jatekosok;
            for(let i=0; i<jatekosok.length; i++) {
                let jatekos = jatekosok[i];
                buffer += `<tr><td>${jatekos.minecraft_username}</td><td>`
                let epoch_text = epoch_to_text(jatekos.minecraft_lastlogin);
                if(jatekos.minecraft_isLogged == 1) {
                    buffer += `&#x1F7E2; Online `;
                }
                buffer += `</td><td>`;
                buffer += `${epoch_text}`;
                buffer += `</td></tr>`;
            }
            buffer += `</table>`;

            let jatekos_lista = document.getElementById("jatekos-lista");
            jatekos_lista.innerHTML = buffer;
        }
    });
}

function epoch_to_text(epoch) {
    let now = Math.floor(Date.now());
    let diff = now - epoch;

    if(diff < 1000) {
        return "Most";
    }
    diff = Math.floor(diff / 1000);

    if( diff < 60 ) {
        return `${diff} másodperce`;
    }
    diff = Math.floor(diff / 60);
    if( diff < 60 ) {
        return `${diff} perce`;
    }
    diff = Math.floor(diff / 60);
    if( diff < 24 ) {
        return `${diff} órája`;
    }
    diff = Math.floor(diff / 24);
    if( diff < 7 ) {
        return `${diff} napja`;
    }
    diff = Math.floor(diff / 7);
    if( diff < 4 ) {
        return `${diff} hete`;
    }
    diff = Math.floor(diff / 4);
    if( diff < 12 ) {
        return `${diff} hónapja`;
    }
    diff = Math.floor(diff / 12);
    return `${diff} éve`;
}

function felhasznalonev_valtoztatas() {
    let uj_felhasznalonev = (<HTMLInputElement>document.getElementById("uj_felhasznalonev")).value;

    if( uj_felhasznalonev.length <= 0 ) {
        uj_valasz_mutatasa(5000, "hiba", "Nem adtál meg felhasználónevet!");
        return;
    }

    let post_parameterek = new FormData();
    post_parameterek.append('uj_felhasznalonev', uj_felhasznalonev);
    szinkron_keres("/minecraft/minecraft.🦀?felhasznalonev_valtoztatas", post_parameterek, (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            belepteto_rendszer_frissult();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}
topbar_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult );
