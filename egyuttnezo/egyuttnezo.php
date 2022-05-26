<?php
	session_start();

	if($_GET['allitas'] == 1 || $_GET['statusz'] == 1) {
		$servername = "127.0.0.1";
		$username = "root";
		$password = "root";
		$dbname = "hausz_egyuttnezo";
		$conn = new mysqli($servername, $username, $password, $dbname);
		$conn->set_charset("utf8mb4");
		if ($conn->connect_error) { 
			printLn("Nem sikerült csatlakozni az SQL szerverhez: " . $conn->connect_error);
			printLn("Kérlek vedd fel a kapcsolatot a rendszergazdával a csaba@hausz.stream e-mail címen.");
			die();
		}
		// Videó azonosító, másodperc, megy-e a videó? (I/N), lejátszási sebesség, dátum
		// GET kapcsolók:	statusz,  allitas

		if($_GET['statusz'] == 1) {
			$result = $conn->query("select id, video_id from hausz_egyuttnezo.statusz where video_id is not null order by id desc limit 1;");
			$row = $result->fetch_assoc();
			echo $row['video_id'].',';
			$id = $row['id'];
			$result = $conn->query("select id, masodperc from hausz_egyuttnezo.statusz where masodperc is not null and id >= ".$id." order by id desc limit 1;");
			$masodperc = $result->fetch_assoc()['masodperc'];
			echo $masodperc.',';
			if(strlen($masodperc) == 0) { $masodperc = "0"; }
			$result = $conn->query("select id, lejatszas, datum from hausz_egyuttnezo.statusz where lejatszas is not null and id >= ".$id." order by id desc limit 1;");
			$lejatszas = $result->fetch_assoc()['lejatszas'];
			$result = $conn->query("select id, lejatszas, datum from hausz_egyuttnezo.statusz where lejatszas is not null and lejatszas != 'N' and id >= ".$id." order by id desc limit 1;");
			$datum = $result->fetch_assoc()['datum'];
			echo $lejatszas.',';
			$result = $conn->query("select id, sebesseg from hausz_egyuttnezo.statusz where sebesseg is not null and id >= ".$id." order by id desc limit 1;");
			echo $result->fetch_assoc()['sebesseg'].',';
			if($lejatszas != "N") {
				$result = $conn->query("select *, TIME_TO_SEC(TIMEDIFF(now(), datum)) + ".$masodperc." as tenyleges_masodperc from hausz_egyuttnezo.statusz where datum is not null order by id desc limit 1;");
				echo $result->fetch_assoc()['tenyleges_masodperc'];
			} else {
				echo $masodperc;
			}
			$result = $conn->query("select id from hausz_egyuttnezo.statusz order by id desc limit 1;");
			echo ', '.$result->fetch_assoc()['id'];
			die();
		}

		if($_GET['allitas'] == 1) {
			if($_SESSION['loggedin'] != "yes") {
				die();
			}
			$masodperc = "";
			$query = "insert into hausz_egyuttnezo.statusz (";
			$adatok = "";
			if(strlen($_GET['video_id']) > 0) {
				$_GET['video_id'] = preg_replace("#(.*)/(watch)?(\?v)?i?=?([a-zA-Z0-9-_]{11})#", '$4', $_GET['video_id']);
				$query = $query.'video_id,sebesseg,lejatszas,masodperc,';
				$adatok = '"'.$_GET['video_id'].'", 1.0, "I", 0.0,';
			} else {
				$result = $conn->query("select id, video_id from hausz_egyuttnezo.statusz where video_id is not null order by id desc limit 1;");
				$id = $result->fetch_assoc()['id'];
				$result = $conn->query("select id, lejatszas, datum from hausz_egyuttnezo.statusz where lejatszas is not null and id >= ".$id." order by id desc limit 1;");
				$lejatszas = $result->fetch_assoc()['lejatszas'];
				if(strlen($_GET['lejatszas']) > 0 && $lejatszas != $_GET['lejatszas']) {
					if(strlen($_GET['masodperc']) > 0) {
						$query = $query.'lejatszas,masodperc,';
						$adatok = $adatok.'"'.$_GET['lejatszas'].'", '.$_GET['masodperc'].', ';
					} else {
						$query = $query.'lejatszas,masodperc,';
						$adatok = $adatok.'"'.$_GET['lejatszas'].'", ';
						$result = $conn->query("select masodperc from hausz_egyuttnezo.statusz where masodperc is not null order by id desc limit 1;");
						$adatok = $adatok.$result->fetch_assoc()['masodperc'].', ';
					}
				} else {
					if(strlen($_GET['masodperc']) > 0) {	$query = $query.'masodperc,'; 		$adatok = $adatok.$_GET['masodperc'].', '; }
					if(strlen($_GET['sebesseg']) > 0) {		$query = $query.'sebesseg,'; 		$adatok = $adatok.$_GET['sebesseg'].', '; }
				}
			}
			if(strlen($adatok) <= 0) {
				die();
			}
			$query = $query.'datum';
			$adatok = $adatok.' now()';
			$query = $query.') values ('.$adatok.');';
			
			$result = $conn->query($query);
			if(!$result) {
				var_dump('QUERY HIBA: '.$query);
			}
			die();
		}
	}

	include '../include/adatbazis.php';
	include '../include/alap_fuggvenyek.php';
	include "../include/belepteto_rendszer.php";

?>

<!DOCTYPE html>
<html>
	<head>
		<title>Hausz együttnéző</title>
		<meta charset="UTF-8">
        <meta name="description" content="A Hausz Kft. együttnéző szolgáltatása, ahol YouTube videókat lehet együtt nézni a világhálón keresztül.">
		<link rel="stylesheet" type="text/css" href="/index/style.css" />
		<link rel="shortcut icon" type="image/png" href="/index/favicon.png" />
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
		<script>
			fetch("/index/topbar.html")
				.then(response => response.text())
				.then(text => document.body.innerHTML = text + document.body.innerHTML)
		</script>
		<table style="width: 95%; height: 80%; background-color: rgb(70, 70, 70); border: 0px solid;">
			<tr>
				<td>
					<div id="player"></div>
				</td>
				<td style="width: 25%">
					<?php
						if($_SESSION['loggedin'] == "yes") {
							echo '<input type="text" id="video_id_mezo"></input>';
							echo '<button onclick="gomb_uj_video()">Új videó indítása</button>';
							echo '<br><br><button onclick="gomb_lejatszas()">Lejátszás</button>';
							echo '<br><button onclick="gomb_megallitas()">Megállítás</button>';
						}

						echo '<br><br><button onclick="gomb_szinkronizalas()">Idő szinkronizálása (ALPHA)</button>';
					?>
				</td>
			</tr>
		</table>
		
		
		
		

		<script>
			function keres(url) {
				xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						if(debug) {
							console.log('URL: '+url);
							console.log('VÁLASZ: '+this.responseText);
						}
					}
				};
				xhttp.open("GET", url, true);
				xhttp.send();
			}

			function gomb_megallitas() {
				player.pauseVideo();
				keres('/egyuttnezo/egyuttnezo.php?allitas=1&lejatszas=N&masodperc=' + player.getCurrentTime());
				statusz_frissitese();
			}

			function gomb_szinkronizalas() {
				statusz_frissitese();
				utolso_szinkron_ideje = Date.now();
				player.seekTo(tenyleges_masodperc,true);
			}

			function gomb_lejatszas() {
				player.playVideo();
				keres('/egyuttnezo/egyuttnezo.php?allitas=1&lejatszas=I');
				statusz_frissitese();
			}

			function gomb_uj_video() {
				keres('/egyuttnezo/egyuttnezo.php?allitas=1&video_id='+ document.getElementById('video_id_mezo').value +'');
				document.getElementById('video_id_mezo').value = "";
				statusz_frissitese();
			}

			var debug = true;
			var csuszas_tolerancia = 2.0;
			var frissitesi_ido = 100;
			var utolso_szinkron_ideje = "semmi";
			var xhttp;
			var xhttp_valasz = "";
			var video_id = "";
			var masodperc = "";
			var lejatszas = "";
			var sebesseg = "";
			var id;
			var tenyleges_masodperc = "";
			var elozo_video_id = "";
			var elozo_masodperc = "";
			var elozo_lejatszas = "";
			var elozo_sebesseg = "";
			var player;
			var elozo_PlayerState = "";
			var elozo_elozo_PlayerState = "";
			var elozo_time = "semmi";
			var lastClick;
			var utolso_teljesitett_parancs ="semmi";

			function statusz_frissitese() {
				if(elozo_time == "semmi") { elozo_time = player.getCurrentTime(); }

				xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						xhttp_valasz = this.responseText;
						video_id = xhttp_valasz.split(",")[0];
						masodperc = xhttp_valasz.split(",")[1];
						lejatszas = xhttp_valasz.split(",")[2];
						sebesseg = xhttp_valasz.split(",")[3];
						tenyleges_masodperc = xhttp_valasz.split(",")[4];
						id = xhttp_valasz.split(",")[5];
					}
				};
				xhttp.open("GET", "/egyuttnezo/egyuttnezo.php?statusz=1", true);
				xhttp.send();

				if(utolso_teljesitett_parancs == id)
					return;

				if(elozo_video_id != video_id && video_id != "") {
					console.log("Új videó parancs észlelve");
					player.loadVideoById(video_id, tenyleges_masodperc);
					player.setPlaybackRate(sebesseg);
					player.playVideo();
				}

				if(sebesseg != elozo_sebesseg && sebesseg != "") {
					console.log("Sebesség változtatás parancs észlelve");
					player.setPlaybackRate(parseFloat(sebesseg));
				}

				if(masodperc != elozo_masodperc && masodperc != "") {
					if(parseFloat(masodperc) > player.getCurrentTime() + csuszas_tolerancia || parseFloat(masodperc) < player.getCurrentTime() - csuszas_tolerancia ) {
						console.log("Tekerés parancs észlelve");
						player.seekTo(parseFloat(tenyleges_masodperc), true);
					}
				}

				if(lejatszas != "N") {
					if(lejatszas != elozo_lejatszas) {
						console.log('Indítás parancs észlelve');
					}
					player.playVideo();
				} else {
					if(lejatszas != elozo_lejatszas) {
						console.log('Megállítás parancs észlelve');
						player.pauseVideo();
						player.seekTo(parseFloat(masodperc), true);
					}
				}

				elozo_lejatszas = lejatszas;
				if(masodperc != "") {	elozo_masodperc = masodperc; }
				if(sebesseg != "") {  	elozo_sebesseg = sebesseg; }
				if(video_id != "") {	elozo_video_id = video_id; }
				elozo_time = player.getCurrentTime();
				utolso_teljesitett_parancs = id;
			}

			

			// player.loadVideoById()
			// player.getCurrentTime()
			var tag = document.createElement('script');

			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			var folyamatos_frissites;

			function onYouTubeIframeAPIReady() {
				player = new YT.Player('player', {
					height: '390',
					width: '640',
					videoId: '',
					playerVars: {
						'playsinline': 1,
						'autoplay': 1,
						'controls': <?php
										if($_SESSION['loggedin'] == "yes") {
											echo '1';
										} else {
											echo '0';
										}
									?>
					},
					events: {
						'onReady': onPlayerReady,
						'onStateChange': onStateChange
					}
				});
			}

			function onPlayerReady(event) {
				console.log("Player ready!");
				folyamatos_frissites = setInterval(statusz_frissitese, frissitesi_ido);
			}

			function onStateChange(event) {
				var jelenlegi = event.data;
				if(debug) { console.log("DEBUG: state change: "+elozo_PlayerState+" -> "+jelenlegi); }

				if(Date.now() - utolso_szinkron_ideje < 500 && elozo_PlayerState != 1 && jelenlegi == 1 && lejatszas == "N") {
					console.log("KLIENS: Indítás észlelve");
					elozo_elozo_PlayerState = elozo_PlayerState;
					elozo_PlayerState = jelenlegi;
					gomb_lejatszas();
				}
				
				if(Date.now() - utolso_szinkron_ideje < 500 && elozo_PlayerState == 1 && jelenlegi == 2 && lejatszas != "N") {
					console.log("KLIENS: Leállítás észlelve");
					elozo_elozo_PlayerState = elozo_PlayerState;
					elozo_PlayerState = jelenlegi;
					gomb_megallitas();
				}
				elozo_elozo_PlayerState = elozo_PlayerState;
				elozo_PlayerState = jelenlegi;
			}
		</script>
	</body>
</html>