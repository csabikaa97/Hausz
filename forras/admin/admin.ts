function futtatas() {
    szinkron_keres(`/admin/admin.php?parancs=${obj("parancs").value}`, "", (uzenet) => {
        obj("parancssor").innerHTML += uzenet.valasz;
        obj("parancs").value = "";
    });
}

function futtatas_enter() {
    if (event.key === 'Enter') {   futtatas(); }
}

function admin_statusz_csere(nev, id) {
    if( confirm(`Biztosan meg szeretnéd változtatni "${nev}" admin státuszát?`) ) {
        szinkron_keres("/admin/admin.php?admin_csere&id=" + id, "", (uzenet) => {
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
        szinkron_keres(`/admin/admin.php?elutasitas&id=${id}`, "", (uzenet) => {
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
        szinkron_keres(`/admin/admin.php?aktivalas&id=${id}`, "", (uzenet) => {
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
        szinkron_keres("/admin/admin.php?torles&user_id=" + id, "", (uzenet) => {
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
    szinkron_keres("/admin/admin.php?aktivalando_fiokok", "", (uzenet) => {
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
    szinkron_keres("/admin/admin.php?fiokok", "", (uzenet) => {
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
    szinkron_keres("/admin/admin.php?log", "", (uzenet) => {
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

function belepteto_rendszer_frissult() {
    if(session_admin == "igen") {
        obj('aktivalando_fiokok').style.display = 'block';
        obj('fiokok').style.display = 'block';
        obj('log').style.display = 'block';
        obj('shell').style.display = 'block';
        obj('hibauzenet').style.display = 'none';
        aktivalando_fiokok_betoltese();
        fiokok_betoltese();
        log_betoltese();
    } else {
        obj('aktivalando_fiokok').style.display = 'none';
        obj('fiokok').style.display = 'none';
        obj('log').style.display = 'none';
        obj('shell').style.display = 'none';
        obj('hibauzenet').style.display = 'block';
    }
}

topbar_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult );