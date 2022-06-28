<!DOCTYPE html>
<html lang="hu">
    <head>
		<title>Regisztráció - Hausz</title>
		<meta charset="UTF-8">
		<link rel="stylesheet" type="text/css" href="/index/style.css" />
        <link rel="stylesheet" type="text/css" href="/index/alapok.css" />
		<link rel="shortcut icon" type="image/png" href="/index/favicon.png"/>
        <meta name="color-scheme" content="dark light">
	</head>
    <body>
        <script src="/include/topbar.js"></script>
        <script src="/include/alap_fuggvenyek.js"></script>

        <h1 style="kozepre-szoveg">Hausz regisztráció</h1>

        <?php
            $dbname = "hausz_megoszto";
            include '../include/adatbazis.php';
            include '../include/alap_fuggvenyek.php';

            function showPage($reason) {
                printLn("<center>");
                printLn("<p>".$reason."</p>");
                printLn("<div class='register'>");
                printLn("<form id='register' action='register.php' method='post'>");
                printLn("<input type='text' name='register_username' placeholder='Felhasználónév'><br>");
                printLn("<input autocomplete='password' id='password' type='password' name='register_password' placeholder='Jelszó'><br>");
                printLn("<input autocomplete='password' id='password' type='password' name='register_password_confirm' placeholder='Jelszó megerősítése'><br>");
                printLn("<input type='text' name='register_email' placeholder='E-mail cím (opcionális)'><br>");
                printLn("<input type='hidden' name='register' value='yes'>");
                printLn("<button type='submit'>Regisztráció</button>");
                printLn("</form>");
                printLn("</div>");
                printLn("</center>");
                die();
            }

            if($_GET['register_done'] == '1') {
                showPage('A regisztrációs kérésed felvételre került a Hausz rendszerben.');
            }

            if($_POST['register'] == "yes") {
                if(strlen($_POST['register_username']) == 0) { showPage('Nem adtál meg felhasználónevet'); }
                if(strlen($_POST['register_password']) == 0) { showPage('Nem adtál meg jelszót'); }
                if(strlen($_POST['register_password_confirm']) == 0) { showPage('Nem erősítetted meg a jelszavad'); }
                if(strlen($_POST['register_username']) < 3) { showPage('Túl rövid a felhasználóneved (minimum 3 karakter hosszúnak kell lennie)'); }
                if(strlen($_POST['register_password']) < 5) { showPage('Túl rövid a jelszavad (minimum 5 karakter hosszúnak kell lennie)'); }
                if(preg_match('/[^a-zA-Z0-9-\.#/\\áűőúüóöéí]/', $_POST['register_username'])) { showPage('Illegális karaktert tartalmaz a felhasználóneved'); }
                if($_POST['register_password'] != $_POST['register_password_confirm']) { showPage('Nem egyeznek a megadott jelszavak'); }
                if(!preg_match('/^\S+@\S+\.\S+$/', $_POST['register_email']) && strlen($_POST['register_email']) > 0) { showPage('Helytelen e-mail cím formátum'); }

                $query_username_check = "select * from users where username = '".$_POST['register_username']."'";
                $result_username_check = $conn->query($query_username_check);
                if($result_username_check) {
                    $row = $result_username_check->fetch_assoc();
                    if(mysqli_num_rows($result_username_check) > 0) {
                        showPage('Ez a felhasználónév már foglalt');
                    }
                }

                $query_username_check = "select * from users_requested where username = '".$_POST['register_username']."'";
                $result_username_check = $conn->query($query_username_check);
                if($result_username_check) {
                    $row = $result_username_check->fetch_assoc();
                    if(mysqli_num_rows($result_username_check) > 0) {
                        showPage('Ez a felhasználónév már meg lett igényelve');
                    }
                }
                
                $query_add = 'insert into hausz_megoszto.users_requested (username, password, email) values ("'.$_POST['register_username'].'", "'.password_hash($_POST['register_password'], PASSWORD_DEFAULT).'", ';
                if( strlen($_POST['register_email']) > 0 ) {
                    $query_add = $query_add.'"'.$_POST['register_email'].'");';
                } else {
                    $query_add = $query_add.' null);';
                }
                $result_add = $conn->query($query_add);

                if(!$result_add) {
                    var_dump($query_add);
                    var_dump($conn->error);
                    showpage('A regisztrációs kérésed NEM került felvételre a Hausz rendszerben.');
                }

                header("Location: https://hausz.stream/include/register.php?register_done=1");
            } else {
                showPage("");
            }
        ?>
    </body>
</html>
