<?php   
    session_start();
    $dbname = "hausz_megoszto";
    include '../../forras/include/alap_fuggvenyek.php';
    include '../../forras/include/adatbazis.php';

    die_if( !isset( $_SESSION['loggedin'] ), 'Nem vagy belépve');
    die_if( $_SESSION['admin'] != "igen", 'Nem vagy rendszergazda');

    if( isset($_GET['aktivalas']) ) {
        die_if( strlen($_GET['id']) <= 0, 'Az id helytelenül van, vagy nincs megadva');

        $result = query_futtatas("select * from hausz_megoszto.users_requested where request_id = ".$_GET['id']);
        $row = $result->fetch_assoc();
        $aktivalt_felhasznalo = $row['username'];

        $result = query_futtatas("call hausz_megoszto.add_user(".$_GET['id'].");");
        log_bejegyzes("hausz_alap", "fiók aktiválás", '['.$_GET['id'].'] - '.$aktivalt_felhasznalo, $_SESSION['username']);
        exit_ok('Aktiválás sikeres');
    }

    if( isset($_GET['elutasitas']) ) {
        die_if( strlen($_GET['id']) <= 0, 'Az id helytelenül van, vagy nincs megadva');

        $result = query_futtatas("select * from hausz_megoszto.users_requested where request_id = ".$_GET['id']);
        $row = $result->fetch_assoc();
        $elutasitott_felhasznalo = $row['username'];

        $result = query_futtatas("delete from hausz_megoszto.users_requested where request_id = ".$_GET['id'].";");
        log_bejegyzes("hausz_alap", "fiók elutasítás", '['.$_GET['id'].'] - '.$elutasitott_felhasznalo, $_SESSION['username']);
        exit_ok('Elutasítás sikeres');
    }

    if( isset($_GET['torles']) ) {
        die_if( strlen($_GET['user_id']) <= 0, 'A user_id helytelenül van, vagy nincs megadva');

        $result = query_futtatas("select * from hausz_megoszto.users where id = ".$_GET['user_id']);
        $row = $result->fetch_assoc();
        $torolt_felhasznalo = $row['username'];
        
        $result = query_futtatas("delete from hausz_megoszto.users where id = ".$_GET['user_id'].";");
        log_bejegyzes("hausz_alap", "fiók törlés", '['.$_GET['user_id'].'] - '.$torolt_felhasznalo, $_SESSION['username']);
        exit_ok('Törlés sikeres');
    }

    if( isset($_GET['aktivalando_fiokok']) ) {
        $result = query_futtatas("select * from hausz_megoszto.users_requested");
        die_if( $result->num_rows <= 0, "Nincs aktiválandó fiók");

        $row = $result->fetch_assoc();
        $buffer = '"valasz": [{"request_id": '.$row['request_id'].', "username": "'.$row['username'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "email": "'.$row['email'].'"}';
        while($row = $result->fetch_assoc()) {
            $buffer .= ', {"request_id": '.$row['request_id'].', "username": "'.$row['username'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "email": "'.$row['email'].'"}';
        }
        exit_ok($buffer.']');
    }

    if( isset($_GET['fiokok']) ) {
        $result = query_futtatas("select * from hausz_megoszto.users");
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

        $query = "select * from hausz_megoszto.users where id = ".$_GET['id'];
        $result = query_futtatas($query);
        die_if( $result->num_rows <= 0, "Nincs aktív felhasználó");

        $row = $result->fetch_assoc();

        $uj_ertek = "";
        if( $row['admin'] == NULL) {
            $uj_ertek = "'igen'";
        } else {
            $uj_ertek = 'null';
        }
        $query_csere = "update hausz_megoszto.users set admin = ".$uj_ertek.' where id = '.$_GET['id'];
        $result = query_futtatas($query_csere);
        log_bejegyzes('hausz_admin', 'admin státusz csere', '['.$_GET['id'].'] - '.$row['username'].': '.$uj_ertek, $_SESSION['username']);
        exit_ok('Admin státusz változtatás kész');
    }

    if( isset($_GET['log']) ) {
        $result = query_futtatas("select * from hausz_log.log order by datum desc limit 100");
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

    die_if( true, 'Ismeretlen szándék. Mi a parancs?');
?>