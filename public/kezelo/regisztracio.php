<?php
    include '../../forras/include/adatbazis.php';
    include '../../forras/include/alap_fuggvenyek.php';
    
    adatbazis_csatlakozas("", "", "", "");
    
    if( isset($_GET['generate_salt']) ) {
        $salt = substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil(64/strlen($x)) )),1,64);
        exit_ok($salt);
    }

    die_if( $_POST['regisztracio'] != "igen", "Mi a parancs?");

    die_if( strlen($_POST['regisztracio_username']) == 0, 'Nem adtál meg felhasználónevet');
    die_if( strlen($_POST['regisztracio_password']) == 0, 'Nem adtál meg jelszót');
    die_if( strlen($_POST['regisztracio_password_confirm']) == 0, 'Nem erősítetted meg a jelszavad');
    die_if( strlen($_POST['regisztracio_username']) < 3, 'Túl rövid a felhasználóneved (minimum 3 karakter hosszúnak kell lennie)');
    die_if( strlen($_POST['regisztracio_password']) < 5, 'Túl rövid a jelszavad (minimum 5 karakter hosszúnak kell lennie)');
    die_if( preg_match('/["\'`]/', $_POST['regisztracio_username']), "Illegális karaktert tartalmaz a felhasználóneved ( \' \" \` ).");
    die_if( preg_match('/[^a-zA-Z0-9-\.#áűőúüóöéí]/', $_POST['regisztracio_username']), 'Illegális karaktert tartalmaz a felhasználóneved');
    die_if( $_POST['regisztracio_password'] != $_POST['regisztracio_password_confirm'], 'Nem egyeznek a megadott jelszavak');
    die_if( !preg_match('/^\S+@\S+\.\S+$/', $_POST['regisztracio_email']) && strlen($_POST['regisztracio_email']) > 0, 'Helytelen e-mail cím formátum');

    $result_username_check = query_futtatas("SELECT * FROM users WHERE username = '".$_POST['regisztracio_username']."'");
    $row = $result_username_check->fetch_assoc();
    die_if( mysqli_num_rows($result_username_check) > 0, 'Ez a felhasználónév már foglalt');
    
    $result_username_check = query_futtatas("SELECT * FROM users_requested WHERE username = '".$_POST['regisztracio_username']."'");
    $row = $result_username_check->fetch_assoc();
    die_if( mysqli_num_rows($result_username_check) > 0, 'Ez a felhasználónév már meg lett igényelve');
    
    $use_meghivo = false;
    $db_table = 'hausz_megoszto.users_requested';
    if( strlen( $_POST['regisztracio_meghivo'] ) > 0 ) {
        $result_check_meghivo = query_futtatas("SELECT * FROM meghivok WHERE meghivo = '".$_POST['regisztracio_meghivo']."'");
        die_if( $result_check_meghivo->num_rows <= 0, 'Hibás meghívókód');
        $use_meghivo = true;
        $db_table = 'hausz_megoszto.users';
    }

    // TODO: check incoming password with regex, to prevent SQL injection
    
    $query_add = 'insert into '.$db_table.' (username, sha256_password, email) values ("'.$_POST['regisztracio_username'].'", "$SHA$'.$_POST['regisztracio_password_salt'].'$'.$_POST['regisztracio_password'].'", ';
    if( strlen($_POST['regisztracio_email']) > 0 ) {
        $query_add = $query_add.'"'.$_POST['regisztracio_email'].'");';
    } else {
        $query_add = $query_add.' null);';
    }
    $result_add = query_futtatas($query_add);
    
    $buffer = $_POST['regisztracio_username'].' - '.$_POST['regisztracio_email'];
    if($use_meghivo) {
        query_futtatas("DELETE FROM meghivok WHERE meghivo = '".$_POST['regisztracio_meghivo']."'");
        $buffer = $buffer.' - Meghivo: '.$_POST['regisztracio_meghivo'];
    }

    log_bejegyzes("hausz_alap", "regisztráció", $buffer, "");
    exit_ok("Sikeres regisztráció");
?>