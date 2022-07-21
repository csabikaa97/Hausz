function belepteto_rendszer_frissult() {
    if( session_loggedin == 'yes' ) {
        obj('token_felhasznalas').style.display = 'block';
        obj('nincs_belepve_leiras').style.display = 'none';
        obj('online_felhasznalok').style.display = 'block';
        obj('szerver_statusz').style.display = 'block';
        obj('csatlakozas_gomb').onclick = () => {
            location.href = 'ts3server://hausz.stream/?port=9987&nickname=' + session_username;
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
            location.href = 'ts3server://hausz.stream/?port=9987&nickname=ismeretlen felhasználó';
        }
    }
}

function uj_token_igenylese() {
    szinkron_keres("/teamspeak/teamspeak.php?uj_token_igenylese", "", (uzenet) => {
        if( /^OK:/.test(uzenet) ) {
            token_informaciok_frissitese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet);
        }
    });
}

function felhasznalok_frissitese() {
    szinkron_keres("/teamspeak/teamspeak.php?felhasznalok", "", (uzenet) => {
        if( /^OK:Nincs online felhaszn/.test(uzenet) ) {
            obj('nincs_online_felhasznalo').style.display = 'block';
            obj('van_online_felhasznalo').style.display = 'none';
            return;
        }
        if( /^OK:/.test(uzenet) ) {
            let online_felhasznalok_lista = obj('online_felhasznalok_lista');
            online_felhasznalok_lista.innerHTML = '';
            uzenet = uzenet.replace( /^OK:/, '' );
            let felhasznalok = uzenet.split('\\n');
            felhasznalok.forEach(felhasznalo => {
                if( felhasznalo.length > 0 ) {
                    online_felhasznalok_lista.innerHTML += `<li>${felhasznalo}</li>`;
                }
            });
        }
    });
}

function token_informaciok_frissitese() {
    szinkron_keres("/teamspeak/teamspeak.php?token_informacio", "", (uzenet) => {
        if( /^OK:/.test(uzenet) ) {
            obj('van_token').style.display = 'block';
            obj('nincs_token').style.display = 'none';
            uzenet = uzenet.replace(/^OK:/, '');
            let adatok = uzenet.split('|');

            let token, jogosult_uj_rokenre;
            [token, jogosult_uj_rokenre] = adatok;

            obj('token').innerHTML = token;

            if( jogosult_uj_rokenre == "igen" ) {
                obj('jogosult_tokenre_szoveg').style.display = 'block';
            } else {
                obj('jogosult_tokenre_szoveg').style.display = 'none';
            }
            return;
        }
        if( /^HIBA:Nincs/.test(uzenet) ) {
            obj('van_token').style.display = 'none';
            obj('nincs_token').style.display = 'block';
        }
    });
}

function szerver_statusz_frissitese() {
    szinkron_keres("/teamspeak/teamspeak.php?szerver_statusz", "", (uzenet) => {
        uzenet = uzenet.replace( /^OK:/, '' );
        let adatok = uzenet.split(';');

        let buffer = "";

        let folyamat_ok = adatok[0] == 'folyamat ok' ? true : false;
        let telnet_ok = adatok[1] == 'telnet ok' ? true : false;
        let processzor_1perc = parseFloat(adatok[2]);
        let processzor_5perc = parseFloat(adatok[3]);
        let processzor_15perc = parseFloat(adatok[4]);
        let memoria_hasznalat = parseFloat(adatok[5]);
        let swap_hasznalat = parseFloat(adatok[6]);
        let lemez_hasznalat = parseFloat(adatok[7]) / 100.0;

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

        if( folyamat_ok 
            && telnet_ok 
            && processzor_1perc < processzor_hasznalat_figyelmeztetes 
            && processzor_5perc < processzor_hasznalat_figyelmeztetes
            && processzor_15perc < processzor_hasznalat_figyelmeztetes
            && memoria_hasznalat < memoria_hasznalat_elfogadhato
            && swap_hasznalat < swap_hasznalat_elfogadhato
            && lemez_hasznalat < lemez_hasznalat_elfogadhato ) {

            buffer += '<p>A szerver állapota jelenleg kifogástalan 🥳</p>';
        } else {
            if( folyamat_ok ) { buffer += '<p>🟩 TeamSpeak szerver folyamat fut</p>'; }
            else { buffer += '<p>🟥 TeamSpeak szerver folyamat nem fut</p>'; }

            if( !telnet_ok ) { buffer += '<p>🟥 Serverquery nem elérhető</p>'; } 
            else { buffer += '<p>🟩 Serverquery elérhető</p>'; }

            if( processzor_15perc >= processzor_hasznalat_figyelmeztetes ) {
                if( processzor_1perc >= processzor_hasznalat_figyelmeztetes ) {
                    buffer += '<p>🟥 Processzor terhelés - magas körülbelül 15 perce</p>';
                } else {
                    if( processzor_5perc < processzor_hasznalat_figyelmeztetes ) {
                        buffer += '<p>🟨 Processzor terhelés - magas volt körülbelül 15 perce, de már lecsökkent</p>';
                    } else {
                        buffer += '<p>🟧 Processzor terhelés - magas volt körülbelül 5 perce, de már kezd lecsökkenni</p>';
                    }
                }
            } else {
                if( processzor_5perc >= processzor_hasznalat_figyelmeztetes ) {
                    if( processzor_1perc >= processzor_hasznalat_figyelmeztetes ) {
                        buffer += '<p>🟧 Processzor terhelés - magas körülbelül 5 perce</p>';
                    } else {
                        buffer += '<p>🟨 Processzor terhelés - magas volt körülbelül 5 perce, de most alacsony</p>';
                    }
                } else {
                    if( processzor_1perc >= processzor_hasznalat_figyelmeztetes ) {
                        buffer += '<p>🟨 Processzor terhelés - elfogadható</p>';
                    } else {
                        buffer += '<p>🟩 Processzor terhelés - optimális</p>';
                    }
                }
            }

            if(memoria_hasznalat >= memoria_hasznalat_kritikus) {
                buffer += '<p>🟥 Memória használat - nagyon magas</p>';
            } else {
                if(memoria_hasznalat >= memoria_hasznalat_figyelmezetetes) {
                    buffer += '<p>🟧 Memória használat - magas</p>';
                } else {
                    if(memoria_hasznalat >= memoria_hasznalat_elfogadhato) {
                        buffer += '<p>🟨 Memória használat - elfogadható</p>';
                    } else {
                        buffer += '<p>🟩 Memória használat - optimális</p>';
                    }
                }
            }

            if(swap_hasznalat >= swap_hasznalat_elfogadhato) {
                buffer += '<p>🟥 Virtuális memória használat - nagyon magas</p>';
            } else {
                if(swap_hasznalat >= swap_hasznalat_figyelmezetetes) {
                    buffer += '<p>🟧 Virtuális memória használat - magas</p>';
                } else {
                    if(swap_hasznalat >= swap_hasznalat_elfogadhato) {
                        buffer += '<p>🟨 Virtuális memória használat - elfogadható</p>';
                    } else {
                        buffer += '<p>🟩 Virtuális memória használat - optimális</p>';
                    }
                }
            }

            if(lemez_hasznalat >= lemez_hasznalat_kritikus) {
                buffer += '<p>🟥 Lemezterület kihasználtság - nagyon magas</p>';
            } else {
                if(lemez_hasznalat >= lemez_hasznalat_figyelmeztetes) {
                    buffer += '<p>🟧 Lemezterület kihasználtság - magas</p>';
                } else {
                    if(lemez_hasznalat >= lemez_hasznalat_elfogadhato) {
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