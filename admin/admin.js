function futtatas() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        document.getElementById("parancssor").innerHTML = document.getElementById("parancssor").innerHTML + this.responseText;
    }
    xhttp.open("GET", "/admin/admin.php?parancs=" + document.getElementById("parancs").value);
    xhttp.send();
}

function futtatas_enter() {
    if (event.key === 'Enter') {
        futtatas();
        document.getElementById("parancs").value = "";
    }
}

function admin_statusz_csere(nev, id) {
    szinkron_keres("/admin/admin.php?admin_csere&id=" + id, (uzenet) => {
        if( /^OK:/.test(uzenet) ) {
            fiokok_betoltese();
            log_betoltese();
        } else {
            alert(uzenet);
        }
    });
}

function elutasitas(nev, id) {
    if( confirm('Biztosan elutasítod "'+nev+'" regisztrációs kérelmét?') ) {
        szinkron_keres("/admin/admin.php?elutasitas&id=" + id, (uzenet) => {
            if( /^OK:/.test(uzenet) ) {
                aktivalando_fiokok_betoltese();
                log_betoltese(); 
            } else {
                alert(uzenet);
            }
        });
    }
}

function aktivalas(nev, id) {
    if( confirm('Biztosan elfogadod "'+nev+'" regisztrációs kérelmét?') ) {
        szinkron_keres("/admin/admin.php?aktivalas&request_id=" + id, (uzenet) => {
            if( /^OK:/.test(uzenet) ) {
                aktivalando_fiokok_betoltese();
                fiokok_betoltese();
                log_betoltese();
            } else {
                alert(uzenet);
            }
        });
    }
}

function torles(nev, id) {
    if( confirm('Biztosan szeretnéd törölni a "'+nev+'" nevű fiókot?') ) {
        szinkron_keres("/admin/admin.php?torles&user_id=" + id, (uzenet) => {
            if( /^OK:/.test(uzenet) ) {
                fiokok_betoltese();
                log_betoltese(); 
            } else {
                alert(uzenet);
            }
        });
    }
}

function aktivalando_fiokok_betoltese() {
    var buffer = '<h3>Aktiválandó fiókok</h3><table><tbody><tr><th>request_id</th><th>username</th><th>email</th><th></th><th></th></tr>';
    szinkron_keres("/admin/admin.php?aktivalando_fiokok", (uzenet) => {
        if( /OK:nincs aktivalando fiok/.test(uzenet) ) {
            buffer += '<tr><td colspan="3" class="kozepre-szoveg">Jelenleg nincs aktiválandó fiók</td><td></td><td></td></tr>';
        } else {
            if( /^OK:/.test(uzenet) ) {
                uzenet = uzenet.replace(/^OK:/, '');
                buffer += '<tr>';
                while( /^<(.*)>/.test(uzenet) ) {
                    adatok = uzenet.replace( /^<(.*)>/, '$1');
                    uzenet = uzenet.replace( /^<([^<>]*)>(.*)/, '$2');
                    adatok = adatok.split('|');

                    request_id = adatok[0];
                    username = adatok[1];
                    email = adatok[2];

                    buffer += '<td>' + request_id + '</td>';
                    buffer += '<td>' + username + '</td>';
                    buffer += '<td>' + email + '</td>';
                    buffer += '<td><div class="szint-2 gomb kerekites-15" onclick="elutasitas(&quot;'+username+'&quot;, '+request_id+')">Elutasítás</div></td>';
                    buffer += '<td><div class="szint-2 gomb kerekites-15" onclick="aktivalas(&quot;'+username+'&quot;, '+request_id+')">Aktiválás</div></td>';
                }
                buffer += '</tr>';
            } else {
                alert(uzenet);
            }
        }

        document.getElementById('aktivalando_fiokok').innerHTML = buffer + '</tbody></table>';
    });
}

function fiokok_betoltese() {
    var buffer = '<h3>Aktív fiókok</h3><table><tbody><tr><th>id</th><th>username</th><th>email</th><th>Admin</th><th></th><th></th></tr>';
    szinkron_keres("/admin/admin.php?fiokok", (uzenet) => {
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
                
                id = adatok[0];
                username = adatok[1];
                email = adatok[2];
                Admin = adatok[3];
                
                buffer += '<td>' + id + '</td>';
                buffer += '<td>' + username + '</td>';
                buffer += '<td>' + email + '</td>';
                buffer += '<td>' + Admin + '</td>';
                buffer += "<td><div class='szint-2 gomb kerekites-15' onclick='admin_statusz_csere(&quot;"+username+"&quot;, "+id+")'>Admin státusz csere</div></td>";
                buffer += "<td><div class='szint-2 gomb kerekites-15' onclick='torles(&quot;"+username+"&quot;, "+id+")'>Törlés</div></td>";
                buffer += '</tr>';
            });
        } else {
            alert(uzenet);
        }

        document.getElementById('fiokok').innerHTML = buffer + '</tbody></table>';
    });
}

function log_betoltese() {
    var buffer = '<h3>Log</h3><table><tbody><tr><th>id</th><th>szolgaltatas</th><th>bejegyzes</th><th>komment</th><th>felhasznalo</th><th>datum</th></tr>';
    szinkron_keres("/admin/admin.php?log", (uzenet) => {
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

                adatok.forEach(adat => {
                    buffer += '<td>' + adat + '</td>';
                });

                buffer += '</tr>';
            });
        } else {
            alert(uzenet);
        }

        document.getElementById('log').innerHTML = buffer + '</tbody></table>';
    });
}

function belepteto_rendszer_frissult() {
    if(session_admin == "igen") {
        document.getElementById('aktivalando_fiokok').style.display = 'block';
        document.getElementById('fiokok').style.display = 'block';
        document.getElementById('log').style.display = 'block';
        document.getElementById('shell').style.display = 'block';
        document.getElementById('hibauzenet').style.display = 'none';
        aktivalando_fiokok_betoltese();
        fiokok_betoltese();
        log_betoltese();
    } else {
        document.getElementById('aktivalando_fiokok').style.display = 'none';
        document.getElementById('fiokok').style.display = 'none';
        document.getElementById('log').style.display = 'none';
        document.getElementById('shell').style.display = 'none';
        document.getElementById('hibauzenet').style.display = 'block';
    }

}