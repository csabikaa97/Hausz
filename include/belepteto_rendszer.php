<?php
    session_start();

    $dbname = "hausz_megoszto";
    include '../include/alap_fuggvenyek.php';
    include '../include/adatbazis.php';

    if( $_GET['statusz'] == '1') {
        die_if( $_SESSION['loggedin'] == "yes", 'OK:'.$_SESSION['username'].','.$_SESSION['admin']);
        die_if( $_SESSION['loggedin'] != "yes", 'HIBA:Nem vagy belépve');
    }

    if( $_GET['logout'] == "igen" ) {
        $_SESSION['loggedin'] = false;
        $_SESSION['username'] = '';
        $_SESSION['admin'] = false;
        unset($_SESSION['user_id']);
        $_GET['logout'] = "";
        exit_ok('OK:Sikeres kilépés.');
    }

    if($_POST['login']=="yes") {
        $query = "SELECT * FROM users WHERE username='".$_POST['username']."'";
        $result = $conn->query($query);
        
        die_if( !$result, "HIBA:".$query);
        die_if( $result->num_rows <= 0, "HIBA:Nincs ilyen felhasználó");
        $row = $result->fetch_assoc();
        die_if( !password_verify($_POST['password'], $row['password']), "HIBA:Hibás felhasználónév vagy jelszó");

        $_SESSION['loggedin'] = "yes";
        $_SESSION['username'] = $row['username'];
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['admin'] = $row['admin'];
        exit_ok('OK:Sikeres belépés.');
    }
    
    exit_ok('HIBA:Mi a parancs most?');
?>