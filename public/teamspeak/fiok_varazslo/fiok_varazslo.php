<?php
    session_start();
    include '../../../forras/include/adatbazis.php';
    include '../../../forras/include/alap_fuggvenyek.php';

    adatbazis_csatlakozas("", "", "", "");
    adatbazis_csatlakozas("172.20.128.14", "", "", "teamspeak");

    die_if( !isset($_SESSION['loggedin']), 'Nem vagy belépve');

    if( isset($_GET['fiok_lista_lekerese'])) {
        $buffer = '"fiokok": [';
        $result = query_futtatas("SELECT * FROM clients ORDER BY client_nickname", "teamspeak");
        if( $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $buffer .= '{"client_id": ' . $row['client_id'] . ', "client_nickname": "' . $row['client_nickname'] . '"}';
            while( $row = $result->fetch_assoc() ) {
                $buffer .= ', {"client_id": ' . $row['client_id'] . ', "client_nickname": "' . $row['client_nickname'] . '"}';
            }
            $buffer .= ']';
        }
        exit_ok('"fiokok_szama": '.$result->num_rows.','.$buffer);
    }

    if( isset($_GET['igenyles'])) {
        $eredmeny = query_futtatas("INSERT INTO hausz_ts.jogosultsag_igenylesek (hausz_felhasznalo_id, igenyles_datuma, igenyelt_fiokok, igenyelt_fiok_idk, jelenlegi_fiok_kivalasztott) VALUES (".$_SESSION['user_id'].", now(6), '".$_POST['fiok_nevek']."', '".$_POST['fiok_idk']."', '".$_POST['jelenlegi_fiok_kivalasztott']."')");
        log_bejegyzes("teamspeak szerver", "Jogosultság igénylése", "Fióknevek: " . "Jelenlegi: '".$_POST['jelenlegi_fiok_kivalasztott']."' <- ".$_POST['fiok_nevek'], $_SESSION['username']);
        exit_ok('Igénylés sikeresen elküldve');
    }
?>