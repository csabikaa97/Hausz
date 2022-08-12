<?php
    session_start();
    $dbname = "hausz_megoszto";
    include '../../forras/include/alap_fuggvenyek.php';
    include '../../forras/include/adatbazis.php';

    function mimeType($path) {
        preg_match("|\.([a-z0-9]*)$|i", $path, $fileSuffix);
        switch(strtolower($fileSuffix[1])) {
            case "m" : return 'text/plain'; break;
            case "c" : return 'text/plain'; break;
            case "cpp" : return 'text/plain'; break;
            case "cs" : return 'text/plain'; break;
            case "py" : return 'text/plain'; break;
            case "txt" : return 'text/plain'; break;
            case "md" : return 'text/plain'; break;
            case "sql" : return 'text/plain'; break;
            case "ahk" : return 'text/plain'; break;
            case "css" : return 'text/plain'; break;

            case "php" : return 'text/html'; break;

            case "css" : return 'text/css'; break;

            case "jpe" : return 'image/jpg'; break;
            case "jpeg" : return 'image/jpg'; break;
            case "jpg" : return 'image/jpg'; break;
            
            case "png" : return 'image/png'; break;
            case "tiff" : return 'image/tiff'; break;
            case "gif" : return 'image/gif'; break;
            
            case "mp3" : return 'audio/mpeg3'; break;
            case "wav" : return 'audio/wav'; break;
            case "aif" : return 'audio/aiff'; break;
            
            case "mpe" : return 'video/mpeg'; break;
            case "avi" : return 'video/msvideo'; break;
            case "wmv" : return 'video/x-ms-wmv'; break;
            case "mov" : return 'video/quicktime'; break;

            case "drawio" : return 'application/octet-stream'; break;
            case "js" : return 'application/x-javascript'; break;
            case "json" : return 'application/json'; break;
            case "xml" : return 'application/xml'; break;
            case "docx" : return 'application/msword'; break;
            case "xll" : return 'application/vnd.ms-excel'; break;
            case "pps" : return 'application/vnd.ms-powerpoint'; break;
            case "rtf" : return 'application/rtf'; break;
            case "pdf" : return 'application/pdf'; break;
            case "zip" : return 'application/zip'; break;
            case "tar" : return 'application/x-tar'; break;
            case "swf" : return 'application/x-shockwave-flash'; break;
        }
        if(function_exists('mime_content_type')) {
            $fileSuffix = mime_content_type($path);
        }
        return 'unknown/' . trim($fileSuffix[0], '.');
    }

    if( isset($_GET['fajlok']) ) {
        $result = query_futtatas("SELECT users.megjeleno_nev, files.titkositott, files.id as 'id', files.size, filename, added, username, private FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC");
        if( $result->num_rows <= 0 ) {   exit_ok('"fajlok_szama": 0'); }

        $buffer = '"fajlok": [';
        $fajlok_szama = 0;
        while($row = $result->fetch_assoc()) {
            if( ($row['private'] == '1' && strtolower($_SESSION['username']) != strtolower($row['username']))
                or (!isset($_SESSION['loggedin']) && $row['private'] == '1') ) {   continue; }
            
            if($fajlok_szama > 0) {   $buffer .= ', '; }

            $buffer .= '{"id": '.$row['id'].', "size": "'.$row['size'].'", "filename": "'.$row['filename'].'", "added": "'.$row['added'].'", "megjeleno_nev": "'.$row['megjeleno_nev'].'", "private": "'.$row['private'].'", "titkositott": "'.$row['titkositott'].'"}';
            $fajlok_szama++;
        }
        exit_ok('"fajlok_szama":'.$fajlok_szama.','.$buffer.']');
    }

    if( isset($_GET['atnevezes']) ) {
        die_if( $_SESSION['loggedin'] != 'yes', 'Nem vagy belépve');
        header('X-Robots-Tag: noindex');
        die_if( strlen($_GET['uj_nev']) <= 0 || strlen($_GET['file_id']) <= 0, 'Hiányzó uj_nev vagy file_id paraméter.');

        $result = query_futtatas("select * from hausz_megoszto.files where filename='".$_GET['uj_nev']."';");
        die_if( $result->num_rows > 0, 'Már létezik fájl ezzel a névvel.');

        $result = query_futtatas("select * from hausz_megoszto.files where id=".$_GET['file_id'].";");
        die_if( $result->num_rows <= 0, 'Nem létezik az átnevezendő fájl.');
        $row = $result->fetch_assoc();
        die_if( $row['user_id'] != $_SESSION['user_id'] && $row['user_id'] != '0', 'Nem nevezheted át más fájljait.');
        die_if( strlen($_GET['uj_nev']) > 250, 'Nem lehet az új név 250 karakternél hosszabb.');
        die_if( preg_match('/[^a-zA-Z0-9_-\.éáűőúöüóíÍÉÁŰŐÚÖÜÓ]/', $_GET['uj_nev'], $matches), 'Illegális karakterek vannak az új névben: '.$matches);
        die_if( !preg_match('/(.*)\.(.*)/', $_GET['uj_nev']), 'Nincs kiterjesztés megadva az új névben.');

        $eredmeny = "";
        $parancs = 'mv "/var/www/public/megoszto/fajlok/'.$row['filename'].'" "/var/www/public/megoszto/fajlok/'.$_GET['uj_nev'].'"';
        exec($parancs, $eredmeny, $retval);
        die_if( $retval != 0, $parancs);

        $query = 'update hausz_megoszto.files set filename="'.$_GET['uj_nev'].'" where id = '.$_GET['file_id'];
        $result = query_futtatas($query);
        log_bejegyzes("megoszto", "átnevezés", "[".$_GET['file_id'].'] '.$row['filename'].' -> '.$_GET['uj_nev'], $_SESSION['username']);
        exit_ok('"valasz": "A(z) '.$row['filename'].' nevű fájl sikeresen át lett nevezve."');
    }

    if( isset($_GET['privat_statusz_csere']) ) {
        die_if( $_SESSION['loggedin'] != 'yes', "Nem vagy belépve.");
        die_if( strlen($_GET['file_id']) <= 0, "Nincs megadva fájl azonosító.");
        $result = query_futtatas("select * from files where id = ".$_GET['file_id']);
        die_if( $result->num_rows <= 0, "Nem létezik a változtatni kívánt fájl.");
        $row = $result->fetch_assoc();
        if( $row['private'] ) {
            $result = query_futtatas('update files set private = 0 where id = '.$_GET['file_id']);
            exit_ok('"valasz": "'.$row['filename'].' nevű fájl publikussá tétele kész."');
        } else {
            $result = query_futtatas('update files set private = 1 where id = '.$_GET['file_id']);
            exit_ok('"valasz": "'.$row['filename'].' nevű fájl priváttá tétele kész."');
        }
    }

    if( isset($_GET['delete']) ) {
        die_if( !isset( $_SESSION['loggedin'] ), 'Nem vagy belépve');
        header('X-Robots-Tag: noindex');
        $result = query_futtatas("SELECT files.id, users.username, files.user_id, files.filename, files.added FROM files LEFT OUTER JOIN users ON files.user_id = users.id WHERE files.id = ".$_GET['file_id']);
        die_if( $result->num_rows <= 0, 'Nem létező fájl azonosító');
        $row = $result->fetch_assoc();
        die_if( strtolower($_SESSION['username']) != strtolower($row['username']) && strtolower($row['username']) != "ismeretlen", 'Nem a tiéd a fájl, ezért azt nem törölheted');
        $eredmeny = "";
        $parancs = 'rm "/var/www/public/megoszto/fajlok/'.$row['filename'].'"';
        exec($parancs, $eredmeny, $retval);
        die_if( $retval != 0, "".$parancs);
        $_GET['file'] = preg_replace("/'/", "\'", $_GET['file']);
        $result_del = query_futtatas("DELETE FROM files WHERE id = ".$_GET['file_id']);
        log_bejegyzes("megoszto", "törlés", "[".$_GET['file_id'].']: '.$row['filename'], $_SESSION['username']);
        exit_ok('"valasz": "'.$row['filename'].' nevű fájl törölve."');
    }

    if( isset($_GET['claim']) ) {
        die_if( !isset( $_SESSION['loggedin'] ), 'Nem vagy belépve');
        header('X-Robots-Tag: noindex');
        $query = "UPDATE files SET user_id = (SELECT id FROM users WHERE username = '".$_SESSION['username']."') WHERE id = ".$_GET['file_id'];
        $result = query_futtatas($query);
        $query = "select filename from files WHERE id = ".$_GET['file_id'];
        $result = query_futtatas($query);
        die_if( $result->num_rows <= 0, 'Nem létezik a claimelendő fájl');
        $row = $result->fetch_assoc();
        log_bejegyzes("megoszto", "claimelés", "[".$_GET['file_id'].']: '.$row['filename'], $_SESSION['username']);
        exit_ok('"valasz": "A ' . $row['filename'] . ' nevű fájl sikeresen hozzá lett rendelve a fiókodhoz."');
    }

    if( isset($_GET['tarhely']) ) {
        $tarhely2 = shell_exec('df -B1');
        $tarhely2 = preg_replace('/[\n\r]/', '', $tarhely2);
        $hasznalt = preg_replace('/.*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*/', '$3', $tarhely2);
        $elerheto = preg_replace('/.*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*/', '$4', $tarhely2);
        $hasznalt = floatval($hasznalt);
        $elerheto = floatval($elerheto);
        exit_ok('"szabad_tarhely": '.$elerheto.', "foglalt_tarhely": '.$hasznalt);
    }

    if( isset($_GET['letoltes']) ) {
        die_if( strlen( $_GET['file_id'] ) <= 0, 'Nem adtál meg fájl azonsítót.');
    
        $query = "select * from files left outer join users on users.id = files.user_id where files.id = ".$_GET['file_id'];
        $result = query_futtatas($query);
        die_if( $result->num_rows <= 0, "Nem létező fájl: ".$_GET['file_id']);

        $row = $result->fetch_assoc();
        die_if( ( (strtolower($row['username']) != strtolower($_SESSION['username'])) or !isset($_SESSION['loggedin']) ) && $row['private'] == "1", 'Nem vagy jogosult a fájl eléréshez.');

        header("Cache-Control: public, max-age=9999999, immutable");
        header('X-Robots-Tag: noindex');
        header("Content-Type: ".mimeType("/var/www/public/megoszto/fajlok/".$row['filename']));
        if(strlen($_POST['titkositas_feloldasa_kulcs']) > 0) {
            die_if( $row['titkositott'] != '1', 'A fájl nem titkosított');
            die_if( !password_verify($_POST['titkositas_feloldasa_kulcs'], $row['titkositas_kulcs']), 'Nem jó titkosítási kulcs');
            
            if( isset($_POST['letoltes']) ) {
                $plaintext = file_get_contents("/var/www/public/megoszto/fajlok/".$row['filename']);
                $plaintext = base64_decode($plaintext);
                $plaintext = openssl_decrypt($plaintext, "aes-256-cbc", $_POST['titkositas_feloldasa_kulcs'], $options=0, "aaaaaaaaaaaaaaaa");
                header('Content-Disposition: filename="'.$row['filename'].'"');
                header('Content-Length: '.strlen($plaintext));
                echo($plaintext);
                die();
            }
            
            exit_ok('Titkosítás feloldva');
        }
        if($row['titkositott'] == '1') {
            header('Content-Disposition: filename="titkositott_'.$row['filename'].'"');
        } else {
            header('Content-Disposition: filename="'.$row['filename'].'"');
        }
        header_remove("Pragma"); 
        header('Cache-control: public, max-age=9999999');
        $fajl = file_get_contents("/var/www/public/megoszto/fajlok/".$row['filename']);
        header('Content-Length: '.strlen($fajl));
        echo($fajl);
        die();
    }

    if( isset($_POST["submit"]) || ($_POST["azonnali_feltoltes"]) == "igen" ) {
        die_if( strlen($_FILES["fileToUpload"]["name"]) <= 0, 'Nem válaszottál ki fájlt a feltöltéshez.');
        $_FILES["fileToUpload"]["name"] = preg_replace("/'/i", '', $_FILES["fileToUpload"]["name"]);
        $_FILES["fileToUpload"]["name"] = preg_replace('/"/i', '', $_FILES["fileToUpload"]["name"]);
        $_FILES["fileToUpload"]["name"] = preg_replace('/|/i', '', $_FILES["fileToUpload"]["name"]);
        $target_file = "/var/www/public/megoszto/fajlok/" . basename($_FILES["fileToUpload"]["name"]);
        $result_check = query_futtatas('SELECT files.filename, files.user_id, users.username FROM hausz_megoszto.files LEFT OUTER JOIN hausz_megoszto.users ON users.id = files.user_id WHERE filename = "'.basename( $_FILES["fileToUpload"]["name"] ).'" COLLATE utf8mb4_general_ci;');
        if($result_check->num_rows > 0) {
            $row = $result_check->fetch_assoc();
            die_if( strtolower($row['username']) != strtolower($_SESSION['username']) || !isset($_SESSION['loggedin']), 'Már létezik egy "' . $_FILES["fileToUpload"]["name"] . '" nevű fájl, amely nem a tiéd, ezért a feltöltés nem lehetséges.');
            $result_overwrite = query_futtatas('DELETE FROM files WHERE filename = "'.basename( $_FILES["fileToUpload"]["name"] ).'"');
        }

        $tarhely2 = shell_exec('df -B1');
        $tarhely2 = preg_replace('/[\n\r]/', '', $tarhely2);
        $hasznalt = preg_replace('/.*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*/', '$3', $tarhely2);
        $elerheto = preg_replace('/.*(overlay|\/dev\/xvda1|\/dev\/root)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*).*/', '$4', $tarhely2);
        $hasznalt = floatval($hasznalt);
        $elerheto = floatval($elerheto);
        $tarhely_beteltseg = $hasznalt / ($hasznalt + $elerheto);
    
        die_if( $elerheto - $_FILES["fileToUpload"]['size'] < 250*1024*1024, 'Nincs elég tárhely a fájl feltöltéséhez (250 MB).');
        die_if( $_FILES["fileToUpload"]['size'] >= 200*1024*1024, 'A fájl meghaladja a 200 MB-os méretlimitet.');

        if(strlen($_POST['titkositas_kulcs']) > 0) {
            $plaintext = file_get_contents($_FILES['fileToUpload']['tmp_name']);
            exec('rm "'.$_FILES['fileToUpload']['tmp_name'].'"', $output, $retval);
            die_if( $retval != 0, 'Eltávolítás nem sikerült.');
            $key = $_POST['titkositas_kulcs'];
            $cipher = "aes-256-cbc";
            die_if( !in_array($cipher, openssl_get_cipher_methods()), 'Nem lehet titkosítani, mert nem jó a titkosítási algoritmus.');
            $iv = "aaaaaaaaaaaaaaaa";
            $ciphertext = base64_encode(openssl_encrypt($plaintext, $cipher, $key, $options=0, $iv));
            ini_set('display_errors', 1);
            exec('touch "'.$target_file.'"', $output, $retval);
            die_if( $retval != 0, 'Fájl készítése sikertelen.');
            
            die_if( !file_put_contents($target_file, $ciphertext), 'Nem sikerül kiírni a fájlba a tartalmat: "'.$target_file.'"');
        } else {
            die_if( !move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file), 'Sikertelen volt a fájl feltöltése.');
        }

        $query_del2 = 'INSERT INTO `files` (filename, added, user_id, size, private, titkositott, titkositas_kulcs) VALUES ("'.basename( $_FILES["fileToUpload"]["name"] ).'", "'.date("Y-m-d H:i:s").'",';

        if( isset($_SESSION['loggedin']) ) {
            $query_del2 .= ' (SELECT id FROM users WHERE username = "'.$_SESSION['username'].'"), ';
        } else {
            $query_del2 .= ' 0, ';
        }
        $_POST['private'] = isset($_POST['private']) ? "1" : "0";
        $query_del2 .= $_FILES["fileToUpload"]["size"].', '.$_POST['private'].', ';
        $titkositas = "0";
        if(strlen($_POST['titkositas_kulcs']) > 0) {
            $query_del2 .= '1, "'.password_hash($_POST['titkositas_kulcs'], PASSWORD_DEFAULT).'");';
        } else {
            $query_del2 .= '0, "");';
        }

        $result_del2 = query_futtatas($query_del2);
        
        $result = query_futtatas("(select id from hausz_megoszto.files where filename = '".basename( $_FILES["fileToUpload"]["name"] )."');");
        $id = "[???]";
        if($result) {
            $row = $result->fetch_assoc();
            $id = '['.$row['id'].']';
        }
        
        log_bejegyzes("megoszto", "feltöltés", $id . ': ' . basename( $_FILES["fileToUpload"]["name"] ), strlen($_SESSION['username']) > 0 ? $_SESSION['username'] : "ismeretlen");
        exit_ok('"valasz": "A \'' . $_FILES["fileToUpload"]["name"] . '\' nevű fájl sikeresen fel lett töltve."');
    }

    die_if( true, 'Mi a parancs?: ');
?>
