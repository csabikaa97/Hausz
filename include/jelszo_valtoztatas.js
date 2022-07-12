function belepteto_rendszer_frissult() {
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

    var post_parameterek = "uj_jelszo=" + obj('uj_jelszo').value;
    post_parameterek += "&uj_jelszo_megerosites=" + obj('uj_jelszo_megerosites').value;
    post_parameterek += "&jelenlegi_jelszo=" + obj('jelenlegi_jelszo').value;

    szinkron_keres("/include/jelszo_valtoztatas.php", (uzenet) => {
        if(/^OK:/.test(uzenet)) {
            obj('jelszo_valtoztatas_doboz').style.display = 'none';
            obj('hiba_nem_vagy_belepve_doboz').style.display = 'none';
            obj('ok_jelszo_valtoztatas_sikeres').style.display = 'block';
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet);
        }
    }, post_parameterek);
}

if( typeof belepteto_rendszer_beallitas != 'function' ) {   throw new Error('Nincs importálva a belepteto_rendszer.js!!!'); }
if( typeof topbar_betoltese != 'function' ) {   throw new Error('Nincs importálva a topbar.js!!!'); }

belepteto_rendszer_beallitas();
topbar_betoltese();