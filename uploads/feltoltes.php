<!DOCTYPE html>
<html>
    <head>
		<title>Hausz megosztó</title>
		<meta charset="UTF-8">
		<link rel="stylesheet" type="text/css" href="/index/style.css" />
		<link rel="shortcut icon" type="image/png" href="/index/favicon.png"/>
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
                background-color: white;
            }

            #preview_box {
                padding: 10px;
                position: fixed;
                left: 20%;
                top: 25%;
                width: 60%;
                border: solid rgb(240, 240, 240) 1px;
                border-radius: 5px;
                background-color: white;
                z-index: 2;
            }
            #elonezet_bezaras_gomb {
                position: fixed;
                top: 10%;
                right: 10%;
                font-size: 30px;
            }
            #darken_background {
                position: fixed;
                top: 0px;
                left: 0px;
                width: 100%;
                height: 100%;
                background-color: black;
                opacity: 75%;
            }
        </style>
        <script>
            function torles(link, fajlnev) {
                if( confirm('Biztosan szeretnéd törölni a "' + fajlnev + '" nevű fájlt?') ) {
                    window.location.assign(link);
                }
            }

            function elonezet(hivatkozas, tipus, meret) {
                var caller = event.target;
                if(caller.outerHTML.match(/^<td/) ) {
                    if(meret > 1024*1024*2) {
                        alert('A fájl mérete nagyobb mint 2MB, ezért az előnézetet nem lehet hozzá betölteni.');
                    } else {
                        if(tipus == "image") {
                            document.getElementById('preview_box').innerHTML = '<img style="max-width: 100%" id="elonezet_iframe" src="' + hivatkozas + '" title="Előnézet" />';
                            document.getElementById('preview_box').style.height = "50%";
                        } else {
                            document.getElementById('preview_box').innerHTML = '<iframe style="width: 100%; height: 100%" id="elonezet_iframe" src="' + hivatkozas + '" title="Előnézet"></iframe>';
                            document.getElementById('preview_box').style.height = "70%";
                        }
                        document.getElementById('preview_box').hidden = false;
                        document.getElementById('darken_background').hidden = false;
                        document.getElementById('elonezet_bezaras_gomb').hidden = false;
                    }
                }
            }

            function elonezet_bezaras() {
                document.getElementById('preview_box').hidden = true;
                document.getElementById('darken_background').hidden = true;
                document.getElementById('elonezet_bezaras_gomb').hidden = true;
            }

            function $(id) { return document.getElementById(id); }

            window.onload = function() {
                document.addEventListener("keyup", function(event) {
                    if (event.key == "Escape") {
                        elonezet_bezaras();
                    }
                });

                fetch("https://hausz.stream/index/topbar.html")
				.then(response => response.text())
				.then(text => document.body.innerHTML = text + document.body.innerHTML)
            }
		</script>

        
        <div id='preview_box' hidden></div>
        <div id='darken_background' hidden onclick="elonezet_bezaras()"> </div>
        <button hidden id="elonezet_bezaras_gomb" onclick="elonezet_bezaras()">X</button>

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
                printLn("<center><div class='container' id='bottom_left_corner_div'>");
                printLn("<p>".$reason."</p>");
                printLn("<div class='login'>");
                printLn("<form action='feltoltes.php' method='post'>");
                printLn("<input type='text' name='username' placeholder='Felhasználónév'><br>");
                printLn("<input type='password' name='password' placeholder='Jelszó'><br>");
                printLn("<input type='hidden' name='login' value='yes'>");
                printLn("<button type='submit'>Bejelentkezés</button>");
                printLn("</form>");
                printLn('<a href="/uploads/register.php"><button>Regisztráció</button></a>');
                printLn("</div>");
                printLn("</div></center>");
            }

            function debug($data) {
                echo "<script>console.log('Debug: " . $data . "' );</script>";
            }

            printLn('<h1 style="text-align: center">Hausz megosztó</h1>');

            session_start();

            if( !empty($_GET['logout']) ) {
                $_SESSION['loggedin'] = false;
                $_SESSION['username'] = '';
                
                header("Location: feltoltes.php");
            }

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

            printLn('<center><form action="feltoltes.php" method="post" enctype="multipart/form-data">');
            printLn('<h3 style="font-weight: normal;">Válassz ki, vagy húzz ide egy fájlt a feltöltéshez</h3>');
            printLn('<input class="InputSzoveg" type="file" name="fileToUpload" id="fileToUpload"><br><br>');
            if($_SESSION['loggedin'] == true) { 
                printLn('<input type="checkbox" name="private" type="private" id="private" />Fájl privát tárolása<br><br>');
            }
            printLn('<button class="Gombok KekHatter" name="submit" type="submit" id="SubmitGomb">Feltöltés</button>');
            printLn('</form></center>');

            $target_file = "/var/www/html/uploads/fajlok/" . basename($_FILES["fileToUpload"]["name"]);
            debug("/uploads/fajlok/" . basename($_FILES["fileToUpload"]["name"]));

            if($_GET['delete'] == '1' && $_SESSION['loggedin'] == true) {
                $query = "SELECT files.id, users.username, files.user_id, files.filename, files.added FROM files LEFT OUTER JOIN users ON files.user_id = users.id WHERE files.id = ".$_GET['file_id'];
                $result = $conn->query($query);
                if($result) {
                    if($result->num_rows > 0) {
                        $row = $result->fetch_assoc();
                        if($_GET['file'] == $row['filename'] && strtolower($_SESSION['username']) == strtolower($row['username']) or strtolower($row['username']) == "ismeretlen" && $_GET['file_id'] == $row['id']) {
                            shell_exec('rm "/var/www/html/uploads/fajlok/'.$_GET['file'].'"');
                            //echo('rm "/var/www/html/uploads/fajlok/'.$_GET['file'].'"');
                            echo '<h1 style="text-align: center">"'.$_GET['file'].'" törölve.</h1>';
                            $query_del = "DELETE FROM files WHERE filename = '".$_GET['file']."' AND user_id = '".$row['user_id']."' AND id = ".$_GET['file_id'];
                            $result_del = $conn->query($query_del);
                        }
                    }
                } else {
                    die('Fatal error: '.$query);
                }
            }

            if($_GET['claim'] == '1' && $_SESSION['loggedin'] == true) {
                $query = "UPDATE files SET user_id = (SELECT id FROM users WHERE username = '".$_SESSION['username']."') WHERE id = ".$_GET['file_id'];
                $result = $conn->query($query);
                if($result) {
                    echo '<h1>A "' . $_GET['file'] . '" nevű fájl sikeresen hozzá lett rendelve a fiókodhoz.</h1>';
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
                    if( $_FILES["fileToUpload"]['size'] < 250*1024*1024 ) {
                        if (!move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
                            echo '<h1>Sikertelen volt a fájl feltöltése.</h1>';
                            //var_dump($_FILES["fileToUpload"]["tmp_name"]);
                        } else {
                            if($_SESSION['loggedin'] == true) {
                                if($_POST['private'] == "on") { $_POST['private'] = "1"; } else { $_POST['private'] = "0"; }
                                $query_del2 = 'INSERT INTO `files` (filename, added, user_id, size, private) VALUES ("'.basename( $_FILES["fileToUpload"]["name"] ).'", "'.date("Y-m-d H:i:s").'", (SELECT id FROM users WHERE username = "'.$_SESSION['username'].'"), '.$_FILES["fileToUpload"]["size"].', '.$_POST['private'].');';
                                $result_del2 = $conn->query($query_del2);
                                if(!$result_del2) {
                                    var_dump($result_del2);
                                    var_dump($conn->error);
                                    var_dump($query_del2);
                                    die();
                                }
                            } else {
                                $query_del2 = 'INSERT INTO `files` (filename, added, user_id, size, private) VALUES ("'.basename( $_FILES["fileToUpload"]["name"] ).'", "'.date("Y-m-d H:i:s").'", 0, '.$_FILES["fileToUpload"]["size"].', 0)';
                                $result_del2 = $conn->query($query_del2);
                            }
                            
                            echo '<h1 style="text-align: center">A "' . $_FILES["fileToUpload"]["name"] . '" nevű fájl sikeresen fel lett töltve.</h1>';
                            //echo "<a href='uploads/fajlok" . basename( $_FILES["fileToUpload"]["name"] ) . "'>uploads/fajlok/" . basename( $_FILES["fileToUpload"]["name"] ) . "</a>";
                        }
                    } else {
                        echo '<h1>A feltöltés sikertelen. A kiválasztott fájl meghaladja a 25 MB-os méretlimitet.</h1>';
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
		
            print('<br><center><table class="InputSzoveg">');
            print("<tr>");
            print("<th>Fájlnév</th>");
            print("<th>Dátum</th>");
            print("<th>Méret</th>");
            print("<th>Feltöltő</th>");
            print("<th></th>");
            print("<th></th>");
            print("<th></th>");
            print("<th></th>");
            print("</tr>");

            $query = "SELECT files.id as 'id', files.size, filename, added, username, private FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC";
            $result = $conn->query($query);
            if($result) {
                if($result->num_rows > 0) {
                    while($row = $result->fetch_assoc()) {
                        if( ($row['private'] == '1' && strtolower($_SESSION['username']) != strtolower($row['username'])) or ($_SESSION['loggedin'] != true && $row['private'] == '1') )
                            continue;

                        $kiterjesztes = preg_replace('/(.*)\.(.*)/', '$2', $row['filename']);
                        $preview_type = "";
                        if( 
                            preg_match('/jpg$/', $row['filename']) or
                            preg_match('/png$/', $row['filename']) or
                            preg_match('/jpeg$/', $row['filename']) or
                            preg_match('/bmp$/', $row['filename']) or
                            preg_match('/webp$/', $row['filename']) or
                            preg_match('/svg$/', $row['filename']) or
                            preg_match('/gif$/', $row['filename'])
                        ) { $preview_type = "image"; } else { $preview_type = "other"; }

                        print('<tr onclick=\'elonezet("https://hausz.stream/uploads/request.php?file_id='.$row['id'].'", "'.$preview_type.'", '.$row['size'].')\'>');

                        print('<td>');
                        if( $row['private'] == '1') {
                            print('<font style="color:red">PRIVÁT</font> ');
                        }
                        print($row['filename'].'</td>');
                            
                        $datum_sajat_formatum = preg_replace('/\-/', '.', $row['added']);
                        $datum_sajat_formatum = preg_replace('/ /', ' - ', $datum_sajat_formatum);
                        $datum_sajat_formatum = preg_replace('/([0-9]?[0-9]:[0-9][0-9]):[0-9][0-9]/', '$1', $datum_sajat_formatum);
                        print('<td>'.$datum_sajat_formatum.'</td>');

                        $size = " B";
                        if($row['size'] <= 1024) { $size = $row['size']." B"; }
                        if($row['size'] > 1024) { $size = round($row['size']/(1024), 2)." KB"; }
                        if($row['size'] > 1024 * 1024) { $size = round($row['size']/(1024*1024), 2)." MB"; }
                        if($row['size'] > 1024 * 1024 * 1024) { $size = round($row['size']/(1024*1024*1024), 2)." GB"; }

                        $size = preg_replace('/^([0-9][0-9][0-9][0-9])\.(.*) (.*)/', '$1 $3', $size);
                        $size = preg_replace('/^([0-9][0-9][0-9])\.([0-9])(.*) (.*)/', '$1 $4', $size);
                        $size = preg_replace('/^([0-9][0-9])\.([0-9])(.*) (.*)/', '$1.$2 $4', $size);
                        $size = preg_replace('/^([0-9])\.([0-9][0-9])(.*) (.*)/', '$1.$2 $4', $size);
                        $size = preg_replace('/(.*)\.0 (.*)/', '$1 $2', $size);
                        
                        print('<td>'.$size.'</td>');
                        print('<td>'.$row['username'].'</td>');
                        if( strtolower($row['username'] == "ismeretlen") && $_SESSION['loggedin'] == true ) {
                            print('<td><a href="/uploads/feltoltes.php?claim=1&file='.$row['filename'].'&file_id='.$row['id'].'">Claimelés</a></td>');
                        } else {
                            print('<td></td>');
                        }
                        if( (strtolower($_SESSION['username']) == strtolower($row['username']) && $_SESSION['loggedin'] == true) or (strtolower($row['username']) == "ismeretlen" && $_SESSION['loggedin'] == true)) {
                            print('<td><a style="text-decoration: none" onclick=\'torles("/uploads/feltoltes.php?delete=1&file='.$row['filename'].'&file_id='.$row['id'].'", "'.$row['filename'].'")\'>&#10060;</a></td>');
                        } else {
                            print('<td></td>');
                        }

                        //print('<td><a onclick=\'elonezet("/uploads/fajlok/'.$row['filename'].'", "'.$preview_type.'", '.$row['size'].')\'>&#128064;</a></td>');
                        print('<td></td>');

                        print('<td><a href="/uploads/request.php?file_id='.$row['id'].'" download>&#128190;</a></td>');
                        
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
                printLn("<div class='container' id='bottom_left_corner_div'>");
                printLn('Belépve mint: "'.$_SESSION['username'].'"');
                printLn('<br><a href="feltoltes.php?logout=1"><button id="kilepesgomb">Kilépés</button></a>');
                printLn('</div>');
            }

            print('</table></center>');
        ?>
    </body>
</html>
