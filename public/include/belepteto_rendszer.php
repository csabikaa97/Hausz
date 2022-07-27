<?php
    session_start();

    $dbname = "hausz_megoszto";
    include '../../forras/include/alap_fuggvenyek.php';
    include '../../forras/include/adatbazis.php';
    
    if( isset($_GET['statusz']) ) {
        die_if( !isset($_SESSION['loggedin']), 'Nem vagy belépve');
        exit_ok('"session_loggedin": "yes", "session_username": "'.$_SESSION['username'].'", "session_admin": "'.$_SESSION['admin'].'"');
    }

    if( isset($_GET['logout']) ) {
        unset( $_SESSION['loggedin'] );
        unset( $_SESSION['username'] );
        unset( $_SESSION['admin'] );
        unset( $_SESSION['user_id'] );
        exit_ok('Sikeres kilépés.');
    }

    if( isset($_POST['login'])) {
        $result = query_futtatas("SELECT * FROM users WHERE username='".$_POST['username']."'");
        die_if( $result->num_rows <= 0, "Nincs ilyen felhasználó");
        $row = $result->fetch_assoc();
        die_if( !password_verify($_POST['password'], $row['password']), "Hibás felhasználónév vagy jelszó");

        $_SESSION['loggedin'] = "yes";
        $_SESSION['username'] = $row['username'];
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['admin'] = $row['admin'];
        exit_ok('Sikeres belépés.');
    }
    
    exit_ok('Mi a parancs most?');
?>