<?php
    session_start();
    include '../../forras/include/adatbazis.php';
    include '../../forras/include/alap_fuggvenyek.php';

    adatbazis_csatlakozas("", "", "", "");

    die_if( !isset($_SESSION['loggedin']), "Nem vagy belépve.");
    die_if( strlen($_POST['jelenlegi_jelszo']) == 0, 'Nem adtad meg a jelenlegi jelszavad');
    die_if( strlen($_POST['uj_jelszo']) == 0, 'Nem adtad meg az új jelszavad');
    die_if( strlen($_POST['uj_jelszo_megerosites']) == 0, 'Nem erősítetted meg az új jelszavad');
    die_if( strlen($_POST['uj_jelszo']) < 3, 'Túl rövid a jelszavad (minimum 3 karakter hosszúnak kell lennie)');
    die_if( $_POST['uj_jelszo'] != $_POST['uj_jelszo_megerosites'], 'Nem egyeznek az új jelszavak');
    
    $result_username_check = query_futtatas("SELECT * FROM users WHERE username = '" . $_SESSION['username'] . "'");


    $row = $result_username_check->fetch_assoc();
    die_if( mysqli_num_rows($result_username_check) <= 0, "Nem ellenőrizhető a jelszó (felhasználónév nem létezik)");

    die_if( !password_verify($_POST['jelenlegi_jelszo'], $row['password']), 'Helytelen jelenlegi jelszót adtál meg.');

    $result_change = query_futtatas('update hausz_megoszto.users set password = "' . password_hash($_POST['uj_jelszo'], PASSWORD_DEFAULT) . '" where id = "'.$row['id'].'";');

    exit_ok('A jelszavad sikeresen meg lett változtatva');
    log_bejegyzes("hausz_alap", "jelszó változtatás", "", $_SESSION['username']);
?>
