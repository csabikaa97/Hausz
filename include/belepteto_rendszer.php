<?php
    function showLogin($reason) {
        printLn("<div class='center container' id='bottom_left_corner_div'>");
        if( strlen($reason) > 0 ) {   printLn("<p>".$reason."</p>"); }
        printLn("<div class='login'>");
        printLn("<form id='login' action='' method='post'>");
        printLn("<input id='username' autocomplete='username' type='text' name='username' placeholder='Felhasználónév'><br>");
        printLn("<input id='current-password' autocomplete='current-password' type='password' name='password' placeholder='Jelszó'><br>");
        printLn("<input type='hidden' name='login' value='yes'><br>");
        printLn("<button type='submit'>Bejelentkezés</button>");
        printLn("</form>");
        printLn('<button onclick=location.href="/include/register.php" type="button">Regisztráció</button>');
        printLn("</div>");
        printLn("</div>");
    }

    function ujratoltes($szoveg) {
        $_SESSION['ujratoltes_szoveg'] = $szoveg;
        printLn('<script>window.location.href = "'.$_SERVER['PHP_SELF'].'";</script>');
        exit();
    }
    
    if( $_GET['logout'] == "igen" ) {
        $_SESSION['loggedin'] = false;
        $_SESSION['username'] = '';
        unset($_SESSION['user_id']);
        $_GET['logout'] = "";
        ujratoltes('Sikeres kilépés.');
    }

    if($_SESSION['loggedin'] != "yes") {
        if($_POST['login']=="yes") {
            $query = "SELECT * FROM users WHERE username='".$_POST['username']."'";
            $result = $conn->query($query);
            if($result) {
                if($result->num_rows > 0) {
                    $row = $result->fetch_assoc();
                    if(password_verify($_POST['password'], $row['password'])) {
                        $_SESSION['loggedin'] = "yes";
                        $_SESSION['username'] = $row['username'];
                        $_SESSION['user_id'] = $row['id'];
                    } else {
                        showLogin("Hibás felhasználónév vagy jelszó");
                    }
                } else {
                    showLogin("Nincs ilyen felhasználó");
                }
            } else {
                ujratoltes("Fatal error in: '".$query."'");
            }
        } else {
            showLogin("Nem vagy bejelentkezve!");
        }
    }

    if($_SESSION['loggedin'] == "yes") {
        printLn("<div class='container' id='bottom_left_corner_div'>");
        printLn('Belépve mint: '.$_SESSION['username']);
        printLn('<br><a href="'.$_SERVER['PHP_SELF'].'?logout=igen"><button id="kilepesgomb">Kilépés</button></a>');
        printLn('<br><a href="/include/change_password.php"><button id="jelszovaltoztatsgomb">Jelszó megváltoztatása</button></a>');
        printLn('</div>');
    }
?>