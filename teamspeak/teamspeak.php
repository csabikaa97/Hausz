<?php
	session_start();

    $dbname = "hausz_megoszto";
    include '../include/adatbazis.php';
    include '../include/alap_fuggvenyek.php';
    
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

    include "../include/belepteto_rendszer.php";

    ?>

<!DOCTYPE html>
<html>
	<head>
		<title>Hausz keresztény TeamSpeak szerver</title>
		<meta charset="UTF-8">
        <meta name="description" content="A Hausz Kft. keresztény TeamSpeak szolgáltatása amit a céges kommunikáció hatékony és biztonásgos lebonyolításához lehet használni.">
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
		<script>
			fetch("/index/topbar.html")
				.then(response => response.text())
				.then(text => document.body.innerHTML = text + document.body.innerHTML)
		</script>
		<h1 style="text-align: center">Hausz keresztény TeamSpeak szerver</h1>
        <?php
                printLn('<div style="width: 50%; margin: auto">');
                printLn('<h2 class="center">Lépések a csatlakozáshoz</h2>');
                printLn('<ol>');
                printLn('<li>Töltsd le a TeamSpeak 3 kliens szoftvert a következő címről: <a href="https://teamspeak.com/en/downloads/">TeamSpeak 3 - Downloads</a></li>');
                printLn('<li>Kattints rá a következő linkre a csatlakozáshoz: <a href="ts3server://hausz.stream/?port=9987&nickname='.$_SESSION['username'].'">Csatlakozás</a></li>');
                if($_SESSION['loggedin'] == "yes") {
                    printLn('<li>Használd fel a Hausz által generált jogosultsági tokent a TeamSpeak kliensben</li>');
                    printLn('<p>Mac:       Menü bar -> Permissions -> Use Privilege Key</p>');
                    printLn('<p>Windows:  Az ablak tetején Permissions -> Use Privilege Key</p>');
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
                    printLn('<li>Ha nem rendelkezel Hausz fiókkal, akkor meg kell várnod hogy adjon jogosultságot valaki aki online van. Abban az esetben ha regisztrálsz magadnak fiókot a jobb alsó sarokban található menüben, akkor a jogosultságot meg tudod adni magadnak, így nem kell várnod sem.</li>');
                }
            ?>
        </ol>
        </div>
	</body>
</html>