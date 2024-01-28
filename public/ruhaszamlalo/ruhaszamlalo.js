// Kiadás dátuma: Sun Nov 05 2023 23:07:30 GMT+0000 (Coordinated Universal Time)
// Kiadás checksum: c0e7cf2bfbe449ed9d096733ddf2a1fc
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
    if (typeof ido == "undefined") {
        throw new Error('Ido paraméter nem definiált!!!');
    }
    if (typeof tipus == "undefined") {
        throw new Error('Tipus paraméter nem definiált!!!');
    }
    if (typeof valasz == "undefined") {
        throw new Error('Valasz paraméter nem definiált!!!');
    }
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
/// <reference path="alap_fuggvenyek.ts" />
/// Checksum: e12ca1712a0c22ac88c3477fca5b9dcf
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
    var post_parameterek_salt_keres = new FormData();
    post_parameterek_salt_keres.append('get_salt', 'yes');
    post_parameterek_salt_keres.append('username', obj('username').value);
    szinkron_keres("/include/belepteto_rendszer.php", post_parameterek_salt_keres, function (uzenet) {
        if (uzenet.eredmeny == 'ok') {
            var salt = uzenet.salt;
            var post_parameterek_belepes = new FormData();
            post_parameterek_belepes.append('login', 'yes');
            post_parameterek_belepes.append('username', obj('username').value);
            var jelszo = crypto_konyvtar.hash_keszites(obj('current-password').value);
            var saltos_jelszo = crypto_konyvtar.hash_keszites(jelszo + salt);
            post_parameterek_belepes.append('sha256_password', saltos_jelszo);
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
        else {
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
var myLibrary;
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
var crypto_konyvtar;
var elem = document.createElement("script");
elem.setAttribute("src", "/komponensek/crypto.js");
document.body.appendChild(elem);
/// <reference path="../komponensek/alap_fuggvenyek.ts" />
/// Checksum: e12ca1712a0c22ac88c3477fca5b9dcf
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
/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// Checksum: e12ca1712a0c22ac88c3477fca5b9dcf
/// <reference path="/var/www/forras/komponensek/belepteto_rendszer.ts" />
/// Checksum: 3c4694858f4308e602ebdb3b8184cdc4
/// <reference path="/var/www/forras/komponensek/topbar.ts" />
/// Checksum: 6f35da70ffe7e761adfd0c477dd9e9ff
function belepes_kilepes_siker() {
    location.reload();
}
function hozzaadas(id) {
    szinkron_keres("/ruhaszamlalo/ruhaszamlalo.php?hozzaadas=" + id, "", function (uzenet) {
        if (uzenet.eredmeny == 'ok') {
            console.log({ uzenet: uzenet });
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            ruhak_frissitese();
        }
        else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}
function csokkentes(id) {
    szinkron_keres("/ruhaszamlalo/ruhaszamlalo.php?csokkentes=" + id, "", function (uzenet) {
        if (uzenet.eredmeny == 'ok') {
            console.log({ uzenet: uzenet });
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            ruhak_frissitese();
        }
        else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}
function kategoria_click(kategoria_szama) {
    var sorok = document.getElementsByClassName('kategoria-' + kategoria_szama.toString());
    var jelenleg_rejte_van = sorok[0].getAttribute('hidden') != null;
    var eltunteteshez = document.getElementsByTagName('tr');
    for (var i = 0; i < eltunteteshez.length; i++) {
        if (/kategoria-[0-9]/.test(eltunteteshez[i].className)) {
            eltunteteshez[i].setAttribute('hidden', "");
        }
    }
    if (jelenleg_rejte_van) {
        for (var i = 0; i < sorok.length; i++) {
            sorok[i].removeAttribute('hidden');
        }
    }
    else {
        for (var i = 0; i < sorok.length; i++) {
            sorok[i].setAttribute('hidden', "");
        }
    }
}
function ruhak_frissitese() {
    if (session_loggedin != 'yes' || session_username != "Andi") {
        obj('belepve').setAttribute('style', 'display: none;');
        obj('nincs_belepve_hiba').setAttribute('style', 'display: block;');
        return;
    }
    obj('belepve').setAttribute('style', 'display: block;');
    obj('nincs_belepve_hiba').setAttribute('style', 'display: none;');
    szinkron_keres("/ruhaszamlalo/ruhaszamlalo.php?ruhak=1", "", function (uzenet) {
        if (uzenet.eredmeny == 'ok') {
            console.log({ uzenet: uzenet });
            var buffer = '';
            var kategoriak = [];
            for (var i = 0; i < uzenet.ruhak_szama; i++) {
                var van = false;
                for (var j = 0; j < kategoriak.length; j++) {
                    if (kategoriak[j] == uzenet.ruhak[i].kategoria) {
                        van = true;
                    }
                }
                if (!van) {
                    kategoriak = __spreadArray(__spreadArray([], kategoriak, true), [uzenet.ruhak[i].kategoria], false);
                }
            }
            for (var k = 0; k < kategoriak.length; k++) {
                buffer += "<tr kategoria=\"".concat(k, "\" onclick=\"kategoria_click(").concat(k, ");\"><td class=\"padding-10\"><dsa class=\"gomb szint-2 kerekites-15\" style=\"font-weight: bold;\">").concat(kategoriak[k], "</dsa></td><td colspan=\"5\"></td></tr>");
                var _loop_1 = function (i) {
                    if (uzenet.ruhak[i].kategoria != kategoriak[k]) {
                        return "continue";
                    }
                    buffer += "<tr hidden ";
                    var ruha = uzenet.ruhak[i];
                    var utolso_felvetel_szoveg = void 0;
                    if (ruha.utolso_felvetel == new Date().toJSON().slice(0, 10)) {
                        utolso_felvetel_szoveg = "Ma";
                        buffer += 'style="background-color: rgb(100,220,100); text-shadow: 0px 0px 4px var(--szint-0-szin);"';
                    }
                    else {
                        if (ruha.utolso_felvetel.length <= 0) {
                            utolso_felvetel_szoveg = "";
                        }
                        else {
                            var nap_kulonbseg = (Date.now() - Date.parse(ruha.utolso_felvetel)) / (1000 * 60 * 60 * 24);
                            utolso_felvetel_szoveg = (Math.round(nap_kulonbseg).toString() + " napja");
                        }
                    }
                    if (k % 2 == 0) {
                        buffer += ' class="szint-1';
                    }
                    else {
                        buffer += ' class="szint-2';
                    }
                    buffer += " kategoria-".concat(k, "\">");
                    buffer += '<td colspan="2" style="';
                    if (/turis ?/ig.test(ruha.nev)) {
                        buffer += 'color: orange; ';
                        ruha.nev = ruha.nev.replace(/turis? /ig, '');
                    }
                    buffer += "padding-top: 15px; padding-bottom: 15px;";
                    var markak = ['mango', 'h&m', 'lacoste', 'zara', 'no comment', 'calvin klein',
                        'bershka', 'mtv', 'lidl', 'butikos', 'abercrombie & fitch',
                        'debenhams', 'takko', 'sugarbird', 'mohito', 'new look', 'g star raw',
                        'adidas', 'nike', 'nasty gal', 'puma', 'converse', 'rieker',
                        'remonte', 'salamander'
                    ];
                    markak.forEach(function (marka) {
                        var jelenlegi_marka_regexe = new RegExp("(".concat(marka, ")"), 'ig');
                        if (jelenlegi_marka_regexe.test(ruha.nev)) {
                            ruha.nev = ruha.nev.replace(jelenlegi_marka_regexe, '<dsa style="text-decoration: underline;">$1</dsa>');
                        }
                    });
                    buffer += "\">".concat(ruha.nev, "</td><td>").concat(utolso_felvetel_szoveg, "</td>");
                    buffer += "<td class=\"cella\"><div class=\"szint-2 gomb kerekites-15\" onclick=\"hozzaadas(".concat(ruha.id, ")\">+</div></td>");
                    buffer += "<td>".concat(ruha.szamlalo, "</td>");
                    buffer += '<td class="cella">';
                    if (ruha.szamlalo > 0) {
                        buffer += "<div class=\"szint-2 gomb kerekites-15\" onclick=\"csokkentes(".concat(ruha.id, ")\">-</div>");
                    }
                    buffer += '</td>';
                    buffer += "</tr>";
                };
                for (var i = 0; i < uzenet.ruhak_szama; i++) {
                    _loop_1(i);
                }
            }
            document.getElementsByClassName('tablazat')[0].innerHTML = buffer;
        }
        else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}
function ruha_hozzaadasa(event) {
    event.preventDefault();
    var postdata = new FormData();
    postdata.append('ruha_kategoria', obj('ruhakategoria').value);
    postdata.append('ruha_nev', obj('ruhanev').value);
    szinkron_keres("/ruhaszamlalo/ruhaszamlalo.php?uj_ruha=1", postdata, function (uzenet) {
        if (uzenet.eredmeny == 'ok') {
            console.log({ uzenet: uzenet });
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            obj('ruhanev').value = "";
            ruhak_frissitese();
        }
        else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}
topbar_betoltese();
belepteto_rendszer_beallitas(ruhak_frissitese, belepes_kilepes_siker, belepes_kilepes_siker);

