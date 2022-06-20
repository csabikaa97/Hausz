<?php session_start(); ?>
<!DOCTYPE html>
<html lang="hu">

<head>
    <title>Hausz</title>
    <meta name="description" content="A cég által készített összes szolgáltatás főoldala.">
    <meta charset="utf-8">
    <link rel="stylesheet" type="text/css" href="/index/style.css" />
    <link rel="shortcut icon" type="image/png" href="/index/favicon.png" />
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "url": "http://hausz.stream",
            "logo": "http://hausz.stream/index/favicon.png",
            "aggregateRating": {
                "@type": "aggregateRating",
                "ratingValue": "4",
                "reviewCount": "69"
            }
        }
    </script>
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": [{
                    "@type": "ListItem",
                    "name": "Megosztó",
                    "position": 1,
                    "url": "https://hausz.stream/uploads/feltoltes.php"
                },
                {
                    "@type": "ListItem",
                    "name": "Webjósda",
                    "position": 2,
                    "url": "https://hausz.stream/webjosda/josda.html"
                },
                {
                    "@type": "ListItem",
                    "name": "Webjósda (fizetős verzió)",
                    "position": 3,
                    "url": "https://hausz.stream/webjosda/fizetos.html"
                }
            ]
        }
    </script>
</head>

<body onload="document.getElementById('ujitasok_doboz').style.bottom = document.getElementById('belepes_doboz').offsetHeight + 20 + 'px';">
    <?php
        readfile("/var/www/html/index/topbar.html");

        $dbname = "hausz_megoszto";
        include 'include/adatbazis.php';
        include 'include/alap_fuggvenyek.php';
        include "include/belepteto_rendszer.php";

        $ujitasok = array();
        array_push($ujitasok, "");
        array_push($ujitasok, "Együttnéző: Még sok tesztelésre van szükség, és nem valószínű hogy a közeljövőben használható lesz az oldal. Egyelőre egy passion project, de idővel lehet hogy egy kész szolgáltatás lesz majd.");
        array_push($ujitasok, "Megosztó: Lehet szerkeszteni a kis ceruza ikonnal a saját fájlok nevét.");
        array_push($ujitasok, "TeamSpeak oldal: Tartalmaz egy rövid leírást új felhasználók számára, lehet rajta jogosultságot igényelni, és meg lehet tekinteni a szerver státuszát, illetve az online felhasználókat.");
        
        printLn('<div id="ujitasok_doboz" class="bottom_left_corner_div" style="max-width: 20%"><h3>Újítások a Hauszon</h3><ul>');
        foreach($ujitasok as $ujitas) {
            if(strlen($ujitas) > 0) {
                if(preg_match('/:/', $ujitas)) {
                    $ujitas = explode(':', $ujitas);
                    printLn('<li><font style="text-decoration: underline">'.$ujitas[0].'</font>:'.$ujitas[1].'</li><br>');
                } else {
                    printLn('<li>'.$ujitas.'</li><br>');
                }
            }
        }
        printLn('</ul></div>');
    ?>
    <div class="center FuggolegesCenter FullDoboz">
        <img id="hausz_logo" class="center" src="/index/hausz.svg" alt="Hausz logo">
        <br>
        <br>
        <form action="https://www.google.com/search" class="center searchform" method="get" name="searchform">
            <input value="" autocomplete="off" class="center InputSzoveg" name="q" placeholder="Mit szeretnél megtalálni more?" required="required" type="text">
            <br>
            <br>
            <button class="center inline Gombok" type="submit">Keressed more</button>
            <button class="center inline Gombok" onclick="alert('Az jó he!')">Jó napom van more</button>
        </form>
    </div>
</body>

</html>