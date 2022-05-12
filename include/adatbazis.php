<?php
    $servername = "127.0.0.1";
    $username = "root";
    $password = "root";
    $dbname = "hausz_megoszto";
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8mb4");
    if ($conn->connect_error) { 
        printLn("Nem sikerült csatlakozni az SQL szerverhez: " . $conn->connect_error);
        printLn("Kérlek vedd fel a kapcsolatot a rendszergazdával a csaba@hausz.stream e-mail címen.");
        die();
    }
?>