function futtatas() { //
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        obj("parancssor").innerHTML = obj("parancssor").innerHTML + this.responseText;
    }
    xhttp.open("GET", "/admin/admin.php?parancs=" + obj("parancs").value);
    xhttp.send();
}

function futtatas_enter() { //
    if (event.key === 'Enter') {
        futtatas();
        obj("parancs").value = "";
    }
}

function admin_statusz_csere(nev, id) { //
    szinkron_keres("/admin/admin.php?admin_csere&id=" + id, "", (uzenet) => {
        if( /^OK:/.test(uzenet) ) {
            fiokok_betoltese();
            log_betoltese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet);
        }
    });
}

function elutasitas(nev, id) { //
    if( confirm('Biztosan elutasítod "'+nev+'" regisztrációs kérelmét?') ) {
        szinkron_keres("/admin/admin.php?elutasitas&id=" + id, "", (uzenet) => {
            if( /^OK:/.test(uzenet) ) {
                aktivalando_fiokok_betoltese();
                log_betoltese(); 
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet);
            }
        });
    }
}

function aktivalas(nev, id) { //
    if( confirm('Biztosan elfogadod "'+nev+'" regisztrációs kérelmét?') ) {
        szinkron_keres("/admin/admin.php?aktivalas&request_id=" + id, "", (uzenet) => {
            if( /^OK:/.test(uzenet) ) {
                aktivalando_fiokok_betoltese();
                fiokok_betoltese();
                log_betoltese();
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet);
            }
        });
    }
}

function torles(nev, id) { //
    if( confirm('Biztosan szeretnéd törölni a "'+nev+'" nevű fiókot?') ) {
        szinkron_keres("/admin/admin.php?torles&user_id=" + id, "", (uzenet) => {
            if( /^OK:/.test(uzenet) ) {
                fiokok_betoltese();
                log_betoltese(); 
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet);
            }
        });
    }
}

function aktivalando_fiokok_betoltese() { //
    let buffer = '<h3>Aktiválandó fiókok</h3><table class="szint-1 tablazat"><tbody><tr><th class="cella">request_id</th><th class="cella">username</th><th class="cella">email</th><th class="cella"></th><th class="cella"></th></tr>';
    szinkron_keres("/admin/admin.php?aktivalando_fiokok", "", (uzenet) => {
        if( /OK:nincs aktivalando fiok/.test(uzenet) ) {
            buffer += '<tr><td class="cella kozepre-szoveg" colspan="3">Jelenleg nincs aktiválandó fiók</td><td class="cella"></td><td class="cella"></td></tr>';
        } else {
            if( /^OK:/.test(uzenet) ) {
                uzenet = uzenet.replace(/^OK:</, '');
                uzenet = uzenet.replace(/>$/, '');
                let fiokok = uzenet.split('><');
                fiokok.forEach(adatok => {
                    buffer += '<tr>';
                    adatok = adatok.split('|');

                    let request_id, username, megjeleno_nev, email;
                    [request_id, username, megjeleno_nev, email] = adatok;
                    console.log(request_id, username, megjeleno_nev, email);

                    buffer += '<td class="cella">' + request_id + '</td>';
                    buffer += '<td class="cella">' + username + '</td>';
                    buffer += '<td class="cella">' + megjeleno_nev + '</td>';
                    buffer += '<td class="cella">' + email + '</td>';
                    buffer += '<td class="cella"><div class="szint-2 gomb kerekites-15" onclick="elutasitas(&quot;'+username+'&quot;, '+request_id+')">Elutasítás</div></td>';
                    buffer += '<td class="cella"><div class="szint-2 gomb kerekites-15" onclick="aktivalas(&quot;'+username+'&quot;, '+request_id+')">Aktiválás</div></td>';
                    buffer += '</tr>';
                });
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet);
            }
        }

        obj('aktivalando_fiokok').innerHTML = buffer + '</tbody></table>';
    });
}

function fiokok_betoltese() { //
    let buffer = '<h3>Aktív fiókok</h3><table class="szint-1 tablazat"><tbody><tr><th class="cella">id</th><th class="cella">username</th><th class="cella">megjeleno_nev</th><th class="cella">email</th><th class="cella">Admin</th><th class="cella"></th><th class="cella"></th></tr>';
    szinkron_keres("/admin/admin.php?fiokok", "", (uzenet) => {
        if( /^OK:/.test(uzenet) ) {
            uzenet = uzenet.replace(/^OK:/, '');
            uzenet = uzenet.split('><');
            uzenet.forEach(sor => {
                sor = sor.replace(/^</, '');
                sor = sor.replace(/>$/, '');
                buffer += '<tr>';
                adatok = sor.replace( /^<(.*)>/, '$1');
                sor = sor.replace( /^<([^<>]*)>(.*)/, '$2');
                adatok = adatok.split('|');
                
                let id = adatok[0];
                let username = adatok[1];
                let megjeleno_nev = adatok[2];
                let email = adatok[3];
                let Admin = adatok[4];
                
                buffer += '<td class="cella">' + id + '</td>';
                buffer += '<td class="cella">' + username + '</td>';
                buffer += '<td class="cella">' + megjeleno_nev + '</td>';
                buffer += '<td class="cella">' + email + '</td>';
                buffer += '<td class="cella">' + Admin + '</td>';
                buffer += "<td class='cella'><div class='szint-2 gomb kerekites-15' onclick='admin_statusz_csere(&quot;"+username+"&quot;, "+id+")'>Admin státusz csere</div></td>";
                buffer += "<td class='cella'><div class='szint-2 gomb kerekites-15' onclick='torles(&quot;"+username+"&quot;, "+id+")'>Törlés</div></td>";
                buffer += '</tr>';
            });
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet);
        }

        obj('fiokok').innerHTML = buffer + '</tbody></table>';
    });
}

function log_betoltese() { //
    let buffer = '<h3>Log</h3><table class="szint-1 tablazat"><tbody><tr><th class="cella">id</th><th class="cella">szolgaltatas</th><th class="cella">bejegyzes</th><th class="cella">komment</th><th class="cella">felhasznalo</th><th class="cella">datum</th></tr>';
    szinkron_keres("/admin/admin.php?log", "", (uzenet) => {
        if( /^OK:/.test(uzenet) ) {
            uzenet = uzenet.replace(/^OK:/, '');
            uzenet = uzenet.split('><');
            uzenet.forEach(sor => {
                sor = sor.replace(/^</, '');
                sor = sor.replace(/>$/, '');
                buffer += '<tr>';
                let adatok = sor.replace( /^<(.*)>/, '$1');
                sor = sor.replace( /^<([^<>]*)>(.*)/, '$2');
                adatok = adatok.split('|');

                adatok.forEach(adat => {
                    buffer += '<td class="cella">' + adat + '</td>';
                });

                buffer += '</tr>';
            });
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet);
        }

        obj('log').innerHTML = buffer + '</tbody></table>';
    });
}

function belepteto_rendszer_frissult( session_loggedin, session_username, session_admin ) { //
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