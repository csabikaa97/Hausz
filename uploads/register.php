<!DOCTYPE html>
<html>
    <head>
		<title>Hausz megosztó</title>
		<meta charset="UTF-8">
		<link rel="stylesheet" type="text/css" href="/index/style.css" />
		<link rel="shortcut icon" type="image/png" href="/favicon.png"/>
	</head>
    <body>
        <style>
            #top_right_corner_div {
                position: absolute;
                bottom: 5px;
                left: 5px;
                margin: 0px;
            }

            #bottom_left_corner_div {
                padding: 10px;
                position: fixed;
                bottom: 5px;
                left: 5px;
                margin: 0px;
                border: solid rgb(240, 240, 240) 1px;
                border-radius: 5px;
            }
        </style>
        <script>
			fetch("https://hausz.stream/index/topbar.html")
				.then(response => response.text())
				.then(text => document.body.innerHTML = text + document.body.innerHTML)
		</script>

        <center>
        <h1>Hausz megosztó</h1>
        <p>Regisztráció</p>
        </center>

        <?php
            $servername = "127.0.0.1";
            $username = "root";
            $password = "root";
            $dbname = "hausz_megoszto";
            $conn = new mysqli($servername, $username, $password, $dbname);
            $conn->set_charset("utf8mb4");
            if ($conn->connect_error) {
                die("Connection failed: " . $conn->connect_error);
            }

            function printLn($string) {
                echo $string . "\n";
            }

            function debug($data) {
                echo "<script>console.log('Debug: " . $data . "' );</script>";
            }

            function showPage($reason) {
                printLn("<center>");
                printLn("<p>".$reason."</p>");
                printLn("<div class='register'>");
                printLn("<form action='register.php' method='post'>");
                printLn("<input type='text' name='register_username' placeholder='Felhasználónév'><br>");
                printLn("<input type='password' name='register_password' placeholder='Jelszó'><br>");
                printLn("<input type='password' name='register_password_confirm' placeholder='Jelszó megerősítése'><br>");
                printLn("<input type='hidden' name='register' value='yes'>");
                printLn("<button type='submit'>Regisztráció</button>");
                printLn("</form>");
                printLn("</div>");
                printLn('<br><br><a href="https://hausz.stream/uploads/feltoltes.php"><- Vissza a Hausz megosztóra</a>');
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

                $query_username_check = "select * from users where username = '".$_POST['register_username']."'";
                $result_username_check = $conn->query($query_username_check);
                if($result_username_check) {
                    $row = $result_username_check->fetch_assoc();
                    if(mysqli_num_rows($result_username_check) > 0) {
                        showPage('Ez a felhasználónév már foglalt');
                    }
                }
                
                $query_add = 'insert into hausz_megoszto.users_requested (username, password) values ("'.$_POST['register_username'].'", "'.password_hash($_POST['register_password'], PASSWORD_DEFAULT).'");';
                $result_add = $conn->query($query_add);

                if(!$result_add) {
                    printLn('<h3>A regisztrációs kérésed NEM került felvételre a Hausz rendszerben.</h3>');
                    var_dump($query_add);
                    var_dump($conn->error);
                }

                header("Location: https://hausz.stream/uploads/register.php?register_done=1");
            } else {
                showPage("");
            }
        ?>
    </body>
</html>
