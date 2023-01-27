<?php   
    session_start();
    include '../../forras/include/adatbazis.php';
    include '../../forras/include/alap_fuggvenyek.php';

    adatbazis_csatlakozas("", "", "", "");
    adatbazis_csatlakozas("172.20.128.14", "", "", "teamspeak");

    die_if( !isset( $_SESSION['loggedin'] ), 'Nem vagy belépve');
    die_if( $_SESSION['admin'] != "igen", 'Nem vagy rendszergazda');

    if( isset($_GET['aktivalas']) ) {
        die_if( strlen($_GET['id']) <= 0, 'Az id helytelenül van, vagy nincs megadva');

        $result = query_futtatas("SELECT * FROM hausz_megoszto.users_requested WHERE request_id = ".$_GET['id']);
        $row = $result->fetch_assoc();
        $aktivalt_felhasznalo = $row['username'];

        $result = query_futtatas("call hausz_megoszto.add_user(".$_GET['id'].");");
        log_bejegyzes("hausz_alap", "fiók aktiválás", '['.$_GET['id'].'] - '.$aktivalt_felhasznalo, $_SESSION['username']);
        exit_ok('Aktiválás sikeres');
    }

    if( isset($_GET['elutasitas']) ) {
        die_if( strlen($_GET['id']) <= 0, 'Az id helytelenül van, vagy nincs megadva');

        $result = query_futtatas("SELECT * FROM hausz_megoszto.users_requested WHERE request_id = ".$_GET['id']);
        $row = $result->fetch_assoc();
        $elutasitott_felhasznalo = $row['username'];

        $result = query_futtatas("DELETE FROM hausz_megoszto.users_requested WHERE request_id = ".$_GET['id'].";");
        log_bejegyzes("hausz_alap", "fiók elutasítás", '['.$_GET['id'].'] - '.$elutasitott_felhasznalo, $_SESSION['username']);
        exit_ok('Elutasítás sikeres');
    }

    if( isset($_GET['torles']) ) {
        die_if( strlen($_GET['user_id']) <= 0, 'A user_id helytelenül van, vagy nincs megadva');

        $result = query_futtatas("SELECT * FROM hausz_megoszto.users WHERE id = ".$_GET['user_id']);
        $row = $result->fetch_assoc();
        $torolt_felhasznalo = $row['username'];
        
        $result = query_futtatas("DELETE FROM hausz_megoszto.users WHERE id = ".$_GET['user_id'].";");
        log_bejegyzes("hausz_alap", "fiók törlés", '['.$_GET['user_id'].'] - '.$torolt_felhasznalo, $_SESSION['username']);
        exit_ok('Törlés sikeres');
    }

    if( isset($_GET['aktivalando_fiokok']) ) {
        $result = query_futtatas("SELECT * FROM hausz_megoszto.users_requested");
        die_if( $result->num_rows <= 0, "Nincs aktiválandó fiók");

        $row = $result->fetch_assoc();
        $buffer = '"valasz": [{"request_id": '.$row['request_id'].', "username": "'.$row['username'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "email": "'.$row['email'].'"}';
        while($row = $result->fetch_assoc()) {
            $buffer .= ', {"request_id": '.$row['request_id'].', "username": "'.$row['username'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "email": "'.$row['email'].'"}';
        }
        exit_ok($buffer.']');
    }

    if( isset($_GET['fiokok']) ) {
        $result = query_futtatas("SELECT * FROM hausz_megoszto.users");
        die_if( $result->num_rows <= 0, "Nincs aktív felhasználó");

        $row = $result->fetch_assoc();
        $buffer = '"valasz": [{"id": "'.$row['id'].'", "username": "'.$row['username'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "email": "'.$row['email'].'", "admin": "'.$row['admin'].'"}';
        while($row = $result->fetch_assoc()) {
            $buffer .= ', {"id": "'.$row['id'].'", "username": "'.$row['username'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "email": "'.$row['email'].'", "admin": "'.$row['admin'].'"}';
        }
        exit_ok($buffer.']');
    }

    if( isset($_GET['admin_csere']) ) {
        die_if( !isset($_GET['id']), "Nem adtál meg felhasználói azonosítót");
        die_if( strlen($_GET['id']) <= 0, "Hibás felhasználói azonosító");

        $result = query_futtatas("SELECT * FROM hausz_megoszto.users WHERE id = ".$_GET['id']);
        die_if( $result->num_rows <= 0, "Nincs aktív felhasználó");

        $row = $result->fetch_assoc();

        $uj_ertek = "";
        if( $row['admin'] == NULL) {
            $uj_ertek = "'igen'";
        } else {
            $uj_ertek = 'null';
        }
        $result = query_futtatas("UPDATE hausz_megoszto.users SET admin = ".$uj_ertek.' WHERE id = '.$_GET['id']);
        log_bejegyzes('hausz_admin', 'admin státusz csere', '['.$_GET['id'].'] - '.$row['username'].': '.$uj_ertek, $_SESSION['username']);
        exit_ok('Admin státusz változtatás kész');
    }

    if( isset($_GET['log']) ) {
        $result = query_futtatas("SELECT * FROM hausz_log.log ORDER BY datum DESC LIMIT 100");
        die_if( $result->num_rows <= 0, "Nincs jelenleg log");

        $row = $result->fetch_assoc();
        $buffer .= '"valasz": [{"id": "'.$row['id'].'", "szolgaltatas": "'.$row['szolgaltatas'].'", "bejegyzes": "'.$row['bejegyzes'].'", "komment": "'.$row['komment'].'", "felhasznalo": "'.$row['felhasznalo'].'", "datum": "'.$row['datum'].'"}';
        while($row = $result->fetch_assoc()) {
            $buffer .= ', {"id": "'.$row['id'].'", "szolgaltatas": "'.$row['szolgaltatas'].'", "bejegyzes": "'.$row['bejegyzes'].'", "komment": "'.$row['komment'].'", "felhasznalo": "'.$row['felhasznalo'].'", "datum": "'.$row['datum'].'"}';
        }
        exit_ok($buffer.']');
    }

    if( isset($_GET['parancs']) ) {
        die_if( strlen( $_GET['parancs']) <= 0, "Parancs paraméter helytelen");
        $eredmeny = "";
        exec($_GET['parancs'], $eredmeny, $retval);
        die_if( $retval != 0, "Parancs futtatás ".$_GET['parancs']);

        $buffer = '>>> '.$_GET['parancs'].'<br>';
        foreach ($eredmeny as $sor) {
            $buffer .= $sor.'<br>';
        }
        $buffer .= '<br>';
        exit_ok($buffer);
    }

    if( isset($_GET['teamspeak_jogosultsag_igenylesek']) ) {
        $result = query_futtatas("SELECT hausz_ts.jogosultsag_igenylesek.id, username, igenyles_datuma, igenyelt_fiokok, igenyelt_fiok_idk FROM hausz_ts.jogosultsag_igenylesek LEFT OUTER JOIN hausz_megoszto.users ON hausz_ts.jogosultsag_igenylesek.hausz_felhasznalo_id = hausz_megoszto.users.id ORDER BY igenyles_datuma DESC");
        
        if( $result->num_rows <= 0 ) {
            exit_ok('"igenylesek_szama": 0');
        }
        
        $buffer = '"igenylesek_szama": '.$result->num_rows.', ';
        $row = $result->fetch_assoc();
        $buffer .= '"valasz": [{"id": '.$row['id'].',"username": "'.$row['username'].'", "igenyles_datuma": "'.$row['igenyles_datuma'].'", "igenyelt_fiokok": "'.$row['igenyelt_fiokok'].'", "igenyelt_fiok_idk": "'.$row['igenyelt_fiok_idk'].'"}';
        while($row = $result->fetch_assoc()) {
            $buffer .= ', {"hausz_felhasznalo_id": "'.$row['hausz_felhasznalo_id'].'", "igenyles_datuma": "'.$row['igenyles_datuma'].'", "igenyelt_fiokok": "'.$row['igenyelt_fiokok'].'", "igenyelt_fiok_idk": "'.$row['igenyelt_fiok_idk'].'"}';
        }
        exit_ok($buffer.']');
    }

    if( isset($_GET['teamspeak_jogosultsag_jovahagyas']) ) {
        die_if( !isset($_GET['id']), "Nem adtál meg igénylés azonosítót");
        
        $result = query_futtatas("SELECT * FROM hausz_ts.jogosultsag_igenylesek WHERE id = ".$_GET['id']);
        die_if( $result->num_rows <= 0, "Nincs ilyen azonosítójú igénylés");
        die_if( strlen($_GET['id']) <= 0, "Hibás igénylés azonosító");
        
        $row = $result->fetch_assoc();
        $jelenlegi_fiok_kivalasztott = $row['jelenlegi_fiok_kivalasztott'];
        $result = query_futtatas("SELECT DISTINCT group_server_to_client.group_id, groups_server.name FROM group_server_to_client LEFT OUTER JOIN groups_server ON groups_server.group_id = group_server_to_client.group_id WHERE id1 IN (".$row['igenyelt_fiok_idk'].")", "teamspeak");
        
        $parancs = <<< PARANCS_VEGE
        expect << EOF
        set timeout 2
        spawn telnet 172.20.128.15 10011
        expect -re ".*command\."
        send "login serveradmin zT3FOa4V\\r"
        expect -re ".*msg=ok"
        send "use sid=1\\r"
        expect -re ".*msg=ok"
        send "use port=9987\\r"
        expect -re ".*msg=ok"

        PARANCS_VEGE;

        while($row = $result->fetch_assoc()) {
            $parancs .= 'send "servergroupaddclient sgid='.$row['group_id'].' cldbid='.$jelenlegi_fiok_kivalasztott.'\r"'."\n";
            $parancs .= 'expect -re "(.*error id=2561.*|.*msg=ok.*)"'."\n";
        }

        $parancs .= 'send "use sid=1\\r"'."\n";
        $parancs .= 'expect -re ".*msg=ok"'."\n";
        $parancs .= "\nEOF";

        exec($parancs, $eredmeny, $retval);
        die_if( $retval != 0, "Parancs futtatás hiba!!!: ".$parancs);

        $result = query_futtatas("DELETE FROM hausz_ts.jogosultsag_igenylesek WHERE id = ".$_GET['id']);
        exit_ok("DONE");
    }

    if( isset($_GET['teamspeak_jogosultsag_elutasitas']) ) {
        die_if( !isset($_GET['id']), "Nem adtál meg igénylés azonosítót");
        die_if( strlen($_GET['id']) <= 0, "Hibás igénylés azonosító");
        
        $result = query_futtatas("DELETE FROM hausz_ts.jogosultsag_igenylesek WHERE id = ".$_GET['id']);
        exit_ok("DONE");
    }

    die_if( true, 'Ismeretlen szándék. Mi a parancs?');
?>