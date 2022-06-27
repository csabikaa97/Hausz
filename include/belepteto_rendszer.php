<?php

    session_start();
    
    function showLogin($reason) {
        printLn('<div id="belepes_doboz" class="center container bottom_left_corner_div">');
        if( strlen($reason) > 0 ) {   printLn("<p>".$reason."</p>"); }
        printLn("<div class='login'>");
        printLn("<form id='login' method='post'>");
        printLn("<input id='username' autocomplete='username' type='text' name='username' placeholder='Felhasználónév'><br>");
        printLn("<input id='current-password' autocomplete='current-password' type='password' name='password' placeholder='Jelszó'><br>");
        printLn("<input type='hidden' name='login' value='yes'><br>");
        printLn("<button id='bejelentkezes_gomb' type='submit'>Bejelentkezés</button>");
        printLn("</form>");
        printLn('<button onclick="location.href=\'/include/register.php\'" type="button">Regisztráció</button>');
        printLn("</div>");
        printLn("</div>");
    }

    function belepett_doboz() {
        printLn('<div id="belepes_doboz" class="container bottom_left_corner_div">');
        printLn('Belépve mint: '.$_SESSION['username']);
        printLn('<br><a href="'.$_SERVER['PHP_SELF'].'?logout=igen"><button id="kilepesgomb">Kilépés</button></a>');
        printLn('<br><a href="/include/change_password.php"><button id="jelszovaltoztatsgomb">Jelszó megváltoztatása</button></a>');
        if($_SESSION['admin'] == "igen") {
            printLn('<br><a href="#"><button onclick="window.open(\'https://hausz.stream:8080\')">Admin VScode</button></a>');
            printLn('<br><a href="#"><button onclick="window.location.href = \'https://hausz.stream/admin/admin.php\'">Admin felület</button></a>');
        }
        printLn('</div>');
    }

    function ujratoltes($szoveg) {
        $_SESSION['ujratoltes_szoveg'] = $szoveg;
        printLn('<script>window.location.href = "'.$_SERVER['PHP_SELF'].'";</script>');
        exit();
    }

    function belepes() {
        global $conn;
        $query = "SELECT * FROM users WHERE username='".$_POST['username']."'";
        $result = $conn->query($query);
        if($result) {
            if($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                if(password_verify($_POST['password'], $row['password'])) {
                    $_SESSION['loggedin'] = "yes";
                    $_SESSION['username'] = $row['username'];
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['admin'] = $row['admin'];
                } else {
                    showLogin("Hibás felhasználónév vagy jelszó");
                }
            } else {
                showLogin("Nincs ilyen felhasználó");
            }
        } else {
            ujratoltes("Fatal error in: '".$query."'");
        }
    }

    // kiírás innenstől kezdve van

    if($_GET['javascript'] == '1') {
        // Javascript oldalakhoz eredmény
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
    }
    
    // PHP oldalakhoz implementáció
    if( $_GET['logout'] == "igen" ) {
        $_SESSION['loggedin'] = false;
        $_SESSION['username'] = '';
        $_SESSION['admin'] = false;
        unset($_SESSION['user_id']);
        $_GET['logout'] = "";
        ujratoltes('Sikeres kilépés.');
    }

    if($_SESSION['loggedin'] == "yes") {
        belepett_doboz();
    } else {
        if($_POST['login']=="yes") {
            belepes();
            belepett_doboz();
        } else {
            showLogin("Nem vagy bejelentkezve!");
        }
    }

?>