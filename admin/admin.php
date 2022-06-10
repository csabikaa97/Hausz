<?php   session_start(); ?>
<!DOCTYPE html>
<html lang="hu">
    <head>
        <title>Hausz admin felület</title>
        <meta charset="UTF-8">
        <meta name="robots" content="noindex">
        <link rel="stylesheet" type="text/css" href="/index/style.css" />
        <link rel="shortcut icon" type="image/png" href="/index/favicon.png" />
        <meta name="color-scheme" content="dark light">
    </head>
    <body>
        <?php readfile("/var/www/html/index/topbar.html"); ?>

        <center>
            <h1>Hausz admin felület</h1>
        </center>

        <?php
            $dbname = "hausz_megoszto";
            include '../include/adatbazis.php';
            include '../include/alap_fuggvenyek.php';
            include '../include/belepteto_rendszer.php';

            function kidob($szoveg)
            {
                printLn($szoveg);
                //header("Location: https://hausz.stream");
                die();
            }

            if (!($_SESSION['loggedin'] == "yes")) {
                kidob('Nem vagy belépve');
            }

            if ($_SESSION['admin'] != "igen") {
                kidob('Nem vagy admin');
            }

            if($_GET['aktivalas'] == 1) {
                if(strlen($_GET['request_id']) <= 0) {
                    printLn('A request_id helytelenül van, vagy nincs megadva');
                    die();
                }

                $query = "call hausz_megoszto.add_user(".$_GET['request_id'].");";
                $result = $conn->query($query);
                if(!$result) {
                    printLn('Query hiba: '.$query);
                    die();
                }

                header('Location: https://hausz.stream/admin/admin.php');
            }

            printLn('<h3>Aktiválandó fiókok</h3>');
            $query = "select * from hausz_megoszto.users_requested";
            $result = $conn->query($query);
            if(!$result) {
                printLn('Query hiba: '.$query);
                die();
            }
            if($result->num_rows <= 0) {
                printLn('<p>Jelenleg nincs aktiválandó fiók</p>');
            } else {
                printLn('<table>');
                printLn('<tr>');
                printLn('<th>request_id</th>');
                printLn('<th>username</th>');
                printLn('<th>email</th>');
                printLn('<th>Aktiválás</th>');
                printLn('</tr>');

                while($row = $result->fetch_assoc()) {
                    printLn('<tr>');
                    printLn('<td>'.$row['request_id'].'</td>');
                    printLn('<td>'.$row['username'].'</td>');
                    printLn('<td>'.$row['email'].'</td>');
                    printLn('<td><a href="https://hausz.stream/admin/admin.php?aktivalas=1&request_id='.$row['request_id'].'">Aktiválás</a></td>');
                    printLn('</tr>');
                }
                printLn('</table>');
            }

            printLn('<h3>Aktív fiókok</h3>');
            $query = "select * from hausz_megoszto.users";
            $result = $conn->query($query);
            if(!$result) {
                printLn('Query hiba: '.$query);
                die();
            }

            if($result->num_rows > 0) {
                printLn('<table>');
                printLn('<tr>');
                printLn('<th>id</th>');
                printLn('<th>username</th>');
                printLn('<th>email</th>');
                printLn('<th>Admin</th>');
                printLn('</tr>');

                while($row = $result->fetch_assoc()) {
                    printLn('<tr>');
                    printLn('<td>'.$row['id'].'</td>');
                    printLn('<td>'.$row['username'].'</td>');
                    printLn('<td>'.$row['email'].'</td>');
                    printLn('<td>'.$row['admin'].'</td>');
                    printLn('</tr>');
                }
                printLn('</table>');
            }
        ?>
    </body>
</html>