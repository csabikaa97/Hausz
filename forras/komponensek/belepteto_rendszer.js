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
    let post_parameterek_belepes = new FormData();
    post_parameterek_belepes.append('login', 'yes');
    post_parameterek_belepes.append('username', obj('username').value);
    post_parameterek_belepes.append('password', obj('current-password').value);
    szinkron_keres("/include/belepteto_rendszer.php", post_parameterek_belepes, (uzenet) => {
        if(/^OK:/.test(uzenet)) {
            if (typeof belepes_siker === 'function') {   belepes_siker(); }
            uj_valasz_mutatasa(3000, "", "Sikeres belépés");
            belepteto_rendszer_frissites();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet);
        }
    });
}
 
function kilepesgomb(event) {
    event.preventDefault();
    szinkron_keres("/include/belepteto_rendszer.php?logout=igen", "", (uzenet) => { 
        if(/^OK:/.test(uzenet)) {
            if (typeof kilepes_siker === 'function') {   kilepes_siker(); }
            session_username = "";
            session_admin = "";
            session_loggedin = "";
            belepteto_rendszer_frissites();
            uj_valasz_mutatasa(3000, "", "Sikeres kilépés");
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet);
        }
    });
}

function belepteto_rendszer_frissites() {
    szinkron_keres("/include/belepteto_rendszer.php?statusz=1", "", (uzenet) => {
        if(/^OK:/.test(uzenet)) {
            let adatok = uzenet.replace(/^OK:/, '').split(',');
            session_username = adatok[0];
            session_admin = adatok[1];
            session_loggedin = 'yes';
            obj('belepve_mint').innerHTML = `Belépve mint: ${session_username}`;
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
        
        if( typeof frissites_fuggveny == 'function' ) { frissites_fuggveny(session_loggedin, session_username, session_admin); }
    });
}

var session_loggedin = "";
var session_username = "";
var session_admin = "";

var frissites_fuggveny;
var belepes_fuggveny;
var kilepes_fuggveny;

function belepteto_rendszer_beallitas(frissult, belepes, kilepes) {
    document.body.innerHTML += '<span id="belepteto_rendszer"></span>';

    fetch("/forras/komponensek/belepteto_rendszer.html")
    .then(response => response.text())
    .then(uzenet => {
        obj('belepteto_rendszer').innerHTML = uzenet;
        belepteto_rendszer_frissites();
    });

    if( typeof frissult == 'function' ) { frissites_fuggveny = frissult; }
    if( typeof belepes == 'function' ) { belepes_fuggveny = belepes; }
    if( typeof kilepes == 'function' ) { kilepes_fuggveny = kilepes; }
}