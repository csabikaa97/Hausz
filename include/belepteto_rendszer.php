<?php
    session_start();

    $dbname = "hausz_megoszto";
    include '../include/adatbazis.php';
    include '../include/alap_fuggvenyek.php';

    if( $_GET['statusz'] == '1') {
        if($_SESSION['loggedin'] == "yes") {
            echo 'OK:'.$_SESSION['username'].','.$_SESSION['admin'];
            die();
        } else {
            echo 'HIBA:Nem vagy belépve';
            die();
        }
    }

    if( $_GET['logout'] == "igen" ) {
        $_SESSION['loggedin'] = false;
        $_SESSION['username'] = '';
        $_SESSION['admin'] = false;
        unset($_SESSION['user_id']);
        $_GET['logout'] = "";
        echo('OK:Sikeres kilépés.');
        die();
    }

    if($_POST['login']=="yes") {
        $query = "SELECT * FROM users WHERE username='".$_POST['username']."'";
        $result = $conn->query($query);
        if(!$result) {
            echo("HIBA:".$query);
            die();
        }

        if($result->num_rows <= 0) {
            echo("HIBA:Nincs ilyen felhasználó");
            die();
        }

        $row = $result->fetch_assoc();
        if( !password_verify($_POST['password'], $row['password'])) {
            echo("HIBA:Hibás felhasználónév vagy jelszó");
            die();
        }

        $_SESSION['loggedin'] = "yes";
        $_SESSION['username'] = $row['username'];
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['admin'] = $row['admin'];
        echo 'OK:Sikeres belépés.';
        die();
    }

    echo 'HIBA:Mi a parancs most?';
    var_dump($_POST);
    die();
?>