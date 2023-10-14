<?php
    session_start();
    include '../../forras/include/adatbazis.php';
    include '../../forras/include/alap_fuggvenyek.php';

    adatbazis_csatlakozas("", "", "", "");

    die_if( !isset($_SESSION['loggedin']), "Nem vagy belépve.");

    $result_username_check = query_futtatas("SELECT * FROM users WHERE id = '" . $_SESSION['user_id'] . "'");
    
    $row = $result_username_check->fetch_assoc();

    die_if( mysqli_num_rows($result_username_check) <= 0, "Nem ellenőrizhető a jelszó (a megadott felhasználónév nem létezik)");

    if( isset($_POST['jelenlegi_jelszo_sha256']) ) {

        $password_hash_in_db = explode('$', $row['sha256_password']);
        $password_hash_in_db = $password_hash_in_db[3];

        die_if( $_POST['jelenlegi_jelszo_sha256'] != $password_hash_in_db, "Nem egyezik a jelenlegi jelszó hash" );
    }

    if( isset($_POST['jelenlegi_jelszo']) ) {
        die_if( !password_verify($_POST['jelenlegi_jelszo'], $row['password']), 'Helytelen jelenlegi jelszót adtál meg.');
    }

    if( isset($_POST['uj_jelszo_sha256']) ) {
        die_if( strlen($_POST['uj_jelszo_sha256']) != 64, 'Hibás jelszó hash lett elküldve a szervernek');
        die_if( preg_match('/[^a-zA-Z0-9]/', $_POST['uj_jelszo_sha256']), 'Illegális karaktert tartalmaz a jelszó hashelése');

        die_if( !isset($_POST['uj_jelszo_sha256_salt']), 'Nem lett elküldve a jelszó hasheléséhez szükséges salt');
        die_if( strlen($_POST['uj_jelszo_sha256_salt']) != 64, 'Hibás salt lett elküldve a szervernek');
        die_if( preg_match('/[^a-zA-Z0-9]/', $_POST['uj_jelszo_sha256_salt']), 'Illegális karaktert tartalmaz a salt');

        die_if( $_POST['uj_jelszo_sha256'] != $_POST['uj_jelszo_sha256_megerosites'], "Nem egyeznek a jelszó hashek" );

        $result_change = query_futtatas('update hausz_megoszto.users set sha256_password = "$SHA$'.$_POST['uj_jelszo_sha256_salt'].'$'.$_POST['uj_jelszo_sha256'].'" where id = "'.$_SESSION['user_id'].'";');
    }

    if( isset($_POST['uj_jelszo']) ) {
        die_if( strlen($_POST['uj_jelszo']) == 0, 'Nem adtad meg az új jelszavad');
        die_if( strlen($_POST['uj_jelszo_megerosites']) == 0, 'Nem erősítetted meg az új jelszavad');
        die_if( strlen($_POST['uj_jelszo']) < 3, 'Túl rövid a jelszavad (minimum 3 karakter hosszúnak kell lennie)');
        die_if( $_POST['uj_jelszo'] != $_POST['uj_jelszo_megerosites'], 'Nem egyeznek az új jelszavak');

        $result_change = query_futtatas('update hausz_megoszto.users set password = "' . password_hash($_POST['uj_jelszo'], PASSWORD_BCRYPT) . '" where id = "'.$row['id'].'";');
    }

    exit_ok('A jelszavad sikeresen meg lett változtatva');
    log_bejegyzes("hausz_alap", "jelszó változtatás", "", $_SESSION['username']);
?>
