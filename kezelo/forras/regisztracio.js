function regisztracio_inditasa(event) {
    event.preventDefault();
    
    let post_parameterek = new FormData();
    post_parameterek.append("regisztracio", "igen");
    post_parameterek.append("regisztracio_username", obj('regisztracio_username').value);
    post_parameterek.append("regisztracio_password", obj('regisztracio_password').value);
    post_parameterek.append("regisztracio_password_confirm", obj('regisztracio_password_confirm').value);
    post_parameterek.append("regisztracio_email", obj('regisztracio_email').value);

    szinkron_keres("/kezelo/regisztracio.php", post_parameterek, (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            obj('regisztracio_doboz').style.display = 'none';
            obj('adatvedelmi_tajekoztato_doboz').style.display = 'none';
            obj('regisztracio_siker_doboz').style.display = 'block';
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function adatvedelmi_tajekoztato_elolvasva() {
    obj('adatvedelmi_tajekoztato_elolvasva_gomb').style.visibility = 'hidden';
    obj('regisztracio_doboz').style.display = 'block';
}

topbar_betoltese();