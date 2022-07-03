<?php
    $dbname = "hausz_megoszto";
    include '../include/alap_fuggvenyek.php';
    include '../include/adatbazis.php';

    die_if( $_POST['regisztracio'] != "igen", "HIBA:Mi a parancs?");

    die_if( strlen($_POST['regisztracio_username']) == 0, 'HIBA:Nem adtál meg felhasználónevet');
    die_if( strlen($_POST['regisztracio_password']) == 0, 'HIBA:Nem adtál meg jelszót');
    die_if( strlen($_POST['regisztracio_password_confirm']) == 0, 'HIBA:Nem erősítetted meg a jelszavad');
    die_if( strlen($_POST['regisztracio_username']) < 3, 'HIBA:Túl rövid a felhasználóneved (minimum 3 karakter hosszúnak kell lennie)');
    die_if( strlen($_POST['regisztracio_password']) < 5, 'HIBA:Túl rövid a jelszavad (minimum 5 karakter hosszúnak kell lennie)');
    die_if( preg_match('/[^a-zA-Z0-9-\.#/\\áűőúüóöéí]/', $_POST['regisztracio_username']), 'HIBA:Illegális karaktert tartalmaz a felhasználóneved');
    die_if( $_POST['regisztracio_password'] != $_POST['regisztracio_password_confirm'], 'HIBA:Nem egyeznek a megadott jelszavak');
    die_if( !preg_match('/^\S+@\S+\.\S+$/', $_POST['regisztracio_email']) && strlen($_POST['regisztracio_email']) > 0, 'HIBA:Helytelen e-mail cím formátum');

    $query_username_check = "select * from users where username = '".$_POST['regisztracio_username']."'";
    $result_username_check = $conn->query($query_username_check);
    die_if( !$result_username_check, "Query hiba: ".$query_username_check);
    $row = $result_username_check->fetch_assoc();
    die_if( mysqli_num_rows($result_username_check) > 0, 'HIBA:Ez a felhasználónév már foglalt');

    $query_username_check = "select * from users_requested where username = '".$_POST['regisztracio_username']."'";
    $result_username_check = $conn->query($query_username_check);
    die_if( !$result_username_check, "Query hiba: ".$query_username_check);
    $row = $result_username_check->fetch_assoc();
    die_if( mysqli_num_rows($result_username_check) > 0, 'HIBA:Ez a felhasználónév már meg lett igényelve');
    
    $query_add = 'insert into hausz_megoszto.users_requested (username, password, email) values ("'.$_POST['regisztracio_username'].'", "'.password_hash($_POST['regisztracio_password'], PASSWORD_DEFAULT).'", ';
    if( strlen($_POST['regisztracio_email']) > 0 ) {
        $query_add = $query_add.'"'.$_POST['regisztracio_email'].'");';
    } else {
        $query_add = $query_add.' null);';
    }
    $result_add = $conn->query($query_add);

    die_if( !$result_add, 'Query hiba: '.$query_add);

    log_bejegyzes("hausz_alap", "regisztráció", $_POST['regisztracio_username'].' - '.$_POST['regisztracio_email'], "");
    exit_ok("OK:Sikeres regisztráció");
?>