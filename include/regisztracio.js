function regisztracio_inditasa(event) {
    event.preventDefault();
    
    var post_parameterek = "regisztracio=igen";
    post_parameterek += "&regisztracio_username=" + document.getElementById('regisztracio_username').value;
    post_parameterek += "&regisztracio_password=" + document.getElementById('regisztracio_password').value;
    post_parameterek += "&regisztracio_password_confirm=" + document.getElementById('regisztracio_password_confirm').value;
    post_parameterek += "&regisztracio_email=" + document.getElementById('regisztracio_email').value;

    szinkron_keres((uzenet) => {
        if(/^OK:/.test(uzenet)) {
            document.getElementById('regisztracio_doboz').style.display = 'none';
            document.getElementById('adatvedelmi_tajekoztato_doboz').style.display = 'none';
            document.getElementById('regisztracio_siker_doboz').style.display = 'block';
        } else {
            alert(uzenet);
            console.log(post_parameterek);
        }
    }, "/include/regisztracio.php", post_parameterek);
}

function adatvedelmi_tajekoztato_elolvasva() {
    document.getElementById('adatvedelmi_tajekoztato_elolvasva_gomb').style.visibility = 'hidden';
    document.getElementById('regisztracio_doboz').style.display = 'block';
}