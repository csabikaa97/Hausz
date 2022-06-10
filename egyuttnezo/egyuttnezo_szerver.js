// app.js
'use strict'
const https = require('https');
const fs = require('fs');
const ws = require('ws');
/*
    var mysql = require('mysql');
    var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root"
    });

    con.connect(function(err) {
    if (err) throw err;
    console.log("MySQL csatlakozás sikeres!");
    });
*/

var debug = true;

var video_id = '1';
var masodperc;
var lejatszas;
var sebesseg;
var tenyleges_masodperc;
var id;
var user;

var utolso_ismert_idopont = 0;

const options = {
    key: fs.readFileSync('/var/www/html/priv/privkey.pem'),
    cert: fs.readFileSync('/var/www/html/priv/cert.pem')
};

const index = fs.readFileSync('./index.html');


let server = https.createServer(options, (req, res) => {
    res.writeHead(200);
    res.end(index);
});
//server.addListener('upgrade', (req, res, head) => console.log('UPGRADE:', req.url));
server.on('error', (err) => console.error(err));
server.listen(8090, () => console.log('A szerver sikeresen elindult a 8090-es TCP porton'));

function osszes_kliens_statusz_frissitese() {
    wss.clients.forEach(function each(client) {
        client.send('statusz:' + video_id + ',' + jelenlegi_masodperc() + ',' + lejatszas + ',' + sebesseg + ',' + user);
    });
}

function osszes_kliens_felhasznalolista_frissitese() {
    var felhasznalok = "";
    wss.clients.forEach(function each(client) {
        felhasznalok += (felhasznalok == "" ? "" : ",") + (client.felhasznalonev != undefined ? client.felhasznalonev : 'Nem regisztrált felhasználó');
    });
    wss.clients.forEach(function each(client) {
        client.send('felhasznalok:' + felhasznalok);
    });
}

function jelenlegi_masodperc() {
    return parseFloat(masodperc) + parseFloat((Date.now() - utolso_ismert_idopont) / 1000 * parseFloat(sebesseg));
}

const wss = new ws.Server({server, path: '/echo'});
wss.on('connection', function connection(ws, req) {
    ws.id = req.headers['sec-websocket-key'];
    console.log((ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': csatlakozott a szerverhez');
    osszes_kliens_felhasznalolista_frissitese();

    ws.on('message', (event) => {
        var idopont = new Date();
        var szoveg = (idopont.getHours() < 10 ? '0' + idopont.getHours() : idopont.getHours()) + ':' + (idopont.getMinutes() < 10 ? '0' + idopont.getMinutes() : idopont.getMinutes()) + ':' + (idopont.getSeconds() < 10 ? '0' + idopont.getSeconds() : idopont.getSeconds()) + ' ';
        var data = event.toString();
        console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ':\tCsomag: "' + data + '"');

        if( /^statusz$/.test(data) ) {
            ws.send('statusz:' + video_id + ',' + jelenlegi_masodperc() + ',' + lejatszas + ',' + sebesseg + ',' + ws.felhasznalonev);
            return;
        }

        if( /^video vege$/.test(data) ) {
            video_id = '1';
            return;
        }

        
        if( /^felhasznalok$/.test(data) ) {
            var felhasznalok = "";
            wss.clients.forEach(function each(client) {
                felhasznalok += (felhasznalok == "" ? "" : ",") + (client.felhasznalonev != undefined ? client.felhasznalonev : 'Nem regisztrált felhasználó');
            });
            ws.send('felhasznalok:' + felhasznalok);
            return;
        }

        if( /^uj_video:/.test(data) ) {
            if( /(.*)youtube.com(.*)/.test(data) ) {
                video_id = data.replace(/(.*)[&?]v=([a-zA-Z0-9-_]{11})(.*)/, '$2');
                console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Új videó beállítva: ' + video_id);
            } else if( /(.*)youtu.be(.*)/.test(data) ) {
                video_id = data.replace(/uj_video:(.*)\.be\/([a-zA-Z0-9-_]{11})(.*)/, '$2');
                console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Új videó beállítva: ' + video_id);
                masodperc = '0';
            } else if( /^uj_video:[a-zA-Z0-9-_]{11}$/.test(data) ) {
                video_id = data.replace(/uj_video:(.*)/, '$1');
                console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Új videó beállítva: ' + video_id);
                masodperc = '0';
            } else {
                console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Új videó rossz link: ' + data);
            }

            if( /[&?]t=/.test(data) ) {
                masodperc = data.replace(/(.*)[&\?]t=([0-9]*)(.*)/, '$2');
                console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': \tTekerés -> ' + masodperc);
            } else {
                masodperc = '0';
            }
            utolso_ismert_idopont = Date.now();

            sebesseg = '1.0';
            lejatszas = 'I';
            utolso_ismert_idopont = Date.now();
            osszes_kliens_statusz_frissitese();
            return;
        }

        if( /^felhasznalonev:/.test(data) ) {
            console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Felhasználóneve mostantól "' + data.replace(/^felhasznalonev:(.*)/, '$1') + '"');
            ws.felhasznalonev = data.replace(/^felhasznalonev:(.*)/, '$1');
            osszes_kliens_felhasznalolista_frissitese();
            return;
        }
        
        if( /tekeres:/.test(data) ) {
            masodperc = data.replace(/(.*)tekeres:([\.0-9]*)\|?/, '$2');
            utolso_ismert_idopont = Date.now();
            console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Tekerés -> ' + masodperc);
        }
        
        if( /sebesseg:/.test(data) ) {
            masodperc = jelenlegi_masodperc();
            utolso_ismert_idopont = Date.now();
            sebesseg = data.replace(/(.*)sebesseg:([\.0-9]*)\|?/, '$2');
            console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Sebesség átállítva -> ' + sebesseg);
        }

        if( /lejatszas:/.test(data) ) {
            lejatszas = data.replace(/(.*)lejatszas:([A-Z])\|?(.*)/, '$2');
            if(lejatszas == 'N') {
                utolso_ismert_idopont = Date.now();
                masodperc = jelenlegi_masodperc();
                console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Megállítás');
            } else {
                console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Lejátszás');
            }
        }

        user = ws.felhasznalonev != undefined ? ws.felhasznalonev : 'Nem regisztrált felhasználó';
        
        osszes_kliens_statusz_frissitese();
    });

    ws.on('close', () => {
        console.log((ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': lecsatlakozott a szerverről');
        osszes_kliens_felhasznalolista_frissitese();
    });
});
