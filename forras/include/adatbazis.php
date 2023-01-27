<?php
    $conn = null;

    function adatbazis_csatlakozas($servername, $username, $password, $dbname) {
        global $conn;
        if( $servername == "" )
            $servername = "172.20.128.10";
        if( $username == "")
            $username = "root";
        if( $password == "")
            $password = "root";
        if( $dbname == "")
            $dbname = "hausz_megoszto";
        
        $conn[$dbname] = new mysqli($servername, $username, $password, $dbname);
        $conn[$dbname]->set_charset("utf8mb4");
        die_if( $conn[$dbname]->connect_error, "Nem sikerült csatlakozni az SQL szerverhez: " . $conn[$dbname]->connect_error . "\nKérlek vedd fel a kapcsolatot a rendszergazdával a csaba@hausz.stream e-mail címen.");
    }

    function log_bejegyzes($szolgaltatas, $bejegyzes, $komment, $felhasznalo) {
        global $conn;
        $result = query_futtatas('insert into hausz_log.log (szolgaltatas, bejegyzes, komment, felhasznalo, datum) values ("'.$szolgaltatas.'", "'.$bejegyzes.'", "'.$komment.'", "'.$felhasznalo.'", now(6));');
    }
?>