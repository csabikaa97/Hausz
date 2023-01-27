/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// <reference path="/var/www/forras/komponensek/belepteto_rendszer.ts" />
/// <reference path="/var/www/forras/komponensek/topbar.ts" />

function gomb_uj_video() {
    socket.send('uj_video:' + obj('video_id_mezo').value);
    obj('video_id_mezo').value = "";
}

function input_uj_video(event?: KeyboardEvent) {
    if (event.key === 'Enter') {
        gomb_uj_video();
    }
}

function gomb_lejatszas() {
    if(session_loggedin == 'yes') {
        if( player.getPlayerState() != 1 ) {
            player.playVideo();
            socket.send("lejatszas:I");
        } else {
            player.pauseVideo();
            socket.send("lejatszas:N|tekeres:" + player.getCurrentTime());
        }
    }
}

function tekeres(szazalek) {
    let ide = player.getDuration() * szazalek;
    console.log(`Tekerés ide: ${ide}mp`);
    seek(ide);
    socket.send("tekeres:" + ide);

    utolso_tekeres_ideje_INT = new Date().getTime();
}

function onYouTubeIframeAPIReady() {
    api_betoltve = true;
    if( session_loggedin == 'yes' ) {
        obj('iranyitas_doboz').style.display = 'block';
        obj('uj_video_doboz').style.display = 'block';
    } else {
        obj('iranyitas_doboz').style.display = 'none';
        obj('uj_video_doboz').style.display = 'none';
    }

    player = new window['YT'].Player('player', {
        height: '390',
        width: '640',
        videoId: video_id_STRING,
        playerVars: {
            'playsinline': 1,
            'start': jelenlegi_ido(),
            'autoplay': 1,
            'controls': 1,
            'mute': 1,
            'disablekb': 1,
            'fs': 1,
            'hl': 'hu',
            'modestbranding': 1,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onStateChange,
            'onError': onPlayerError
        }
    });

    obj('csuszka').onclick = (event) => {
        let csuszka_hossz = obj('csuszka').offsetWidth;
        let ide_koordinata = event.offsetX;
        console.log(event);
        tekeres( parseFloat(ide_koordinata) / parseFloat(csuszka_hossz) );
    }
}

function onPlayerError(event) {
    uj_valasz_mutatasa(5000, "hiba", `Lejátszó hiba: ${event.data}`);
}

function hangero_valtozas() {
    let uj_hangero = parseFloat(obj('csuszka_hangero').value);
    player.setVolume( uj_hangero );
    window.localStorage.setItem('hangero', uj_hangero.toString());
    if( uj_hangero > 0 ) {
        obj('nemitasGomb').innerHTML = '🔈';
    }
    if( uj_hangero > 50 ) {
        obj('nemitasGomb').innerHTML = '🔉';
    }
    if( uj_hangero > 75 ) {
        obj('nemitasGomb').innerHTML = '🔊';
    }
}

function gomb_nemitas() {
    if( obj('csuszka_hangero').style.visibility != 'visible' ) {
        obj('csuszka_hangero').style.visibility = 'visible';
        player.unMute();
        hangero_valtozas();
    } else {
        obj('nemitasGomb').innerHTML = '🔇';
        obj('csuszka_hangero').style.visibility = 'hidden';
        player.mute();
        player.setVolume(0);
    }
}

function onPlayerReady(event) {
    player_betoltott_BOOL = true;
    player_frissitese();

    player.playVideo();

    let taroltHangero = window.localStorage.getItem('hangero');
    if( taroltHangero != null ) {
        obj('csuszka_hangero').value = parseFloat(taroltHangero);
    }

    obj('csuszka_hangero').onchange = () => { hangero_valtozas(); }
    obj('csuszka_hangero').onclick = () => { hangero_valtozas(); }

    csuszka_folyamatos_frissitese = setInterval(() => {
        if( typeof player.getCurrentTime() == 'number' ) {
            let utolso_tekeres_ota_ms = new Date().getTime() - utolso_tekeres_ideje_INT;
            if( utolso_tekeres_ota_ms > 250 ) {
                obj('csuszka').value = (player.getCurrentTime() / player.getDuration()) * obj('csuszka').max;
                let uj_ido = masodperc_szovegge_alakitas( jelenlegi_ido() ) + ' / ' + masodperc_szovegge_alakitas( player.getDuration() );
                if( uj_ido != obj('ido').innerHTML ) {
                    obj('ido').innerHTML = uj_ido;
                }
            }
        }
    }, 33);

    player_folyamatos_frissitese = setInterval(() => {
        let most = player.getCurrentTime();
        let tenyleges = jelenlegi_ido();
        if( most > tenyleges + csuszas_tolerancia_FLOAT || most < tenyleges - csuszas_tolerancia_FLOAT) {
            if( new Date().getTime() - utolso_tekeres_ideje_INT > 500 ) {
                seek(tenyleges);
            }
        }

        if(lejatszas_STRING == 'N') {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }, 50)

    if( session_loggedin == 'yes' ) {
        obj('iranyitas_doboz').style.display = 'block';
        obj('uj_video_doboz').style.display = 'block';
    } else {
        obj('iranyitas_doboz').style.display = 'none';
        obj('uj_video_doboz').style.display = 'none';
    }
}

function onStateChange(event) {
    if(event.data == 1) {
        obj('lejatszasgomb').innerHTML = '⏸';
    } else {
        obj('lejatszasgomb').innerHTML = '▶';
    }
}

function socket_csatlakozas() {
    clearInterval(socket_ujracsatlakozas_INTERVAL);
    
    let domain = window.location.href.replace(/https?:\/\/([a-z0-9_\-\.]*).*/, '$1');
    socket = new WebSocket(`wss://${domain}:8090/echo`);

    socket.onopen = function() {
        socket_csatlakozva = true;
        console.log('Socket csatlakozva = true');

        obj('csatlakozas_statusz').innerHTML = '🟩';

        valaszidok_ARRAY_FLOAT = Array();

        valaszido_ellenorzes_INTERVAL = setInterval(function() {
            valaszido_kezdes_FLOAT = Date.now();
            socket.send('ping');
        }, 1000);

        socket.send('statusz');

        if( belepteto_rendszer_betoltott ) {
            if( !api_betoltve ) {
                youtube_api_betoltese();
            }
        }
        if(session_username != '') {
            socket.send("felhasznalonev:" + session_username);
            felhasznalonev_elkuldve = true;
        }
    };

    socket.onclose = function(event) {
        socket_csatlakozva = false;
        console.log('Socket csatlakozva = false');

        lejatszas_STRING = 'N';

        obj('csatlakozas_statusz').innerHTML = '🟥';

        if (event.wasClean) {
            uj_valasz_mutatasa(5000, "hiba", 'WebSocket: Lecsatlakozva');
        } else {
            uj_valasz_mutatasa(5000, "hiba", `WebSocket: Megszakadt a kapcsolat: ${(event.reason || event.code)}`);
        }

        clearInterval(valaszido_ellenorzes_INTERVAL);
        socket_ujracsatlakozas_INTERVAL = setInterval(socket_csatlakozas, 1000);
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

        console.log('SZERVER: ' + event.data);
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
        console.log(`SZERVER: Ismeretlen válasz csomag: ${event.data}`);
    };
    socket.onerror = function(err) {
        console.error(err.message);
    };
}

function jelenlegi_ido() {
    let eredmeny_FLOAT = 0.0;
    if (valaszido_utolso_frissiteskor_FLOAT != undefined && !isNaN(valaszido_utolso_frissiteskor_FLOAT)) {
        eredmeny_FLOAT += valaszido_utolso_frissiteskor_FLOAT / 2000.0;
    }
    if (masodperc_FLOAT != undefined && !isNaN(masodperc_FLOAT)) {
        eredmeny_FLOAT += masodperc_FLOAT;
    }
    if (lejatszas_STRING == 'N') {
        return eredmeny_FLOAT;
    } else {
        if (utolsoIdopontFogadasanakIdejeFLOAT != undefined && !isNaN(utolsoIdopontFogadasanakIdejeFLOAT)) {
            eredmeny_FLOAT += (Date.now() - utolsoIdopontFogadasanakIdejeFLOAT) / 1000;
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
    utolsoIdopontFogadasanakIdejeFLOAT = Date.now();
    valaszido_utolso_frissiteskor_FLOAT = atlag_FLOAT;
}

function seek(to) {
    player.seekTo(to, true);
}

function masodperc_szovegge_alakitas(jelenlegi: number) {
    if( typeof jelenlegi != 'number')  {
        return '00:00';
    }
    
    let szoveg = "";

    if( player.getDuration() > 60*60 ) {
        szoveg = Math.floor(jelenlegi / (60*60)).toString() + ":";
    }
    
    if( Math.floor(jelenlegi / 60) % 60 < 10 ) {
        szoveg += '0' + (Math.floor(jelenlegi / 60) % 60).toString();
    } else {
        szoveg += (Math.floor(jelenlegi / 60) % 60).toString();
    }

    if( Math.floor(jelenlegi % 60) < 10 ) {
        szoveg += ':0' + Math.floor(jelenlegi % 60).toString();
    } else {
        szoveg += ':' + Math.floor(jelenlegi % 60).toString();
    }
    
    return szoveg;
}

function player_frissitese() {
    if (!player || !player_betoltott_BOOL) {   return; }

    utolso_utasitas_ideje_FLOAT = Date.now();
    let parancs_lista_buffer_STRING = '';

    if (elozo_video_id_STRING != video_id_STRING) {
        if (/^[a-zA-Z0-9-_]{11}$/.test(video_id_STRING)) {
            player.loadVideoById(video_id_STRING);
            obj('video_link').href = 'https://youtube.com/watch?v=' + video_id_STRING;
            parancs_lista_buffer_STRING += ` Új videó > <a href="https://youtube.com/watch?v=${video_id_STRING}">${video_id_STRING}</a>`;
            let video_nev_folyamatos_frissitese = setInterval(() => {
                if(api_betoltve) {
                    if( player.getVideoData() != undefined ) {
                        if( player.getVideoData().title != '' ) {
                            obj('video_link').innerHTML = player.getVideoData().title;
                            clearInterval(video_nev_folyamatos_frissitese);
                        }
                    }
                }
            }, 100);
        } else {
            console.log(`SZERVER: Rossz videó ID formátum: ${video_id_STRING}`);
        }
    }

    if (elozo_sebesseg_FLOAT != sebesseg_FLOAT) {
        player.setPlaybackRate(sebesseg_FLOAT);
        parancs_lista_buffer_STRING += ` Sebesség > ${sebesseg_FLOAT}`;
    }

    if( elozo_masodperc_FLOAT != masodperc_FLOAT ) {
        console.log(`PLAYER: Tekerés szerver kérésére: ${masodperc_FLOAT}`);
        parancs_lista_buffer_STRING += ` Tekerés: ${masodperc_szovegge_alakitas(masodperc_FLOAT)}`;
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

function belepteto_rendszer_frissult() {
    belepteto_rendszer_betoltott = true;
    felhasznalonev_elkuldve = false;
    console.log( session_loggedin, session_username, session_admin, api_betoltve, socket_csatlakozva, belepteto_rendszer_betoltott );
    if(socket_csatlakozva) {
        if(socket_csatlakozva) {
            socket.send("felhasznalonev:" + session_username);
            felhasznalonev_elkuldve = true;
        }
        if( !api_betoltve ) {
            youtube_api_betoltese();
        }
    }

    if( session_loggedin == 'yes' ) {
        obj('iranyitas_doboz').style.display = 'inline';
        obj('uj_video_doboz').style.display = 'inline';
    } else {
        obj('iranyitas_doboz').style.display = 'none';
        obj('uj_video_doboz').style.display = 'none';
    }
}

function youtube_api_betoltese() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

var debug_BOOL = true;
var video_id_STRING = "";
var masodperc_FLOAT = 0.0;
var lejatszas_STRING = "";
var sebesseg_FLOAT = 1.0;
var user_STRING = "";
var atlag_FLOAT = 0.0;
var atlag_oszto_INT = 0;


var elozo_title_STRING = "";
var elozo_video_id_STRING = "";
var elozo_masodperc_FLOAT = 0.0;
var elozo_lejatszas_STRING = "";
var elozo_sebesseg_FLOAT = 1.0;
var elozo_PlayerState_INT = undefined;
var elozo_elozo_PlayerState_INT = undefined;

var elozo_playerstate_ideje_FLOAT = 0.0;
var elozoElozoPlayerstateIdejeFLOAT = 0.0;

var utolso_utasitas_ideje_FLOAT = 0.0;
var utolso_tekeres_ideje_INT: number = 0.0;
var valaszido_kezdes_FLOAT;
var valaszidok_ARRAY_FLOAT;
var utolsoIdopontFogadasanakIdejeFLOAT;
var valaszido_utolso_frissiteskor_FLOAT;
var ping_mintak_szama_FLOAT = 7;
var csuszas_tolerancia_FLOAT = 1.5;
var state_elozmeny_INT = 5;
var state_elozmeny_ARRAY_INT = Array();

var socket_ujracsatlakozas_INTERVAL;
var valaszido_ellenorzes_INTERVAL;

var player;
var socket;
var felhasznalonev_elkuldve = false;

var belepteto_rendszer_betoltott = false;
var socket_csatlakozva = false;
var api_betoltve = false;
var player_betoltott_BOOL = false;
var csuszka_folyamatos_frissitese;

var player_folyamatos_frissitese;

topbar_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult );
socket_csatlakozas();
