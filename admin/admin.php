<?php   session_start(); ?>
<!DOCTYPE html>
<html lang="hu">
    <head>
        <title>Admin felület - Hausz</title>
        <meta charset="UTF-8">
        <meta name="robots" content="noindex">
        <link rel="stylesheet" type="text/css" href="/index/style.css" />
        <link rel="stylesheet" type="text/css" href="/index/alapok.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="shortcut icon" type="image/png" href="/index/favicon.png" />
        <meta name="color-scheme" content="dark light">
    </head>
    <body>
        <script src="/include/topbar.js"></script>
        <script src="/include/alap_fuggvenyek.js"></script>
        <script src="/include/belepteto_rendszer.js"></script>
        <span id="belepteto_rendszer"></span>

        <h1 class="kozepre-szoveg">Hausz admin felület</h1>

        <script>
            function belepes_siker(uzenet) {
                location.reload();
            }

            function kilepes_siker(uzenet) {
                location.reload();
            }

            function futtatas() {
                const xhttp = new XMLHttpRequest();
                xhttp.onload = function() {
                    document.getElementById("parancssor").innerHTML = document.getElementById("parancssor").innerHTML + this.responseText;
                }
                xhttp.open("GET", "https://hausz.stream/admin/parancs.php?parancs=" + document.getElementById("parancs").value);
                xhttp.send();
            }

            function futtatas_enter() {
                if (event.key === 'Enter') {
                    futtatas();
                    document.getElementById("parancs").value = "";
                }
            }
        </script>

        <?php
            $dbname = "hausz_megoszto";
            include '../include/adatbazis.php';
            include '../include/alap_fuggvenyek.php';

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

            printLn('<h3>Shell</h3>');
            printLn('<div id="parancssor">');
            printLn('</div>');
            printLn('<input id="parancs" onkeydown="futtatas_enter()" type="text" placeholder="parancs" />');
            printLn('<input onclick="futtatas()" type="button" value="Futtatás"></input>');
        ?>
    </body>
</html>