<?php session_start(); ?>
<!DOCTYPE html>
<html lang="hu">
	<head>
		<title>Hausz együttnéző</title>
		<meta charset="UTF-8">
        <meta name="description" content="A Hausz Kft. együttnéző szolgáltatása, ahol YouTube videókat lehet együtt nézni a világhálón keresztül.">
		<link rel="stylesheet" type="text/css" href="../index/style.css" />
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
		<?php 
			readfile("/var/www/html/index/topbar.html"); 
			$dbname = "hausz_megoszto";
			include '../include/adatbazis.php';
			include '../include/alap_fuggvenyek.php';
			include "../include/belepteto_rendszer.php";
		?>
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
							if($_SESSION['admin'] == "igen") {
								printLn('<h2>Parancsok</h2>');
								printLn('<ul id="parancs_lista"></ul>');
							}
							printLn('</div>');
						}
					?>
				</td>
			</tr>
		</table>
		<script>
			function gomb_megallitas() {
				<?php
					if($_SESSION['loggedin'] == "yes") {
						printLn('socket.send("lejatszas:N|tekeres:" + player.getCurrentTime());');
					}
				?>
			}
			
			function gomb_lejatszas() {
				<?php
					if($_SESSION['loggedin'] == "yes") {
						printLn('socket.send("lejatszas:I")');
					}
				?>
			}

			function gomb_szinkronizalas() {
				socket.send('statusz');
			}

			function gomb_uj_video() {
				socket.send('uj_video:' + document.getElementById('video_id_mezo').value);
				document.getElementById('video_id_mezo').value = "";
			}

			function input_uj_video() {
				if(event.key === 'Enter') {
					socket.send('uj_video:' + document.getElementById('video_id_mezo').value);
					document.getElementById('video_id_mezo').value = "";
				}
			}

			var debug = true;
			var video_id = "";
			var masodperc = "";
			var lejatszas = "";
			var sebesseg = "";
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
			var parancs_kiiras_buffer;
			var socket;
			var socket_ujracsatlakozas;
			var utolso_utasitas_ideje;
			var folyamatos_nevcsere;

			var tag = document.createElement('script');

			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			function onYouTubeIframeAPIReady() {
				player = new YT.Player('player', {
					height: '390',
					width: '640',
					videoId: 0,
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
				socket_csatlakozas();
			}

			function onStateChange(event) {
				var jelenlegi = event.data;
				
				if(debug) { console.log("DEBUG: state change: "+elozo_PlayerState+" -> "+jelenlegi); }

				
				if((elozo_PlayerState == 3 || elozo_PlayerState == 2) && jelenlegi == 1 && lejatszas == "N" && utolso_utasitas_ideje + 500 < Date.now()) {
					console.log("KLIENS: Indítás észlelve");
					player.pauseVideo();
					gomb_lejatszas();
				}
				
				if(elozo_PlayerState == 1 && jelenlegi == 2 && lejatszas != "N" && utolso_utasitas_ideje + 500 < Date.now()) {
					console.log("KLIENS: Leállítás észlelve");
					gomb_megallitas();
				}

				if(elozo_PlayerState == 1 && jelenlegi == 0) {
					console.log("KLIENS: Videó vége észlelve");
					socket.send('video vege');
				}

				if((jelenlegi == -1 || jelenlegi == 2) && lejatszas != 'N') {
					player.playVideo();
				}

				elozo_elozo_PlayerState = elozo_PlayerState;
				elozo_PlayerState = jelenlegi;
			}

			function socket_csatlakozas() {
				clearInterval(socket_ujracsatlakozas);
				console.log('Csatlakozás...');
				socket = new WebSocket('wss://hausz.stream:8090/echo');
				socket.onopen = () => {
					console.log('WebSocket: Csatlakozva');
					document.getElementById('csatlakozas_statusz').innerHTML = 'Csatlakozás státusz: 🟩';
					<?php 
						if(strlen($_SESSION['username']) > 0) { 
							echo 'socket.send("felhasznalonev:'.$_SESSION['username'].'");';
						}
					?>
					socket.send('statusz');
				} 
				socket.onclose = (event) => {
					if(event.wasClean) {
						console.log('WebSocket: Disconnected');
					} else {
						console.log('WebSocket: Connection break: ' + (event.reason || event.code));
					}
					document.getElementById('csatlakozas_statusz').innerHTML = 'Csatlakozás státusz: 🟥';
					socket_ujracsatlakozas = setInterval(socket_csatlakozas, 2000);
				}
				socket.onmessage = (event) => {
					console.log('SERVER: ', event.data);
					utolso_utasitas_ideje = Date.now();
					if(/^statusz:/.test(event.data)) {
						statusz_frissitese(event.data.replace(/^statusz:(.*)/, '$1'));
						return;
					}
					if(/^felhasznalok:/.test(event.data)) {
						nevek = event.data.replace(/felhasznalok:/, '').split(",");
						document.getElementById('nev_lista').innerHTML = "";
						nevek.forEach(nev => {
							document.getElementById('nev_lista').innerHTML += "<li>" + nev + "</li>";
						});
						return;
					}
					
					console.log('KLIENS: Ismeretlen válasz csomag: '+ event.data);
				}
				socket.onerror = (err) => {
					console.error(err.message);
				}
			}

			function statusz_frissitese(data) {
				video_id = data.split(",")[0];
				masodperc = parseFloat(data.split(",")[1]);
				lejatszas = data.split(",")[2];
				sebesseg = data.split(",")[3];
				user = data.split(",")[4];

				if(!player)
					return;

				if(elozo_title != player.getVideoData().title) {
					document.getElementById("video_link").href = 'https://youtube.com/watch?v=' + video_id;
					document.getElementById("video_link").innerHTML = player.getVideoData().title;
				}
				elozo_title = player.getVideoData().title;

				var parancs_lista_buffer = '<li>' + user + ':';
				
				if(elozo_video_id != video_id) {
					if( /^[a-zA-Z0-9-_]{11}$/.test(video_id) ) {
						player.loadVideoById(video_id, parseFloat(masodperc));
						parancs_lista_buffer += '<br>Új videó > <a href="https://youtube.com/watch?v=' + video_id + '">' + video_id + '</a>';
					} else {
						console.log('Rossz videó ID formátum: ' + video_id);
					}
				}
				
				if(elozo_sebesseg != sebesseg) {
					player.setPlaybackRate(sebesseg);
					parancs_lista_buffer += '<br>Sebesség > ' + sebesseg;
				}
				
				if(masodperc + 1.0 > player.getCurrentTime() || masodperc - 1.0 < player.getCurrentTime()) {					
					player.seekTo(parseFloat(masodperc), true);
					parancs_lista_buffer += '<br>Tekerés > ' + masodperc;
				}

				if(elozo_lejatszas != lejatszas) {
					parancs_lista_buffer += lejatszas == 'N' ? '<br>Megállítás' : '<br>Indítás';
				}
				
				if(lejatszas != 'N') {
					player.playVideo();
				} else {
					player.pauseVideo();
				}

				elozo_video_id = video_id;
				elozo_masodperc = masodperc;
				elozo_lejatszas = lejatszas;
				elozo_sebesseg = sebesseg;
				parancs_lista_buffer = parancs_lista_buffer + '</li>';
				document.getElementById('parancs_lista').innerHTML = parancs_lista_buffer + document.getElementById('parancs_lista').innerHTML;
			}
		</script>
	</body>
</html>