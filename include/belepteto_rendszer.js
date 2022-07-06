function belepes_menu_gomb_kattintas(event) {
    if( obj('belepes_doboz').style.visibility == 'hidden' ||
        obj('belepes_doboz').style.visibility == 'visible') {
        obj('belepes_doboz').style.visibility = 'visible';
        obj('belepes_doboz').style.display = 'block';
    } else {
        obj('belepes_doboz').style.visibility = 'hidden';
    }
}

function belepett_menu_gomb_kattintas(event) {
    if( obj('belepett_doboz').style.visibility == 'hidden' || 
        obj('belepett_doboz').style.visibility == 'visible' ) {
        obj('belepett_doboz').style.visibility = 'visible';
        obj('belepett_doboz').style.display = 'block';
    } else {
        obj('belepett_doboz').style.visibility = 'hidden';
    }
}

function belepesgomb(event) {
    event.preventDefault();
    var post_parameterek_belepes = "login=yes&username=" + obj('username').value + "&password=" + obj('current-password').value;
    szinkron_keres("/include/belepteto_rendszer.php", post_parameterek_belepes, (uzenet) => {
        if(/^OK:/.test(uzenet)) {
            if (typeof belepes_siker === 'function') {   belepes_siker(uzenet); }
            belepteto_rendszer_frissites();
        } else {
            alert(uzenet);
        }
    });
}
 
function kilepesgomb(event) {
    event.preventDefault();
    szinkron_keres("/include/belepteto_rendszer.php?logout=igen", (uzenet) => { 
        if(/^OK:/.test(uzenet)) {
            if (typeof kilepes_siker === 'function') {   kilepes_siker(uzenet); }
            session_username = "";
            session_admin = "";
            session_loggedin = "";
            belepteto_rendszer_frissites();
        } else {
            alert(uzenet);
        }
    });
}

function belepteto_rendszer_frissites() {
    szinkron_keres("/include/belepteto_rendszer.php?statusz=1", (uzenet) => {
        if(/^OK:/.test(uzenet)) {
            var adatok = uzenet.replace(/^OK:/, '').split(',');
            session_username = adatok[0];
            session_admin = adatok[1];
            session_loggedin = 'yes';
            obj('belepve_mint').innerHTML = 'Belépve mint: ' + session_username;
            if(session_admin == "igen") {
                obj('admin_felulet_gomb').style.display = 'block';
                obj('vscode_gomb').style.display = 'block';
            } else {
                session_admin = "";
                obj('admin_felulet_gomb').style.display = 'none';
                obj('vscode_gomb').style.display = 'none';
            }
            if(session_username != "") {
                obj('belepett_menu_gomb').style.display = '';
                obj('belepes_menu_gomb').style.display = 'none';
            }
            obj('belepett_doboz').style.visibility = 'visible';
            obj('belepes_doboz').style.visibility = 'hidden';
        } else {
            session_admin = "";
            session_username = "";
            session_loggedin = "";
            obj('belepett_doboz').style.visibility = 'hidden';
            obj('belepes_doboz').style.visibility = 'visible';
            obj('belepett_menu_gomb').style.display = 'none';
            obj('belepes_menu_gomb').style.display = '';
        }
        if (typeof belepteto_rendszer_frissult === 'function') {   belepteto_rendszer_frissult(); }
    });
}

var session_loggedin = "";
var session_username = "";
var session_admin = "";

if(typeof szinkron_keres !== 'function') {
    throw new Error('Nincs importálva az alap_fuggvenyek.js!!!');
}

fetch("/index/belepteto_rendszer.html")
    .then(response => response.text())
    .then(uzenet => {
        obj('belepteto_rendszer').innerHTML = uzenet;
        belepteto_rendszer_frissites();
    });