<?php 

    session_start();
    $dbname = "hausz_megoszto";
    include '../include/adatbazis.php';
    include '../include/alap_fuggvenyek.php';

    if( isset($_POST['belepteto_rendszer']) ) {
        include "../include/belepteto_rendszer.php";
        die();
    }

    if( $_GET['logout'] == "igen" ) {
        $_SESSION['loggedin'] = false;
        $_SESSION['username'] = '';
        $_SESSION['admin'] = false;
        unset($_SESSION['user_id']);
        $_GET['logout'] = "";
        echo 'OK:Kilépés sikeres.';
        die();
    }

    if( isset($_POST['body']) ) {
        printLn('<h1 style="text-align: center">Megosztó</h1>');
        printLn('<p style="text-align: center">Fájl megosztó szolgáltatás, ahol a felhasználók privát és publikus módon tudnak fájlokat megosztani egymással.</p>');
        printLn('<p style="text-align: center">Tölts fel egy fájlt, vagy nézd meg hogy mások mit töltöttek eddig fel.</p><br>');
        printLn('<h2 style="text-align: center">Feltöltés</h2>');
        printLn('<form class="center" enctype="multipart/form-data">');
        printLn('<label style="display: inline; width: 35%; margin:auto; font-size: 20px" for="fileToUpload" id="fileToUpload_label">&#128193; Kattints ide fájlok feltöltéséhez</label>');
        printLn('<input onChange="updateFileName()" class="InputSzoveg" type="file" name="fileToUpload" id="fileToUpload">');

        if($_SESSION['loggedin'] == "yes") {
            printLn('<div id="privat_doboz" style="margin-left: 10px; border-radius: 15px; font-size: 20px; display: inline; padding: 20px 10px; background-color: rgb(35, 35, 35);"><input type="checkbox" name="private" type="private" id="private" /><label for="private"> Privát tárolás</label></div>');
        }

        printLn('<div id="titkositasi_kulcs_doboz" style="margin-left: 10px; border-radius: 15px; font-size: 20px; display: inline; padding: 20px 35px;">');
        printLn('<label autocomplete="off" for="titkositas_kulcs">Titkosítás kulcs: </label>');
        printLn('<input autocomplete="off" type="password" name="titkositas_kulcs" type="titkositas_kulcs" id="titkositas_kulcs" /></div><br><br>');
        printLn('</form>');
        printLn('<br><br><button style="visibility: hidden; display: block; margin: auto" onclick="feltoltes()" class="Gombok KekHatter" id="SubmitGomb" hidden>Feltöltés</button>');
        die();
    }

    if( isset($_POST['tablazat']) ) {
        printLn('<h2 style="text-align: center">Feltöltött fájlok</h2>');
        printLn('<br><table style="display: table" class="center InputSzoveg">');
        printLn("<tr>");
            printLn("<th></th>");
            printLn("<th>Fájlnév</th>");
            printLn("<th>Dátum</th>");
            printLn("<th>Méret</th>");
            printLn("<th>Feltöltő</th>");
            printLn('<th colspan="4"><a onclick=\'szinkron_keres((uzenet) => { fajlok_resz = uzenet; tablazat_betoltese(); }, "/uploads/feltoltes.php", "fajlok");\'>🔃 Frissítés</a></th>');
        printLn("</tr>");
        die();
    }

    if( isset($_POST['fajlok']) ) {
        $query = "SELECT files.titkositott, files.id as 'id', files.size, filename, added, username, private FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC";
        $result = $conn->query($query);
        if($result) {
            if($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    if( ($row['private'] == '1' && strtolower($_SESSION['username']) != strtolower($row['username'])) or ($_SESSION['loggedin'] != "yes" && $row['private'] == '1') )
                        continue;

                    $kiterjesztes = preg_replace('/(.*)\.(.*)/', '$2', $row['filename']);
                    $preview_type = "other"; 
                    if(preg_match('/\.jpg$/i', $row['filename'])) { $preview_type = "image"; }
                    if(preg_match('/\.png$/i', $row['filename'])) { $preview_type = "image"; }
                    if(preg_match('/\.jpeg$/i', $row['filename'])) { $preview_type = "image"; }
                    if(preg_match('/\.bmp$/i', $row['filename'])) { $preview_type = "image"; }
                    if(preg_match('/\.webp$/i', $row['filename'])) { $preview_type = "image"; }
                    if(preg_match('/\.svg$/i', $row['filename'])) { $preview_type = "image"; }
                    if(preg_match('/\.gif$/i', $row['filename'])) { $preview_type = "image"; }
                    if(preg_match('/\.heic$/i', $row['filename'])) { $preview_type = "image"; }

                    if(preg_match('/\.mp3$/i', $row['filename'])) { $preview_type = "audio"; }
                    if(preg_match('/\.wav$/i', $row['filename'])) { $preview_type = "audio"; }

                    if(preg_match('/\.mkv$/i', $row['filename'])) { $preview_type = "video"; }
                    if(preg_match('/\.avi$/i', $row['filename'])) { $preview_type = "video"; }
                    if(preg_match('/\.mp4$/i', $row['filename'])) { $preview_type = "video"; }
                    if(preg_match('/\.webm$/i', $row['filename'])) { $preview_type = "video"; }

                    if(preg_match('/\.pdf$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.c$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.cpp$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.m$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.py$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.cs$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.txt$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.sql$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.xls$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.xlsx$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.doc$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.docx$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.ppt$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.pptx$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.ahk$/i', $row['filename'])) { $preview_type = "document"; }
                    if(preg_match('/\.md$/i', $row['filename'])) { $preview_type = "document"; }

                    if(preg_match('/\.exe$/i', $row['filename'])) { $preview_type = "software"; }
                    if(preg_match('/\.msi$/i', $row['filename'])) { $preview_type = "software"; }
                    if(preg_match('/\.iso$/i', $row['filename'])) { $preview_type = "software"; }
                    if(preg_match('/\.apk$/i', $row['filename'])) { $preview_type = "software"; }
                    if(preg_match('/\.rpm$/i', $row['filename'])) { $preview_type = "software"; }
                    if(preg_match('/\.deb$/i', $row['filename'])) { $preview_type = "software"; }
                    if(preg_match('/\.dmg$/i', $row['filename'])) { $preview_type = "software"; }
                    if(preg_match('/\.pkg$/i', $row['filename'])) { $preview_type = "software"; }
                    
                    if(preg_match('/\.torrent$/i', $row['filename'])) { $preview_type = "compressed"; }
                    if(preg_match('/\.zip$/i', $row['filename'])) { $preview_type = "compressed"; }
                    if(preg_match('/\.7z$/i', $row['filename'])) { $preview_type = "compressed"; }
                    if(preg_match('/\.tar$/i', $row['filename'])) { $preview_type = "compressed"; }
                    if(preg_match('/\.rar$/i', $row['filename'])) { $preview_type = "compressed"; }

                    if( $row['titkositott'] == '1') {
                        printLn('<tr onclick=\'titkositas_feloldasa("'.$row['id'].'", "'.$row['filename'].'")\'>');
                    } else {
                        printLn('<tr onclick=\'elonezet("https://hausz.stream/uploads/request.php?file_id='.$row['id'].'", "'.$preview_type.'", '.$row['size'].')\'>');
                    }
                    
                    $preview_emoji = "❔";
                    if($preview_type == "document") { $preview_emoji ='<abbr style="cursor: pointer" title="Dokumentum: '.$kiterjesztes.'">📝</abbr>'; }
                    if($preview_type == "audio") { $preview_emoji = '<abbr style="cursor: pointer" title="Audió: '.$kiterjesztes.'">🎵</abbr>'; }
                    if($preview_type == "image") { $preview_emoji = '<abbr style="cursor: pointer" title="Kép: '.$kiterjesztes.'">📷</abbr>'; }
                    if($preview_type == "video") { $preview_emoji = '<abbr style="cursor: pointer" title="Videó: '.$kiterjesztes.'">🎬</abbr>'; }
                    if($preview_type == "software") { $preview_emoji = '<abbr style="cursor: pointer" title="Szoftver: '.$kiterjesztes.'">💿</abbr>'; }
                    if($preview_type == "compressed") { $preview_emoji = '<abbr style="cursor: pointer" title="Tömörített fájl: '.$kiterjesztes.'">📦</abbr>'; }

                    printLn('<td class="emoji_cell" style="text-align: center">'.$preview_emoji.'</td>');
                    printLn('<td class="text-align-left">');
                    if( $row['private'] == '1') {   printLn('<abbr style="cursor: pointer" title="Privát">🔒</abbr> ');  }
                    if( $row['titkositott'] == '1') {   printLn('<abbr style="cursor: pointer" title="Titkosított">🔑</abbr> ');  }
                    printLn($row['filename'].'</td>');
                        
                    $datum_sajat_formatum = preg_replace('/\-/', '.', $row['added']);
                    $datum_sajat_formatum = preg_replace('/ /', ' - ', $datum_sajat_formatum);
                    $datum_sajat_formatum = preg_replace('/([0-9]?[0-9]:[0-9][0-9]):[0-9][0-9]/', '$1', $datum_sajat_formatum);
                    printLn('<td>'.$datum_sajat_formatum.'</td>');

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
                    
                    printLn('<td>'.$size.'</td>');
                    printLn('<td>'.$row['username'].'</td>');
                    if( strtolower($row['username'] == "ismeretlen") && $_SESSION['loggedin'] == "yes" ) {
                        printLn('<td><a onclick=\'claimeles("/uploads/feltoltes.php?claim=1&file_id='.$row['id'].'")\'>Claimelés</a></td>');
                    } else {
                        printLn('<td></td>');
                    }
                    if( (strtolower($_SESSION['username']) == strtolower($row['username']) && $_SESSION['loggedin'] == "yes") or (strtolower($row['username']) == "ismeretlen" && $_SESSION['loggedin'] == "yes")) {
                        printLn('<td class="emoji_cell"><a style="text-decoration: none" onclick="torles(&quot;/uploads/feltoltes.php?delete=1&file_id='.$row['id'].'&quot;, &quot;'.$row['filename'].'&quot;)"><abbr style="cursor: pointer" title="Törlés">❌</abbr></a></td>');
                        if( strtolower($row['username']) != "ismeretlen" ) {
                            printLn('<td class="emoji_cell">');
                            printLn('<a onclick="fajl_atnevezese(\''.$row['id'].'\', \''.$row['filename'].'\')"><abbr style="cursor: pointer" title="Átnevezés">✏️</abbr></a>');
                            printLn('</td>');
                        } else {
                            printLn('<td></td>');
                        }
                    } else {
                        printLn('<td></td><td></td>');
                    }

                    if($row['titkositott'] != '1') {
                        printLn('<td class="emoji_cell"><a href="/uploads/request.php?file_id='.$row['id'].'" style="text-decoration: none" download><abbr style="cursor: pointer" title="Letöltés">💾</abbr></a></td>');
                    } else {
                        printLn('<td class="emoji_cell"></td>');
                    }

                    
                    printLn("</tr>");
                }
            } else {
                printLn("<tr>");
                printLn('<td>-</td>');
                printLn('<td>-</td>');
                printLn('<td>-</td>');
                printLn('<td>-</td>');
                printLn('<td>-</td>');
                printLn('<td>-</td>');
                printLn('<td>-</td>');
                printLn('<td>-</td>');
                printLn('<td>-</td>');
                printLn("</tr>");
            }
        }
        die();
    }

    if( isset($_POST['fajlok_javascript']) ) {
        $query = "SELECT files.titkositott, files.id as 'id', files.size, filename, added, username, private FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC";
        $result = $conn->query($query);
        if($result) {
            if($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    if( ($row['private'] == '1' && strtolower($_SESSION['username']) != strtolower($row['username'])) or ($_SESSION['loggedin'] != "yes" && $row['private'] == '1') )
                        continue;
                    
                    echo '<'.$row['id'].'|'.$row['size'].'|'.$row['filename'].'|'.$row['added'].'|'.$row['username'].'|'.$row['private'].'>';
                }
            } else {
                echo '<-|-|-|-|-|-|->';
            }
        }
        die();
    }

    if( isset($_POST['tablazat_vege']) ) {
        printLn('</table><br><br><br>');
        die();
    }

    if( isset($_POST['tarhely_resz']) ) {
        $query_tarhely_adat = "select * from hausz_megoszto.tarhely_statisztika order by datum desc limit 1;";
        $result_tarhely_adat = $conn->query($query_tarhely_adat);
        $szabad_tarhely = "";
        $foglalt_tarhely = "";
        if(!$result_tarhely_adat) {
            var_dump($query_tarhely_adat);
            print('<br>');
            var_dump($conn->error);
            print('<br>');
        } else {
            $row = $result_tarhely_adat->fetch_assoc();
            $szabad_tarhely = $row['szabad'];
            $foglalt_tarhely = $row['foglalt'];
        }
        
        printLn('<h2 style="text-align: center">Tárhely kihasználtsága</h2>');


        $foglalt_tarhely_arany = ($foglalt_tarhely) / ($szabad_tarhely + $foglalt_tarhely) * 100;
        $szabad_tarhely_arany = 100 - (($foglalt_tarhely) / ($szabad_tarhely + $foglalt_tarhely) * 100);

        printLn('<div class="div_szabad_tarhely" style="border: 1px solid black; border-radius: 10px; display: flex; width: 55%; height: auto; margin: auto">');
            printLn('<div class="div_hasznalt_tarhely" id="div_hasznalt_tarhely" style="border-radius: 10px; padding: 10px; width:'.$foglalt_tarhely_arany.'%"><p id="hasznalt_tarhely">Felhasznált: </p></div>');
            printLn('<div class="div_szabad_tarhely" id="div_szabad_tarhely" style="border-radius: 10px; padding: 10px; width:'.$szabad_tarhely_arany.'%; text-align: right"><p id="szabad_tarhely">Szabad terület: </p></div>');
        printLn('</div><br><br><br>');

        $szabad_tarhely = intval($szabad_tarhely);
        $foglalt_tarhely = intval($foglalt_tarhely);

        if($szabad_tarhely > 1024 * 1024 * 1024) { $szabad_tarhely = round($szabad_tarhely/(1024*1024*1024), 2)." GB"; } else {
            if($szabad_tarhely > 1024 * 1024) { $szabad_tarhely = round($szabad_tarhely/(1024*1024), 2)." MB"; } else {
                if($szabad_tarhely > 1024) { $szabad_tarhely = round($szabad_tarhely/(1024), 2)." KB"; } else {
                    if($szabad_tarhely <= 1024) { $szabad_tarhely = $szabad_tarhely." B"; }
                }
            }
        }

        if($foglalt_tarhely > 1024 * 1024 * 1024) { $foglalt_tarhely = round($foglalt_tarhely/(1024*1024*1024), 2)." GB"; } else {
            if($foglalt_tarhely > 1024 * 1024) { $foglalt_tarhely = round($foglalt_tarhely/(1024*1024), 2)." MB"; } else {
                if($foglalt_tarhely > 1024) { $foglalt_tarhely = round($foglalt_tarhely/(1024), 2)." KB"; } else {
                    if($foglalt_tarhely <= 1024) { $foglalt_tarhely = $foglalt_tarhely." B"; }
                }
            }
        }

        printLn("<script>document.getElementById('szabad_tarhely').innerHTML = 'Szabad terület: ".strval($szabad_tarhely)."';</script>");
        printLn("<script>document.getElementById('hasznalt_tarhely').innerHTML = 'Felhasznált: ".strval($foglalt_tarhely)."';</script>");
    }

    function tarhely_statisztika_mentes() {
        global $conn;
        $df_eredmeny = exec("df -B1 | grep /dev/xvda1");
        $df_eredmeny = preg_replace("|/dev/xvda1 *([0-9]*) *([0-9]*) *([0-9]*) *([0-9]*%)(.*)|", "$3", $df_eredmeny);

        $du_eredmeny = exec("du -b /var/www/html/uploads/fajlok/");
        $du_eredmeny = preg_replace("/[^0-9]/", "", $du_eredmeny);

        $query_statisztika_mentes = "INSERT INTO hausz_megoszto.tarhely_statisztika (datum, szabad, foglalt) values (now(), '".$df_eredmeny."', '".$du_eredmeny."')";
        $result_statisztika_mentes = $conn->query($query_statisztika_mentes);
        if(!$result_statisztika_mentes) {
            var_dump($conn->error);
            printLn("<br>");
            var_dump($query_statisztika_mentes);
            printLn("<br>");
            die();
        }
    }

    if($_GET['atnevezes'] == '1') {
        header('X-Robots-Tag: noindex');
        if(strlen($_GET['uj_nev']) <= 0 || strlen($_GET['file_id']) <= 0) {
            echo('HIBA:Hiányzó uj_nev vagy file_id paraméter.');
            die();
        }

        $query = "select * from hausz_megoszto.files where filename='".$_GET['uj_nev']."';";
        $result = $conn->query($query);
        if(!$result) {
            echo('HIBA:'.$query);
            die();
        }
        if($result->num_rows > 0) {
            echo('HIBA:Már létezik fájl ezzel a névvel.');
            die();
        }

        $query = "select * from hausz_megoszto.files where id=".$_GET['file_id'].";";
        $result = $conn->query($query);
        if(!$result) {
            echo('HIBA:'.$query);
            die();
        }
        if($result->num_rows <= 0) {
            echo('HIBA:Nem létezik az átnevezendő fájl.');
            die();
        }
        $row = $result->fetch_assoc();
        if($row['user_id'] != $_SESSION['user_id'] && $row['user_id'] != '0') {
            echo('HIBA:Nem nevezheted át más fájljait.');
            die();
        }

        if(strlen($_GET['uj_nev']) > 250) {
            echo('HIBA:Nem lehet az új név 250 karakternél hosszabb.');
            die();
        }

        if(preg_match('/[^a-zA-Z0-9_-\.éáűőúöüóíÍÉÁŰŐÚÖÜÓ]/', $_GET['uj_nev'], $matches) ) {
            echo('HIBA:Illegális karakterek vannak az új névben: '.$matches);
            die();
        }

        if(!preg_match('/(.*)\.(.*)/', $_GET['uj_nev']) ) {
            echo('HIBA:Nincs kiterjesztés megadva az új névben.');
            die();
        }

        $eredmeny = "";
        $parancs = 'mv "/var/www/html/uploads/fajlok/'.$row['filename'].'" "/var/www/html/uploads/fajlok/'.$_GET['uj_nev'].'"';
        exec($parancs, $eredmeny, $retval);
        if($retval != 0) {
            echo('HIBA:"'.$parancs.'"');
            die();
        }

        $query = 'update hausz_megoszto.files set filename="'.$_GET['uj_nev'].'" where id = '.$_GET['file_id'];
        $result = $conn->query($query);
        if(!$result) {
            echo('HIBA:'.$query);
            die();
        }
        echo('OK:A(z) "'.$row['filename'].'" nevű fájl sikeresen át lett nevezve.');
        die();
    }

    if($_GET['delete'] == '1') {
        if($_SESSION['loggedin'] != "yes") {
            printLn('HIBA:Nem vagy belépve');
            die();
        }
        header('X-Robots-Tag: noindex');
        $query = "SELECT files.id, users.username, files.user_id, files.filename, files.added FROM files LEFT OUTER JOIN users ON files.user_id = users.id WHERE files.id = ".$_GET['file_id'];
        $result = $conn->query($query);
        if(!$result) {
            printLn('HIBA:'.$query);
            die();
        }
        if($result->num_rows <= 0) {
            printLn('HIBA:Nem létező fájl azonosító');
            die();
        }
        $row = $result->fetch_assoc();
        if(strtolower($_SESSION['username']) != strtolower($row['username']) && strtolower($row['username']) != "ismeretlen") {
            printLn('HIBA:Nem a tiéd a fájl');
            die();
        }
        $eredmeny = "";
        $parancs = 'rm "/var/www/html/uploads/fajlok/'.$row['filename'].'"';
        exec($parancs, $eredmeny, $retval);
        if($retval != 0) {
            printLn("HIBA:".$parancs);
            die();
        }
        tarhely_statisztika_mentes();
        $_GET['file'] = preg_replace("/'/", "\'", $_GET['file']);
        $query_del = "DELETE FROM files WHERE id = ".$_GET['file_id'];
        $result_del = $conn->query($query_del);
        if(!$result_del) {
            printLn("HIBA:".$query_del);
            die();
        }
        printLn('OK:&quot;'.$row['filename'].'&quot; nevű fájl törölve.');
        die();
    }

    if($_GET['claim'] == '1') {
        if($_SESSION['loggedin'] != "yes") {
            echo 'HIBA:Nem vagy belépve';
            die();
        }
        header('X-Robots-Tag: noindex');
        $query = "UPDATE files SET user_id = (SELECT id FROM users WHERE username = '".$_SESSION['username']."') WHERE id = ".$_GET['file_id'];
        $result = $conn->query($query);
        if(!$result) {
            echo('HIBA:'.$query);
            die();
        }
        $query = "select filename from files WHERE id = ".$_GET['file_id'];
        $result = $conn->query($query);
        if(!$result) {
            echo('HIBA:'.$query);
            die();
        }
        if($result->num_rows <= 0) {
            echo('HIBA:Nem létezik a claimelendő fájl');
            die();
        }
        $row = $result->fetch_assoc();
        echo('OK:A "' . $row['filename'] . '" nevű fájl sikeresen hozzá lett rendelve a fiókodhoz.');
        die();
    }

    if(isset($_POST["submit"]) || ($_POST["azonnali_feltoltes"]) == "igen") {
        if( strlen($_FILES["fileToUpload"]["name"]) <= 0 ) {   
            echo('Nem válaszottál ki fájlt a feltöltéshez.');
            die();
        }
        $_FILES["fileToUpload"]["name"] = preg_replace("/'/i", '', $_FILES["fileToUpload"]["name"]);
        $_FILES["fileToUpload"]["name"] = preg_replace('/"/i', '', $_FILES["fileToUpload"]["name"]);
        $target_file = "/var/www/html/uploads/fajlok/" . basename($_FILES["fileToUpload"]["name"]);
        $query_check = 'SELECT files.filename, files.user_id, users.username FROM hausz_megoszto.files LEFT OUTER JOIN hausz_megoszto.users ON users.id = files.user_id WHERE filename = "'.basename( $_FILES["fileToUpload"]["name"] ).'" COLLATE utf8mb4_general_ci;';
        $result_check = $conn->query($query_check);
        if(!$result_check) {
            echo('HIBA:'.$query_check);
            die();
        }
        if($result_check->num_rows > 0) {
            $row = $result_check->fetch_assoc();
            if( strtolower($row['username']) == strtolower($_SESSION['username']) && $_SESSION['loggedin'] == "yes" ) {
                $query_overwrite = 'DELETE FROM files WHERE filename = "'.basename( $_FILES["fileToUpload"]["name"] ).'"';
                $result_overwrite = $conn->query($query_overwrite);
                if(!$result_overwrite) {
                    echo('HIBA:Korábbi azonos fájl törlése sikertelen.');
                    die();
                }
            } else {
                echo('HIBA:Már létezik egy "' . $_FILES["fileToUpload"]["name"] . '" nevű fájl, amely nem a tiéd, ezért a feltöltés nem lehetséges.');
                die();
            }
        }

        $query_tarhely_adat = "select * from hausz_megoszto.tarhely_statisztika order by datum desc limit 1;";
        $result_tarhely_adat = $conn->query($query_tarhely_adat);
        $szabad_tarhely = "";
        if(!$result_tarhely_adat) {
            printLn('HIBA:'.$query_tarhely_adat);
            die();
        }
        $row = $result_tarhely_adat->fetch_assoc();
        $szabad_tarhely = floatval($row['szabad']);
    
        if($szabad_tarhely - $_FILES["fileToUpload"]['size'] < 250*1024*1024) {
            echo('HIBA:Nincs elég tárhely a fájl feltöltéséhez (250 MB).');
            die();
        }
        if( $_FILES["fileToUpload"]['size'] >= 200*1024*1024 ) {
            echo('HIBA:A fájl meghaladja a 200 MB-os méretlimitet.');
            die();
        }

        if(strlen($_POST['titkositas_kulcs']) > 0) {
            $plaintext = file_get_contents($_FILES['fileToUpload']['tmp_name']);
            exec('rm "'.$_FILES['fileToUpload']['tmp_name'].'"', $output, $retval);
            if($retval != 0) {
                printLn('HIBA:Eltávolítás nem sikerült.');
                die();
            }
            $key = $_POST['titkositas_kulcs'];
            $cipher = "aes-256-cbc";
            if ( in_array($cipher, openssl_get_cipher_methods()) )
            {
                $iv = "aaaaaaaaaaaaaaaa";
                
                $ciphertext = base64_encode(openssl_encrypt($plaintext, $cipher, $key, $options=0, $iv));
                //$original_plaintext = openssl_decrypt(base64_decode($ciphertext), $cipher, $key, $options=0, $iv);
            } else {
                foreach (openssl_get_cipher_methods() as $key) { printLn($key.'<br>'); }
                printLn('HIBA:Nem lehet titkosítani, mert nem jó a titkosítási algoritmus.');
                die();
            }
            ini_set('display_errors', 1);
            exec('touch "'.$target_file.'"', $output, $retval);
            if($retval != 0) {
                printLn('HIBA:Fájl készítése sikertelen.');
                die();
            }
            
            if ( !file_put_contents($target_file, $ciphertext) ) {
                $output = shell_exec('ls -l "'.$target_file.'"');
                var_dump($output);
                printLn('HIBA:Nem sikerül kiírni a fájlba a tartalmat: "'.$target_file.'"');
                die();
            }
        } else {
            if (!move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
                echo('HIBA:Sikertelen volt a fájl feltöltése.');
                die();
            }
        }

        $query_del2 = 'INSERT INTO `files` (filename, added, user_id, size, private, titkositott, titkositas_kulcs) VALUES ("'.basename( $_FILES["fileToUpload"]["name"] ).'", "'.date("Y-m-d H:i:s").'",';

        if($_SESSION['loggedin'] == "yes") {
            $query_del2 .= ' (SELECT id FROM users WHERE username = "'.$_SESSION['username'].'"), ';
        } else {
            $query_del2 .= ' 0, ';
        }
        if(isset($_POST['private'])) {
            $_POST['private'] = "1";
        } else { 
            $_POST['private'] = "0";
        }
        $query_del2 .= $_FILES["fileToUpload"]["size"].', '.$_POST['private'].', ';
        $titkositas = "0";
        if(strlen($_POST['titkositas_kulcs']) > 0) {
            $query_del2 .= '1, "'.password_hash($_POST['titkositas_kulcs'], PASSWORD_DEFAULT).'");';
        } else {
            $query_del2 .= '0, "");';
        }

        $result_del2 = $conn->query($query_del2);
        if(!$result_del2) {
            echo("HIBA: ".$query_del2); 
            die();
        }
        
        tarhely_statisztika_mentes();

        echo('OK:A "' . $_FILES["fileToUpload"]["name"] . '" nevű fájl sikeresen fel lett töltve.');
        die();
    }

    header('Location: /uploads/');
?>
