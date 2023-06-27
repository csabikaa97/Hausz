// Kiadás dátuma: Tue Feb 21 2023 12:10:41 GMT+0000 (Coordinated Universal Time)
// Kiadás checksum: 556aec220d7c2c0752d97033d3519cb9
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var uj_valasz_mutatasa_idozito;
var regi_zindex;
var regi_position;
var eloterbe_helyezett_objectek;
var eloterbe_helyezett_objectek_szama = 0;
function szinkron_keres(hivatkozas, parameterek, fuggveny) {
    if (typeof hivatkozas != 'string') {
        throw new Error('Hivatkozás paraméter nem string típusú!!!');
    }
    if (typeof fuggveny != 'function') {
        throw new Error('Fuggveny paraméter nem függvény típusú!!!');
    }
    if (typeof parameterek != 'object' && typeof parameterek != 'string') {
        throw new Error('Parameterek fuggveny nem string típusú!!!');
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        console.log(hivatkozas);
        console.log(this.responseText);
        fuggveny(JSON.parse(this.responseText));
    };
    if (typeof parameterek == 'string') {
        if (parameterek.length <= 0) {
            xhttp.open("GET", hivatkozas);
            xhttp.send();
        }
        else {
            xhttp.open("GET", hivatkozas);
            xhttp.send();
        }
    }
    else {
        xhttp.open("POST", hivatkozas);
        xhttp.send(parameterek);
    }
}
function simpleStringHash(string) {
    // https://linuxhint.com/javascript-hash-function/
    var hash = 0;
    if (string.length == 0)
        return hash;
    for (var x = 0; x < string.length; x++) {
        var ch = string.charCodeAt(x);
        hash = ((hash << 5) - hash) + ch;
        hash = hash & hash;
    }
    return hash;
}
function bajt_merette_valtasa(size) {
    var meret = parseFloat(size);
    var eredmeny = "";
    if (meret <= 1024) {
        eredmeny = String(meret) + ' B';
    }
    else {
        if (meret <= 1024 * 1024) {
            eredmeny = String(meret / 1024) + ' KB';
        }
        else {
            if (meret <= 1024 * 1024 * 1024) {
                eredmeny = String(meret / 1024 / 1024) + ' MB';
            }
            else {
                if (meret <= 1024 * 1024 * 1024 * 1024) {
                    eredmeny = String(meret / 1024 / 1024 / 1024) + ' GB';
                }
                else {
                    if (meret <= 1024 * 1024 * 1024 * 1024 * 1024) {
                        eredmeny = String(meret / 1024 / 1024 / 1024 / 1024) + ' GB';
                    }
                }
            }
        }
    }
    eredmeny = eredmeny.replace(/([0-9])\.([0-9][0-9]).* ([KMG]?B)/, '$1.$2 $3');
    eredmeny = eredmeny.replace(/([0-9][0-9])\.([0-9]).* ([KMG]?B)/, '$1.$2 $3');
    eredmeny = eredmeny.replace(/([0-9][0-9][0-9])\..* ([KMG]?B)/, '$1 $2');
    return eredmeny;
}
function eloterbe_helyezes_vege() {
    if (obj('sotetites_div') != null) {
        obj('sotetites_div').remove();
    }
    var metatagek = document.getElementsByTagName('meta');
    for (var i = 0; i < metatagek.length; i++) {
        if (/light/ig.test(metatagek[i].media)) {
            metatagek[i].content = "rgb(245,245,245)";
        }
        if (/dark/ig.test(metatagek[i].media)) {
            metatagek[i].content = "rgb(30,30,30)";
        }
    }
    if (eloterbe_helyezett_objectek_szama > 0) {
        for (var i = 0; i < eloterbe_helyezett_objectek_szama; i++) {
            var jelenlegi = obj(eloterbe_helyezett_objectek[i].id);
            if (jelenlegi != null) {
                jelenlegi.style.zIndex = regi_zindex[i];
                jelenlegi.style.position = regi_position[i];
            }
        }
        eloterbe_helyezett_objectek_szama = 0;
        eloterbe_helyezett_objectek = undefined;
    }
}
function eloterbe_helyezes(objectek, kattintassal_vege, vege) {
    eloterbe_helyezes_vege();
    if (obj('sotetites_div') == null) {
        var sotetites = document.createElement('div');
        sotetites.id = 'sotetites_div';
        sotetites.setAttribute('style', 'z-index: 10; position: fixed; background-color: black; opacity: 0.65; display: block; width: 100%; height: 100%; top: 0; left: 0;');
        document.body.appendChild(sotetites);
    }
    var metatagek = document.getElementsByTagName('meta');
    for (var i = 0; i < metatagek.length; i++) {
        if (/light/ig.test(metatagek[i].media)) {
            metatagek[i].content = "rgb(85.75, 85.75, 85.75)";
        }
        if (/dark/ig.test(metatagek[i].media)) {
            metatagek[i].content = "rgb(10.5, 10.5, 10.5)";
        }
    }
    if (kattintassal_vege) {
        obj('sotetites_div').onclick = function () {
            eloterbe_helyezes_vege();
            if (typeof vege == 'function') {
                vege();
            }
        };
    }
    else {
        obj('sotetites_div').onclick = null;
    }
    regi_zindex = [];
    regi_position = [];
    eloterbe_helyezett_objectek = [];
    eloterbe_helyezett_objectek_szama = 0;
    objectek.forEach(function (object) {
        eloterbe_helyezett_objectek_szama += 1;
        regi_zindex = __spreadArray(__spreadArray([], regi_zindex, true), [object.style.zIndex], false);
        regi_position = __spreadArray(__spreadArray([], regi_position, true), [object.style.position], false);
        eloterbe_helyezett_objectek = __spreadArray(__spreadArray([], eloterbe_helyezett_objectek, true), [object], false);
        var van_position = false;
        for (var i = 0; i < object.style.length; i++) {
            if (object.style[i] == 'position') {
                van_position = true;
            }
        }
        if (!van_position) {
            object.style.position = 'relative';
        }
        object.style.zIndex = '11';
    });
}
function masolas(event) {
    navigator.clipboard.writeText(event.target.innerHTML).then(function () {
        uj_valasz_mutatasa(3000, "", "Token vágólapra másolva");
    }, function (err) {
        console.error("V\u00E1g\u00F3lap m\u00E1sol\u00E1s hiba \"".concat(event.target.innerHTML, "\""));
    });
}
function obj(szoveg) {
    if (!(/^#/.test(szoveg))) {
        return document.querySelector('#' + szoveg);
    }
    return document.querySelector(szoveg);
}
function idopontbol_datum(datum) {
    datum.setHours(0);
    datum.setSeconds(0);
    datum.setMinutes(0);
    datum.setMilliseconds(0);
    return datum;
}
function uj_valasz_mutatasa(ido, tipus, valasz) {
    if (typeof ido != "number")
        throw new Error('Ido paraméter nem number típusú!!!');
    if (typeof tipus != "string")
        throw new Error('Tipus paraméter nem string típusú!!!');
    if (typeof valasz != "string")
        throw new Error('Valasz paraméter nem string típusú!!!');
    var valasz_uzenet = obj('valasz_uzenet');
    valasz_uzenet.style.border = '1px solid var(--szint-2-szin)';
    valasz_uzenet.style.backgroundColor = 'var(--szint-1-szin)';
    if (/^hiba/ig.test(tipus)) {
        valasz_uzenet.style.border = '1px solid var(--piros-1)';
        valasz_uzenet.style.backgroundColor = 'var(--piros-0)';
    }
    if (/^ok/ig.test(tipus)) {
        valasz_uzenet.style.border = '1px solid var(--zold-1)';
        valasz_uzenet.style.backgroundColor = 'var(--zold-0)';
    }
    valasz_uzenet.innerHTML = "<p style=\"color: rgb(240,240,240)\">".concat(valasz, "</p>");
    valasz_uzenet.style.visibility = "visible";
    clearTimeout(uj_valasz_mutatasa_idozito);
    uj_valasz_mutatasa_idozito = setTimeout(function () {
        valasz_uzenet.style.visibility = 'hidden';
    }, ido);
}
function varakozas(feltetel, hiba, fuggveny) {
    var kezdet = Date.now();
    var interval = setInterval(function () {
        if (Date.now() - kezdet > 5000) {
            clearInterval(interval);
            throw new Error(hiba);
            return;
        }
        if (feltetel()) {
            clearInterval(interval);
            fuggveny();
            return;
        }
    }, 3);
}
var domain = window.location.href.replace(/https?:\/\/([a-z0-9_\-\.]*).*/, '$1');
document.body.innerHTML += '<div id="valasz_uzenet" class="fit-content kerekites-10" style="z-index: 2; bottom: 5px; left: 5px; max-width: 300px; visibility: hidden; position: fixed; padding: 10px; text-shadow: 1px 1px rgb(70,70,70), -1px -1px rgb(70,70,70), 1px -1px rgb(70,70,70), -1px 1px rgb(70,70,70)"></div>';
/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// Checksum: 47d115f783830dcb439da838b87c8952
function topbar_fiok_gomb_kattintas() {
    var felhasznalo_doboz = obj('felhasznalo_doboz');
    if (felhasznalo_doboz.style.visibility == '') {
        felhasznalo_doboz.style.visibility = 'visible';
    }
    else {
        if (felhasznalo_doboz.style.visibility == 'hidden') {
            felhasznalo_doboz.style.visibility = 'visible';
        }
        else {
            felhasznalo_doboz.style.visibility = '';
        }
    }
}
function belepesgomb(event) {
    event.preventDefault();
    var post_parameterek_belepes = new FormData();
    post_parameterek_belepes.append('login', 'yes');
    post_parameterek_belepes.append('username', obj('username').value);
    post_parameterek_belepes.append('password', obj('current-password').value);
    szinkron_keres("/include/belepteto_rendszer.php", post_parameterek_belepes, function (uzenet) {
        if (uzenet.eredmeny == 'ok') {
            if (typeof belepes_fuggveny === 'function') {
                belepes_fuggveny();
            }
            uj_valasz_mutatasa(3000, "", "Sikeres belépés");
            belepteto_rendszer_frissites();
        }
        else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}
function kilepesgomb(event) {
    event.preventDefault();
    szinkron_keres("/include/belepteto_rendszer.php?logout=igen", "", function (uzenet) {
        if (uzenet.eredmeny == 'ok') {
            if (typeof kilepes_fuggveny === 'function') {
                kilepes_fuggveny();
            }
            session_username = "";
            session_admin = "";
            session_loggedin = "";
            belepteto_rendszer_frissites();
            uj_valasz_mutatasa(3000, "", "Sikeres kilépés");
            obj('username').value = '';
            obj('current-password').value = '';
        }
        else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}
function belepteto_rendszer_frissites() {
    szinkron_keres("/include/belepteto_rendszer.php?statusz=1", "", function (uzenet) {
        var varakozas = setInterval(function () {
            if (obj('felhasznalo_doboz') != null) {
                if (uzenet.eredmeny == 'ok') {
                    session_username = uzenet.session_username;
                    session_admin = uzenet.session_admin;
                    session_loggedin = uzenet.session_loggedin;
                    obj('belepve_mint').innerHTML = "Bel\u00E9pve mint: ".concat(session_username);
                    if (session_admin == "igen") {
                        obj('admin_felulet_gomb').style.display = 'block';
                        obj('vscode_gomb').style.display = 'block';
                    }
                    else {
                        session_admin = "";
                        obj('admin_felulet_gomb').style.display = 'none';
                        obj('vscode_gomb').style.display = 'none';
                    }
                    if (session_username != "") {
                        obj('belepett_menu_gomb').innerHTML = "Fiók";
                        obj('belepett_menu_gomb').style.display = 'inline';
                        obj('belepes_menu_gomb').style.display = 'none';
                    }
                }
                else {
                    session_admin = "";
                    session_username = "";
                    session_loggedin = "";
                    obj('belepett_menu_gomb').style.display = 'none';
                    obj('belepes_menu_gomb').style.display = 'inline';
                }
                if (session_loggedin == 'yes') {
                    obj('belepett_doboz').style.display = 'block';
                    obj('belepes_doboz').style.display = 'none';
                }
                else {
                    obj('belepett_doboz').style.display = 'none';
                    obj('belepes_doboz').style.display = 'block';
                }
                if (typeof frissites_fuggveny == 'function') {
                    frissites_fuggveny(session_loggedin, session_username, session_admin);
                }
                clearInterval(varakozas);
            }
        }, 20);
    });
}
var session_loggedin = "";
var session_username = "";
var session_admin = "";
var frissites_fuggveny;
var belepes_fuggveny;
var kilepes_fuggveny;
var kilepes_siker;
var belepes_siker;
function belepteto_rendszer_beallitas(frissult, belepes, kilepes) {
    var span = document.createElement('span');
    span.id = 'belepteto_rendszer';
    fetch("/komponensek/belepteto_rendszer.html")
        .then(function (response) { return response.text(); })
        .then(function (uzenet) {
        span.innerHTML = uzenet;
        document.body.appendChild(span);
        belepteto_rendszer_frissites();
        if (typeof frissult == 'function') {
            frissites_fuggveny = frissult;
        }
        if (typeof belepes == 'function') {
            belepes_fuggveny = belepes;
        }
        if (typeof kilepes == 'function') {
            kilepes_fuggveny = kilepes;
        }
    });
}
/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// Checksum: 47d115f783830dcb439da838b87c8952
function topbar_betoltese() {
    fetch("/komponensek/topbar.html")
        .then(function (response) { return response.text(); })
        .then(function (text) {
        document.body.innerHTML = text + document.body.innerHTML;
        document.head.innerHTML += '<meta name="theme-color" media="(prefers-color-scheme: light)" content="rgb(245,245,245)">';
        document.head.innerHTML += '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="rgb(30,30,30)">';
        var menu_div = obj('menu_div');
        menu_div.style.visibility = 'hidden';
        document.onclick = function (event) {
            var menure_kattintott = false;
            event.composedPath().forEach(function (element) {
                if (element == obj('oldalak_menu_gomb')) {
                    menure_kattintott = true;
                }
                if (menure_kattintott) {
                    menu_div.style.visibility = 'visible';
                    menu_div.style.animation = 'height-novekedes-sigmoid 0.3s ease 1 forwards';
                    eloterbe_helyezes([obj('menu_div')], true, undefined);
                }
                else {
                    if (menu_div.style.visibility != 'hidden') {
                        menu_div.style.visibility = 'visible';
                        menu_div.style.animation = 'height-csokkenes-sigmoid 0.3s ease 1 forwards';
                        eloterbe_helyezes_vege();
                    }
                }
            });
        };
    });
}
/* This is the TypeScript source of the 2048 game AI trainer.

The game board is represented by a 4x4 array of numbers (16 cells total).
The numbers can be 0, or any power of 2.
0 means an empty cell.

The AI should have an inoput layer which has these data to work with:
4 neurons describing the possibility of moving in each direction (1 for possible, 0 for not possible)
16 neurons describing if the cells are empty or not (1 for empty, 0 for not empty)
16 neurons describing the value of the cells (0-1, 0 for empty, 1 for 65536)

In total: 64 neurons as the input layer

The AI should have an output layer for each of the 4 directions (up, down, left, right) with 4 neurons total.
The neurons should signal the probability of moving in that direction.

The number of hidden layers and the number of neurons in each layer is up to the user.

NO COMMENTS AFTER THIS PART
*/
/// <reference path="/var/www/forras/kettoezernegyvennyolc/kettoezernegyvennyolc.ts" />
/// Checksum: 556aec220d7c2c0752d97033d3519cb9
var distribution = [0, 0, 0, 0];
var input_neuron_count = 20;
var cellPlacementCache = [];
var cacheHit = 0;
var cacheMiss = 0;
var bestGameSoFar;
var bestScoreSoFar = -500;
function cacheStats() {
    console.log("Cache hit: " + cacheHit);
    console.log("Cache miss: " + cacheMiss);
    console.log("Cache hit rate: " + (cacheHit / (cacheHit + cacheMiss) * 100) + "%");
}
function relu(x) {
    if (x < 0) {
        return x * 0.01;
    }
    else {
        return x;
    }
}
var AI = /** @class */ (function () {
    function AI(hiddenLayerCount, hiddenLayerNeuronCount) {
        this.selected = false;
        this.latest_score = 0;
        this.latest_fitness = 0;
        this.hiddenLayerCount = hiddenLayerCount;
        this.hiddenLayerNeuronCount = hiddenLayerNeuronCount;
        this.weights = [];
        this.biases = [];
        this.initWeights();
        this.initBiases();
        this.selected = false;
        this.latest_score = 0;
        this.latest_fitness = 0;
    }
    AI.prototype.initWeights = function () {
        this.weights = [];
        for (var i = 0; i < this.hiddenLayerCount + 1; i++) {
            this.weights.push([]);
            for (var j = 0; j < (i == 0 ? input_neuron_count : this.hiddenLayerNeuronCount); j++) {
                this.weights[i].push([]);
                for (var k = 0; k < (i == this.hiddenLayerCount ? 4 : this.hiddenLayerNeuronCount); k++) {
                    this.weights[i][j].push(Math.random() * 2 - 1);
                }
            }
        }
    };
    AI.prototype.initBiases = function () {
        this.biases = [];
        for (var i = 0; i < this.hiddenLayerCount + 1; i++) {
            this.biases.push([]);
            for (var j = 0; j < (i == this.hiddenLayerCount ? 4 : this.hiddenLayerNeuronCount); j++) {
                this.biases[i].push(Math.random() * 2 - 1);
            }
        }
    };
    AI.prototype.getInput = function (board) {
        var input = [];
        input.push(canMove(board, direction.up) ? 1 : 0);
        input.push(canMove(board, direction.down) ? 1 : 0);
        input.push(canMove(board, direction.left) ? 1 : 0);
        input.push(canMove(board, direction.right) ? 1 : 0);
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                input.push(board[i][j] / 65536);
            }
        }
        return input;
    };
    AI.prototype.getOutput = function (input) {
        var output;
        var layerInput = input;
        for (var i = 0; i < this.hiddenLayerCount + 1; i++) {
            output = [];
            for (var to = 0; to < (i == this.hiddenLayerCount ? 4 : this.hiddenLayerNeuronCount); to++) {
                var sum = 0;
                for (var from = 0; from < (i == 0 ? input_neuron_count : this.hiddenLayerNeuronCount); from++) {
                    sum += layerInput[from] * this.weights[i][from][to];
                }
                sum += this.biases[i][to];
                output.push(relu(sum));
            }
            layerInput = output;
        }
        return output;
    };
    AI.prototype.outputToMove = function (output) {
        var max = 0;
        var maxIndex = 0;
        for (var i = 0; i < 4; i++) {
            if (output[i] > max) {
                max = output[i];
                maxIndex = i;
            }
        }
        distribution[maxIndex] += 1;
        switch (maxIndex) {
            case 0: return "up";
            case 1: return "down";
            case 2: return "left";
            default: return "right";
        }
    };
    AI.prototype.benchmark = function () {
        var score = 0;
        for (var i = 0; i < 16; i++) {
            for (var j = 0; j < 15; j++) {
                var game_1 = new Game();
                game_1.control = control.AI;
                game_1.newGame();
                switch (i) {
                    case 0:
                        game_1.board[0][0] = 2;
                        break;
                    case 1:
                        game_1.board[0][1] = 2;
                        break;
                    case 2:
                        game_1.board[0][2] = 2;
                        break;
                    case 3:
                        game_1.board[0][3] = 2;
                        break;
                    case 4:
                        game_1.board[1][0] = 2;
                        break;
                    case 5:
                        game_1.board[1][1] = 2;
                        break;
                    case 6:
                        game_1.board[1][2] = 2;
                        break;
                    case 7:
                        game_1.board[1][3] = 2;
                        break;
                    case 8:
                        game_1.board[2][0] = 2;
                        break;
                    case 9:
                        game_1.board[2][1] = 2;
                        break;
                    case 10:
                        game_1.board[2][2] = 2;
                        break;
                    case 11:
                        game_1.board[2][3] = 2;
                        break;
                    case 12:
                        game_1.board[3][0] = 2;
                        break;
                    case 13:
                        game_1.board[3][1] = 2;
                        break;
                    case 14:
                        game_1.board[3][2] = 2;
                        break;
                    case 15:
                        game_1.board[3][3] = 2;
                        break;
                }
                switch (j) {
                    case 0:
                        game_1.board[0][0] == 2 ? game_1.board[0][1] = 2 : game_1.board[0][0] = 2;
                        break;
                    case 1:
                        game_1.board[0][1] == 2 ? game_1.board[0][2] = 2 : game_1.board[0][1] = 2;
                        break;
                    case 2:
                        game_1.board[0][2] == 2 ? game_1.board[0][3] = 2 : game_1.board[0][2] = 2;
                        break;
                    case 3:
                        game_1.board[0][3] == 2 ? game_1.board[1][0] = 2 : game_1.board[0][3] = 2;
                        break;
                    case 4:
                        game_1.board[1][0] == 2 ? game_1.board[1][1] = 2 : game_1.board[1][0] = 2;
                        break;
                    case 5:
                        game_1.board[1][1] == 2 ? game_1.board[1][2] = 2 : game_1.board[1][1] = 2;
                        break;
                    case 6:
                        game_1.board[1][2] == 2 ? game_1.board[1][3] = 2 : game_1.board[1][2] = 2;
                        break;
                    case 7:
                        game_1.board[1][3] == 2 ? game_1.board[2][0] = 2 : game_1.board[1][3] = 2;
                        break;
                    case 8:
                        game_1.board[2][0] == 2 ? game_1.board[2][1] = 2 : game_1.board[2][0] = 2;
                        break;
                    case 9:
                        game_1.board[2][1] == 2 ? game_1.board[2][2] = 2 : game_1.board[2][1] = 2;
                        break;
                    case 10:
                        game_1.board[2][2] == 2 ? game_1.board[2][3] = 2 : game_1.board[2][2] = 2;
                        break;
                    case 11:
                        game_1.board[2][3] == 2 ? game_1.board[3][0] = 2 : game_1.board[2][3] = 2;
                        break;
                    case 12:
                        game_1.board[3][0] == 2 ? game_1.board[3][1] = 2 : game_1.board[3][0] = 2;
                        break;
                    case 13:
                        game_1.board[3][1] == 2 ? game_1.board[3][2] = 2 : game_1.board[3][1] = 2;
                        break;
                    case 14:
                        game_1.board[3][2] == 2 ? game_1.board[3][3] = 2 : game_1.board[3][2] = 2;
                        break;
                    case 15:
                        game_1.board[3][3] == 2 ? game_1.board[0][0] = 2 : game_1.board[3][3] = 2;
                        break;
                }
                var taken_steps = 0;
                while (taken_steps < 500) {
                    var cancontinue = true;
                    try {
                        var inference_output = this.inference(game_1.getBoard());
                        var decoded_move = this.outputToMove(inference_output);
                        game_1.move(decoded_move);
                        taken_steps++;
                        var new_cell_position = getCachedRandomCellPosition(game_1.board);
                        if (game_1.board[new_cell_position.row][new_cell_position.column] != 0) {
                            console.error({ game: game_1.board, new_cell_position: new_cell_position });
                            cancontinue = false;
                        }
                        game_1.board[new_cell_position.row][new_cell_position.column] = 2;
                    }
                    catch (e) {
                        if (e == game_errors.GAME_OVER) {
                            console.log({ e: e });
                            break;
                        }
                        else {
                            game_1.penalty(300);
                            continue;
                        }
                    }
                    if (!cancontinue) {
                        throw new Error("Trying to place a new cell on a non-empty cell");
                    }
                }
                var current_score = game_1.getScore();
                score += current_score;
                if (current_score > bestScoreSoFar) {
                    bestGameSoFar = game_1;
                    bestScoreSoFar = current_score;
                    console.log("Best score so far: " + bestScoreSoFar);
                }
            }
        }
        this.latest_score = score;
        return score;
    };
    AI.prototype.mutate = function (mutation_rate, mutation_chance) {
        for (var i = 0; i < this.hiddenLayerCount + 1; i++) {
            for (var j = 0; j < (i == this.hiddenLayerCount ? 4 : this.hiddenLayerNeuronCount); j++) {
                for (var k = 0; k < (i == 0 ? input_neuron_count : this.hiddenLayerNeuronCount); k++) {
                    if (Math.random() < mutation_chance) {
                        this.weights[i][k][j] += (Math.random() * 2 - 1) * mutation_rate;
                    }
                }
                if (Math.random() < mutation_chance) {
                    this.biases[i][j] = Math.random() * 2 - 1 * mutation_rate;
                }
            }
        }
    };
    AI.prototype.train = function (generations, populationSize, hiddenLayerCount, hiddenLayerNeuronCount, mutation_rate, mutation_chance) {
        console.log("Training AI with the following parameters:");
        console.log({ generations: generations, populationSize: populationSize, hiddenLayerCount: hiddenLayerCount, hiddenLayerNeuronCount: hiddenLayerNeuronCount, mutation_rate: mutation_rate });
        var main_ai;
        var main_ai_score;
        if (!this.selected) {
            console.log("Starting benchmarking of starter population...");
            var max = -500;
            for (var i = 0; i < populationSize; i++) {
                console.log(i);
                var random_ai = new AI(hiddenLayerCount, hiddenLayerNeuronCount);
                var random_ai_score = random_ai.benchmark();
                if (random_ai_score > max) {
                    main_ai = random_ai;
                    main_ai_score = random_ai_score;
                    max = main_ai_score;
                    console.log("New main AI score: " + (main_ai_score / 240));
                }
            }
            console.log("Final main AI score: " + (main_ai_score / 240));
        }
        else {
            main_ai = this;
            main_ai.weights = this.weights;
            main_ai.biases = this.biases;
            main_ai_score = this.latest_score;
            console.log("Using pre-selected AI with score: " + (main_ai_score / 240));
        }
        for (var i = 0; i < generations; i++) {
            var mutated_ai = new AI(hiddenLayerCount, hiddenLayerNeuronCount);
            mutated_ai.weights = main_ai.weights;
            mutated_ai.biases = main_ai.biases;
            mutated_ai.mutate(mutation_rate, mutation_chance);
            var mutated_ai_score = mutated_ai.benchmark();
            if (mutated_ai_score > main_ai_score) {
                main_ai = mutated_ai;
                main_ai_score = mutated_ai_score;
                console.log("New main AI score: " + (main_ai_score / 240));
            }
        }
        console.log("Training finished");
        main_ai.selected = true;
        return main_ai;
    };
    AI.prototype.inference = function (board) {
        var input = this.getInput(board);
        var output = this.getOutput(input);
        return output;
    };
    return AI;
}());
function getCachedRandomCellPosition(board) {
    var board_squished = [];
    for (var row = 0; row < 4; row++) {
        for (var column = 0; column < 4; column++) {
            board_squished.push(board[row][column]);
        }
    }
    var cache = cellPlacementCache;
    for (var currentCell = 0; currentCell < 16; currentCell++) {
        var foundForCell = false;
        for (var j = 0; j < cache.length; j++) {
            if (cache[j].currentToken == board_squished[currentCell]) {
                cache = cache[j].children;
                foundForCell = true;
                if (currentCell == 15) {
                    if (cache.length == 1) {
                        if (cache[0].row != undefined && cache[0].column != undefined) {
                            cacheHit++;
                            return { row: cache[0].row, column: cache[0].column };
                        }
                    }
                }
                break;
            }
        }
        if (!foundForCell) {
            break;
        }
    }
    cacheMiss++;
    var emptyCells = [];
    for (var row = 0; row < board.length; row++) {
        for (var column = 0; column < board[row].length; column++) {
            if (board[row][column] == 0) {
                emptyCells.push({ row: row, column: column });
            }
        }
    }
    var randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    for (var rotation = 0; rotation < 4; rotation++) {
        randomCell = { row: 3 - randomCell.column, column: randomCell.row };
        var board_rotated = [];
        for (var row = 0; row < board.length; row++) {
            board_rotated.push([]);
            for (var column = 0; column < board[row].length; column++) {
                board_rotated[row].push(board[column][3 - row]);
            }
        }
        board = board_rotated;
        board_squished = [];
        for (var row = 0; row < board_rotated.length; row++) {
            for (var column = 0; column < board_rotated[row].length; column++) {
                board_squished.push(board_rotated[row][column]);
            }
        }
        insertIntoCache(randomCell, board_squished);
    }
    return randomCell;
}
function insertIntoCache(randomCell, board_squished) {
    var cache_insert = cellPlacementCache;
    for (var currentCell = 0; currentCell < 16; currentCell++) {
        var exists = false;
        for (var j = 0; j < cache_insert.length; j++) {
            if (cache_insert.length == 0) {
                break;
            }
            if (cache_insert[j].currentToken == board_squished[currentCell]) {
                cache_insert = cache_insert[j].children;
                exists = true;
                break;
            }
        }
        if (!exists) {
            cache_insert.push({ currentToken: board_squished[currentCell], children: [] });
            for (var j = 0; j < cache_insert.length; j++) {
                if (cache_insert[j].currentToken == board_squished[currentCell]) {
                    cache_insert = cache_insert[j].children;
                    break;
                }
            }
        }
    }
    cache_insert.push({ row: randomCell.row, column: randomCell.column });
}
function rotateBoardRight(board) {
    var newBoard = [];
    for (var row = 0; row < board.length; row++) {
        newBoard.push([]);
        for (var column = 0; column < board[row].length; column++) {
            newBoard[row].push(board[column][board.length - row - 1]);
        }
    }
    return newBoard;
}
function rotateBoardLeft(board) {
    var newBoard = [];
    for (var row = 0; row < board.length; row++) {
        newBoard.push([]);
        for (var column = 0; column < board[row].length; column++) {
            newBoard[row].push(board[board.length - column - 1][row]);
        }
    }
    return newBoard;
}
function rotateCellLeft(cell) {
    return { row: cell.column, column: 3 - cell.row };
}
function testingSingle() {
    jelenlegi_ai = new AI(1, 10);
    jelenlegi_ai = jelenlegi_ai.train(1, 1, 1, 10, 10, 1, 0.01);
}
function testingReal() {
    jelenlegi_ai = new AI(1, 16);
    jelenlegi_ai = jelenlegi_ai.train(1000, 30, 2, 36, 1000, 0.1, 0.05);
}
function testingRealQuick() {
    jelenlegi_ai = new AI(1, 16);
    jelenlegi_ai = jelenlegi_ai.train(5, 10, 1, 16, 1000, 0.1, 0.01);
}
function testingContinous() {
    jelenlegi_ai = new AI(1, 16);
    var dsa = function () {
        jelenlegi_ai = jelenlegi_ai.train(1, 10, 1, 16, 1000, 0.03, 0.003);
        drawGame(bestGameSoFar);
        cacheStats();
        drawGame(bestGameSoFar);
        setTimeout(dsa, 300);
    };
    dsa();
}
/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// Checksum: 47d115f783830dcb439da838b87c8952
/// <reference path="/var/www/forras/komponensek/belepteto_rendszer.ts" />
/// Checksum: a822d8a6e57f5f6e1c5a16170961da1d
/// <reference path="/var/www/forras/komponensek/topbar.ts" />
/// Checksum: 4d2f6739d6700c6dc0b76219b38713f1
/// <reference path="/var/www/forras/kettoezernegyvennyolc/ai.ts" />
/// Checksum: d0ebf4b5442c62e4e11ad84a1662a61e
var lepes_interval;
var game;
var jelenlegi_ai;
var game_errors;
(function (game_errors) {
    game_errors["INVALID_DIRECTION"] = "INVALID_DIRECTION";
    game_errors["IMPOSSIBLE_MOVE"] = "IMPOSSIBLE_MOVE";
    game_errors["GAME_OVER"] = "GAME_OVER";
    game_errors["INVALID_CONTROL_MODE"] = "INVALID_CONTROL_MODE";
})(game_errors || (game_errors = {}));
var direction;
(function (direction) {
    direction[direction["left"] = 0] = "left";
    direction[direction["right"] = 1] = "right";
    direction[direction["up"] = 2] = "up";
    direction[direction["down"] = 3] = "down";
})(direction || (direction = {}));
var control;
(function (control) {
    control[control["automatikus_random"] = 0] = "automatikus_random";
    control[control["manualis"] = 1] = "manualis";
    control[control["AI"] = 2] = "AI";
})(control || (control = {}));
var Game = /** @class */ (function () {
    function Game() {
        this.score = 0;
        this.board = [];
        for (var i = 0; i < 4; i++) {
            this.board[i] = [];
            for (var j = 0; j < 4; j++) {
                this.board[i][j] = 0;
            }
        }
    }
    Game.prototype.newGame = function () {
        this.board = [];
        for (var i = 0; i < 4; i++) {
            this.board[i] = [];
            for (var j = 0; j < 4; j++) {
                this.board[i][j] = 0;
            }
        }
        this.score = 0;
        if (this.control != control.AI) {
            this.fillRandomCell();
            this.fillRandomCell();
        }
    };
    Game.prototype.fillRandomCell = function () {
        var emptyCells = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push([i, j]);
                }
            }
        }
        if (emptyCells.length > 0) {
            var cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[cell[0]][cell[1]] = 2;
        }
    };
    Game.prototype.move = function (direction) {
        if (direction === 'left') {
            this.moveLeft();
        }
        else if (direction === 'right') {
            this.moveRight();
        }
        else if (direction === 'up') {
            this.moveUp();
        }
        else if (direction === 'down') {
            this.moveDown();
        }
        else {
            throw new Error(game_errors.INVALID_DIRECTION);
        }
        if (this.control != control.AI) {
            this.fillRandomCell();
        }
        if (this.isGameOver() || this.score < -500) {
            drawGame(this);
            clearInterval(lepes_interval);
            if (this.control != control.AI) {
                setTimeout(function () {
                    throw new Error(game_errors.GAME_OVER);
                }, 500);
            }
            else {
                throw new Error(game_errors.GAME_OVER);
            }
        }
    };
    Game.prototype.isGameOver = function () {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    return false;
                }
            }
        }
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 3; j++) {
                if (this.board[i][j] === this.board[i][j + 1]) {
                    return false;
                }
            }
        }
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 3; j++) {
                if (this.board[j][i] === this.board[j + 1][i]) {
                    return false;
                }
            }
        }
        return true;
    };
    Game.prototype.moveLeft = function () {
        var possibleMove = false;
        for (var i = 0; i < 4; i++) {
            var row = this.board[i];
            var newRow = this.moveRow(row);
            if (row.toString() != newRow.toString()) {
                possibleMove = true;
            }
            this.board[i] = newRow;
        }
        if (!possibleMove) {
            throw new Error(game_errors.IMPOSSIBLE_MOVE);
        }
    };
    Game.prototype.moveRight = function () {
        var possibleMove = false;
        for (var i = 0; i < 4; i++) {
            var row = this.board[i];
            var newRow = this.moveRow(row.reverse()).reverse();
            if (row.toString() != newRow.toString()) {
                possibleMove = true;
            }
            this.board[i] = newRow;
        }
        if (!possibleMove) {
            throw new Error(game_errors.IMPOSSIBLE_MOVE);
        }
    };
    Game.prototype.moveUp = function () {
        var possibleMove = false;
        for (var i = 0; i < 4; i++) {
            var column = [];
            for (var j = 0; j < 4; j++) {
                column.push(this.board[j][i]);
            }
            var newColumn = this.moveRow(column);
            if (column.toString() != newColumn.toString()) {
                possibleMove = true;
            }
            for (var j = 0; j < 4; j++) {
                this.board[j][i] = newColumn[j];
            }
        }
        if (!possibleMove) {
            throw new Error(game_errors.IMPOSSIBLE_MOVE);
        }
    };
    Game.prototype.moveDown = function () {
        var possibleMove = false;
        for (var i = 0; i < 4; i++) {
            var column = [];
            for (var j = 0; j < 4; j++) {
                column.push(this.board[j][i]);
            }
            var newColumn = this.moveRow(column.reverse()).reverse();
            if (column.toString() != newColumn.toString()) {
                possibleMove = true;
            }
            for (var j = 0; j < 4; j++) {
                this.board[j][i] = newColumn[j];
            }
        }
        if (!possibleMove) {
            throw new Error(game_errors.IMPOSSIBLE_MOVE);
        }
    };
    Game.prototype.moveRow = function (row) {
        var newRow = row.filter(function (value) { return value !== 0; });
        for (var i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                newRow.splice(i + 1, 1);
                this.score += newRow[i];
            }
        }
        for (var i = newRow.length; i < 4; i++) {
            newRow.push(0);
        }
        return newRow;
    };
    Game.prototype.changeControl = function (mode) {
        var _this = this;
        if (mode == 'kezi') {
            this.control = control.manualis;
        }
        else if (mode == 'automatikus') {
            this.control = control.automatikus_random;
        }
        else if (mode == 'ai') {
            this.control = control.AI;
        }
        else {
            throw new Error(game_errors.INVALID_CONTROL_MODE);
        }
        if (this.control != control.manualis) {
            lepes_interval = setInterval(function () {
                while (1) {
                    try {
                        if (_this.control == control.automatikus_random) {
                            _this.move(_this.getRandomMove());
                        }
                        else if (_this.control == control.AI) {
                            _this.move(_this.getAIMove());
                        }
                    }
                    catch (e) {
                        if (e.message == 'IMPOSSIBLE_MOVE') {
                            if (_this.control == control.AI) {
                                _this.penalty(100);
                                if (_this.isGameOver() || _this.score < -500) {
                                    clearInterval(lepes_interval);
                                    alert('Game over! Score: ' + _this.getScore());
                                }
                                break;
                            }
                            continue;
                        }
                        throw e;
                    }
                    break;
                }
                drawGame(_this);
            }, this.control == control.AI ? 1000 : 100);
        }
    };
    Game.prototype.getRandomMove = function () {
        var moves = ['left', 'right', 'up', 'down'];
        return moves[Math.floor(Math.random() * 4)];
    };
    Game.prototype.getAIMove = function () {
        console.log('Asking AI to do something');
        return jelenlegi_ai.inference(this.board);
    };
    Game.prototype.penalty = function (penalty) {
        this.score -= penalty;
    };
    Game.prototype.getBoard = function () {
        return this.board;
    };
    Game.prototype.getScore = function () {
        return this.score;
    };
    return Game;
}());
function drawGame(game) {
    var board = game.getBoard();
    var boardDiv = document.getElementById('board');
    var score = document.getElementById('score');
    boardDiv.innerHTML = '';
    var table = document.createElement('table');
    for (var i = 0; i < 4; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < 4; j++) {
            var td = document.createElement('td');
            if (board[i][j] != 0) {
                td.innerText = board[i][j].toString();
                tr.appendChild(td);
            }
            else {
                var td_1 = document.createElement('td');
                tr.appendChild(td_1);
            }
        }
        table.appendChild(tr);
    }
    table.style.borderSpacing = '0px';
    table.style.borderCollapse = 'collapse';
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++) {
            table.rows[i].cells[j].style.border = '1px solid black';
            table.rows[i].cells[j].style.padding = '10px';
        }
    }
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++) {
            var cell = table.rows[i].cells[j];
            if (cell.innerText === '2') {
                cell.style.backgroundColor = '#eee4da';
            }
            else if (cell.innerText === '4') {
                cell.style.backgroundColor = '#ede0c8';
            }
            else if (cell.innerText === '8') {
                cell.style.backgroundColor = '#f2b179';
            }
            else if (cell.innerText === '16') {
                cell.style.backgroundColor = '#f59563';
            }
            else if (cell.innerText === '32') {
                cell.style.backgroundColor = '#f67c5f';
            }
            else if (cell.innerText === '64') {
                cell.style.backgroundColor = '#f65e3b';
            }
            else if (cell.innerText === '128') {
                cell.style.backgroundColor = '#edcf72';
            }
            else if (cell.innerText === '256') {
                cell.style.backgroundColor = '#edcc61';
            }
            else if (cell.innerText === '512') {
                cell.style.backgroundColor = '#edc850';
            }
            else if (cell.innerText === '1024') {
                cell.style.backgroundColor = '#edc53f';
            }
            else if (cell.innerText === '2048') {
                cell.style.backgroundColor = '#edc22e';
            }
            else if (cell.innerText === '4096') {
                cell.style.backgroundColor = '#000000';
            }
            else if (cell.innerText === '8192') {
                cell.style.backgroundColor = '#000000';
            }
            else if (cell.innerText === '16384') {
                cell.style.backgroundColor = '#000000';
            }
            cell.style.width = '100px';
            cell.style.height = '100px';
            cell.style.fontSize = '50px';
            cell.style.textAlign = 'center';
        }
    }
    boardDiv.appendChild(table);
    score.innerText = game.getScore().toString();
}
function canMove(board, dir) {
    if (dir === direction.left) {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 3; j++) {
                if (board[i][j] === 0 && board[i][j + 1] !== 0) {
                    return true;
                }
                else if (board[i][j] !== 0 && board[i][j] === board[i][j + 1]) {
                    return true;
                }
            }
        }
    }
    else if (dir === direction.right) {
        for (var i = 0; i < 4; i++) {
            for (var j = 3; j > 0; j--) {
                if (board[i][j] === 0 && board[i][j - 1] !== 0) {
                    return true;
                }
                else if (board[i][j] !== 0 && board[i][j] === board[i][j - 1]) {
                    return true;
                }
            }
        }
    }
    else if (dir === direction.up) {
        for (var j = 0; j < 4; j++) {
            for (var i = 0; i < 3; i++) {
                if (board[i][j] === 0 && board[i + 1][j] !== 0) {
                    return true;
                }
                else if (board[i][j] !== 0 && board[i][j] === board[i + 1][j]) {
                    return true;
                }
            }
        }
    }
    else if (dir === direction.down) {
        for (var j = 0; j < 4; j++) {
            for (var i = 3; i > 0; i--) {
                if (board[i][j] === 0 && board[i - 1][j] !== 0) {
                    return true;
                }
                else if (board[i][j] !== 0 && board[i][j] === board[i - 1][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}
function belepteto_rendszer_frissult() {
    if (session_loggedin != 'yes') {
        obj('loginWarning').style.display = 'block';
        obj('leaderboard').style.display = 'none';
    }
    else {
        obj('loginWarning').style.display = 'none';
        obj('leaderboard').style.display = 'block';
    }
}
window.onload = function () {
    topbar_betoltese();
    belepteto_rendszer_beallitas(belepteto_rendszer_frissult);
    game = new Game();
    game.newGame();
    drawGame(game);
    document.addEventListener('keydown', function (event) {
        try {
            game.move(event.key.replace('Arrow', '').toLowerCase());
        }
        catch (e) {
            if (e.message === 'IMPOSSIBLE_MOVE') {
                alert('IMPOSSIBLE_MOVE: -100 points');
                game.penalty(100);
            }
        }
        drawGame(game);
    });
};

