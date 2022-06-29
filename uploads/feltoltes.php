<?php
    session_start();
    $dbname = "hausz_megoszto";
    include '../include/adatbazis.php';
    include '../include/alap_fuggvenyek.php';

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

    if( isset($_GET['fajlok']) ) {
        $query = "SELECT files.titkositott, files.id as 'id', files.size, filename, added, username, private FROM files LEFT OUTER JOIN users ON files.user_id = users.id ORDER BY files.added DESC";
        $result = $conn->query($query);
        if($result) {
            if($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    if( ($row['private'] == '1' && strtolower($_SESSION['username']) != strtolower($row['username'])) or ($_SESSION['loggedin'] != "yes" && $row['private'] == '1') )
                        continue;
                    
                    echo '<'.$row['id'].'|'.$row['size'].'|'.$row['filename'].'|'.$row['added'].'|'.$row['username'].'|'.$row['private'].'|'.$row['titkositott'].'>';
                }
            } else {
                echo '<-|-|-|-|-|-|->';
            }
        }
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

    if($_GET['tarhely'] == '1') {
        $query_tarhely_adat = "select * from hausz_megoszto.tarhely_statisztika order by datum desc limit 1;";
        $result_tarhely_adat = $conn->query($query_tarhely_adat);
        $szabad_tarhely = "";
        $foglalt_tarhely = "";
        if(!$result_tarhely_adat) {
            echo 'HIBA:'.$query_tarhely_adat;
            die();
        } else {
            $row = $result_tarhely_adat->fetch_assoc();
            $szabad_tarhely = $row['szabad'];
            $foglalt_tarhely = $row['foglalt'];
            echo 'OK:'.$szabad_tarhely.','.$foglalt_tarhely;
            die();
        }
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
