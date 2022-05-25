<?php
    include '../include/alap_fuggvenyek.php';

    function mimeType($path) {
        preg_match("|\.([a-z0-9]*)$|i", $path, $fileSuffix);
        switch(strtolower($fileSuffix[1])) {
            case 'm' : return 'text/plain';
            case 'c' : return 'text/plain';
            case 'cpp' : return 'text/plain';
            case 'cs' : return 'text/plain';
            case 'py' : return 'text/plain';
            case 'drawio' : return 'application/octet-stream';
            case 'js' : return 'application/x-javascript';
            case 'json' : return 'application/json';
            case 'jpe' : return 'image/jpg';
            case 'tiff' : return 'image/'.strtolower($fileSuffix[1]);
            case 'css' : return 'text/css';
            case 'xml' : return 'application/xml';
            case 'docx' : return 'application/msword';
            case 'xll' : return 'application/vnd.ms-excel';
            case 'pps' : return 'application/vnd.ms-powerpoint';
            case 'rtf' : return 'application/rtf';
            case 'pdf' : return 'application/pdf';
            case 'php' : return 'text/html';
            case 'txt' : return 'text/plain';
            case 'mpe' : return 'video/mpeg';
            case 'mp3' : return 'audio/mpeg3';
            case 'wav' : return 'audio/wav';
            case 'aif' : return 'audio/aiff';
            case 'avi' : return 'video/msvideo';
            case 'wmv' : return 'video/x-ms-wmv';
            case 'mov' : return 'video/quicktime';
            case 'zip' : return 'application/zip';
            case 'tar' : return 'application/x-tar';
            case 'swf' : return 'application/x-shockwave-flash';
            default :
                if(function_exists('mime_content_type')) {
                    $fileSuffix = mime_content_type($path);
                }
                return 'unknown/' . trim($fileSuffix[0], '.');
        }
    }

    session_start();

    if( strlen( $_GET['file_id'] ) <= 0 ) {
        printLn('Nem adtál meg fájl azonsítót.');
        die();
    }

    include '../include/adatbazis.php';

    $query = "select * from files left outer join users on users.id = files.user_id where files.id = ".$_GET['file_id'];
    $result = $conn->query($query);
    if( !$result ) {
        printLn("Hiba a lekérdezés futtatása közben.");
        var_dump($query);
        var_dump($result);
        var_dump($conn->error);
        die();
    }

    if( $result->num_rows <= 0 ) {
        printLn("Nem létező fájl.");
        var_dump($_GET['file_id']);
        die();
    }

    $row = $result->fetch_assoc();

    if( strlen( $row['filename'] ) <= 0 ) {
        printLn("Hibás fájlnév.");
        die();
    }

    if( ( 
            (strtolower($row['username']) != strtolower($_SESSION['username']))
            or
            ($_SESSION['loggedin'] != "yes")
        ) 
        
        && $row['private'] == "1" ) {
        printLn('Nem vagy jogosult a fájl eléréshez.');
        die();
    }

    header('X-Sendfile: /var/www/html/uploads/fajlok/'.$row['filename']);
    header("Content-type: ".mimeType("/var/www/html/uploads/fajlok/".$row['filename']));
    header('Content-Disposition: filename="'.$row['filename'].'"');
    header('Content-Length: '.filesize("/var/www/html/uploads/fajlok/".$row['filename']));
    header('X-Robots-Tag: noindex');
?>