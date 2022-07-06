<?php   
    session_start();
    $dbname = "hausz_megoszto";
    include '../include/alap_fuggvenyek.php';
    include '../include/adatbazis.php';

    die_if( !isset( $_SESSION['loggedin'] ), 'HIBA:Nem vagy belépve');
    die_if( $_SESSION['admin'] != "igen", 'HIBA:Nem vagy rendszergazda');

    if( isset($_GET['aktivalas']) ) {
        die_if( strlen($_GET['request_id']) <= 0, 'HIBA:A request_id helytelenül van, vagy nincs megadva');

        $result = query_futtatas("select * from hausz_megoszto.users_requested where request_id = ".$_GET['request_id']);
        $row = $result->fetch_assoc();
        $aktivalt_felhasznalo = $row['username'];

        $result = query_futtatas("call hausz_megoszto.add_user(".$_GET['request_id'].");");
        log_bejegyzes("hausz_alap", "fiók aktiválás", '['.$_GET['request_id'].'] - '.$aktivalt_felhasznalo, $_SESSION['username']);
        exit_ok('OK:Aktiválás sikeres');
    }

    if( isset($_GET['elutasitas']) ) {
        die_if( strlen($_GET['request_id']) <= 0, 'HIBA:A request_id helytelenül van, vagy nincs megadva');

        $result = query_futtatas("select * from hausz_megoszto.users_requested where request_id = ".$_GET['request_id']);
        $row = $result->fetch_assoc();
        $elutasitott_felhasznalo = $row['username'];

        $result = query_futtatas("delete from hausz_megoszto.users_requested where request_id = ".$_GET['request_id'].";");
        log_bejegyzes("hausz_alap", "fiók elutasítás", '['.$_GET['request_id'].'] - '.$elutasitott_felhasznalo, $_SESSION['username']);
        exit_ok('OK:Elutasítás sikeres');
    }

    if( isset($_GET['torles']) ) {
        die_if( strlen($_GET['user_id']) <= 0, 'HIBA:A user_id helytelenül van, vagy nincs megadva');

        $result = query_futtatas("select * from hausz_megoszto.users where id = ".$_GET['user_id']);
        $row = $result->fetch_assoc();
        $torolt_felhasznalo = $row['username'];
        
        $result = query_futtatas("delete from hausz_megoszto.users where id = ".$_GET['user_id'].";");
        log_bejegyzes("hausz_alap", "fiók törlés", '['.$_GET['user_id'].'] - '.$torolt_felhasznalo, $_SESSION['username']);
        exit_ok('OK:Törlés sikeres');
    }

    if( isset($_GET['aktivalando_fiokok']) ) {
        $result = query_futtatas("select * from hausz_megoszto.users_requested");
        die_if( $result->num_rows <= 0, "HIBA:OK:nincs aktivalando fiok");

        echo 'OK:';
        while($row = $result->fetch_assoc()) {
            echo '<'.$row['request_id'].'|'.$row['username'].'|'.$row['email'].'>';
        }
        die();
    }

    if( isset($_GET['fiokok']) ) {
        $result = query_futtatas("select * from hausz_megoszto.users");
        die_if( $result->num_rows <= 0, "HIBA:Nincs aktív felhasználó");

        echo 'OK:';
        while($row = $result->fetch_assoc()) {
            echo '<'.$row['id'].'|'.$row['username'].'|'.$row['email'].'|'.$row['admin'].'>';
        }
        die();
    }

    if( isset($_GET['admin_csere']) ) {
        die_if( !isset($_GET['id']), "HIBA:Nem adtál meg felhasználói azonosítót");
        die_if( strlen($_GET['id']) <= 0, "HIBA:Hibás felhasználói azonosító");

        $query = "select * from hausz_megoszto.users where id = ".$_GET['id'];
        $result = query_futtatas($query);
        die_if( $result->num_rows <= 0, "HIBA:Nincs aktív felhasználó");

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
        exit_ok('OK:Csere kész');
    }

    if( isset($_GET['log']) ) {
        $result = query_futtatas("select * from hausz_log.log order by datum desc limit 100");
        die_if( $result->num_rows <= 0, "HIBA:Nincs jelenleg log");

        echo 'OK:';
        while($row = $result->fetch_assoc()) {
            echo '<'.$row['id'].'|'.$row['szolgaltatas'].'|'.$row['bejegyzes'].'|'.$row['komment'].'|'.$row['felhasznalo'].'|'.$row['datum'].'>';
        }
        die();
    }

    if( isset($_GET['parancs']) ) {
        die_if( strlen( $_GET['parancs']) <= 0, "HIBA:Parancs paraméter helytelen");
        $eredmeny = "";
        exec($_GET['parancs'], $eredmeny, $retval);
        die_if( $retval != 0, "HIBA:Parancs futtatás hiba: ".$_GET['parancs']);
        echo '>>> '.$_GET['parancs'].'<br>';
        foreach ($eredmeny as $sor) {
            echo $sor.'<br>';
        }
        echo '<br>';
        die();
    }

    echo 'HIBA:Mi a parancs?';
?>