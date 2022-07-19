"use strict";

function gomb_uj_video() {
    socket.send('uj_video:' + obj('video_id_mezo').value);
    obj('video_id_mezo').value = "";
}

function input_uj_video() {
    if (event.key === 'Enter') {
        gomb_uj_video();
    }
}

function gomb_megallitas() {
    if(session_loggedin == 'yes') {
        player.pauseVideo();
        console.log(player.getCurrentTime());
        socket.send("lejatszas:N|tekeres:" + player.getCurrentTime());
    }
}

function gomb_lejatszas() {
    if(session_loggedin == 'yes') {
        player.playVideo();
        socket.send("lejatszas:I");
    }
}

function tekeres(ido) {
    let ertek = parseFloat(ido);
    let max = parseFloat(obj('csuszka').max);
    let ide = player.getDuration() * (ertek / max);
    seek( ide );
    socket.send("tekeres:" + ide);
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: video_id_STRING,
        playerVars: {
            'playsinline': 1,
            'autoplay': 1,
            'controls': 0
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

    csuszka_folyamatos_frissitese = setInterval(() => {
        if( typeof player.getCurrentTime() == 'number' ) {
            let utolso_tekeres_ota_ms = parseInt(new Date().getTime()) - utolso_tekeres_ideje_INT;
            if( utolso_tekeres_ota_ms > 250 ) {
                obj('csuszka').value = (player.getCurrentTime() / player.getDuration()) * obj('csuszka').max;
                let uj_ido = masodperc_szovegge_alakitas( player.getCurrentTime(), player.getDuration() ) + ' / ' + masodperc_szovegge_alakitas( player.getDuration(), player.getDuration() );
                if( uj_ido != obj('ido').innerHTML ) {
                    obj('ido').innerHTML = uj_ido;
                }
            }
        }
    }, 33);
}

function onStateChange(event) {
    if(event.data == 1) {
        obj('megallitasgomb').style.display = 'inline';
        obj('lejatszasgomb').style.display = 'none';
    } else {
        obj('megallitasgomb').style.display = 'none';
        obj('lejatszasgomb').style.display = 'inline';
    }
}

function socket_csatlakozas() {
    clearInterval(socket_ujracsatlakozas_INTERVAL);
    console.log('WebSocket: Csatlakozás...');
    socket = new WebSocket('wss://hausz.stream:8090/echo');
    socket.onopen = function() {
        console.log('WebSocket: Csatlakozva');
        socket_csatlakozva = true;
        if(session_username != '') {
            socket.send("felhasznalonev:" + session_username);
            felhasznalonev_elkuldve = true;
        }
        if(!player_betoltott_BOOL) {
            console.log('PLAYER: iframe betöltése...');
            tag.src = "https://www.youtube.com/iframe_api";
        }
        obj('csatlakozas_statusz').innerHTML = '🟩';
        valaszidok_ARRAY_FLOAT = Array();
        tekeres_ellenorzes_INTERVAL = setInterval(function() {
        }, 100);
        valaszido_ellenorzes_INTERVAL = setInterval(function() {
            valaszido_kezdes_FLOAT = Date.now();
            socket.send('ping');
        }, 1000);
        socket.send('statusz');
    };
    socket.onclose = function(event) {
        socket_csatlakozva = false;
        if (event.wasClean) {
            console.log('WebSocket: Disconnected');
        } else {
            console.log('WebSocket: Connection break: ' + (event.reason || event.code));
        }
        clearInterval(valaszido_ellenorzes_INTERVAL);
        clearInterval(tekeres_ellenorzes_INTERVAL);
        obj('csatlakozas_statusz').innerHTML = '🟥';
        socket_ujracsatlakozas_INTERVAL = setInterval(socket_csatlakozas, 2000);
    };
    socket.onmessage = function(event) {
        if (/^pong$/.test(event.data)) {
            for (let i = 1; i < ping_mintak_szama_FLOAT; i++) {
                valaszidok_ARRAY_FLOAT[ping_mintak_szama_FLOAT - i] = valaszidok_ARRAY_FLOAT[ping_mintak_szama_FLOAT - i - 1];
            }
            valaszidok_ARRAY_FLOAT[0] = (Date.now() - valaszido_kezdes_FLOAT);
            atlag_FLOAT = 0.0;
            atlag_oszto_INT = 0;
            for (let i = 0; i < ping_mintak_szama_FLOAT; i++) {
                if (!isNaN(valaszidok_ARRAY_FLOAT[i])) {
                    atlag_FLOAT += valaszidok_ARRAY_FLOAT[i];
                    atlag_oszto_INT++;
                }
            }
            atlag_FLOAT = atlag_FLOAT / atlag_oszto_INT;
            obj('valaszido').innerHTML = Math.round(atlag_FLOAT) + ' ms';
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
            let nevek = event.data.replace(/felhasznalok:/, '').split(",");
            obj('nev_lista').innerHTML = "";
            nevek.forEach(function(nev) {
                obj('nev_lista').innerHTML += `<li>${nev}</li>`;
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
    let eredmeny_FLOAT = 0.0;
    if (valaszido_utolso_frissiteskor_FLOAT != undefined && !isNaN(valaszido_utolso_frissiteskor_FLOAT)) {
        eredmeny_FLOAT += valaszido_utolso_frissiteskor_FLOAT / 2000.0;
    } else {
        console.log('HIBÁS: valaszido_utolso_frissiteskor');
    }
    if (masodperc_FLOAT != undefined && !isNaN(masodperc_FLOAT)) {
        eredmeny_FLOAT += masodperc_FLOAT;
    } else {
        console.log('HIBÁS: masodperc');
    }
    if (lejatszas_STRING == 'N') {
        return eredmeny_FLOAT;
    } else {
        if (utolso_idopont_fogadasanak_ideje_FLOAT != undefined && !isNaN(utolso_idopont_fogadasanak_ideje_FLOAT)) {
            eredmeny_FLOAT += (Date.now() - utolso_idopont_fogadasanak_ideje_FLOAT) / 1000;
        } else {
            console.log('HIBÁS: utolso_idopont_fogadasanak_ideje');
        }
        return eredmeny_FLOAT;
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

function masodperc_szovegge_alakitas(jelenlegi, maximum) {
    if( typeof jelenlegi != 'number')
        throw new Error('Jelenlegi parameter nem number típusú!!!');
    if( typeof maximum != 'number')
        throw new Error('Maximum parameter nem number típusú!!!');
    
    var szoveg = "";

    if( maximum > 60*60 ) {
        szoveg = String(parseInt( jelenlegi / (60*60) )) + ":";
    }
    
    if( parseInt(jelenlegi / 60 % (60) ) < 10 ) {
        szoveg += '0' + String(parseInt(jelenlegi / 60 % (60)));
    } else {
        szoveg += String(parseInt(jelenlegi / 60 % (60)));
    }

    if( jelenlegi % 60 < 10 ) {
        szoveg += ':0' + String(parseInt(jelenlegi % 60));
    } else {
        szoveg += ':' + String(parseInt(jelenlegi % 60));
    }
    
    return szoveg;
}

function player_frissitese() {
    if (!player || !player_betoltott_BOOL)
        return;

    utolso_utasitas_ideje_FLOAT = Date.now();
    let parancs_lista_buffer_STRING = '';

    if (elozo_video_id_STRING != video_id_STRING) {
        if (/^[a-zA-Z0-9-_]{11}$/.test(video_id_STRING)) {
            console.log(`PLAYER: Videó betöltése: ${video_id_STRING}@${jelenlegi_ido()}`);
            player.loadVideoById(video_id_STRING);
            setTimeout(function() {
                seek(jelenlegi_ido());
            }, 500);
            parancs_lista_buffer_STRING += `<br>Új videó > <a href="https://youtube.com/watch?v=${video_id_STRING}">${video_id_STRING}</a>`;
        } else {
            console.log('Rossz videó ID formátum: ' + video_id_STRING);
        }
    }

    if (elozo_sebesseg_FLOAT != sebesseg_FLOAT) {
        player.setPlaybackRate(sebesseg_FLOAT);
        parancs_lista_buffer_STRING += `<br>Sebesség > ${sebesseg_FLOAT}`;
    }

    if( elozo_masodperc_FLOAT != masodperc_FLOAT ) {
        console.log('PLAYER: Tekerés szerver kérésére: ' + jelenlegi_ido());
        seek(jelenlegi_ido());
    }

    if (elozo_lejatszas_STRING != lejatszas_STRING) {
        parancs_lista_buffer_STRING += lejatszas_STRING == 'N' ? ' Megállítás' : ' Indítás';
        if (lejatszas_STRING != 'N') {
            player.playVideo();
        } else {
            player.pauseVideo();
            seek(jelenlegi_ido());
        }
    }

    elozo_video_id_STRING = video_id_STRING;
    elozo_masodperc_FLOAT = masodperc_FLOAT;
    elozo_lejatszas_STRING = lejatszas_STRING;
    elozo_sebesseg_FLOAT = sebesseg_FLOAT;
    if(parancs_lista_buffer_STRING != '') {
        parancs_lista_buffer_STRING = `<li>${user_STRING}:${parancs_lista_buffer_STRING}</li>`;
        obj('parancs_lista').innerHTML = parancs_lista_buffer_STRING + obj('parancs_lista').innerHTML;
    }
}

function belepteto_rendszer_frissult( session_loggedin, session_username, session_admin ) {
    if(socket_csatlakozva) {
        if(!felhasznalonev_elkuldve) {
            socket.send("felhasznalonev:" + session_username);
            felhasznalonev_elkuldve = true;
        }
    }
    if( session_loggedin == 'yes' ) {
        obj('uj_video_doboz').style.display = 'block';
        obj('iranyito_gombok').style.display = 'block';
    } else {
        obj('uj_video_doboz').style.display = 'none';
        obj('iranyito_gombok').style.display = 'none';
    }
}

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
var utolso_tekeres_ideje_INT = 0.0;
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
var socket_csatlakozva = false;
var felhasznalonev_elkuldve = false;

belepteto_rendszer_beallitas( belepteto_rendszer_frissult );
topbar_betoltese();

var csuszka_folyamatos_frissitese;

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

socket_csatlakozas();