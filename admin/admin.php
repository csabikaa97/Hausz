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
                xhttp.open("GET", "/admin/parancs.php?parancs=" + document.getElementById("parancs").value);
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
            include '../include/alap_fuggvenyek.php';
            include '../include/adatbazis.php';

            function kidob($szoveg) {   die_if(true, $szoveg); }

            if (!($_SESSION['loggedin'] == "yes")) {
                kidob('Nem vagy belépve');
            }

            if ($_SESSION['admin'] != "igen") {
                kidob('Nem vagy admin');
            }

            if($_GET['aktivalas'] == 1) {
                die_if( strlen($_GET['request_id']) <= 0, 'A request_id helytelenül van, vagy nincs megadva');

                $query = "call hausz_megoszto.add_user(".$_GET['request_id'].");";
                $result = $conn->query($query);
                die_if( !$result, 'Query hiba: '.$query);
                header('Location: https://hausz.stream/admin/admin.php');
            }

            if($_GET['elutasitas'] == 1) {
                die_if( strlen($_GET['request_id']) <= 0, 'A request_id helytelenül van, vagy nincs megadva');

                $query = "delete from hausz_megoszto.users_requested where request_id = ".$_GET['request_id'].";";
                $result = $conn->query($query);
                die_if( !$result, 'Query hiba: '.$query);
                header('Location: https://hausz.stream/admin/admin.php');
            }

            if($_GET['torles'] == 1) {
                die_if( strlen($_GET['user_id']) <= 0, 'A user_id helytelenül van, vagy nincs megadva');

                $query = "delete from hausz_megoszto.users where id = ".$_GET['user_id'].";";
                $result = $conn->query($query);
                die_if( !$result, 'Query hiba: '.$query);
                header('Location: https://hausz.stream/admin/admin.php');
            }

            printLn('<h3>Aktiválandó fiókok</h3>');
            $query = "select * from hausz_megoszto.users_requested";
            $result = $conn->query($query);
            die_if( !$result, 'Query hiba: '.$query);
            if($result->num_rows <= 0) {
                printLn('<p>Jelenleg nincs aktiválandó fiók</p>');
            } else {
                printLn('<table>');
                printLn('<tr>');
                printLn('<th>request_id</th>');
                printLn('<th>username</th>');
                printLn('<th>email</th>');
                printLn('<th></th>');
                printLn('<th></th>');
                printLn('</tr>');

                while($row = $result->fetch_assoc()) {
                    printLn('<tr>');
                    printLn('<td>'.$row['request_id'].'</td>');
                    printLn('<td>'.$row['username'].'</td>');
                    printLn('<td>'.$row['email'].'</td>');
                    printLn('<td><a href="/admin/admin.php?aktivalas=1&request_id='.$row['request_id'].'">Aktiválás</a></td>');
                    printLn('<td><a href="/admin/admin.php?elutasitas=1&request_id='.$row['request_id'].'">Elutasítás</a></td>');
                    printLn('</tr>');
                }
                printLn('</table>');
            }

            printLn('<h3>Aktív fiókok</h3>');
            $query = "select * from hausz_megoszto.users";
            $result = $conn->query($query);
            die_if( !$result, 'Query hiba: '.$query);

            if($result->num_rows > 0) {
                printLn('<table>');
                printLn('<tr>');
                printLn('<th>id</th>');
                printLn('<th>username</th>');
                printLn('<th>email</th>');
                printLn('<th>Admin</th>');
                printLn('<th></th>');
                printLn('</tr>');

                while($row = $result->fetch_assoc()) {
                    printLn('<tr>');
                    printLn('<td>'.$row['id'].'</td>');
                    printLn('<td>'.$row['username'].'</td>');
                    printLn('<td>'.$row['email'].'</td>');
                    printLn('<td>'.$row['admin'].'</td>');
                    printLn('<td><a href="/admin/admin.php?torles=1&user_id='.$row['id'].'">Törlés</a></td>');
                    printLn('</tr>');
                }
                printLn('</table>');
            }

            // id | szolgaltatas | bejegyzes   | komment                     | felhasznalo | datum         
            printLn('<h3>Log</h3>');
            $query = "select * from hausz_log.log order by datum desc limit 100";
            $result = $conn->query($query);
            die_if( !$result, 'Query hiba: '.$query);

            if($result->num_rows > 0) {
                printLn('<table>');
                printLn('<tr>');
                printLn('<th>id</th>');
                printLn('<th>szolgaltatas</th>');
                printLn('<th>bejegyzes</th>');
                printLn('<th>komment</th>');
                printLn('<th>felhasznalo</th>');
                printLn('<th>datum</th>');
                printLn('</tr>');

                while($row = $result->fetch_assoc()) {
                    printLn('<tr>');
                    printLn('<td>'.$row['id'].'</td>');
                    printLn('<td>'.$row['szolgaltatas'].'</td>');
                    printLn('<td>'.$row['bejegyzes'].'</td>');
                    printLn('<td>'.$row['komment'].'</td>');
                    printLn('<td>'.$row['felhasznalo'].'</td>');
                    printLn('<td>'.$row['datum'].'</td>');
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