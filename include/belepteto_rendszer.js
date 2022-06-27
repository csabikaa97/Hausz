var username = "";
var admin = "";
var loggedin = "";

if(typeof szinkron_keres !== 'function') {
    throw new Error('Nincs importálva az alap_fuggvenyek.js!!!');
}

fetch("/index/belepteto_rendszer.html")
    .then(response => response.text())
    .then(uzenet => {
        document.getElementById('belepteto_rendszer').innerHTML = uzenet;
        if( document.getElementById('kilepesgomb') != null ) {
            document.getElementById('kilepesgomb').onclick = function(event) {
                event.preventDefault();
                szinkron_keres(function(uzenet) { 
                    if(/^OK:/.test(uzenet)) {
                        if (typeof kilepes_siker === 'function') {   kilepes_siker(uzenet); }
                        username = "";
                        admin = "";
                        belepteto_rendszer_frissites();
                    } else {
                        alert(uzenet);
                    }
                }, "/uploads/feltoltes.php?logout=igen&javascript=1");
            }
        }
    
        if( document.getElementById('bejelentkezes_gomb') != null ) {
            document.getElementById('bejelentkezes_gomb').onclick = function(event) {
                event.preventDefault();
                var formData = "login=yes&belepteto_rendszer&username=" + document.getElementById('username').value + "&password=" + document.getElementById('current-password').value;
                szinkron_keres(function(uzenet) {
                    if(/^OK:/.test(uzenet)) {
                        if (typeof belepes_siker === 'function') {   belepes_siker(uzenet); }
                        belepteto_rendszer_frissites();
                    } else {
                        alert(uzenet);
                    }
                }, "/uploads/feltoltes.php?javascript=1", formData);
            }
        }

        document.getElementById('belepett_menu_gomb').onclick = () => {
            if( document.getElementById('belepett_doboz').style.visibility == 'hidden' || 
                document.getElementById('belepett_doboz').style.visibility == 'visible' ) {
                document.getElementById('belepett_doboz').style.visibility = 'visible';
                document.getElementById('belepett_doboz').style.display = 'block';
            } else {
                document.getElementById('belepett_doboz').style.visibility = 'hidden';
            }
        };

        document.getElementById('belepes_menu_gomb').onclick = () => {
            if( document.getElementById('belepes_doboz').style.visibility == 'hidden' ||
                document.getElementById('belepes_doboz').style.visibility == 'visible') {
                document.getElementById('belepes_doboz').style.visibility = 'visible';
                document.getElementById('belepes_doboz').style.display = 'block';
            } else {
                document.getElementById('belepes_doboz').style.visibility = 'hidden';
            }
        };
        belepteto_rendszer_frissites();
    });

function belepteto_rendszer_frissites() {
    szinkron_keres((uzenet) => {
        if(/^OK:/.test(uzenet)) {
            adatok = uzenet.replace(/^OK:/, '').split(',');
            username = adatok[0];
            document.getElementById('belepve_mint').innerHTML = 'Belépve mint: ' + username;
            admin = adatok[1];
            if(username.length > 0) {
                loggedin = 'yes';
            } else {
                loggedin = '';
            }
            if(admin == "igen") {
                document.getElementById('admin_felulet_gomb').style.display = 'block';
                document.getElementById('vscode_gomb').style.display = 'block';
            } else {
                document.getElementById('admin_felulet_gomb').style.display = 'none';
                document.getElementById('vscode_gomb').style.display = 'none';
            }
            if(username != "") {
                document.getElementById('belepett_menu_gomb').style.display = '';
                document.getElementById('belepes_menu_gomb').style.display = 'none';
            }
            document.getElementById('belepett_doboz').style.visibility = 'visible';
            document.getElementById('belepes_doboz').style.visibility = 'hidden';
        } else {
            document.getElementById('belepett_doboz').style.visibility = 'hidden';
            document.getElementById('belepes_doboz').style.visibility = 'visible';
            document.getElementById('belepett_menu_gomb').style.display = 'none';
            document.getElementById('belepes_menu_gomb').style.display = '';
        }
    }, "/include/belepteto_rendszer.php?javascript=1&statusz=1", "belepteto_rendszer");
}