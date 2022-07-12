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
    szinkron_keres("/include/belepteto_rendszer.php", (uzenet) => {
        if(/^OK:/.test(uzenet)) {
            if (typeof belepes_siker === 'function') {   belepes_siker(uzenet); }
            uj_valasz_mutatasa(3000, "ok", "Sikeres belépés");
            belepteto_rendszer_frissites();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet);
        }
    }, post_parameterek_belepes);
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
            uj_valasz_mutatasa(3000, "ok", "Sikeres kilépés");
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet);
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

    if( typeof frissites_fuggveny == 'function' ) { frissites_fuggveny(); }
    if( typeof belepes_fuggveny == 'function' ) { belepes_fuggveny(); }
    if( typeof kilepes_fuggveny == 'function' ) { kilepes_fuggveny(); }
}

var session_loggedin = "";
var session_username = "";
var session_admin = "";

var frissites_fuggveny;
var belepes_fuggveny;
var kilepes_fuggveny;

function belepteto_rendszer_beallitas(frissult, belepes, kilepes) {
    console.log('Beléptető rendszer init')
    if(typeof szinkron_keres != 'function') {   throw new Error('Nincs importálva az alap_fuggvenyek.js!!!'); }

    document.body.innerHTML += '<span id="belepteto_rendszer"></span>';

    fetch("/index/belepteto_rendszer.html")
    .then(response => response.text())
    .then(uzenet => {
        obj('belepteto_rendszer').innerHTML = uzenet;
        belepteto_rendszer_frissites();
    });

    if( typeof frissult == 'function' ) { frissites_fuggveny = frissult; console.log(frissites_fuggveny); }
    if( typeof belepes == 'function' ) { belepes_fuggveny = belepes; console.log(belepes_fuggveny); }
    if( typeof kilepes == 'function' ) { kilepes_fuggveny = kilepes; console.log(kilepes_fuggveny); }
}