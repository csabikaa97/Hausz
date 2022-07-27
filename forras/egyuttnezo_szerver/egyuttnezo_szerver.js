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

var video_id = 'ljPDtDIrfrE';
var masodperc = 0.0;
var lejatszas = 'I';
var sebesseg = '1.0';
var user = "szerver";

var utolso_ismert_idopont = Date.now();

const options = {
    key: fs.readFileSync('/var/www/public/privkey.pem'),
    cert: fs.readFileSync('/var/www/public/cert.pem')
};

const index = 'miau';


let server = https.createServer(options, (req, res) => {
    res.writeHead(200);
    res.end(index);
});
//server.addListener('upgrade', (req, res, head) => console.log('UPGRADE:', req.url));
server.on('error', (err) => console.error(err));
server.listen(8090, () => console.log('A szerver sikeresen elindult a 8090-es TCP porton'));

function osszes_kliens_statusz_frissitese() {
    let uzenet = `statusz:${video_id},${jelenlegi_masodperc()},${lejatszas},${sebesseg},${user}`;
    console.log(`Üzenet küldése összes kliensnek: "${uzenet}"`);
    wss.clients.forEach(function each(client) {
        client.send(uzenet);
    });
}

function osszes_kliens_felhasznalolista_frissitese() {
    let felhasznalok = "";
    wss.clients.forEach(function each(client) {
        felhasznalok += (felhasznalok == "" ? "" : ",") + (client.felhasznalonev != undefined ? client.felhasznalonev : 'Nem regisztrált felhasználó') + client.agent;
    });
    wss.clients.forEach(function each(client) {
        client.send('felhasznalok:' + felhasznalok);
    });
}

function jelenlegi_masodperc() {
    if(lejatszas == 'N') {
        return parseFloat(masodperc);
    } else {
        return parseFloat(masodperc) + parseFloat((Date.now() - utolso_ismert_idopont) / 1000 * parseFloat(sebesseg));
    }
}

const wss = new ws.Server({
    server,
    path: '/echo'
});

wss.on('connection', function connection(ws, req) {
    ws.id = req.headers['sec-websocket-key'];
    console.log(req.headers['user-agent']);
    ws.agent = '';
    if( /Linux; Android/ig.test(req.headers['user-agent']) || 
        /iPhone/ig.test(req.headers['user-agent'])
    ) {
        ws.agent = ' (mobil)';
        console.log(ws.id + ': Mobil eszközön van (Android vagy iOS)');
    }
    console.log((ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': csatlakozott a szerverhez');
    osszes_kliens_felhasznalolista_frissitese();

    ws.on('message', (event) => {
        let idopont = new Date();
        let szoveg = `${(idopont.getHours() < 10 ? '0' + idopont.getHours() : idopont.getHours())}:${(idopont.getMinutes() < 10 ? '0' + idopont.getMinutes() : idopont.getMinutes())}:${(idopont.getSeconds() < 10 ? '0${idopont.getSeconds()' : idopont.getSeconds())}`;
        let data = event.toString();
        if (/^ping$/.test(data)) {
            ws.send("pong");
            return;
        }

        if (/^statusz$/.test(data)) {
            ws.send(`statusz:${video_id},${jelenlegi_masodperc()},${lejatszas},${sebesseg},${user}`);
            return;
        }

        if (/^felhasznalok$/.test(data)) {
            let felhasznalok = "";
            wss.clients.forEach(function each(client) {
                felhasznalok += (felhasznalok == "" ? "" : ",") + (client.felhasznalonev != undefined ? client.felhasznalonev : 'Nem regisztrált felhasználó') + client.agent;
            });
            ws.send('felhasznalok:' + felhasznalok);
            return;
        }

        if (/^felhasznalonev:/.test(data)) {
            if( /^felhasznalonev:$/.test( data ) ) {
                ws.felhasznalonev = undefined;
            } else {
                console.log(`${szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id)}: Felhasználóneve mostantól "${data.replace(/^felhasznalonev:(.*)/, '$1')}"`);
                ws.felhasznalonev = data.replace(/^felhasznalonev:(.*)/, '$1');
            }
            osszes_kliens_felhasznalolista_frissitese();
            return;
        }

        console.log(`${szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id)}:\tCsomag: "${data}"`);
        if(ws.felhasznalonev == undefined) {
            return;
        }

        if (/^video vege$/.test(data)) {
            video_id = '1';
            return;
        }

        if (/^uj_video:/.test(data)) {
            if(ws.felhasznalonev != undefined) {
                if (/(.*)youtube.com(.*)/.test(data)) {
                    video_id = data.replace(/(.*)[&?]v=([a-zA-Z0-9-_]{11})(.*)/, '$2');
                } else if (/(.*)youtu.be(.*)/.test(data)) {
                    video_id = data.replace(/uj_video:(.*)\.be\/([a-zA-Z0-9-_]{11})(.*)/, '$2');
                } else if (/^uj_video:[a-zA-Z0-9-_]{11}$/.test(data)) {
                    video_id = data.replace(/uj_video:(.*)/, '$1');
                } else {
                    console.log(szoveg + ws.felhasznalonev + ': Új videó rossz link: ' + data);
                }
    
                if (/[&?]t=/.test(data)) {
                    masodperc = data.replace(/(.*)[&\?]t=([0-9]*)(.*)/, '$2');
                } else {
                    masodperc = '0';
                }
                utolso_ismert_idopont = Date.now();
    
                sebesseg = '1.0';
                lejatszas = 'I';
                utolso_ismert_idopont = Date.now();
                user = ws.felhasznalonev;
                osszes_kliens_statusz_frissitese();
            } else {
                console.log('Ismeretlen felhasználó próbált videót berakni!!!!');
            }
            return;
        }
        
        if (/sebesseg:/.test(data)) {
            masodperc = jelenlegi_masodperc();
            utolso_ismert_idopont = Date.now();
            sebesseg = data.replace(/(.*)sebesseg:([\.0-9]*)\|?/, '$2');
            console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Sebesség átállítva -> ' + sebesseg);
        }
        
        if (/lejatszas:/.test(data)) {
            masodperc = jelenlegi_masodperc();
            utolso_ismert_idopont = Date.now();
            lejatszas = data.replace(/(.*)lejatszas:([A-Z])\|?(.*)/, '$2');
            if (lejatszas == 'N') {
                console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Megállítás');
            } else {
                console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Lejátszás');
            }
        }
        
        if (/tekeres:/.test(data)) {
            masodperc = data.replace(/(.*)tekeres:([\.0-9]*)\|?/, '$2');
            utolso_ismert_idopont = Date.now();
            console.log(szoveg + (ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': Tekerés -> ' + masodperc);
        }

        user = ws.felhasznalonev != undefined ? ws.felhasznalonev : 'Nem regisztrált felhasználó';

        osszes_kliens_statusz_frissitese();
    });

    ws.on('close', () => {
        console.log((ws.felhasznalonev != undefined ? ws.felhasznalonev : ws.id) + ': lecsatlakozott a szerverről');
        osszes_kliens_felhasznalolista_frissitese();
    });
});