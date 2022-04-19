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
        </style>
        <script>
			fetch("/index/topbar.html")
				.then(response => response.text())
				.then(text => document.body.innerHTML = text + document.body.innerHTML)
		</script>

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

            function showLogin($reason) {
                printLn("<!DOCTYPE html>");
                printLn("<html>");
                printLn("<head>");
                printLn("<title>Login</title>");
                printLn("<link rel='stylesheet' href='style.css' type='text/css'>");
                printLn("</head>");
                printLn("<body>");
                printLn("<div class='container'>");
                printLn("<p>".$reason."</p>");
                printLn("<div class='login'>");
                printLn("<form action='feltoltes.php' method='post'>");
                printLn("<input type='text' name='username' placeholder='Felhasználónév'><br>");
                printLn("<input type='password' name='password' placeholder='Jelszó'><br>");
                printLn("<input type='hidden' name='login' value='yes'>");
                printLn("<button type='submit'>Bejelentkezés</button>");
                printLn("</form>");
                printLn("</div>");
                printLn("</div>");
                printLn("</body>");
                printLn("</html>");
            }

            function debug($data) {
                echo "<script>console.log('Debug: " . $data . "' );</script>";
            }

            printLn('<h1>Hausz megosztó</h1>');

            session_start();
            if($_SESSION['loggedin'] == false) {
                if($_POST['login']=="yes") {
                    $query = "SELECT * FROM users WHERE username='".$_POST['username']."'";
                    $result = $conn->query($query);
                    if($result) {
                        if($result->num_rows > 0) {
                            $row = $result->fetch_assoc();
                            if(password_verify($_POST['password'], $row['password'])) {
                                $_SESSION['loggedin'] = true;
                                $_SESSION['username'] = $_POST['username'];
                            } else {
                                showLogin("Hibás felhasználónév vagy jelszó");
                            }
                        } else {
                            showLogin("Nincs ilyen felhasználó");
                        }
                    } else {
                        die("Fatal error in: '".$query."'");
                    }
                } else {
                    showLogin("Nem vagy bejelentkezve!");
                }
            }

            if( !empty($_GET['logout']) ) {
                $_SESSION['loggedin'] = false;
                $_SESSION['username'] = '';
                
                header("Location: feltoltes.php");
                exit();
            }

            if($_SESSION['loggedin'] == true) {
                printLn('<form action="feltoltes.php" method="post" enctype="multipart/form-data">');
                printLn('<p>Válassz ki egy fájlt a feltöltéshez</p>');
                printLn('<input class="InputSzoveg" type="file" name="fileToUpload" id="fileToUpload">');
                printLn('<button class="Gombok KekHatter" name="submit" type="submit" value="Kimenet" id="SubmitGomb">Feltöltés</button>');
                printLn('</form>');
            }

            $target_file = "/var/www/html/uploads/fajlok/" . basename($_FILES["fileToUpload"]["name"]);
            debug("/uploads/fajlok/" . basename($_FILES["fileToUpload"]["name"]));

            if($_GET['delete'] == '1') {
                $query = "SELECT files.id, users.username, files.user_id, files.filename, files.added FROM files LEFT OUTER JOIN users ON files.user_id = users.id WHERE files.id = ".$_GET['file_id'];
                $result = $conn->query($query);
                if($result) {
                    if($result->num_rows > 0) {
                        $row = $result->fetch_assoc();
                        if($_GET['file'] == $row['filename'] && strtolower($_SESSION['username']) == strtolower($row['username']) && $_GET['file_id'] == $row['id']) {
                            shell_exec('rm "/var/www/html/uploads/fajlok/'.$_GET['file'].'"');
                            //echo('rm "/var/www/html/uploads/fajlok/'.$_GET['file'].'"');
                            echo '<h1>"'.$_GET['file'].'" törölve.</h1>';
                            $query_del = "DELETE FROM files WHERE filename = '".$_GET['file']."' AND user_id = '".$row['user_id']."' AND id = ".$_GET['file_id'];
                            $result_del = $conn->query($query_del);
                        }
                    }
                } else {
                    die('Fatal error: '.$query);
                }
            }

            if(isset($_POST["submit"])) {
                $goforupload = false;
                $query_del = 'USE hausz_megoszto;';
                $query_check = 'SELECT files.filename, files.user_id, users.username FROM files LEFT OUTER JOIN users ON users.id = files.user_id WHERE filename = "'.basename( $_FILES["fileToUpload"]["name"] ).'"';
                $result_check = $conn->query($query_check);
                if($result_check) {
                    if($result_check->num_rows > 0) {
                        $row = $result_check->fetch_assoc();
                        debug('Már van egy ilyen nevű fájl a szerveren.');

                        if( strtolower($row['username']) == strtolower($_SESSION['username']) ) {
                            $query_overwrite = 'DELETE FROM files WHERE filename = "'.basename( $_FILES["fileToUpload"]["name"] ).'"';
                            $result_overwrite = $conn->query($query_overwrite);
                            if(!$result_overwrite) {
                                printLn('Korábbi azonos fájl törlése sikertelen');
                            } else {
                                $goforupload = true;
                            }
                        } else {
                            debug('Nem egyezik a felhasználónév, ezért a felülírás nem lehetséges.');
                            echo '<h1>Már létezik egy "' . $_FILES["fileToUpload"]["name"] . '" nevű fájl, amely nem a tiéd, ezért a feltöltés nem lehetséges.</h1>';
                            $goforupload = false;
                        }
                    } else {
                        debug('Nincs azonos nevű fájl. OK');
                        $goforupload = true;
                    }
                } else {
                    debug('Query hiba: '.$query_check);
                    printLn('Query hiba: '.$query_check);
                    $goforupload = false;
                }
                if($goforupload == true) {
                    if (!move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
                        echo '<h1>Sikertelen volt a fájl feltöltése.</h1>';
                        //var_dump($_FILES["fileToUpload"]["tmp_name"]);
                    } else {
                        $query_del2 = 'INSERT INTO `files` (filename, added, user_id) VALUES ("'.basename( $_FILES["fileToUpload"]["name"] ).'", "'.date("Y-m-d H:i:s").'", (SELECT id FROM users WHERE username = "'.$_SESSION['username'].'"));';
                        $result_del2 = $conn->query($query_del2);
                        echo '<h1>A "' . $_FILES["fileToUpload"]["name"] . '" nevű fájl sikeresen fel lett töltve.</h1>';
                        //echo "<a href='uploads/fajlok" . basename( $_FILES["fileToUpload"]["name"] ) . "'>uploads/fajlok/" . basename( $_FILES["fileToUpload"]["name"] ) . "</a>";
                    }
                }

                //var_dump($query_del);
                //var_dump($query_del2);
                
                $result_del = $conn->query($query_del);
                //var_dump($result_del);
                //var_dump($result_del2);
                
                unset($_FILES["fileToUpload"]);
                unset($_FILES["fileToUpload"]["tmp_name"]);
                unset($_POST["submit"]);
            }
		
            print("<table>");
            print("<tr>");
            print("<th>Fájlnév</th>");
            print("<th>Dátum</th>");
            print("<th>Feltöltő</th>");
            print("<th>Törlés</th>");
            print("</tr>");

            $query = "SELECT files.id as 'id', filename, added, username FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC";
            $result = $conn->query($query);
            if($result) {
                if($result->num_rows > 0) {
                    while($row = $result->fetch_assoc()) {
                        print("<tr>");
                        print('<td><a href="/uploads/fajlok/'.$row['filename'].'">'.$row['filename']."</a></td>");
                        print('<td>'.$row['added'].'</td>');
                        print('<td>'.$row['username'].'</td>');
                        if( strtolower($_SESSION['username']) != strtolower($row['username']) ) {
                            print('<td></td>');
                        } else {
                            print('<td><a href="/uploads/feltoltes.php?delete=1&file='.$row['filename'].'&file_id='.$row['id'].'">X</a></td>');
                        }
                        print("</tr>");
                    }
                } else {
                    print("<tr>");
                    print('<td>-</td>');
                    print('<td>-</td>');
                    print('<td>-</td>');
                    print('<td>-</td>');
                    print("</tr>");
                }
            }

            if($_SESSION['loggedin'] == true) {
                printLn('<div id="top_right_corner_div">');
                printLn('Belépve mint: "'.$_SESSION['username'].'"');
                printLn('<a href="feltoltes.php?logout=1"><button id="kilepesgomb">Kilépés</button></a>');
                printLn('</div>');
            }
        ?>
    </body>
</html>
