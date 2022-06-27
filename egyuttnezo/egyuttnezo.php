<?php session_start(); ?>
<!DOCTYPE html>
<html lang="hu">
	<head>
		<title>Együttnéző - Hausz</title>
		<meta charset="UTF-8">
        <meta name="description" content="Együttnéző szolgáltatás, ahol YouTube videókat lehet szinkronban nézni a világhálón keresztül.">
		<link rel="stylesheet" type="text/css" href="../index/style.css" />
		<link rel="stylesheet" type="text/css" href="/index/alapok.css" />
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
                "description": "A Hausz Kft. együttnéző szolgáltatása, ahol YouTube videókat lehet együtt nézni a világhálón keresztül.",
                "aggregateRating": {
                    "@type": "aggregateRating",
                    "ratingValue": "2",
                    "reviewCount": "69"
                }
            }
        </script>
	</head>
	<body>
		<?php
			$dbname = "hausz_megoszto";
			include '../include/adatbazis.php';
			include '../include/alap_fuggvenyek.php';
		?>
		<script src="/include/topbar.js"></script>
        <script src="/include/alap_fuggvenyek.js"></script>
		<script src="/include/belepteto_rendszer.js"></script>
    	<span id="belepteto_rendszer"></span>
    
		<h1 style="text-align: center">Hausz együttnéző</h1>
		<table style="width: 95%; height: 80%; background-color: rgb(70, 70, 70); border: 0px solid;">
			<tr>
				<td>
					<div id="player"></div>
				</td>
				<td style="width: 25%; max-width: 25%">
					<?php

						echo '<h2>Jelenlegi videó:</h2>';
						echo '<a style="font-size: 18px" href="" id="video_link"></a><br><br>';
						echo '<h3 id="csatlakozas_statusz"></h3>';
						echo '<h3 id="valaszido"></h3>';
						

						if($_SESSION['loggedin'] == "yes") {
							echo '<input type="text" id="video_id_mezo" onkeydown="input_uj_video()"></input>';
							echo '<button onclick="gomb_uj_video()">Új videó indítása</button>';
						}

						echo '<br><br><button onclick="gomb_szinkronizalas()">Idő szinkronizálása (Átmeneti amíg nem lesz jobb megoldás)</button>';
						echo '<br><br>';

						if($_SESSION['loggedin'] == "yes") {
							printLn('<div id="parancs_box" style="overflow-y: scroll; max-height: 300px; background-color: rgb(50,50,50);">');
							printLn('<h2>Online felhasználók</h2>');
							printLn('<ul id="nev_lista"></ul>');
							printLn('<h2>Parancsok</h2>');
							printLn('<ul id="parancs_lista"></ul>');
							printLn('</div>');
						}
					?>
				</td>
			</tr>
		</table>
		<script>
			"use strict";
			
			function gomb_megallitas() {
				<?php
					if($_SESSION['loggedin'] == "yes") {
						printLn('player.pauseVideo();');
						printLn('console.log(player.getCurrentTime());');
						printLn('socket.send("lejatszas:N|tekeres:" + player.getCurrentTime());');
					} else {
						printLn('player.playVideo();');
					}
				?>
			}

			function gomb_lejatszas() {
				<?php
					if($_SESSION['loggedin'] == "yes") {
						printLn('player.playVideo();');
						printLn('socket.send("lejatszas:I");');
					}
				?>
			}

			<?php 
				if(strlen($_SESSION['username']) > 0) {
					printLn('let vanfelhasznalonev_BOOL = true;');
					printLn('let felhasznalonev_STRING = "'.$_SESSION['username'].'";');
				} else {
					printLn('let vanfelhasznalonev_BOOL = false;');
				}
			?>

			let controls_INT = <?php
                            if($_SESSION['loggedin'] == "yes") {
                                echo '1';
                            } else {
                                echo '0';
                            }
                        ?>;
			
		</script>
		<script src="egyuttnezo.js"></script>
	</body>
</html>