<?php
    include '../../forras/include/adatbazis.php';
    include '../../forras/include/alap_fuggvenyek.php';
    
    adatbazis_csatlakozas("", "", "", "");

    die_if( $_POST['regisztracio'] != "igen", "Mi a parancs?");

    die_if( strlen($_POST['regisztracio_username']) == 0, 'Nem adtál meg felhasználónevet');
    die_if( strlen($_POST['regisztracio_password']) == 0, 'Nem adtál meg jelszót');
    die_if( strlen($_POST['regisztracio_password_confirm']) == 0, 'Nem erősítetted meg a jelszavad');
    die_if( strlen($_POST['regisztracio_username']) < 3, 'Túl rövid a felhasználóneved (minimum 3 karakter hosszúnak kell lennie)');
    die_if( strlen($_POST['regisztracio_password']) < 5, 'Túl rövid a jelszavad (minimum 5 karakter hosszúnak kell lennie)');
    die_if( preg_match('/["\'`]/', $_POST['regisztracio_username']), "Illegális karaktert tartalmaz a felhasználóneved ( \' \" \` ).");
    die_if( preg_match('/[^a-zA-Z0-9-\.#/\\áűőúüóöéí]/', $_POST['regisztracio_username']), 'Illegális karaktert tartalmaz a felhasználóneved');
    die_if( $_POST['regisztracio_password'] != $_POST['regisztracio_password_confirm'], 'Nem egyeznek a megadott jelszavak');
    die_if( !preg_match('/^\S+@\S+\.\S+$/', $_POST['regisztracio_email']) && strlen($_POST['regisztracio_email']) > 0, 'Helytelen e-mail cím formátum');

    $result_username_check = query_futtatas("SELECT * FROM users WHERE username = '".$_POST['regisztracio_username']."'");
    $row = $result_username_check->fetch_assoc();
    die_if( mysqli_num_rows($result_username_check) > 0, 'Ez a felhasználónév már foglalt');

    $result_username_check = query_futtatas("SELECT * FROM users_requested WHERE username = '".$_POST['regisztracio_username']."'");
    $row = $result_username_check->fetch_assoc();
    die_if( mysqli_num_rows($result_username_check) > 0, 'Ez a felhasználónév már meg lett igényelve');
    
    $query_add = 'insert into hausz_megoszto.users_requested (username, password, email) values ("'.$_POST['regisztracio_username'].'", "'.password_hash($_POST['regisztracio_password'], PASSWORD_DEFAULT).'", ';
    if( strlen($_POST['regisztracio_email']) > 0 ) {
        $query_add = $query_add.'"'.$_POST['regisztracio_email'].'");';
    } else {
        $query_add = $query_add.' null);';
    }
    $result_add = query_futtatas($query_add);

    log_bejegyzes("hausz_alap", "regisztráció", $_POST['regisztracio_username'].' - '.$_POST['regisztracio_email'], "");
    exit_ok("Sikeres regisztráció");
?>