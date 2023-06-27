<?php
    session_start();
    include '../../forras/include/adatbazis.php';
    include '../../forras/include/alap_fuggvenyek.php';

    adatbazis_csatlakozas("", "", "", "");

    die_if( !isset($_SESSION['loggedin']), 'Nem vagy belépve');

    if( isset($_GET['token_informacio']) ) {
        $result = query_futtatas('select *, datediff(now(), generalasi_datum) as kulonbseg from hausz_ts.felhasznalo_tokenek where user_id = '.$_SESSION['user_id']);
        die_if( $result->num_rows <= 0, "Jelenleg nincs jogosultsági tokened.");
        $row = $result->fetch_assoc();
        exit_ok('"token": "'.$row['token'].'", "jogosult_uj_token_keresere": "'.(intval($row['kulonbseg']) > 5 ? 'igen' : 'nem').'"');
    }

    if( isset($_GET['uj_token_igenylese']) ) {
        $eredmeny = shell_exec('/var/www/forras/teamspeak/create_token.sh');
        $eredmeny = preg_replace('/\s+/', '', $eredmeny);
        $eredmeny = preg_replace('/(.*)tokenid2=0token=(.*)error(.*)/', '$2', $eredmeny);
        
        $result = query_futtatas('select datediff(now(), generalasi_datum) as kulonbseg from hausz_ts.felhasznalo_tokenek where user_id = '.$_SESSION['user_id'].';');
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            die_if( $row['kulonbseg'] == 0, 'Csak 5 naponként lehet új tokent igényelni. A jelenlegi tokened ma készült.');
            die_if( $row['kulonbseg'] < 5, 'Csak 5 naponként lehet új tokent igényelni. A jelenlegi tokened '.$row['kulonbseg'].' napja készült.');
            query_futtatas('delete from hausz_ts.felhasznalo_tokenek where user_id = '.$_SESSION['user_id']);
        }
        $result = query_futtatas("insert into hausz_ts.felhasznalo_tokenek (user_id, token, generalasi_datum) values (".$_SESSION['user_id'].", '".$eredmeny."', now());");
        log_bejegyzes("teamspeak szerver", "új token készítés", $eredmeny, $_SESSION['username']);
        exit_ok('Új token generálása kész');
    }
    
    if( isset($_GET['felhasznalok']) ) {
        $van_online_felhasznalo = false;
        $eredmeny = shell_exec('/var/www/forras/teamspeak/list_clients.sh');
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
            exit_ok('"felhasznalok": 0');
        }
        $buffer = '"felhasznalok": [{"felhasznalonev": "'.$felhasznalok[0].'"}';
        for ($i=1; $i < count($felhasznalok); $i++) {
            $buffer .= ', {"felhasznalonev": "'.$felhasznalok[$i].'"}';
        }
        exit_ok($buffer.']');
    }

    if( isset($_GET['szerver_statusz']) ) {
        $buffer = "";

        
        $eredmeny = shell_exec("/var/www/forras/teamspeak/check_telnet.sh");
        $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
        if(preg_match('/(.*)elcome to the TeamSpeak 3 ServerQuery interface(.*)/', $eredmeny, $matches)) {
            $buffer = '"folyamat_ok": true, "telnet_ok": true';
        } else {
            $buffer = '"folyamat_ok": false, "telnet_ok": false';
        }
        
        $eredmeny = "";
        $eredmeny = shell_exec("uptime");
        
        $buffer .= preg_replace(    '/(.*)load average: ([0-9]\.[0-9][0-9]), ([0-9]\.[0-9][0-9]), ([0-9]\.[0-9][0-9])(.*)/'
        , ', "processzor_1perc": $2, "processzor_5perc": $3, "processzor_15perc": $4'
        , $eredmeny);
        
        $eredmeny = shell_exec('free');
        $eredmeny = preg_replace('/\n/', ' ', $eredmeny);
        $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
        $memoria_osszes = preg_replace('/(.*)Mem: ([0-9]*) (.*)/', '$2', $eredmeny);
        $memoria_szabad = preg_replace('/(.*)Mem: ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*) (.*)/', '$7', $eredmeny);
        $memoria_arany = (floatval($memoria_osszes) - floatval($memoria_szabad)) / floatval($memoria_osszes);
        
        $swap_osszes = preg_replace('/(.*)Swap: ([0-9]*) (.*)/', '$2', $eredmeny);
        $swap_szabad = preg_replace('/(.*)Swap: ([0-9]*) ([0-9]*) ([0-9]*)(.*)/', '$4', $eredmeny);
        $swap_arany = (floatval($swap_osszes) - floatval($swap_szabad)) / floatval($swap_osszes);
        
        $tarhely2 = shell_exec('df -B1');
        $tarhely2 = preg_replace('/[\n\r]/', '', $tarhely2);
        $hasznalt = preg_replace('/.*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*/', '$3', $tarhely2);
        $elerheto = preg_replace('/.*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*/', '$4', $tarhely2);
        $hasznalt = floatval($hasznalt);
        $elerheto = floatval($elerheto);
        $tarhely_beteltseg = $hasznalt / ($hasznalt + $elerheto);
        
        $buffer .= ', "memoria_hasznalat": '.$memoria_arany.', "swap_hasznalat": '.$swap_arany.', "lemez_hasznalat": '.$tarhely_beteltseg;
        
        exit_ok($buffer);
    }
?>