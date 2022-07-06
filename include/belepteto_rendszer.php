<?php
    session_start();

    $dbname = "hausz_megoszto";
    include '../include/alap_fuggvenyek.php';
    include '../include/adatbazis.php';

    if( isset($_GET['statusz']) ) {
        die_if( !isset($_SESSION['loggedin']), 'HIBA:Nem vagy belépve');
        exit_ok('OK:'.$_SESSION['username'].','.$_SESSION['admin']);
    }

    if( isset($_GET['logout']) ) {
        unset( $_SESSION['loggedin'] );
        unset( $_SESSION['username'] );
        unset( $_SESSION['admin'] );
        unset( $_SESSION['user_id'] );
        exit_ok('OK:Sikeres kilépés.');
    }

    if( isset($_POST['login'])) {
        $result = query_futtatas("SELECT * FROM users WHERE username='".$_POST['username']."'");
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