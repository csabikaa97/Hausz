function belepteto_rendszer_frissult() {
    if( session_loggedin == "yes" ) {
        document.getElementById('jelszo_valtoztatas_doboz').style.display = 'block';
        document.getElementById('hiba_nem_vagy_belepve_doboz').style.display = 'none';
    } else {
        document.getElementById('jelszo_valtoztatas_doboz').style.display = 'none';
        document.getElementById('hiba_nem_vagy_belepve_doboz').style.display = 'block';
    }
}

function jelszo_valtoztatasa(event) {
    event.preventDefault();

    var post_parameterek = "uj_jelszo=" + document.getElementById('uj_jelszo').value;
    post_parameterek += "&uj_jelszo_megerosites=" + document.getElementById('uj_jelszo_megerosites').value;
    post_parameterek += "&jelenlegi_jelszo=" + document.getElementById('jelenlegi_jelszo').value;

    szinkron_keres("/include/jelszo_valtoztatas.php", post_parameterek, (uzenet) => {
        if(/^OK:/.test(uzenet)) {
            document.getElementById('jelszo_valtoztatas_doboz').style.display = 'none';
            document.getElementById('hiba_nem_vagy_belepve_doboz').style.display = 'none';
            document.getElementById('ok_jelszo_valtoztatas_sikeres').style.display = 'block';
        } else {
            alert(uzenet);
            console.log(post_parameterek);
        }
    });
}