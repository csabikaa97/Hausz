<?php
    session_start();
    include '../../forras/include/adatbazis.php';
    include '../../forras/include/alap_fuggvenyek.php';

    adatbazis_csatlakozas("", "", "", "");
    
    if( isset($_GET['statusz']) ) {
        die_if( !isset($_SESSION['loggedin']), 'Nem vagy belépve');
        exit_ok('"session_loggedin": "yes", "session_username": "'.$_SESSION['username'].'", "session_admin": "'.$_SESSION['admin'].'"');
    }

    if( isset($_POST['get_salt']) ) {
        $salt_username = '';
        if( $_SESSION['loggedin'] == 'yes' ) {
            $salt_username = $_SESSION['username'];
        } else {
            die_if( !isset($_POST['username']), 'Nem adtál meg felhasználónevet');
            $salt_username = $_POST['username'];
        }

        $result = query_futtatas("SELECT * FROM users WHERE username='".$salt_username."'");

        die_if( $result->num_rows <= 0, "Nincs ilyen felhasználó");
        
        $row = $result->fetch_assoc();

        die_if( substr($row['sha256_password'], 0, 5) != '$SHA$', '"salt": "none"' );

        $password_in_db = explode('$', $row['sha256_password']);
        $salt_in_db = $password_in_db[2];

        exit_ok('"salt": "'.$salt_in_db.'"');
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
        die_if( $result->num_rows <= 0, "Hibás felhasználónév vagy jelszó");
        $row = $result->fetch_assoc();

        die_if( !isset($_POST['password']) && !isset($_POST['sha256_password']), "Nem adtál meg jelszót");
        
        if( isset($_POST['password']) ) {
            die_if( !password_verify($_POST['password'], $row['password']), "Hibás felhasználónév vagy jelszó");

            $random_salt = substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil(64/strlen($x)) )),1,64);

            // TODO: check incoming password with regex, to prevent SQL injection
        
            $jelszo = hash("sha256", $_POST['password']);
            $salted_hash = hash("sha256", $jelszo.$random_salt);
            $result = query_futtatas('UPDATE users SET sha256_password="$SHA$'.$random_salt.'$'.$salted_hash.'" WHERE id="'.$row['id'].'"');
            log_bejegyzes("hausz_alap", "jelszó upgrade SHA256-ra", $_POST['username'], "");
        }
        
        if( isset($_POST['sha256_password']) ) {
            $password_in_db = explode('$', $row['sha256_password']);
            $password_in_db = $password_in_db[3];
            die_if( $_POST['sha256_password'] != $password_in_db, "Hibás felhasználónév vagy jelszó");
        }

        $_SESSION['loggedin'] = "yes";
        $_SESSION['username'] = $row['username'];
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['admin'] = $row['admin'];
        exit_ok('Sikeres belépés.');
    }
    
    exit_ok('Mi a parancs most?');
?>