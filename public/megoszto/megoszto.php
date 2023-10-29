<?php
    session_start();
    include '../../forras/include/adatbazis.php';
    include '../../forras/include/alap_fuggvenyek.php';

    adatbazis_csatlakozas("", "", "", "");

    // public

    if( isset($_GET['letoltes']) ) {
        die_if( strlen( $_GET['file_id'] ) <= 0, 'Nem adtál meg fájl azonsítót.');
        
        $result = query_futtatas("SELECT * from files left outer join users ON users.id = files.user_id WHERE files.id = ".$_GET['file_id']);
        die_if( $result->num_rows <= 0, "Nem létező fájl: ".$_GET['file_id']);

        $row = $result->fetch_assoc();
        die_if( ( (strtolower($row['username']) != strtolower($_SESSION['username'])) or !isset($_SESSION['loggedin']) ) && $row['private'] == "1", 'Nem vagy jogosult a fájl eléréshez.');
        die_if( !isset($_SESSION['loggedin']) && $row['members_only'] == "1", 'Nem vagy jogosult a fájl eléréshez.');

        header("Cache-Control: public, max-age=9999999, immutable");
        header('X-Robots-Tag: noindex');
        header("Content-Type: ".mimeType("/var/www/public/megoszto/fajlok/".$row['filename']));
        if(isset($_POST['titkositas_feloldasa_kulcs'])) {
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

    // private

    die_if( $_SESSION['loggedin'] != 'yes', 'Nem vagy belépve');
    header('X-Robots-Tag: noindex');


    if( isset($_GET['atnevezes']) ) {
        die_if( strlen($_GET['uj_nev']) <= 0 || strlen($_GET['file_id']) <= 0, 'Hiányzó uj_nev vagy file_id paraméter.');

        $result = query_futtatas("SELECT * FROM hausz_megoszto.files WHERE filename='".$_GET['uj_nev']."';");
        die_if( $result->num_rows > 0, 'Már létezik fájl ezzel a névvel.');

        $result = query_futtatas("SELECT * FROM hausz_megoszto.files WHERE id=".$_GET['file_id'].";");
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
        die_if( strlen($_GET['file_id']) <= 0, "Nincs megadva fájl azonosító.");
        $result = query_futtatas("SELECT * FROM files WHERE id = ".$_GET['file_id']);
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

    if( isset($_GET['members_only_csere']) ) {
        die_if( strlen($_GET['file_id']) <= 0, "Nincs megadva fájl azonosító.");
        $result = query_futtatas("SELECT * FROM files WHERE id = ".$_GET['file_id']);
        die_if( $result->num_rows <= 0, "Nem létezik a változtatni kívánt fájl.");
        $row = $result->fetch_assoc();
        if( $row['members_only'] ) {
            $result = query_futtatas('update files set members_only = 0 where id = '.$_GET['file_id']);
            exit_ok('"valasz": "'.$row['filename'].' nevű fájl mostantól mindenki számára elérhető."');
        } else {
            $result = query_futtatas('update files set members_only = 1 where id = '.$_GET['file_id']);
            exit_ok('"valasz": "'.$row['filename'].' nevű fájl mostantól csak Hausz tagok számára elérhető."');
        }
    }

    if( isset($_GET['delete']) ) {
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
        $result = query_futtatas("UPDATE files SET user_id = (SELECT id FROM users WHERE username = '".$_SESSION['username']."') WHERE id = ".$_GET['file_id']);
        $result = query_futtatas("SELECT filename FROM files WHERE id = ".$_GET['file_id']);
        die_if( $result->num_rows <= 0, 'Nem létezik a claimelendő fájl');
        $row = $result->fetch_assoc();
        log_bejegyzes("megoszto", "claimelés", "[".$_GET['file_id'].']: '.$row['filename'], $_SESSION['username']);
        exit_ok('"valasz": "A ' . $row['filename'] . ' nevű fájl sikeresen hozzá lett rendelve a fiókodhoz."');
    }

    die_if( true, 'Mi a parancs?: ');
?>
