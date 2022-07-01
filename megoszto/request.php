<?php
    session_start();

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

    $dbname = "hausz_megoszto";
    include '../include/alap_fuggvenyek.php';
    include '../include/adatbazis.php';

    die_if( strlen( $_GET['file_id'] ) <= 0, 'Nem adtál meg fájl azonsítót.');
    
    $query = "select * from files left outer join users on users.id = files.user_id where files.id = ".$_GET['file_id'];
    $result = $conn->query($query);
    die_if( !$result, "Query hiba: ".$query);
    die_if( $result->num_rows <= 0, "HIBA:Nem létező fájl: ".$_GET['file_id']);

    $row = $result->fetch_assoc();
    die_if( ( (strtolower($row['username']) != strtolower($_SESSION['username'])) or ($_SESSION['loggedin'] != "yes") ) && $row['private'] == "1", 'Nem vagy jogosult a fájl eléréshez.');

    header("Cache-Control: public, max-age=9999999, immutable");
    header('X-Robots-Tag: noindex');
    header("Content-Type: ".mimeType("/var/www/html/megoszto/fajlok/".$row['filename']));
    if(strlen($_POST['titkositas_feloldasa_kulcs']) > 0) {
        die_if( $row['titkositott'] != '1', 'HIBA:A fájl nem titkosított');
        die_if( !password_verify($_POST['titkositas_feloldasa_kulcs'], $row['titkositas_kulcs']), 'HIBA:Nem jó titkosítási kulcs');
        
        if( $_POST['letoltes'] == "1" ) {
            $plaintext = file_get_contents("/var/www/html/megoszto/fajlok/".$row['filename']);
            $plaintext = base64_decode($plaintext);
            $plaintext = openssl_decrypt($plaintext, "aes-256-cbc", $_POST['titkositas_feloldasa_kulcs'], $options=0, "aaaaaaaaaaaaaaaa");
            header('Content-Disposition: filename="'.$row['filename'].'"');
            header('Content-Length: '.strlen($plaintext));
            exit_ok($plaintext);
        }
        
        exit_ok('OK:Titkosítás feloldva');
    }
    if($row['titkositott'] == '1') {
        header('Content-Disposition: filename="titkositott_'.$row['filename'].'"');
    } else {
        header('Content-Disposition: filename="'.$row['filename'].'"');
    }
    readfile('/var/www/html/megoszto/fajlok/'.$row['filename']);
?>