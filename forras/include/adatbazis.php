<?php
    $servername = "172.20.128.1";
    $username = "root";
    $password = "root";
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8mb4");
    die_if( $conn->connect_error, "Nem sikerült csatlakozni az SQL szerverhez: " . $conn->connect_error . "\nKérlek vedd fel a kapcsolatot a rendszergazdával a csaba@hausz.stream e-mail címen.");

    function log_bejegyzes($szolgaltatas, $bejegyzes, $komment, $felhasznalo) {
        global $conn;
        $result = query_futtatas('insert into hausz_log.log (szolgaltatas, bejegyzes, komment, felhasznalo, datum) values ("'.$szolgaltatas.'", "'.$bejegyzes.'", "'.$komment.'", "'.$felhasznalo.'", now(6));');
    }
?>