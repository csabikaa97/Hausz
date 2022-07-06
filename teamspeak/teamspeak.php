<?php
    session_start();

    $dbname = "hausz_megoszto";
    include '../include/alap_fuggvenyek.php';
    include '../include/adatbazis.php';

    if( isset($_GET['token_informacio']) ) {
        die_if( !isset($_SESSION['loggedin']), 'HIBA:Nem vagy belépve');
        $result = query_futtatas('select *, datediff(now(), generalasi_datum) as kulonbseg from hausz_ts.felhasznalo_tokenek where user_id = '.$_SESSION['user_id']);
        die_if( $result->num_rows <= 0, "HIBA:Nincs");
        $row = $result->fetch_assoc();
        exit_ok('OK:'.$row['token'].'|'.(intval($row['kulonbseg']) > 5 ? 'igen' : 'nem'));
    }

    if( isset($_GET['uj_token_igenylese']) ) {
        die_if( !isset($_SESSION['loggedin']), "HIBA:Nem vagy belépve");
        $eredmeny = shell_exec('/var/www/html/teamspeak/create_token.sh');
        $eredmeny = preg_replace('/\s+/', '', $eredmeny);
        $eredmeny = preg_replace('/(.*)tokenid2=0token=(.*)error(.*)/', '$2', $eredmeny);
        
        $result = query_futtatas('select datediff(now(), generalasi_datum) as kulonbseg from hausz_ts.felhasznalo_tokenek where user_id = '.$_SESSION['user_id'].';');
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            die_if( $row['kulonbseg'] == 0, 'HIBA:Csak 5 naponként lehet új tokent igényelni. A jelenlegi tokened ma készült.');
            die_if( $row['kulonbseg'] < 5, 'HIBA:Csak 5 naponként lehet új tokent igényelni. A jelenlegi tokened '.$row['kulonbseg'].' napja készült.');
            query_futtatas('delete from hausz_ts.felhasznalo_tokenek where user_id = '.$_SESSION['user_id']);
        }
        $result = query_futtatas("insert into hausz_ts.felhasznalo_tokenek (user_id, token, generalasi_datum) values (".$_SESSION['user_id'].", '".$eredmeny."', now());");
        log_bejegyzes("teamspeak szerver", "új token készítés", $eredmeny, $_SESSION['username']);
        exit_ok('OK:Új token generálása kész');
    }
    
    if( isset($_GET['felhasznalok']) ) {
        die_if( !isset($_SESSION['loggedin']), "HIBA:Nem vagy belépve");

        $van_online_felhasznalo = false;
        $eredmeny = shell_exec('/var/www/html/teamspeak/list_clients.sh');
        $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
        $eredmeny = preg_replace('/[\n\r]/', ' ', $eredmeny);
        $eredmeny = explode('|', $eredmeny);
        $felhasznalok = array();
        
        foreach($eredmeny as $sor) {
            $sor = preg_replace('/(.*)client_nickname=(.*) client_type=(.*)/', '$2', $sor);
            if($sor != "serveradmin") {
                $sor = preg_replace('/\\\s/', ' ', $sor);
                $sor = preg_replace('/\\\p/', '|', $sor);
                array_push($felhasznalok, $sor);
                $van_online_felhasznalo = true;
            }
        }
        if( !$van_online_felhasznalo) {
            exit_ok('OK:Nincs online felhasználó');
        }
        echo 'OK:'.$felhasznalok[0].'\n';
        for ($i=1; $i < count($felhasznalok); $i++) { 
            echo $felhasznalok[$i].'\n';
        }
        die();
    }

    if( isset($_GET['szerver_statusz']) ) {
        $result = query_futtatas("select timestampdiff(second, datum, now(6)) as kulonbseg from hausz_ts.szolgaltatas_statusz order by datum desc limit 1;");
        $kell_statusz_update = 0;
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            if(intval($row['kulonbseg']) > 30) {
                $kell_statusz_update = 1;
            }
        } else {
            $kell_statusz_update = 1;
        }

        if($kell_statusz_update == 1) {
            $statusz = "";

            $eredmeny = shell_exec("pgrep -l 'ts3server'");
            if(preg_match('/(.*)ts3server(.*)/', $eredmeny, $matches)) {
                $statusz .= "folyamat ok";
            }
            $statusz .= ";";
            
            $eredmeny = shell_exec("/var/www/html/teamspeak/check_telnet.sh");
            $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
            if(preg_match('/(.*)elcome to the TeamSpeak 3 ServerQuery interface(.*)/', $eredmeny, $matches)) {
                $statusz .= "telnet ok";
            }
            $statusz .= ";";

            $eredmeny = "";
            $eredmeny = shell_exec("uptime");
            $eredmeny = preg_replace('/(.*)load average: ([0-9]\.[0-9][0-9]), ([0-9]\.[0-9][0-9]), ([0-9]\.[0-9][0-9])(.*)/', '$2;$3;$4', $eredmeny);
            $eredmeny = preg_replace('/\s/', '', $eredmeny);
            $statusz .= $eredmeny;

            $eredmeny = shell_exec('free');
            $eredmeny = preg_replace('/\n/', ' ', $eredmeny);
            $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
            $memoria_osszes = preg_replace('/(.*)Mem: ([0-9]*) (.*)/', '$2', $eredmeny);
            $memoria_szabad = preg_replace('/(.*)Mem: ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*) (.*)/', '$7', $eredmeny);
            $memoria_arany = (floatval($memoria_osszes) - floatval($memoria_szabad)) / floatval($memoria_osszes);

            $swap_osszes = preg_replace('/(.*)Swap: ([0-9]*) (.*)/', '$2', $eredmeny);
            $swap_szabad = preg_replace('/(.*)Swap: ([0-9]*) ([0-9]*) ([0-9]*)(.*)/', '$4', $eredmeny);
            $swap_arany = (floatval($swap_osszes) - floatval($swap_szabad)) / floatval($swap_osszes);

            $result_tarhely_adat = query_futtatas("select * from hausz_megoszto.tarhely_statisztika order by datum desc limit 1;");
            $row = $result_tarhely_adat->fetch_assoc();
            $tarhely_arany = floatval($row['szabad']) / floatval($row['foglalt']);
            
            $result = query_futtatas("delete from hausz_ts.szolgaltatas_statusz;");
            $result = query_futtatas("insert into hausz_ts.szolgaltatas_statusz (datum, statusz) values (now(6), '".$statusz.";".$memoria_arany.";".$swap_arany.";".$tarhely_arany."');");
        }

        $result = query_futtatas("select * from hausz_ts.szolgaltatas_statusz order by datum desc limit 1;");
        $row = $result->fetch_assoc();
        exit_ok('OK:'.$row['statusz']);
    }
?>