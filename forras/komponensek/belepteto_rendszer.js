function topbar_fiok_gomb_kattintas() {
    if( obj('felhasznalo_doboz').style.visibility == '') {
        obj('felhasznalo_doboz').style.visibility = 'visible';
    } else {
        if( obj('felhasznalo_doboz').style.visibility == 'hidden') {
            obj('felhasznalo_doboz').style.visibility = 'visible';
        } else {
            obj('felhasznalo_doboz').style.visibility = '';
        }
    }
}

function belepesgomb(event) {
    event.preventDefault();
    let post_parameterek_belepes = new FormData();
    post_parameterek_belepes.append('login', 'yes');
    post_parameterek_belepes.append('username', obj('username').value);
    post_parameterek_belepes.append('password', obj('current-password').value);
    szinkron_keres("/include/belepteto_rendszer.php", post_parameterek_belepes, (uzenet) => {
        if(uzenet.eredmeny == 'ok') {
            if (typeof belepes_siker === 'function') {   belepes_siker(); }
            uj_valasz_mutatasa(3000, "", "Sikeres belépés");
            belepteto_rendszer_frissites();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}
 
function kilepesgomb(event) {
    event.preventDefault();
    szinkron_keres("/include/belepteto_rendszer.php?logout=igen", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            if (typeof kilepes_siker === 'function') {   kilepes_siker(); }
            session_username = "";
            session_admin = "";
            session_loggedin = "";
            belepteto_rendszer_frissites();
            uj_valasz_mutatasa(3000, "", "Sikeres kilépés");
            obj('username').value = '';
            obj('current-password').value = '';
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function belepteto_rendszer_frissites() {
    szinkron_keres("/include/belepteto_rendszer.php?statusz=1", "", (uzenet) => {
        let varakozas = setInterval(() => {
            if( obj('felhasznalo_doboz') != null ) {
                if( uzenet.eredmeny == 'ok' ) {
                    session_username = uzenet.session_username;
                    session_admin = uzenet.session_admin;
                    session_loggedin = uzenet.session_loggedin;
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
                        obj('belepett_menu_gomb').innerHTML = "Fiók";
                        obj('belepett_menu_gomb').style.display = 'inline';
                        obj('belepes_menu_gomb').style.display = 'none';
                    }
                } else {
                    session_admin = "";
                    session_username = "";
                    session_loggedin = "";
                    obj('belepett_menu_gomb').style.display = 'none';
                    obj('belepes_menu_gomb').style.display = 'inline';
                }
        
                if( session_loggedin == 'yes' ) {
                    obj('belepett_doboz').style.display = 'block';
                    obj('belepes_doboz').style.display = 'none';
                } else {
                    obj('belepett_doboz').style.display = 'none';
                    obj('belepes_doboz').style.display = 'block';
                }
                
                if( typeof frissites_fuggveny == 'function' ) { frissites_fuggveny(session_loggedin, session_username, session_admin); }
                clearInterval(varakozas);
            }
        }, 20);
        
    });
}

var session_loggedin = "";
var session_username = "";
var session_admin = "";

var frissites_fuggveny;
var belepes_fuggveny;
var kilepes_fuggveny;

function belepteto_rendszer_beallitas(frissult, belepes, kilepes) {
    let span = document.createElement('span');
    span.id = 'belepteto_rendszer';

    fetch(`/komponensek/belepteto_rendszer.html`)
    .then(response => response.text())
    .then(uzenet => {
        span.innerHTML = uzenet;
        document.body.appendChild(span);
        belepteto_rendszer_frissites();
        if( typeof frissult == 'function' ) { frissites_fuggveny = frissult; }
        if( typeof belepes == 'function' ) { belepes_fuggveny = belepes; }
        if( typeof kilepes == 'function' ) { kilepes_fuggveny = kilepes; }
    });
}