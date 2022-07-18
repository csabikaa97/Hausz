function belepteto_rendszer_frissult( session_loggedin, session_username, session_admin ) {
    if( session_loggedin == "yes" ) {
        obj('jelszo_valtoztatas_doboz').style.display = 'block';
        obj('hiba_nem_vagy_belepve_doboz').style.display = 'none';
    } else {
        obj('jelszo_valtoztatas_doboz').style.display = 'none';
        obj('hiba_nem_vagy_belepve_doboz').style.display = 'block';
    }
}

function jelszo_valtoztatasa(event) {
    event.preventDefault();

    let post_parameterek = "uj_jelszo=" + obj('uj_jelszo').value;
    post_parameterek += "&uj_jelszo_megerosites=" + obj('uj_jelszo_megerosites').value;
    post_parameterek += "&jelenlegi_jelszo=" + obj('jelenlegi_jelszo').value;

    szinkron_keres("/kezelo/jelszo_valtoztatas.php", post_parameterek, (uzenet) => {
        if(/^OK:/.test(uzenet)) {
            obj('jelszo_valtoztatas_doboz').style.display = 'none';
            obj('hiba_nem_vagy_belepve_doboz').style.display = 'none';
            obj('ok_jelszo_valtoztatas_sikeres').style.display = 'block';
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet);
        }
    });
}

belepteto_rendszer_beallitas();
topbar_betoltese();