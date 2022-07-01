function belepes_menu_gomb_kattintas(event) {
    if( document.getElementById('belepes_doboz').style.visibility == 'hidden' ||
        document.getElementById('belepes_doboz').style.visibility == 'visible') {
        document.getElementById('belepes_doboz').style.visibility = 'visible';
        document.getElementById('belepes_doboz').style.display = 'block';
    } else {
        document.getElementById('belepes_doboz').style.visibility = 'hidden';
    }
}

function belepett_menu_gomb_kattintas(event) {
    if( document.getElementById('belepett_doboz').style.visibility == 'hidden' || 
        document.getElementById('belepett_doboz').style.visibility == 'visible' ) {
        document.getElementById('belepett_doboz').style.visibility = 'visible';
        document.getElementById('belepett_doboz').style.display = 'block';
    } else {
        document.getElementById('belepett_doboz').style.visibility = 'hidden';
    }
}

function belepesgomb(event) {
    event.preventDefault();
    var formData = "login=yes&username=" + document.getElementById('username').value + "&password=" + document.getElementById('current-password').value;
    szinkron_keres(function(uzenet) {
        if(/^OK:/.test(uzenet)) {
            if (typeof belepes_siker === 'function') {   belepes_siker(uzenet); }
            belepteto_rendszer_frissites();
        } else {
            alert(uzenet);
        }
    }, "/include/belepteto_rendszer.php", formData);
}
 
function kilepesgomb(event) {
    event.preventDefault();
    szinkron_keres(function(uzenet) { 
        if(/^OK:/.test(uzenet)) {
            if (typeof kilepes_siker === 'function') {   kilepes_siker(uzenet); }
            session_username = "";
            session_admin = "";
            session_loggedin = "";
            belepteto_rendszer_frissites();
        } else {
            alert(uzenet);
        }
    }, "/megoszto/feltoltes.php?logout=igen");
}

function belepteto_rendszer_frissites() {
    szinkron_keres((uzenet) => {
        if(/^OK:/.test(uzenet)) {
            var adatok = uzenet.replace(/^OK:/, '').split(',');
            session_username = adatok[0];
            document.getElementById('belepve_mint').innerHTML = 'Belépve mint: ' + session_username;
            session_admin = adatok[1];
            if(session_username.length > 0) {
                session_loggedin = 'yes';
            } else {
                session_loggedin = '';
            }
            if(session_admin == "igen") {
                document.getElementById('admin_felulet_gomb').style.display = 'block';
                document.getElementById('vscode_gomb').style.display = 'block';
            } else {
                session_admin = "";
                document.getElementById('admin_felulet_gomb').style.display = 'none';
                document.getElementById('vscode_gomb').style.display = 'none';
            }
            if(session_username != "") {
                document.getElementById('belepett_menu_gomb').style.display = '';
                document.getElementById('belepes_menu_gomb').style.display = 'none';
            }
            document.getElementById('belepett_doboz').style.visibility = 'visible';
            document.getElementById('belepes_doboz').style.visibility = 'hidden';
        } else {
            session_admin = "";
            session_username = "";
            session_loggedin = "";
            document.getElementById('belepett_doboz').style.visibility = 'hidden';
            document.getElementById('belepes_doboz').style.visibility = 'visible';
            document.getElementById('belepett_menu_gomb').style.display = 'none';
            document.getElementById('belepes_menu_gomb').style.display = '';
        }
        if (typeof belepteto_rendszer_frissult === 'function') {   belepteto_rendszer_frissult(); }
    }, "/include/belepteto_rendszer.php?statusz=1");
}


if(typeof szinkron_keres !== 'function') {
    throw new Error('Nincs importálva az alap_fuggvenyek.js!!!');
}

fetch("/index/belepteto_rendszer.html")
    .then(response => response.text())
    .then(uzenet => {
        document.getElementById('belepteto_rendszer').innerHTML = uzenet;
        belepteto_rendszer_frissites();
    });