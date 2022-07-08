function regisztracio_inditasa(event) {
    event.preventDefault();
    
    var post_parameterek = "regisztracio=igen";
    post_parameterek += "&regisztracio_username=" + obj('regisztracio_username').value;
    post_parameterek += "&regisztracio_password=" + obj('regisztracio_password').value;
    post_parameterek += "&regisztracio_password_confirm=" + obj('regisztracio_password_confirm').value;
    post_parameterek += "&regisztracio_email=" + obj('regisztracio_email').value;

    szinkron_keres("/include/regisztracio.php", post_parameterek, (uzenet) => {
        if(/^OK:/.test(uzenet)) {
            obj('regisztracio_doboz').style.display = 'none';
            obj('adatvedelmi_tajekoztato_doboz').style.display = 'none';
            obj('regisztracio_siker_doboz').style.display = 'block';
        } else {
            alert(uzenet);
        }
    });
}

function adatvedelmi_tajekoztato_elolvasva() {
    obj('adatvedelmi_tajekoztato_elolvasva_gomb').style.visibility = 'hidden';
    obj('regisztracio_doboz').style.display = 'block';
}