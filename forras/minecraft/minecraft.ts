/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// <reference path="/var/www/forras/komponensek/belepteto_rendszer.ts" />
/// <reference path="/var/www/forras/komponensek/topbar.ts" />

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
        
        szinkron_keres("/minecraft/minecraft.php?felhasznalonev_info", "", (uzenet) => {
            let felhasznalonev_doboz = document.getElementById("felhasznalonev_doboz");
            if( uzenet.eredmeny == 'ok' ) {
                let buffer = `
                    <p>Jelenlegi Minecraft felhasználóneved: ${uzenet.minecraft_username}</p>
                    <br>
                    Új Játékosnév: <input type="text" id="uj_felhasznalonev" placeholder="${uzenet.minecraft_username}" name="uj_felhasznalonev" />
                    <br><br>
                    <button class="gomb no-border szint-2 kerekites-15" onclick="felhasznalonev_valtoztatas()">Játékosnév megváltoztatása</button>`;
                felhasznalonev_doboz.innerHTML = buffer;
            } else {
                let buffer = `
                    <p>Jelenlegi nincs beállítva Minecraft felhasználóneved, ezért nem fogsz tudni csatlakozni a szerverhez.<br>Adj meg alul egy felhasználónevet, és azt használd a Launcherben névként.</p>
                    <br>
                    Játékosnév: <input type="text" id="uj_felhasznalonev" placeholder="(üres)" name="uj_felhasznalonev" />
                    <br><br>
                    <button class="gomb no-border szint-2 kerekites-15" onclick="felhasznalonev_valtoztatas()">Játékosnév megváltoztatása</button>`;
                felhasznalonev_doboz.innerHTML = buffer;
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

function felhasznalonev_valtoztatas() {
    let uj_felhasznalonev = (<HTMLInputElement>document.getElementById("uj_felhasznalonev")).value;

    if( uj_felhasznalonev.length <= 0 ) {
        uj_valasz_mutatasa(5000, "hiba", "Nem adtál meg felhasználónevet!");
        return;
    }

    let post_parameterek = new FormData();
    post_parameterek.append('uj_felhasznalonev', uj_felhasznalonev);
    szinkron_keres("/minecraft/minecraft.php?felhasznalonev_valtoztatas", post_parameterek, (uzenet) => {
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
