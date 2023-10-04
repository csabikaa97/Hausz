<?php
    session_start();
    include '../../forras/include/adatbazis.php';
    include '../../forras/include/alap_fuggvenyek.php';

    adatbazis_csatlakozas("", "", "", "");

    die_if( !isset($_SESSION['loggedin']), "Nem vagy belépve.");
    
    if( isset($_GET['meghivo_adatok'])) {
        $sajat_meghivok = query_futtatas("SELECT meghivo FROM meghivok WHERE user_id = " . $_SESSION['user_id']);

        die_if( $sajat_meghivok->num_rows <= 0, '"meghivok_szama": 0');

        $result = $sajat_meghivok -> fetch_assoc();
    
        $buffer = '"meghivok_szama": '.$sajat_meghivok->num_rows.', "meghivok": [';
        $buffer .= '"'.$result['meghivo'].'"';
        while( $result = $sajat_meghivok -> fetch_assoc() ) {
            $buffer .= ', "'.$result['meghivo'].'"';
        }
        $buffer .= ']';
        exit_ok($buffer);
    }

    if( isset($_GET['uj_meghivo'])) {
        $meghivo = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 15);

        query_futtatas("DELETE FROM meghivok WHERE user_id = '" . $_SESSION['user_id'] . "'");

        query_futtatas("INSERT INTO meghivok (user_id, meghivo, request_date) VALUES ('" . $_SESSION['user_id'] . "', '" . $meghivo . "', NOW())");

        log_bejegyzes("hausz_alap", "Meghívó készítés", $meghivo, $_SESSION['username']);
        exit_ok('Új meghívó létrehozása sikeres');
    }


?>
