<?php
	session_start();

	if($_GET['allitas'] == 1 || $_GET['statusz'] == 1 || $_GET['teszt'] == 1 || $_GET['visszajelzes'] == 1) {
		$dbname = "hausz_egyuttnezo";
		include '../include/adatbazis.php';
		// Videó azonosító, másodperc, megy-e a videó? (I/N), lejátszási sebesség, dátum
		// GET kapcsolók:	statusz,  allitas

		if($_GET['statusz'] == 1) {
			$buffer = "";
			$result_video_id = $conn->query("select id, video_id from hausz_egyuttnezo.statusz where video_id is not null order by id desc limit 1;");
			$row_video_id = $result_video_id->fetch_assoc();
			$id = $row_video_id['id'];
			$buffer = $buffer. $row_video_id['video_id'].',';

			$result_masodperc = $conn->query("select masodperc from hausz_egyuttnezo.statusz where masodperc is not null and id >= ".$id." order by id desc limit 1;");
			$masodperc = $result_masodperc->fetch_assoc()['masodperc'];
			if(strlen($masodperc) == 0) { $masodperc = "0"; }
			$buffer = $buffer. $masodperc.',';

			$result_lejatszas = $conn->query("select lejatszas from hausz_egyuttnezo.statusz where lejatszas is not null and id >= ".$id." order by id desc limit 1;");
			$row_lejatszas = $result_lejatszas->fetch_assoc();
			$buffer = $buffer. $row_lejatszas['lejatszas'].',';

			$result_sebesseg = $conn->query("select sebesseg from hausz_egyuttnezo.statusz where sebesseg is not null and id >= ".$id." order by id desc limit 1;");
			$row_sebesseg = $result_sebesseg->fetch_assoc();
			$buffer = $buffer. $row_sebesseg['sebesseg'].',';
			
			if($row_lejatszas['lejatszas'] != "N") {
				$result_tenyleges_masodperc = $conn->query("select (TIMESTAMPDIFF(MICROSECOND, datum, now(6))) / 1000000 + ".$masodperc." as tenyleges_masodperc from hausz_egyuttnezo.statusz where datum is not null order by id desc limit 1;");
				$row_tenyleges_masodperc = $result_tenyleges_masodperc->fetch_assoc();
				$buffer = $buffer. $row_tenyleges_masodperc['tenyleges_masodperc'];
			} else {
				$buffer = $buffer. $masodperc;
			}

			$result_id_user = $conn->query("select id, user from hausz_egyuttnezo.statusz order by id desc limit 1;");
			$row_id_user = $result_id_user->fetch_assoc();
			$buffer = $buffer. ','.$row_id_user['id'].','.$row_id_user['user'];

			echo($buffer);

			/*
			$query = "insert into hausz_egyuttnezo.visszajelzes (session_id, nev, datum) values ('".session_id()."', '".$_SESSION['username']."', now(6));";
			$result = $conn->query($query);
			if(!$result) {
				var_dump('QUERY HIBA: '.$query);
			}
			*/
			die();
		}

		if($_GET['teszt'] == 1) {
			$buffer = "";
			$result_video_id = $conn->query("select id, video_id from hausz_egyuttnezo.statusz where video_id is not null order by id desc limit 1;");
			$row_video_id = $result_video_id->fetch_assoc();
			$id = $row_video_id['id'];
			$buffer = $buffer. $row_video_id['video_id'].',';

			$result_masodperc = $conn->query("select masodperc from hausz_egyuttnezo.statusz where masodperc is not null and id >= ".$id." order by id desc limit 1;");
			$masodperc = $result_masodperc->fetch_assoc()['masodperc'];
			if(strlen($masodperc) == 0) { $masodperc = "0"; }
			$buffer = $buffer. $masodperc.',';

			$result_lejatszas = $conn->query("select lejatszas from hausz_egyuttnezo.statusz where lejatszas is not null and id >= ".$id." order by id desc limit 1;");
			$row_lejatszas = $result_lejatszas->fetch_assoc();
			$buffer = $buffer. $row_lejatszas['lejatszas'].',';

			$result_sebesseg = $conn->query("select sebesseg from hausz_egyuttnezo.statusz where sebesseg is not null and id >= ".$id." order by id desc limit 1;");
			$row_sebesseg = $result_sebesseg->fetch_assoc();
			$buffer = $buffer. $row_sebesseg['sebesseg'].',';
			
			if($row_lejatszas['lejatszas'] != "N") {
				$result_tenyleges_masodperc = $conn->query("select (TIMESTAMPDIFF(MICROSECOND, datum, now(6))) / 1000000 + ".$masodperc." as tenyleges_masodperc from hausz_egyuttnezo.statusz where datum is not null order by id desc limit 1;");
				$row_tenyleges_masodperc = $result_tenyleges_masodperc->fetch_assoc();
				$buffer = $buffer. $row_tenyleges_masodperc['tenyleges_masodperc'];
			} else {
				$buffer = $buffer. $masodperc;
			}

			$result_id_user = $conn->query("select id, user from hausz_egyuttnezo.statusz order by id desc limit 1;");
			$row_id_user = $result_id_user->fetch_assoc();
			$buffer = $buffer. ','.$row_id_user['id'].','.$row_id_user['user'];

			echo($buffer);
			die();
		}

		if($_GET['visszajelzes'] == 1) {
			if($_SESSION['loggedin'] == "yes") {
				$query = "insert into hausz_egyuttnezo.visszajelzes (session_id, nev, datum) values ('".session_id()."', '".$_SESSION['username']."', now(6));";
			} else {
				$query = "insert into hausz_egyuttnezo.visszajelzes (session_id, nev, datum) values ('".session_id()."', 'Nem regisztrált felhasználó (".session_id().")', now(6));";
			}
			$result = $conn->query($query);
			if(!$result) {
				var_dump('QUERY HIBA: '.$query);
				die();
			}

			$query = "select distinct nev from hausz_egyuttnezo.visszajelzes where TIMESTAMPDIFF(second, datum, now(6)) < 31 order by nev;";
			$result = $conn->query($query);
			if(!$result) {
				var_dump('QUERY HIBA: '.$query);
				die();
			}

			if($result->num_rows > 0) {
				$row = $result->fetch_assoc();
				echo $row['nev'];
				while($row = $result->fetch_assoc()) {
					echo ','.$row['nev'];
				}
			}
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
			$query = $query.'datum, user';
			$adatok = $adatok.' now(6), "'.$_SESSION['username'].'"';
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
	<body onload="visszajelzes_kuldese()">
		<script>
			fetch("/index/topbar.html")
				.then(response => response.text())
				.then(text => document.body.innerHTML = text + document.body.innerHTML)
		</script>
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

						if($_SESSION['loggedin'] == "yes") {
							echo '<input type="text" id="video_id_mezo" onkeydown="input_uj_video()"></input>';
							echo '<button onclick="gomb_uj_video()">Új videó indítása</button>';
						}

						echo '<br><br><button onclick="gomb_szinkronizalas()">Idő szinkronizálása (Átmeneti amíg nem lesz jobb megoldás)</button>';
					?>
					<br><br>
					<div id="parancs_box" style="overflow-y: scroll; max-height: 300px; background-color: rgb(50,50,50);">
						<h2>Online felhasználók</h2>
						<ul id="nev_lista"></ul>
						<h2>Parancsok</h2>
						<ul id="parancs_lista"></ul>
					</div>
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
				<?php
					if($_SESSION['loggedin'] == "yes") {
						printLn("keres('/egyuttnezo/egyuttnezo.php?allitas=1&lejatszas=N&masodperc=' + player.getCurrentTime());");
					}
				?>
			}
			
			function gomb_lejatszas() {
				<?php
					if($_SESSION['loggedin'] == "yes") {
						printLn("keres('/egyuttnezo/egyuttnezo.php?allitas=1&lejatszas=I');");
					}
				?>
			}

			function gomb_szinkronizalas() {
				statusz_frissitese();
				utolso_szinkron_ideje = Date.now();
				player.seekTo(tenyleges_masodperc,true);
			}

			function gomb_uj_video() {
				utolso_szinkron_ideje = Date.now();
				keres('/egyuttnezo/egyuttnezo.php?allitas=1&video_id='+ document.getElementById('video_id_mezo').value +'');
				document.getElementById('video_id_mezo').value = "";
				statusz_frissitese();
			}

			function input_uj_video() {
				if(event.key === 'Enter') {
					utolso_szinkron_ideje = Date.now();
					keres('/egyuttnezo/egyuttnezo.php?allitas=1&video_id='+ document.getElementById('video_id_mezo').value +'');
					document.getElementById('video_id_mezo').value = "";
					statusz_frissitese();
				}
			}

			var debug = true;
			var csuszas_tolerancia = 2.0;
			var frissitesi_ido = 500;
			var utolso_szinkron_ideje = "semmi";
			var xhttp;
			var xhttp_valasz = "";
			var video_id = "";
			var masodperc = "";
			var lejatszas = "";
			var sebesseg = "";
			var id;
			var user;
			var elozo_title;
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
			var parancs_kiiras_buffer;

			function statusz_frissitese() {
				xhttp = new XMLHttpRequest();
				var keres_kezdete = Date.now();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var keres_valaszideje = (Date.now() - keres_kezdete) / 1000;
						xhttp_valasz = this.responseText;
						video_id = xhttp_valasz.split(",")[0];
						masodperc = xhttp_valasz.split(",")[1];
						lejatszas = xhttp_valasz.split(",")[2];
						sebesseg = xhttp_valasz.split(",")[3];
						tenyleges_masodperc = xhttp_valasz.split(",")[4];
						id = xhttp_valasz.split(",")[5];
						user = xhttp_valasz.split(",")[6];
					}
				};
				xhttp.open("GET", "/egyuttnezo/egyuttnezo.php?statusz=1", true);
				xhttp.send();

				if(!player)
					return;

				if(elozo_time == "semmi") { elozo_time = player.getCurrentTime(); }


				if(elozo_video_id != video_id && video_id != "") {
					utolso_szinkron_ideje = Date.now();
					console.log("Új videó parancs észlelve");
					player.loadVideoById(video_id, tenyleges_masodperc);
					player.setPlaybackRate(sebesseg);
					player.seekTo(parseFloat(tenyleges_masodperc), true);
				}

				if(lejatszas != "N") {
					if(lejatszas != elozo_lejatszas) {
						console.log('Indítás parancs észlelve');
					}
					player.playVideo();
				} else {
					if(lejatszas != elozo_lejatszas) {
						console.log('Megállítás parancs észlelve');
						player.seekTo(parseFloat(tenyleges_masodperc), true);
					}
					player.pauseVideo();
				}

				if(utolso_teljesitett_parancs == id) {
					return;
				}

				parancs_kiiras_buffer = "";
				if(elozo_video_id != video_id) {
					parancs_kiiras_buffer += '<br>Új videó: <a href="https://youtube.com/watch?v='+video_id+'">'+video_id+'</a>';
				}
				if(elozo_lejatszas != lejatszas) {
					parancs_kiiras_buffer += ' ';
					if(lejatszas != 'N') {
						parancs_kiiras_buffer += "<br>indítás";
					} else {
						parancs_kiiras_buffer += "<br>megállítás";
					}
				}
				if(elozo_masodperc != masodperc) {
					parancs_kiiras_buffer += "<br>tekerés -> "+masodperc+" mp";
				}
				if(elozo_sebesseg != sebesseg) {
					parancs_kiiras_buffer += "<br>sebesség állítás -> "+sebesseg+" mp";
				}
				
				document.getElementById('parancs_lista').innerHTML = '<li>'+user+':'+parancs_kiiras_buffer+'</li>'+document.getElementById('parancs_lista').innerHTML;

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

				elozo_lejatszas = lejatszas;
				if(masodperc != "") {	elozo_masodperc = masodperc; }
				if(sebesseg != "") {  	elozo_sebesseg = sebesseg; }
				if(video_id != "") {	elozo_video_id = video_id; }
				elozo_time = player.getCurrentTime();
				utolso_teljesitett_parancs = id;
			}

			function visszajelzes_kuldese() {
				xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						xhttp_valasz = this.responseText;
						var nevek = xhttp_valasz.split(',');
						document.getElementById('nev_lista').innerHTML = "";
						for (nev of nevek) {
							document.getElementById('nev_lista').innerHTML = document.getElementById('nev_lista').innerHTML+'<li>'+nev+'</li>';
						}
					}
				};
				xhttp.open("GET", "/egyuttnezo/egyuttnezo.php?visszajelzes=1", true);
				xhttp.send();
			}

			statusz_frissitese();

			var tag = document.createElement('script');

			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			var folyamatos_frissites;
			var folyamatos_visszajelzes_kuldes;

			function onYouTubeIframeAPIReady() {
				player = new YT.Player('player', {
					height: '390',
					width: '640',
					videoId: video_id,
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
				utolso_szinkron_ideje = Date.now();
				folyamatos_frissites = setInterval(statusz_frissitese, frissitesi_ido);
				folyamatos_visszajelzes_kuldes = setInterval(visszajelzes_kuldese, 5000);

				var folyamatos_nevcsere = setInterval( function() {
					if ( player ) {
						if(elozo_title != player.getVideoData().title) {
							document.getElementById("video_link").href = 'https://youtube.com/watch?v=' + video_id;
							document.getElementById("video_link").innerHTML = player.getVideoData().title;
						}
						elozo_title = player.getVideoData().title;
					}
				}, 1000 );
			}

			function onStateChange(event) {
				var jelenlegi = event.data;
				if(debug) { console.log("DEBUG: state change: "+elozo_PlayerState+" -> "+jelenlegi); }

				if(Date.now() - utolso_szinkron_ideje > 1000 && (elozo_PlayerState == 3 || elozo_PlayerState == 2) && jelenlegi == 1 && lejatszas == "N") {
					console.log("KLIENS: Indítás észlelve");
					player.pauseVideo();
					gomb_lejatszas();
				}
				
				if(Date.now() - utolso_szinkron_ideje > 1000 && elozo_PlayerState == 1 && jelenlegi == 2 && lejatszas != "N") {
					console.log("KLIENS: Leállítás észlelve");
					gomb_megallitas();
				}

				elozo_elozo_PlayerState = elozo_PlayerState;
				elozo_PlayerState = jelenlegi;
			}
		</script>
	</body>
</html>