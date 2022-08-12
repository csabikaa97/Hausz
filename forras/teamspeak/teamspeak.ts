/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// <reference path="/var/www/forras/komponensek/belepteto_rendszer.ts" />
/// <reference path="/var/www/forras/komponensek/topbar.ts" />

function belepteto_rendszer_frissult() {
    if( session_loggedin == 'yes' ) {
        obj('token_felhasznalas').style.display = 'block';
        obj('nincs_belepve_leiras').style.display = 'none';
        obj('online_felhasznalok').style.display = 'block';
        obj('szerver_statusz').style.display = 'block';
        obj('csatlakozas_gomb').onclick = () => {
            location.href = `ts3server://${domain}/?port=9987&nickname=${session_username}`;
        }
        felhasznalok_frissitese();
        token_informaciok_frissitese();
        szerver_statusz_frissitese();
    } else {
        obj('token_felhasznalas').style.display = 'none';
        obj('nincs_belepve_leiras').style.display = 'block';
        obj('online_felhasznalok').style.display = 'none';
        obj('szerver_statusz').style.display = 'none';
        obj('csatlakozas_gomb').onclick = () => {
            location.href = `ts3server://${domain}/?port=9987&nickname=ismeretlen felhasználó`;
        }
    }
}

function uj_token_igenylese() { //
    szinkron_keres("/teamspeak/teamspeak.php?uj_token_igenylese", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            token_informaciok_frissitese();
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function felhasznalok_frissitese() {
    szinkron_keres("/teamspeak/teamspeak.php?felhasznalok", "", (uzenet) => {
        console.log(uzenet);
        if( uzenet.eredmeny == 'ok' ) {
            if( uzenet.felhasznalok == 0 ) {
                obj('nincs_online_felhasznalo').style.display = 'block';
                obj('van_online_felhasznalo').style.display = 'none';
                return;
            }

            let online_felhasznalok_lista = obj('online_felhasznalok_lista');
            online_felhasznalok_lista.innerHTML = '';
            uzenet.felhasznalok.forEach(felhasznalo => {
                if( felhasznalo.felhasznalonev.length > 0 ) {
                    online_felhasznalok_lista.innerHTML += `<li>${felhasznalo.felhasznalonev}</li>`;
                }
            });
        }
    });
}

function token_informaciok_frissitese() {
    szinkron_keres("/teamspeak/teamspeak.php?token_informacio", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            obj('van_token').style.display = 'block';
            obj('nincs_token').style.display = 'none';

            obj('token').innerHTML = uzenet.token;

            if( uzenet.jogosult_uj_rokenre == "igen" ) {
                obj('jogosult_tokenre_szoveg').style.display = 'block';
            } else {
                obj('jogosult_tokenre_szoveg').style.display = 'none';
            }
        } else {
            if( uzenet.valasz == 'Jelenleg nincs jogosultásgi tokened' ) {
                obj('van_token').style.display = 'none';
                obj('nincs_token').style.display = 'block';
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        }
    });
}

function szerver_statusz_frissitese() {
    szinkron_keres("/teamspeak/teamspeak.php?szerver_statusz", "", (uzenet) => {
        if(uzenet.eredmeny != 'ok') {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            return;
        }

        let buffer = "";

        const processzor_hasznalat_figyelmeztetes = 0.75;
        const memoria_hasznalat_elfogadhato = 0.7;
        const memoria_hasznalat_figyelmezetetes = 0.8;
        const memoria_hasznalat_kritikus = 0.9;
        const swap_hasznalat_elfogadhato = 0.65;
        const swap_hasznalat_figyelmezetetes = 0.75;
        const swap_hasznalat_kritikus = 0.85;
        const lemez_hasznalat_elfogadhato = 0.65;
        const lemez_hasznalat_figyelmeztetes = 0.75;
        const lemez_hasznalat_kritikus = 0.75;

        if( uzenet.folyamat_ok
            && uzenet.telnet_ok
            && uzenet.processzor_1perc < processzor_hasznalat_figyelmeztetes
            && uzenet.processzor_5perc < processzor_hasznalat_figyelmeztetes
            && uzenet.processzor_15perc < processzor_hasznalat_figyelmeztetes
            && uzenet.memoria_hasznalat < memoria_hasznalat_elfogadhato
            && uzenet.swap_hasznalat < swap_hasznalat_elfogadhato
            && uzenet.lemez_hasznalat < lemez_hasznalat_elfogadhato ) {

            buffer += '<p>A szerver állapota jelenleg kifogástalan 🥳</p>';
        } else {
            if( uzenet.folyamat_ok ) { buffer += '<p>🟩 TeamSpeak szerver folyamat fut</p>'; }
            else { buffer += '<p>🟥 TeamSpeak szerver folyamat nem fut</p>'; }

            if( !uzenet.telnet_ok ) { buffer += '<p>🟥 Serverquery nem elérhető</p>'; } 
            else { buffer += '<p>🟩 Serverquery elérhető</p>'; }

            if( uzenet.processzor_15perc >= processzor_hasznalat_figyelmeztetes ) {
                if( uzenet.processzor_1perc >= processzor_hasznalat_figyelmeztetes ) {
                    buffer += '<p>🟥 Processzor terhelés - magas körülbelül 15 perce</p>';
                } else {
                    if( uzenet.processzor_5perc < processzor_hasznalat_figyelmeztetes ) {
                        buffer += '<p>🟨 Processzor terhelés - magas volt körülbelül 15 perce, de már lecsökkent</p>';
                    } else {
                        buffer += '<p>🟧 Processzor terhelés - magas volt körülbelül 5 perce, de már kezd lecsökkenni</p>';
                    }
                }
            } else {
                if( uzenet.processzor_5perc >= processzor_hasznalat_figyelmeztetes ) {
                    if( uzenet.processzor_1perc >= processzor_hasznalat_figyelmeztetes ) {
                        buffer += '<p>🟧 Processzor terhelés - magas körülbelül 5 perce</p>';
                    } else {
                        buffer += '<p>🟨 Processzor terhelés - magas volt körülbelül 5 perce, de most alacsony</p>';
                    }
                } else {
                    if( uzenet.processzor_1perc >= processzor_hasznalat_figyelmeztetes ) {
                        buffer += '<p>🟨 Processzor terhelés - elfogadható</p>';
                    } else {
                        buffer += '<p>🟩 Processzor terhelés - optimális</p>';
                    }
                }
            }

            if( uzenet.memoria_hasznalat >= memoria_hasznalat_kritikus) {
                buffer += '<p>🟥 Memória használat - nagyon magas</p>';
            } else {
                if( uzenet.memoria_hasznalat >= memoria_hasznalat_figyelmezetetes) {
                    buffer += '<p>🟧 Memória használat - magas</p>';
                } else {
                    if( uzenet.memoria_hasznalat >= memoria_hasznalat_elfogadhato) {
                        buffer += '<p>🟨 Memória használat - elfogadható</p>';
                    } else {
                        buffer += '<p>🟩 Memória használat - optimális</p>';
                    }
                }
            }

            if( uzenet.swap_hasznalat >= swap_hasznalat_elfogadhato) {
                buffer += '<p>🟥 Virtuális memória használat - nagyon magas</p>';
            } else {
                if( uzenet.swap_hasznalat >= swap_hasznalat_figyelmezetetes) {
                    buffer += '<p>🟧 Virtuális memória használat - magas</p>';
                } else {
                    if( uzenet.swap_hasznalat >= swap_hasznalat_elfogadhato) {
                        buffer += '<p>🟨 Virtuális memória használat - elfogadható</p>';
                    } else {
                        buffer += '<p>🟩 Virtuális memória használat - optimális</p>';
                    }
                }
            }

            if( uzenet.lemez_hasznalat >= lemez_hasznalat_kritikus) {
                buffer += '<p>🟥 Lemezterület kihasználtság - nagyon magas</p>';
            } else {
                if( uzenet.lemez_hasznalat >= lemez_hasznalat_figyelmeztetes) {
                    buffer += '<p>🟧 Lemezterület kihasználtság - magas</p>';
                } else {
                    if( uzenet.lemez_hasznalat >= lemez_hasznalat_elfogadhato) {
                        buffer += '<p>🟨 Lemezterület kihasználtság - elfogadható</p>';
                    } else {
                        buffer += '<p>🟩 Lemezterület kihasználtság - optimális</p>';
                    }
                }
            }
        }

        obj('szerver_statusz_szoveg').innerHTML = buffer;
    });
}

topbar_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult );