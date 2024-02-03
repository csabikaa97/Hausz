/// <reference path="../komponensek/alap_fuggvenyek.ts" />
/// <reference path="../komponensek/belepteto_rendszer.ts" />
/// <reference path="../komponensek/topbar.ts" />

function futtatas() {
    szinkron_keres(`/admin/admin.🦀?parancs=${obj("parancs").value}`, "", (uzenet) => {
        obj("parancssor").innerHTML += uzenet.valasz;
        obj("parancs").value = "";
    });
}

function futtatas_enter(event: KeyboardEvent) {
    if (event.key === 'Enter') {   futtatas(); }
}

function admin_statusz_csere(nev, id) {
    if( confirm(`Biztosan meg szeretnéd változtatni "${nev}" admin státuszát?`) ) {
        szinkron_keres("/admin/admin.🦀?admin_csere&id=" + id, "", (uzenet) => {
            if( uzenet.eredmeny == 'ok' ) {
                fiokok_betoltese();
                log_betoltese();
                uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    }
}

function elutasitas(nev, id) {
    if( confirm(`Biztosan elutasítod "${nev}" regisztrációs kérelmét?`) ) {
        szinkron_keres(`/admin/admin.🦀?elutasitas&id=${id}`, "", (uzenet) => {
            if( uzenet.eredmeny == 'ok' ) {
                aktivalando_fiokok_betoltese();
                log_betoltese(); 
                uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    }
}

function aktivalas(nev, id) {
    if( confirm(`Biztosan elfogadod "${nev}" regisztrációs kérelmét?`) ) {
        szinkron_keres(`/admin/admin.🦀?aktivalas&id=${id}`, "", (uzenet) => {
            if( uzenet.eredmeny == 'ok' ) {
                aktivalando_fiokok_betoltese();
                fiokok_betoltese();
                log_betoltese();
                uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    }
}

function torles(nev, id) {
    if( confirm(`Biztosan szeretnéd törölni a "${nev}" nevű fiókot?`) ) {
        szinkron_keres("/admin/admin.🦀?torles&user_id=" + id, "", (uzenet) => {
            if( uzenet.eredmeny == 'ok' ) {
                fiokok_betoltese();
                log_betoltese();
                uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    }
}

function aktivalando_fiokok_betoltese() {
    let buffer = '<h3>Aktiválandó fiókok</h3><table class="szint-1 tablazat"><tbody><tr><th class="cella">request_id</th><th class="cella">username</th><th class="cella">email</th><th class="cella"></th><th class="cella"></th></tr>';
    szinkron_keres("/admin/admin.🦀?aktivalando_fiokok", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uzenet.valasz.forEach(fiok => {
                buffer += '<tr>';
                buffer += `<td class="cella">${fiok.request_id}</td>`;
                buffer += `<td class="cella">${fiok.username}</td>`;
                buffer += `<td class="cella">${fiok.megjeleno_nev}</td>`;
                buffer += `<td class="cella">${fiok.email}</td>`;
                buffer += `<td class="cella"><div class="szint-2 gomb kerekites-15" onclick="elutasitas(&quot;${fiok.username}&quot;, ${fiok.request_id})">Elutasítás</div></td>`;
                buffer += `<td class="cella"><div class="szint-2 gomb kerekites-15" onclick="aktivalas(&quot;${fiok.username}&quot;, ${fiok.request_id})">Aktiválás</div></td>`;
                buffer += `</tr>`;
            });
        } else {
            if( /Nincs aktiválandó fiók/ig.test(uzenet.valasz) ) {
                buffer += '<tr><td class="cella kozepre-szoveg" colspan="3">Jelenleg nincs aktiválandó fiók</td><td class="cella"></td><td class="cella"></td></tr>';
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        }

        obj('aktivalando_fiokok').innerHTML = `${buffer}</tbody></table>`;
    });
}

function fiokok_betoltese() {
    let buffer = '<h3>Aktív fiókok</h3><table class="szint-1 tablazat"><tbody><tr><th class="cella">id</th><th class="cella">username</th><th class="cella">megjeleno_nev</th><th class="cella">email</th><th class="cella">Admin</th><th class="cella"></th><th class="cella"></th></tr>';
    szinkron_keres("/admin/admin.🦀?fiokok", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uzenet.valasz.forEach(fiok => {
                buffer += '<tr>';
                buffer += `<td class="cella">${fiok.id}</td>`;
                buffer += `<td class="cella">${fiok.username}</td>`;
                buffer += `<td class="cella">${fiok.megjeleno_nev}</td>`;
                buffer += `<td class="cella">${fiok.email}</td>`;
                buffer += `<td class="cella">${fiok.admin}</td>`;
                buffer += `<td class='cella'><div class='szint-2 gomb kerekites-15' onclick='admin_statusz_csere("${fiok.username}", "${fiok.id}")'>Admin státusz csere</div></td>`;
                buffer += `<td class='cella'><div class='szint-2 gomb kerekites-15' onclick='torles("${fiok.username}", "${fiok.id}")'>Törlés</div></td>`;
                buffer += `</tr>`;
            });
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }

        obj('fiokok').innerHTML = `${buffer}</tbody></table>`;
    });
}

function log_betoltese() {
    let buffer = '<h3>Log</h3><table class="szint-1 tablazat"><tbody><tr><th class="cella">id</th><th class="cella">szolgaltatas</th><th class="cella">bejegyzes</th><th class="cella">komment</th><th class="cella">felhasznalo</th><th class="cella">datum</th></tr>';
    szinkron_keres("/admin/admin.🦀?log", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uzenet.valasz.forEach(sor => {
                buffer += '<tr>';
                buffer += `<td class="cella">${sor.id}</td>`;
                buffer += `<td class="cella">${sor.szolgaltatas}</td>`;
                buffer += `<td class="cella">${sor.bejegyzes}</td>`;
                buffer += `<td class="cella">${sor.komment}</td>`;
                buffer += `<td class="cella">${sor.felhasznalo}</td>`;
                buffer += `<td class="cella">${sor.datum}</td>`;
                buffer += '</tr>';
            });
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }

        obj('log').innerHTML = `${buffer}</tbody></table>`;
    });
}

function teamspeak_jogosultsag_igenylesek_betoltese() {
    let buffer = '<h3>Teamspeak jogosultság igénylések</h3><table class="szint-1 tablazat"><tbody><tr><th class="cella">id</th><th class="cella">felhasználó</th><th class="cella">igenyelt fiókok</th><th class="cella">igenyelt fiók idk</th><th class="cella">igenyelt időpont</th><th class="cella"></th><th class="cella"></th></tr>';
    szinkron_keres("/admin/admin.🦀?teamspeak_jogosultsag_igenylesek", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            if( uzenet.igenylesek_szama == 0 ) {
                buffer += '<tr><td class="cella" colspan="7">Nincs igénylés</td></tr>';
            } else {
                uzenet.valasz.forEach(sor => {
                    buffer += '<tr>';
                    buffer += `<td class="cella">${sor.id}</td>`;
                    buffer += `<td class="cella">${sor.username}</td>`;
                    buffer += `<td class="cella">${sor.igenyelt_fiokok}</td>`;
                    buffer += `<td class="cella">${sor.igenyelt_fiok_idk}</td>`;
                    buffer += `<td class="cella">${sor.igenyles_datuma}</td>`;
                    buffer += `<td class='cella'><div class='szint-2 gomb kerekites-15' onclick='teamspeak_jogosultsag_jovahagyas("${sor.id}")'>Jóváhagyás</div></td>`;
                    buffer += `<td class='cella'><div class='szint-2 gomb kerekites-15' onclick='teamspeak_jogosultsag_elutasitas("${sor.id}")'>Elutasítás</div></td>`;
                    buffer += '</tr>';
                });
            }
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }

        obj('teamspeak_jogosultsag_igenylesek').innerHTML = `${buffer}</tbody></table>`;
    });
}

function teamspeak_jogosultsag_jovahagyas(id) {
    szinkron_keres("/admin/admin.🦀?teamspeak_jogosultsag_jovahagyas&id="+id, "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uj_valasz_mutatasa(5000, "siker", uzenet.valasz);
            teamspeak_jogosultsag_igenylesek_betoltese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function teamspeak_jogosultsag_elutasitas(id) {
    szinkron_keres("/admin/admin.🦀?teamspeak_jogosultsag_elutasitas&id="+id, "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uj_valasz_mutatasa(5000, "siker", uzenet.valasz);
            teamspeak_jogosultsag_igenylesek_betoltese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function belepteto_rendszer_frissult() {
    if(session_admin == "igen") {
        obj('aktivalando_fiokok').style.display = 'block';
        obj('fiokok').style.display = 'block';
        obj('log').style.display = 'block';
        obj('shell').style.display = 'block';
        obj('hibauzenet').style.display = 'none';
        obj('teamspeak_jogosultsag_igenylesek').style.display = 'block';
        aktivalando_fiokok_betoltese();
        fiokok_betoltese();
        log_betoltese();
        teamspeak_jogosultsag_igenylesek_betoltese();
    } else {
        obj('aktivalando_fiokok').style.display = 'none';
        obj('fiokok').style.display = 'none';
        obj('log').style.display = 'none';
        obj('shell').style.display = 'none';
        obj('hibauzenet').style.display = 'block';
        obj('teamspeak_jogosultsag_igenylesek').style.display = 'none';
    }
}

topbar_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult );