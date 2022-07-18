<?php
    session_start();

    $dbname = "hausz_megoszto";
    include '../include/alap_fuggvenyek.php';
    include '../include/adatbazis.php';

    die_if( !isset($_SESSION['loggedin']), "HIBA:Nem vagy belépve.");
    die_if( strlen($_POST['jelenlegi_jelszo']) == 0, 'HIBA:Nem adtad meg a jelenlegi jelszavad');
    die_if( strlen($_POST['uj_jelszo']) == 0, 'HIBA:Nem adtad meg az új jelszavad');
    die_if( strlen($_POST['uj_jelszo_megerosites']) == 0, 'HIBA:Nem erősítetted meg az új jelszavad');
    die_if( strlen($_POST['uj_jelszo']) < 3, 'HIBA:Túl rövid a jelszavad (minimum 3 karakter hosszúnak kell lennie)');
    die_if( $_POST['uj_jelszo'] != $_POST['uj_jelszo_megerosites'], 'HIBA:Nem egyeznek az új jelszavak');
    
    $result_username_check = query_futtatas("select * from users where username = '" . $_SESSION['username'] . "'");


    $row = $result_username_check->fetch_assoc();
    die_if( mysqli_num_rows($result_username_check) <= 0, "HIBA:Nem ellenőrizhető a jelszó (felhasználónév nem létezik)");

    die_if( !password_verify($_POST['jelenlegi_jelszo'], $row['password']), 'HIBA:Helytelen jelenlegi jelszót adtál meg.');

    $result_change = query_futtatas('update hausz_megoszto.users set password = "' . password_hash($_POST['uj_jelszo'], PASSWORD_DEFAULT) . '" where id = "'.$row['id'].'";');

    exit_ok('OK:A jelszavad sikeresen meg lett változtatva');
    log_bejegyzes("hausz_alap", "jelszó változtatás", "", $_SESSION['username']);
?>
