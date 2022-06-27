<?php
    session_start();

    $dbname = "hausz_megoszto";
    include '../include/adatbazis.php';
    include '../include/alap_fuggvenyek.php';

    $query = "select *, timestampdiff(second, datum, now(6)) as kulonbseg from hausz_ts.szolgaltatas_statusz order by datum desc limit 1;";
    $result = $conn->query($query);
    if(!$result) {
        printLn('Query hiba: '.$query);
        die();
    }
    $kell_statusz_update = 0;
    if($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if(intval($row['kulonbseg']) > 5) {
            $kell_statusz_update = 1;
        }
    } else {
        $kell_statusz_update = 1;
    }

    if($kell_statusz_update == 1) {
        $statusz = "";

        $eredmeny = shell_exec("pgrep -l 'ts3server'");
        if(preg_match('/(.*)ts3server(.*)/', $eredmeny, $matches)) {
            $statusz .= "folyamat ok";
        }
        $statusz .= ",";
        
        $eredmeny = shell_exec("/var/www/html/teamspeak/check_telnet.sh");
        $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
        if(preg_match('/(.*)elcome to the TeamSpeak 3 ServerQuery interface(.*)/', $eredmeny, $matches)) {
            $statusz .= "telnet ok";
        }
        $statusz .= ",";

        $eredmeny = "";
        $eredmeny = shell_exec("uptime");
        $eredmeny = preg_replace('/(.*)load average: ([0-9]\.[0-9][0-9]), ([0-9]\.[0-9][0-9]), ([0-9]\.[0-9][0-9])(.*)/', '$2;$3;$4', $eredmeny);
        $eredmeny = preg_replace('/\s/', '', $eredmeny);
        $statusz .= $eredmeny;
        
        $query = "delete from hausz_ts.szolgaltatas_statusz;";
        $result = $conn->query($query);
        if(!$result) {
            printLn('Query hiba: '.$query);
            die();
        }

        $query = "insert into hausz_ts.szolgaltatas_statusz (datum, statusz) values (now(6), '".$statusz."');";
        $result = $conn->query($query);
        if(!$result) {
            printLn('Query hiba: '.$query);
            die();
        }
    }
    
    if($_GET['uj_token'] == 1 && $_SESSION['loggedin'] == "yes") {
        $eredmeny = shell_exec('/var/www/html/teamspeak/create_token.sh');
        $eredmeny = preg_replace('/\s+/', '', $eredmeny);
        $eredmeny = preg_replace('/(.*)tokenid2=0token=(.*)error(.*)/', '$2', $eredmeny);
        $conn->query('use hausz_ts;');
        $result = $conn->query('select datediff(now(), generalasi_datum) as kulonbseg from felhasznalo_tokenek where user_id = '.$_SESSION['user_id'].';');
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            if($row['kulonbseg'] == 0) {
                printLn('Csak 5 naponként lehet új tokent igényelni. A jelenlegi tokened ma készült.');
                die();
            }
            if($row['kulonbseg'] < 5) {
                printLn('Csak 5 naponként lehet új tokent igényelni. A jelenlegi tokened '.$row['kulonbseg'].' napja készült.');
                die();
            }
            $conn->query('delete from felhasznalo_tokenek where user_id = '.$_SESSION['user_id']);
        }
        $query = "insert into felhasznalo_tokenek (user_id, token, generalasi_datum) values (".$_SESSION['user_id'].", '".$eredmeny."', now());";
        $result = $conn->query($query);
        if(!$result) {
            printLn('Query hiba: '.$query);
            die();
        }
        header('Location: https://hausz.stream/teamspeak/teamspeak.php');
    }

    ?>

<!DOCTYPE html>
<html lang="hu">
	<head>
		<title>Keresztény TeamSpeak szerver - Hausz</title>
		<meta charset="UTF-8">
        <meta name="description" content="Keresztény TeamSpeak szolgáltatás amely a céges kommunikáció hatékony és biztonásgos lebonyolításához használható.">
		<link rel="stylesheet" type="text/css" href="../index/style.css" />
        <link rel="stylesheet" type="text/css" href="/index/alapok.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="shortcut icon" type="image/png" href="/index/favicon.png"/>
        <script type='application/ld+json'>
            {
                "@context": "https://www.schema.org",
                "@type": "product",
                "brand": {
					"@type": "Brand",
					"name": "Hausz"
				}
                "logo": "http://hausz.stream/index/favicon.png",
                "name": "WidgetPress",
                "category": "Widgets",
                "image": "http://hausz.stream/index/favicon.png",
                "description": "A Hausz Kft. keresztény TeamSpeak szolgáltatása amit a céges kommunikáció hatékony és biztonásgos lebonyolításához lehet használni.",
                "aggregateRating": {
                    "@type": "aggregateRating",
                    "ratingValue": "5",
                    "reviewCount": "69"
                }
            }
        </script>
	</head>
	<body>
        <span id="belepteto_rendszer"></span>
        <script src="/include/topbar.js"></script>
        <script src="/include/alap_fuggvenyek.js"></script>
        <script src="/include/belepteto_rendszer.js"></script>
        <script>
            function belepes_siker() {
                location.reload();
            }

            function kilepes_siker() {
                location.reload();
            }
        </script>
		<h1 style="text-align: center">Hausz keresztény TeamSpeak szerver</h1>
        <?php
            printLn('<div style="max-width: 800px; width: 90%; margin: auto">');
            printLn('<h3>Lépések a csatlakozáshoz</h3>');
            printLn('<ol>');
            printLn('<li>Töltsd le a TeamSpeak 3 kliens szoftvert, és telepítsd az eszközödre.');
            printLn('<p>Windows: <a href="#" onclick="window.open(\'https://hausz.stream/uploads/request.php?file_id=390\')">Hausz megosztó - TeamSpeak3-Client-win64-3.5.6.exe</a></p>');
            printLn('<p>MacOS: <a href="#" onclick="window.open(\'https://hausz.stream/uploads/request.php?file_id=343\')">Hausz megosztó - TeamSpeak3-Client-macosx-3.5.7.dmg</a></p></li>');
            printLn('<li>Kattints rá a következő linkre a csatlakozáshoz: <a href="ts3server://hausz.stream/?port=9987&nickname='.$_SESSION['username'].'">Csatlakozás</a></li>');
            if($_SESSION['loggedin'] == "yes") {
                printLn('<li>Használd fel a Hausz által generált jogosultsági tokent a TeamSpeak kliensben</li>');
                printLn('<p>Windows:  Az ablak tetején Permissions > Use Privilege Key</p>');
                printLn('<p>MacOS:       Menü bar > Permissions > Use Privilege Key</p>');
                printLn('<p>A lehetőség kiválasztásakor felugró ablakba kell beillesztened az alábbi tokent ami megadja számodra a "Szabad ember" jogosultsági szintet.</p>');
                $result = $conn->query('use hausz_ts;');
                $query = 'select * from felhasznalo_tokenek where user_id = '.$_SESSION['user_id'];
                $result = $conn->query($query);
                if(!$result) {
                    printLn('Query hiba: '.$query);
                    die();
                }
                if($result->num_rows > 0) {
                    $row = $result->fetch_assoc();
                    printLn('<p>Jelenlegi jogosultsági tokened:   '.$row['token'].'</p>');
                } else {
                    printLn('<p>Nincs jelenleg jogosultsági tokened: <a href="https://hausz.stream/teamspeak/teamspeak.php?uj_token=1">Új token kérése</a></p>');

                }
                $conn->query('use hausz_ts;');
                $query = 'select datediff(now(), generalasi_datum) as kulonbseg from felhasznalo_tokenek where user_id = '.$_SESSION['user_id'].';';
                $result = $conn->query($query);
                if(!$result) {
                    printLn('Query hiba: '.$query);
                }
                if($result->num_rows > 0) {
                    $row = $result->fetch_assoc();
                    if($row['kulonbseg'] >= 5) {
                        printLn('<p>Jogosult vagy új token kérésére, mert a jelenlegi tokened '.$row['kulonbseg'].' napja készült: <a href="https://hausz.stream/teamspeak/teamspeak.php?uj_token=1">Új token kérése</a></p>');
                    }
                }
            } else {
                printLn('<li>Ha nem rendelkezel Hausz fiókkal, akkor meg kell várnod hogy adjon jogosultságot valaki aki online van. Abban az esetben ha regisztrálsz magadnak fiókot a jobb alsó sarokban található gombbal, akkor a jogosultságot meg tudod adni magadnak, és az online felhasználók listáját is láthatod erről a weboldalról.</li>');
            }
            printLn('</ol>');

            if($_SESSION['loggedin'] == "yes") {
                printLn('<br><br><h3>Online felhasználók</h3>');
                printLn('<ul>');
                $van_online_felhasznalo = false;
                $eredmeny = shell_exec('/var/www/html/teamspeak/list_clients.sh');
                $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
                $eredmeny = preg_replace('/[\n\r]/', ' ', $eredmeny);
                $eredmeny = explode('|', $eredmeny);
                foreach($eredmeny as $sor) {
                    $sor = preg_replace('/(.*)client_nickname=(.*) client_type=(.*)/', '$2', $sor);
                    if($sor != "serveradmin") {
                        $sor = preg_replace('/\\\s/', ' ', $sor);
                        printLn('<li>'.$sor.'</li>');
                        $van_online_felhasznalo = true;
                    }
                }
                printLn('</ul>');
                if(!$van_online_felhasznalo) {
                    printLn('<p>Jelenleg senki nincs csatlakozva a szerverhez.</p>');
                }
            }

            $query = "select * from hausz_ts.szolgaltatas_statusz order by datum desc limit 1;";
            $result = $conn->query($query);
            if(!$result) {
                printLn('Query hiba: '.$query);
                die();
            }
            $minden_rendben = true;
            if($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $buffer = "";
                if(preg_match('/(.*)folyamat ok(.*)/', $row['statusz'], $matches)) {    $buffer .= '<p>🟩 TeamSpeak szerver folyamat fut</p>'; }
                if(!preg_match('/(.*)folyamat ok(.*)/', $row['statusz'], $matches)) {   
                    $buffer .= '<p>🟥 TeamSpeak szerver folyamat nem fut</p>';
                    $minden_rendben = false;
                }
                if(preg_match('/(.*)telnet ok(.*)/', $row['statusz'], $matches)) {    $buffer .= '<p>🟩 Telnet elérhető</p>'; }
                if(!preg_match('/(.*)telnet ok(.*)/', $row['statusz'], $matches)) {   
                    $buffer .= '<p>🟥 Telnet csatlakozás sikertelen</p>';
                    $minden_rendben = false;
                }
                $statusz_reszek = explode(',', $row['statusz']);
                $processzor_hasznalat_reszek = explode(';', $statusz_reszek[2]);
                $processzor_tulterheltseg_szint = 0.9;
                if( floatval($processzor_hasznalat_reszek[2]) >= $processzor_tulterheltseg_szint ) {
                    if( floatval($processzor_hasznalat_reszek[0]) >= $processzor_tulterheltseg_szint ) {
                        $buffer .= '<p>🟥 Processzor terhelés - magas körülbelül 15 perce</p>';
                        $minden_rendben = false;
                    } else {
                        if( floatval($processzor_hasznalat_reszek[1]) < $processzor_tulterheltseg_szint ) {
                            $buffer .= '<p>🟨 Processzor terhelés - magas volt körülbelül 15 perce, de már lecsökkent</p>';
                            $minden_rendben = false;
                        } else {
                            $buffer .= '<p>🟧 Processzor terhelés - magas volt körülbelül 5 perce, de már kezd lecsökkenni</p>';
                            $minden_rendben = false;
                        }
                    }
                } else {
                    if( floatval($processzor_hasznalat_reszek[1]) >= $processzor_tulterheltseg_szint ) {
                        if( floatval($processzor_hasznalat_reszek[0]) >= $processzor_tulterheltseg_szint ) {
                            $buffer .= '<p>🟧 Processzor terhelés - magas körülbelül 5 perce</p>';
                            $minden_rendben = false;
                        } else {
                            $buffer .= '<p>🟨 Processzor terhelés - magas volt körülbelül 5 perce, de most alacsony</p>';
                            $minden_rendben = false;
                        }
                    } else {
                        if( floatval($processzor_hasznalat_reszek[0]) >= $processzor_tulterheltseg_szint ) {
                            $buffer .= '<p>🟨 Processzor terhelés - elfogadható</p>';
                            $minden_rendben = false;
                        } else {
                            $buffer .= '<p>🟩 Processzor terhelés - optimális</p>';
                        }
                    }
                }
            }

            $eredmeny = shell_exec('free');
            $eredmeny = preg_replace('/\n/', ' ', $eredmeny);
            $eredmeny = preg_replace('/\s+/', ' ', $eredmeny);
            $memoria_osszes = preg_replace('/(.*)Mem: ([0-9]*) (.*)/', '$2', $eredmeny);
            $memoria_szabad = preg_replace('/(.*)Mem: ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*) ([0-9]*) (.*)/', '$7', $eredmeny);
            $memoria_arany = (floatval($memoria_osszes) - floatval($memoria_szabad)) / floatval($memoria_osszes);
            if($memoria_arany >= 0.95) {
                $buffer .= '<p>🟥 Memória használat - nagyon magas</p>';
                $minden_rendben = false;
            } else {
                if($memoria_arany >= 0.85) {
                    $buffer .= '<p>🟧 Memória használat - magas</p>';
                    $minden_rendben = false;
                } else {
                    if($memoria_arany >= 0.75) {
                        $buffer .= '<p>🟨 Memória használat - elfogadható</p>';
                        $minden_rendben = false;
                    } else {
                        $buffer .= '<p>🟩 Memória használat - optimális</p>';
                    }
                }
            }

            $swap_osszes = preg_replace('/(.*)Swap: ([0-9]*) (.*)/', '$2', $eredmeny);
            $swap_szabad = preg_replace('/(.*)Swap: ([0-9]*) ([0-9]*) ([0-9]*)(.*)/', '$4', $eredmeny);
            $swap_arany = (floatval($swap_osszes) - floatval($swap_szabad)) / floatval($swap_osszes);
            if($swap_arany >= 0.95) {
                $buffer .= '<p>🟥 Virtuális memória használat - nagyon magas</p>';
                $minden_rendben = false;
            } else {
                if($swap_arany >= 0.85) {
                    $buffer .= '<p>🟧 Virtuális memória használat - magas</p>';
                    $minden_rendben = false;
                } else {
                    if($swap_arany >= 0.75) {
                        $buffer .= '<p>🟨 Virtuális memória használat - elfogadható</p>';
                        $minden_rendben = false;
                    } else {
                        $buffer .= '<p>🟩 Virtuális memória használat - optimális</p>';
                    }
                }
            }

            $query_tarhely_adat = "select * from hausz_megoszto.tarhely_statisztika order by datum desc limit 1;";
            $result_tarhely_adat = $conn->query($query_tarhely_adat);
            $szabad_tarhely = "";
            $foglalt_tarhely = "";
            if(!$result_tarhely_adat) {
                printLn('Query hiba: '.$query_tarhely_adat);
                die();
            } else {
                $row = $result_tarhely_adat->fetch_assoc();
                $szabad_tarhely = floatval($row['szabad']);
                $foglalt_tarhely = floatval($row['foglalt']);
            }

            $teljes_tarhely = floatval(8065444*1024);
            $tarhely_arany = $szabad_tarhely / $teljes_tarhely;
            $tarhely_arany = 1.0 - $tarhely_arany;

            if($tarhely_arany >= 0.95) {
                $buffer .= '<p>🟥 Lemezterület kihasználtság - nagyon magas</p>';
                $minden_rendben = false;
            } else {
                if($tarhely_arany >= 0.85) {
                    $buffer .= '<p>🟧 Lemezterület kihasználtság - magas</p>';
                    $minden_rendben = false;
                } else {
                    if($tarhely_arany >= 0.75) {
                        $buffer .= '<p>🟨 Lemezterület kihasználtság - elfogadható</p>';
                        $minden_rendben = false;
                    } else {
                        $buffer .= '<p>🟩 Lemezterület kihasználtság - optimális</p>';
                    }
                }
            }

            if( $minden_rendben ) {
                printLn('<br><br><h3 id="szerver_allapot">A szerver állapota jelenleg kifogástalan 🥳</h3>');
            } else {
                printLn('<br><br><h3 id="szerver_allapot">Szerver állapot</h3>');
                printLn($buffer);
            }
            
            printLn('<br><br>');
            ?>
        </div>
	</body>
</html>