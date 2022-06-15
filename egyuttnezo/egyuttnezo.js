"use strict";

function gomb_szinkronizalas() {
    socket.send('statusz');
}

function gomb_uj_video() {
    socket.send('uj_video:' + document.getElementById('video_id_mezo').value);
    document.getElementById('video_id_mezo').value = "";
}

function input_uj_video() {
    if (event.key === 'Enter') {
        socket.send('uj_video:' + document.getElementById('video_id_mezo').value);
        document.getElementById('video_id_mezo').value = "";
    }
}

// egyuttnezo.php fájlban megadott változók

// let vanfelhasznalonev_BOOL;
// let felhasznalonev_STRING;
// let controls_INT;


var debug_BOOL = true;
var video_id_STRING = "";
var masodperc_FLOAT = 0.0;
var lejatszas_STRING = "";
var sebesseg_FLOAT = 0.0;
var user_STRING = "";
var atlag_FLOAT = 0.0;
var atlag_oszto_INT = 0;

var player_betoltott_BOOL = false;

var elozo_title_STRING = "";
var elozo_video_id_STRING = "";
var elozo_masodperc_FLOAT = 0.0;
var elozo_lejatszas_STRING = "";
var elozo_sebesseg_FLOAT = 1.0;
var elozo_PlayerState_INT = undefined;
var elozo_elozo_PlayerState_INT = undefined;

var elozo_playerstate_ideje_FLOAT = 0.0;
var elozo_elozo_playerstate_ideje_FLOAT = 0.0;

var utolso_utasitas_ideje_FLOAT = 0.0;
var utolso_tekeres_ideje_FLOAT = 0.0;
var valaszido_kezdes_FLOAT;
var valaszidok_ARRAY_FLOAT;
var utolso_idopont_fogadasanak_ideje_FLOAT;
var valaszido_utolso_frissiteskor_FLOAT;
var ping_mintak_szama_FLOAT = 7;
var csuszas_tolerancia_FLOAT = 1.5;
var state_elozmeny_INT = 5;
var state_elozmeny_ARRAY_INT = Array();

var socket_ujracsatlakozas_INTERVAL;
var valaszido_ellenorzes_INTERVAL;
var tekeres_ellenorzes_INTERVAL;

var player;
var socket;

socket_csatlakozas();

var tag = document.createElement('script');

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: video_id_STRING,
        playerVars: {
            'playsinline': 1,
            'autoplay': 1,
            'controls': controls_INT
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerError(event) {
    console.log('Player hiba: ' + event.data);
}

function onPlayerReady(event) {
    console.log("PLAYER: iframe betöltve");
    player_betoltott_BOOL = true;
    player_frissitese();
}

function onStateChange(event) {
    var jelenlegi = parseInt(event.data);
    var jelenlegi_state_ideje = Date.now();
    if (debug_BOOL) {
        console.log("PLAYER: Debug: state change: " + elozo_elozo_PlayerState_INT + ' -> ' + elozo_PlayerState_INT + " -> " + jelenlegi);
    }

    // Oldal betöltése álló videóhoz: -1 -> 3 -> -1
    if(elozo_elozo_PlayerState_INT == -1 && elozo_PlayerState_INT == 3 && jelenlegi == -1 && lejatszas_STRING == "N") {
        if(debug_BOOL) { console.log('ESET: Oldal betöltése álló videóhoz'); }
        player.playVideo();
        seek(jelenlegi_ido(), true);
        if(lejatszas_STRING == 'N') {
            setTimeout(function() {
                seek(jelenlegi_ido(), true);
                player.pauseVideo();
            }, 500);
        }
    }
    
    // Megállítás ellenőrzése
    if(elozo_PlayerState_INT == 1 && jelenlegi == 2 && lejatszas_STRING != "N") {
        if(debug_BOOL) { console.log('ESET: Megállítás'); }
        gomb_megallitas();
    }
    
    // Indítás ellenőrzése
    if( (elozo_PlayerState_INT == -1 || elozo_PlayerState_INT == 2 || elozo_PlayerState_INT == 3) && jelenlegi == 1 && lejatszas_STRING != "I") {
        if(debug_BOOL) { console.log('ESET: Indítás'); }
        gomb_lejatszas();
    }

    elozo_elozo_playerstate_ideje_FLOAT = elozo_playerstate_ideje_FLOAT;
    elozo_playerstate_ideje_FLOAT = jelenlegi_state_ideje;
    elozo_elozo_PlayerState_INT = elozo_PlayerState_INT;
    elozo_PlayerState_INT = jelenlegi;
}

function socket_csatlakozas() {
    clearInterval(socket_ujracsatlakozas_INTERVAL);
    console.log('WebSocket: Csatlakozás...');
    socket = new WebSocket('wss://hausz.stream:8090/echo');
    socket.onopen = function() {
        console.log('WebSocket: Csatlakozva');
        if(!player_betoltott_BOOL) {
            console.log('PLAYER: iframe betöltése...');
            tag.src = "https://www.youtube.com/iframe_api";
        }
        document.getElementById('csatlakozas_statusz').innerHTML = 'Csatlakozás státusz: 🟩';
        if (vanfelhasznalonev_BOOL) {
            socket.send("felhasznalonev:" + felhasznalonev_STRING);
        }
        valaszidok_ARRAY_FLOAT = Array();
        tekeres_ellenorzes_INTERVAL = setInterval(function() {
            tekeres_eszlelese();
        }, 100);
        valaszido_ellenorzes_INTERVAL = setInterval(function() {
            valaszido_kezdes_FLOAT = Date.now();
            socket.send('ping');
        }, 1000);
        socket.send('statusz');
    };
    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log('WebSocket: Disconnected');
        } else {
            console.log('WebSocket: Connection break: ' + (event.reason || event.code));
        }
        clearInterval(valaszido_ellenorzes_INTERVAL);
        clearInterval(tekeres_ellenorzes_INTERVAL);
        document.getElementById('csatlakozas_statusz').innerHTML = 'Csatlakozás státusz: 🟥';
        socket_ujracsatlakozas_INTERVAL = setInterval(socket_csatlakozas, 2000);
    };
    socket.onmessage = function(event) {
        if (/^pong$/.test(event.data)) {
            for (var i = 1; i < ping_mintak_szama_FLOAT; i++) {
                valaszidok_ARRAY_FLOAT[ping_mintak_szama_FLOAT - i] = valaszidok_ARRAY_FLOAT[ping_mintak_szama_FLOAT - i - 1];
            }
            valaszidok_ARRAY_FLOAT[0] = (Date.now() - valaszido_kezdes_FLOAT);
            atlag_FLOAT = 0.0;
            atlag_oszto_INT = 0;
            for (var i = 0; i < ping_mintak_szama_FLOAT; i++) {
                if (!isNaN(valaszidok_ARRAY_FLOAT[i])) {
                    atlag_FLOAT += valaszidok_ARRAY_FLOAT[i];
                    atlag_oszto_INT++;
                }
            }
            atlag_FLOAT = atlag_FLOAT / parseFloat(atlag_oszto_INT);
            document.getElementById('valaszido').innerHTML = Math.round(atlag_FLOAT) + ' ms';
            return;
        }
        utolso_utasitas_ideje_FLOAT = Date.now();
        console.log('WebSocket: SERVER: ', event.data);
        if (/^statusz:/.test(event.data)) {
            adatok_frissitese(event.data.replace(/^statusz:(.*)/, '$1'));
            if (player && player_betoltott_BOOL) {
                player_frissitese();
            }
            return;
        }
        if (/^felhasznalok:/.test(event.data)) {
            var nevek = event.data.replace(/felhasznalok:/, '').split(",");
            document.getElementById('nev_lista').innerHTML = "";
            nevek.forEach(function(nev) {
                document.getElementById('nev_lista').innerHTML += "<li>" + nev + "</li>";
            });
            return;
        }
        console.log('KLIENS: Ismeretlen válasz csomag: ' + event.data);
    };
    socket.onerror = function(err) {
        console.error(err.message);
    };
}

function jelenlegi_ido_debug() {
    console.log('Player: ' + player.getCurrentTime());
    console.log('Calculated: ' + (masodperc_FLOAT + (valaszido_utolso_frissiteskor_FLOAT / 2000) + ((Date.now() - utolso_idopont_fogadasanak_ideje_FLOAT) / 1000)));
    console.log('WebSocket: SERVER: ' + masodperc_FLOAT);
}

function jelenlegi_ido() {
    var eredmeny_FLOAT = 0.0;
    if (valaszido_utolso_frissiteskor_FLOAT != undefined && !isNaN(valaszido_utolso_frissiteskor_FLOAT)) {
        eredmeny_FLOAT += valaszido_utolso_frissiteskor_FLOAT / 2000;
    } else {
        console.log('HIBÁS: valaszido_utolso_frissiteskor');
    }
    if (masodperc_FLOAT != undefined && !isNaN(masodperc_FLOAT)) {
        eredmeny_FLOAT += masodperc_FLOAT;
    } else {
        console.log('HIBÁS: masodperc');
    }
    if (lejatszas_STRING == 'N') {
        return parseFloat(eredmeny_FLOAT);
    } else {
        if (utolso_idopont_fogadasanak_ideje_FLOAT != undefined && !isNaN(utolso_idopont_fogadasanak_ideje_FLOAT)) {
            eredmeny_FLOAT += (Date.now() - utolso_idopont_fogadasanak_ideje_FLOAT) / 1000;
        } else {
            console.log('HIBÁS: utolso_idopont_fogadasanak_ideje');
        }
        return parseFloat(eredmeny_FLOAT);
    }
}

function tekeres_eszlelese() {
    if( (elozo_PlayerState_INT == 1 || elozo_PlayerState_INT == 2 || elozo_PlayerState_INT == 3) && elozo_elozo_PlayerState_INT > 0 ) {
        if( jelenlegi_ido() + csuszas_tolerancia_FLOAT < player.getCurrentTime() || jelenlegi_ido() - csuszas_tolerancia_FLOAT > player.getCurrentTime() ) {
            if( Date.now() - utolso_tekeres_ideje_FLOAT > 750 ) {
                if( player.getPlayerState() != 3 ) {
                    console.log('ESET: Tekerés');
                    socket.send("tekeres:" + player.getCurrentTime());
                } else {
                    seek(jelenlegi_ido());
                    console.log('lassulás észlelve: tekerés...');
                }
            }
        }
    }
}

function adatok_frissitese(data) {
    video_id_STRING = data.split(",")[0];
    masodperc_FLOAT = parseFloat(data.split(",")[1]);
    lejatszas_STRING = data.split(",")[2];
    sebesseg_FLOAT = parseFloat(data.split(",")[3]);
    user_STRING = data.split(",")[4];
    utolso_idopont_fogadasanak_ideje_FLOAT = Date.now();
    valaszido_utolso_frissiteskor_FLOAT = atlag_FLOAT;
}

function seek(to) {
    console.log('SEEK TO: ' + to);
    player.seekTo(to, true);
}

function player_frissitese() {
    if (!player || !player_betoltott_BOOL)
        return;

    utolso_utasitas_ideje_FLOAT = Date.now();
    var parancs_lista_buffer_STRING = '';

    if (elozo_video_id_STRING != video_id_STRING) {
        if (/^[a-zA-Z0-9-_]{11}$/.test(video_id_STRING)) {
            console.log('PLAYER: Videó betöltése:  '+ video_id_STRING + ' @ ' + jelenlegi_ido());
            player.loadVideoById(video_id_STRING);
            setTimeout(function() {
                seek(jelenlegi_ido(), true);
            }, 500);
            parancs_lista_buffer_STRING += '<br>Új videó > <a href="https://youtube.com/watch?v=' + video_id_STRING + '">' + video_id_STRING + '</a>';
        } else {
            console.log('Rossz videó ID formátum: ' + video_id_STRING);
        }
    }

    if (elozo_sebesseg_FLOAT != sebesseg_FLOAT) {
        player.setPlaybackRate(sebesseg_FLOAT);
        parancs_lista_buffer_STRING += '<br>Sebesség > ' + sebesseg_FLOAT;
    }

    if( elozo_masodperc_FLOAT != masodperc_FLOAT ) {
        console.log('PLAYER: Tekerés szerver kérésére: ' + jelenlegi_ido());
        utolso_tekeres_ideje_FLOAT = Date.now();
        seek(jelenlegi_ido(), true);
    }

    if (elozo_lejatszas_STRING != lejatszas_STRING) {
        parancs_lista_buffer_STRING += lejatszas_STRING == 'N' ? ' Megállítás' : ' Indítás';
        if (lejatszas_STRING != 'N') {
            player.playVideo();
        } else {
            player.pauseVideo();
            seek(jelenlegi_ido(), true);
        }
    }

    elozo_video_id_STRING = video_id_STRING;
    elozo_masodperc_FLOAT = masodperc_FLOAT;
    elozo_lejatszas_STRING = lejatszas_STRING;
    elozo_sebesseg_FLOAT = sebesseg_FLOAT;
    if(parancs_lista_buffer_STRING != '') {
        parancs_lista_buffer_STRING = '<li>' + user_STRING + ':' + parancs_lista_buffer_STRING + '</li>';
        document.getElementById('parancs_lista').innerHTML = parancs_lista_buffer_STRING + document.getElementById('parancs_lista').innerHTML;
    }
}