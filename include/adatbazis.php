<?php
    $servername = "127.0.0.1";
    $username = "root";
    $password = "root";
    $dbname = "hausz_megoszto";
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8mb4");
    if ($conn->connect_error) { die("Nem sikerült csatlakozni az SQL szerverhez: " . $conn->connect_error); }
?>