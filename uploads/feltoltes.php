<?php session_start(); ?>
<!DOCTYPE html>
<html lang="hu">
    <head>
		<title>Hausz megosztó</title>
		<meta charset="UTF-8">
        <meta name="description" content="A Hausz Kft. megosztó szolgáltatása, ahol fájlokat lehet megosztani privát és publikus módon, anonim és regisztrált felhasználók által egyaránt.">
		<link rel="stylesheet" type="text/css" href="/index/style.css" />
		<link rel="shortcut icon" type="image/png" href="/index/favicon.png"/>
        <script type='application/ld+json'> 
            {
                "@context": "https://www.schema.org",
                "@type": "product",
                "brand": "Hausz",
                "logo": "http://hausz.stream/index/favicon.png",
                "name": "WidgetPress",
                "category": "Widgets",
                "image": "http://hausz.stream/index/favicon.png",
                "description": "A Hausz Kft. megosztó szolgáltatása, ahol fájlokat lehet megosztani privát és publikus módon, anonim és regisztrált felhasználók által egyaránt.",
                "aggregateRating": {
                    "@type": "aggregateRating",
                    "ratingValue": "5",
                    "reviewCount": "69"
                }
            }
        </script>
	</head>
    <body>
        <script>
            function torles(link, fajlnev) {
                if( confirm('Biztosan szeretnéd törölni a "' + fajlnev + '" nevű fájlt?') ) {
                    window.location.assign(link);
                }
            }

            function PrivatFeltoltesAtallitasa() {
                document.getElementById('private').checked = !document.getElementById('private').checked;
                if(document.getElementById('private').checked) {
                    document.getElementById('private_label_div').classList.add('ZoldHatter');
                    document.getElementById('private_text').innerHTML = "Fájl privát tárolása";
                } else {
                    document.getElementById('private_label_div').classList.remove('ZoldHatter');
                    document.getElementById('private_text').innerHTML = "Fájl publikus tárolása";
                }
            }

            function elonezet(hivatkozas, tipus, meret) {
                var caller = event.target;
                if(caller.outerHTML.match(/^<td/) ) {
                    if(meret > 1024*1024*2) {
                        alert('A fájl mérete nagyobb mint 2MB, ezért az előnézetet nem lehet hozzá betölteni. Amúgy eskü azért mert egy fizikai limitáció, és véletlenül sem azért mert spórolni akarok az elküldött adatmennyiség költségén xddddáű');
                    } else {
                        document.getElementById('preview_box').style.visibility = '';
                        document.getElementById('darken_background').style.visibility = '';
                        document.getElementById('elonezet_bezaras_gomb').style.visibility = '';

                        
                        if(tipus == "image") {
                            document.getElementById('preview_box').innerHTML = '<img alt="előnézet" id="elonezet_iframe" src="' + hivatkozas + '" title="Előnézet" />';
                            return;
                        }
                        if(tipus == "audio") {
                            document.getElementById('preview_box').innerHTML = '<audio controls><source src="'+hivatkozas +'" type="audio/mpeg" /></audio>';
                            return;
                        }

                        document.getElementById('preview_box').innerHTML = '<iframe style="height: 100%; width: 100%" id="elonezet_iframe" src="' + hivatkozas + '" title="Előnézet"></iframe>';
                        document.getElementById('preview_box').style.height = '100%'
                        document.getElementById('preview_box').style.width = '80%'
                    }
                }
            }

            function fajl_atnevezese(id, fajlnev) {
                document.getElementById('atnevezes_box').style.visibility = '';
                document.getElementById('darken_background').style.visibility = '';
                document.getElementById('elonezet_bezaras_gomb').style.visibility = '';
                document.getElementById('atnevezes_uj_nev').placeholder = fajlnev;
                document.getElementById('atnevezes_uj_nev').value = fajlnev;
                document.getElementById('atnevezes_uj_nev').azonosito = id;
            }

            function atnevezes_inditasa() {
                link = "https://hausz.stream/uploads/feltoltes.php?atnevezes=1&file_id=" + document.getElementById('atnevezes_uj_nev').azonosito + "&uj_nev=" + document.getElementById('atnevezes_uj_nev').value;
                window.location.assign(link);
            }

            function elonezet_bezaras() {
                document.getElementById('preview_box').style.visibility = 'hidden';
                document.getElementById('atnevezes_box').style.visibility = 'hidden';
                document.getElementById('darken_background').style.visibility = 'hidden';
                document.getElementById('elonezet_bezaras_gomb').style.visibility = 'hidden';
                document.getElementById('preview_box').innerHTML = "";
            }

            function $(id) { return document.getElementById(id); }

            function updateFileName() {
                document.getElementById('fileToUpload_label').innerHTML = "&#128193; "+ document.getElementById('fileToUpload').files[0].name;
                document.getElementById('SubmitGomb').hidden = false;
            }

            window.onload = function() {
                document.getElementById("fileToUpload").addEventListener("input", updateFileName);
                document.addEventListener("keyup", function(event) {
                        if (event.key == "Escape") {
                            elonezet_bezaras();
                        }
                    }
                );
                fetch("https://hausz.stream/index/topbar.html")
                    .then(response => response.text())
                    .then(text => document.body.innerHTML = text + document.body.innerHTML)
            }
		</script>

        
        <div id='preview_box' class="preview_box" style="max-width: 60%; max-height: 60%;display: inline-block; visibility: hidden"></div>
        <div id='atnevezes_box' class="preview_box center" style="max-width: 60%; max-height: 60%;display: inline-block; visibility: hidden">
            <h3>Fájl átnevezése</h3>
            <label for="atnevezes_uj_nev">Add meg a fájl új nevét (kiterjesztéssel együtt)</label><br><br>
            <input type="text" id="atnevezes_uj_nev" name="atnevezes_uj_nev" placeholder="" style="width: 100%"/><br><br><br>
            <button class="Gombok KekHatter" onclick="atnevezes_inditasa()">Átnevezés</button>
        </div>
        <div id='darken_background' onclick="elonezet_bezaras()" style="visibility: hidden"> </div>
        <button id="elonezet_bezaras_gomb" onclick="elonezet_bezaras()" style="visibility: hidden">X</button>

        <?php
            $dbname = "hausz_megoszto";
            include '../include/adatbazis.php';
            include '../include/alap_fuggvenyek.php';
            include "../include/belepteto_rendszer.php";

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

            if($_GET['atnevezes'] == '1') {
                if(strlen($_GET['uj_nev']) <= 0 || strlen($_GET['file_id']) <= 0) {
                    ujratoltes('HIBA: Hiányzó uj_nev vagy file_id paraméter.');
                }

                $query = "select * from hausz_megoszto.files where filename='".$_GET['uj_nev']."';";
                $result = $conn->query($query);
                if(!$result) {
                    ujratoltes('Query hiba: '.$query);
                }
                if($result->num_rows > 0) {
                    ujratoltes('Már létezik fájl ezzel a névvel.');
                }

                $query = "select * from hausz_megoszto.files where id=".$_GET['file_id'].";";
                $result = $conn->query($query);
                if(!$result) {
                    ujratoltes('Query hiba: '.$query);
                }
                if($result->num_rows <= 0) {
                    ujratoltes('Nem létezik az átnevezendő fájl.');
                }
                $row = $result->fetch_assoc();
                if($row['user_id'] != $_SESSION['user_id'] && $row['user_id'] != '0') {
                    ujratoltes('Nem nevezheted át más fájljait.');
                }

                if(strlen($_GET['uj_nev']) > 250) {
                    ujratoltes('Nem lehet az új név 250 karakternél hosszabb.');
                }

                if(preg_match('/[^a-zA-Z0-9_-\.éáűőúöüóíÍÉÁŰŐÚÖÜÓ]/', $_GET['uj_nev'], $matches) ) {
                    ujratoltes('Illegális karakterek vannak az új névben: '.$matches);
                }

                if(!preg_match('/(.*)\.(.*)/', $_GET['uj_nev']) ) {
                    ujratoltes('Nincs kiterjesztés megadva az új névben.');
                }

                $eredmeny = "";
                $parancs = 'mv "/var/www/html/uploads/fajlok/'.$row['filename'].'" "/var/www/html/uploads/fajlok/'.$_GET['uj_nev'].'"';
                exec($parancs, $eredmeny, $retval);
                if($retval != 0) {
                    ujratoltes('Áthelyezés hiba: "'.$parancs.'"');
                }

                $query = 'update hausz_megoszto.files set filename="'.$_GET['uj_nev'].'" where id = '.$_GET['file_id'];
                $result = $conn->query($query);
                if(!$result) {
                    ujratoltes('Query hiba: '.$query);
                }
                ujratoltes('A(z) "'.$row['filename'].'" nevű fájl sikeresen át lett nevezve.');
            }

            if($_GET['delete'] == '1' && $_SESSION['loggedin'] == "yes") {
                $query = "SELECT files.id, users.username, files.user_id, files.filename, files.added FROM files LEFT OUTER JOIN users ON files.user_id = users.id WHERE files.id = ".$_GET['file_id'];
                $result = $conn->query($query);
                if($result) {
                    if($result->num_rows > 0) {
                        $row = $result->fetch_assoc();
                        if($_GET['file'] == $row['filename'] && strtolower($_SESSION['username']) == strtolower($row['username']) or strtolower($row['username']) == "ismeretlen" && $_GET['file_id'] == $row['id']) {
                            $eredmeny = "";
                            $parancs = 'rm "/var/www/html/uploads/fajlok/'.$row['filename'].'"';
                            exec($parancs, $eredmeny, $retval);
                            if($retval != 0) {
                                ujratoltes("Parancs hiba: ".$parancs);
                            }
                            tarhely_statisztika_mentes();
                            $_GET['file'] = preg_replace("/'/", "\'", $_GET['file']);
                            $query_del = "DELETE FROM files WHERE filename = '".$_GET['file']."' AND user_id = '".$row['user_id']."' AND id = ".$_GET['file_id'];
                            $result_del = $conn->query($query_del);
                            if(!$result_del) {   ujratoltes("Fatal error: ".$query_del); }
                            ujratoltes('&quot;'.$_GET['file'].'&quot; nevű fájl törölve.');
                        }
                    }
                } else {
                    ujratoltes('Fatal error: '.$query);
                }
            }

            if($_GET['claim'] == '1' && $_SESSION['loggedin'] == "yes") {
                $query = "UPDATE files SET user_id = (SELECT id FROM users WHERE username = '".$_SESSION['username']."') WHERE id = ".$_GET['file_id'];
                $result = $conn->query($query);
                if($result) {
                    ujratoltes('A "' . $_GET['file'] . '" nevű fájl sikeresen hozzá lett rendelve a fiókodhoz.');
                } else {
                    ujratoltes('Fatal error: '.$query);
                }
            }

            if(isset($_POST["submit"]) || ($_POST["azonnali_feltoltes"]) == "igen") {
                if( strlen($_FILES["fileToUpload"]["name"]) <= 0 ) {   ujratoltes('Nem válaszottál ki fájlt a feltöltéshez.'); }
                $target_file = "/var/www/html/uploads/fajlok/" . basename($_FILES["fileToUpload"]["name"]);
                debug("/uploads/fajlok/" . basename($_FILES["fileToUpload"]["name"]));
                $goforupload = false;
                $query_check = 'SELECT files.filename, files.user_id, users.username FROM hausz_megoszto.files LEFT OUTER JOIN hausz_megoszto.users ON users.id = files.user_id WHERE filename = "'.basename( $_FILES["fileToUpload"]["name"] ).'" COLLATE utf8mb4_general_ci;';
                $result_check = $conn->query($query_check);
                if($result_check) {
                    if($result_check->num_rows > 0) {
                        $row = $result_check->fetch_assoc();
                        if( strtolower($row['username']) == strtolower($_SESSION['username']) && $_SESSION['loggedin'] == "yes" ) {
                            $query_overwrite = 'DELETE FROM files WHERE filename = "'.basename( $_FILES["fileToUpload"]["name"] ).'"';
                            $result_overwrite = $conn->query($query_overwrite);
                            if(!$result_overwrite) {
                                ujratoltes('Korábbi azonos fájl törlése sikertelen.');
                            } else {
                                $goforupload = true;
                            }
                        } else {
                            ujratoltes('Már létezik egy "' . $_FILES["fileToUpload"]["name"] . '" nevű fájl, amely nem a tiéd, ezért a feltöltés nem lehetséges.');
                        }
                    } else {
                        $goforupload = true;
                    }
                } else {
                    var_dump($conn->error);
                    ujratoltes('Query hiba: '.$query_check);
                }
                if($goforupload == true) {
                    if($szabad_tarhely - $_FILES["fileToUpload"]['size'] < 250*1024*1024) {
                        ujratoltes('Nincs elég tárhely a fájl feltöltéséhez (250 MB).');
                    }
                    if( $_FILES["fileToUpload"]['size'] < 200*1024*1024 ) {
                        if (!move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
                            ujratoltes('Sikertelen volt a fájl feltöltése.');
                        } else {
                            if($_SESSION['loggedin'] == "yes") {
                                if($_POST['private'] == "on") { $_POST['private'] = "1"; } else { $_POST['private'] = "0"; }
                                $query_del2 = 'INSERT INTO `files` (filename, added, user_id, size, private) VALUES ("'.basename( $_FILES["fileToUpload"]["name"] ).'", "'.date("Y-m-d H:i:s").'", (SELECT id FROM users WHERE username = "'.$_SESSION['username'].'"), '.$_FILES["fileToUpload"]["size"].', '.$_POST['private'].');';
                                $result_del2 = $conn->query($query_del2);
                                if(!$result_del2) {   ujratoltes("Fatal error: ".$query_del2); }
                            } else {
                                $query_del2 = 'INSERT INTO `files` (filename, added, user_id, size, private) VALUES ("'.basename( $_FILES["fileToUpload"]["name"] ).'", "'.date("Y-m-d H:i:s").'", 0, '.$_FILES["fileToUpload"]["size"].', 0)';
                                $result_del2 = $conn->query($query_del2);
                                if(!$result_del2) {   var_dump($conn->error); ujratoltes("Fatal error: ".$query_del2);  }
                            }
                            
                            tarhely_statisztika_mentes();

                            ujratoltes('A "' . $_FILES["fileToUpload"]["name"] . '" nevű fájl sikeresen fel lett töltve.');
                        }
                    } else {
                        ujratoltes('A fájl meghaladja a 200 MB-os méretlimitet.');
                    }
                }
                
                $result_del = $conn->query($query_del);
                
                unset($_FILES["fileToUpload"]);
                unset($_FILES["fileToUpload"]["tmp_name"]);
                unset($_POST["submit"]);
            }

            printLn('<h1 style="text-align: center">Hausz megosztó</h1>');
            printLn('<form class="center" action="/uploads/feltoltes.php" method="post" enctype="multipart/form-data">');
            printLn('<label style="display: block; width: 35%; margin:auto; font-size: 20px" for="fileToUpload" id="fileToUpload_label">&#128193; Kattints ide fájlok feltöltéséhez</label>');
            printLn('<input onChange="updateFileName()" class="InputSzoveg" type="file" name="fileToUpload" id="fileToUpload"><br><br>');
            if($_SESSION['loggedin'] == "yes") { 
                printLn('<label onclick="PrivatFeltoltesAtallitasa()" id="private_label_div" for="private"><input hidden type="checkbox" name="private" type="private" id="private" /><div id="private_text">Fájl publikus tárolása</div></label><br><br>');
            }
            printLn('<button class="Gombok KekHatter" name="submit" type="submit" id="SubmitGomb" hidden>Feltöltés</button>');
            printLn('</form>');

            if( strlen($_SESSION['ujratoltes_szoveg']) > 0 ) {
                printLn('<h1 style="text-align: center" id="ujratoltes_szoveg">'.$_SESSION['ujratoltes_szoveg'].'</h1>');
                $_SESSION['ujratoltes_szoveg'] = "";
            }
            printLn('<br><table style="display: table" class="center InputSzoveg">');
            printLn("<tr>");
                printLn("<th></th>");
                printLn("<th>Fájlnév</th>");
                printLn("<th>Dátum</th>");
                printLn("<th>Méret</th>");
                printLn("<th>Feltöltő</th>");
                printLn("<th></th>");
                printLn("<th></th>");
                printLn("<th></th>");
                printLn("<th></th>");
            printLn("</tr>");

            $query = "SELECT files.id as 'id', files.size, filename, added, username, private FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC";
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

                        if(preg_match('/\.exe$/i', $row['filename'])) { $preview_type = "software"; }
                        if(preg_match('/\.msi$/i', $row['filename'])) { $preview_type = "software"; }
                        if(preg_match('/\.iso$/i', $row['filename'])) { $preview_type = "software"; }
                        if(preg_match('/\.apk$/i', $row['filename'])) { $preview_type = "software"; }
                        if(preg_match('/\.rpm$/i', $row['filename'])) { $preview_type = "software"; }
                        if(preg_match('/\.deb$/i', $row['filename'])) { $preview_type = "software"; }
                        if(preg_match('/\.dmg$/i', $row['filename'])) { $preview_type = "software"; }
                        if(preg_match('/\.pkg$/i', $row['filename'])) { $preview_type = "software"; }
                        
                        
                        if(preg_match('/\.zip$/i', $row['filename'])) { $preview_type = "compressed"; }
                        if(preg_match('/\.7z$/i', $row['filename'])) { $preview_type = "compressed"; }
                        if(preg_match('/\.tar$/i', $row['filename'])) { $preview_type = "compressed"; }
                        if(preg_match('/\.rar$/i', $row['filename'])) { $preview_type = "compressed"; }

                        printLn('<tr onclick=\'elonezet("https://hausz.stream/uploads/request.php?file_id='.$row['id'].'", "'.$preview_type.'", '.$row['size'].')\'>');
                        
                        $preview_emoji = "❔";
                        if($preview_type == "document") { $preview_emoji ='📝'; }
                        if($preview_type == "audio") { $preview_emoji = '🎵'; }
                        if($preview_type == "image") { $preview_emoji = '📷'; }
                        if($preview_type == "video") { $preview_emoji = '🎬'; }
                        if($preview_type == "software") { $preview_emoji = '💿'; }
                        if($preview_type == "compressed") { $preview_emoji = '📦'; }

                        printLn('<td class="emoji_cell" style="text-align: center">'.$preview_emoji.'</td>');
                        printLn('<td class="text-align-left">');
                        if( $row['private'] == '1') {   printLn('<font style="color:red">PRIVÁT</font> ');  }
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
                            printLn('<td><a href="/uploads/feltoltes.php?claim=1&file='.$row['filename'].'&file_id='.$row['id'].'">Claimelés</a></td>');
                        } else {
                            printLn('<td></td>');
                        }
                        if( (strtolower($_SESSION['username']) == strtolower($row['username']) && $_SESSION['loggedin'] == "yes") or (strtolower($row['username']) == "ismeretlen" && $_SESSION['loggedin'] == "yes")) {
                            printLn('<td class="emoji_cell"><a style="text-decoration: none" onclick="torles(&quot;/uploads/feltoltes.php?delete=1&file='.$row['filename'].'&file_id='.$row['id'].'&quot;, &quot;'.$row['filename'].'&quot;)">&#10060;</a></td>');
                            printLn('<td class="emoji_cell"><a onclick=\'fajl_atnevezese("'.$row['id'].'", "'.$row['filename'].'")\'>✏️</a></td>');
                        } else {
                            printLn('<td></td><td></td>');
                        }

                        printLn('<td class="emoji_cell"><a href="/uploads/request.php?file_id='.$row['id'].'" style="text-decoration: none" download>&#128190;</a></td>');
                        
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

            printLn('</table><br><br><br>');

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
        ?>
    </body>
</html>
