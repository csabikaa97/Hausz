<?php session_start(); ?>
<!DOCTYPE html>
<html lang="hu">

<head>
    <title>Hausz</title>
    <meta name="description" content="A Hausz Kft. hivatalos weboldala, ahol a cég, a cég által készített összes szolgáltatás leírása, a Hausz megosztó, és egyéb weboldalak találhatóak.">
    <meta charset=" UTF-8">
    <link rel="stylesheet" type="text/css" href="/index/style.css" />
    <link rel="shortcut icon" type="image/png" href="/index/favicon.png" />
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "url": "http://hausz.stream",
            "logo": "http://hausz.stream/index/favicon.png"
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

<body>
    <script>
        fetch("/index/topbar.html")
            .then(response => response.text())
            .then(text => document.body.innerHTML = text + document.body.innerHTML)
    </script>
    <?php
        include 'include/adatbazis.php';
        include 'include/alap_fuggvenyek.php';
        include "include/belepteto_rendszer.php";
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