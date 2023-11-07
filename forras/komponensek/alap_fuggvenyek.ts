var uj_valasz_mutatasa_idozito;
var regi_zindex;
var regi_position;
var eloterbe_helyezett_objectek;
var eloterbe_helyezett_objectek_szama = 0;

function szinkron_keres(hivatkozas, parameterek, fuggveny) {
    if(typeof hivatkozas != 'string') {
        throw new Error('Hivatkozás paraméter nem string típusú!!!');
    }
    if(typeof fuggveny != 'function') {
        throw new Error('Fuggveny paraméter nem függvény típusú!!!');
    }
    if(typeof parameterek != 'object' && typeof parameterek != 'string') {
        throw new Error('Parameterek fuggveny nem string típusú!!!');
    }

    let xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        console.log(hivatkozas);
        console.log(this.responseText);
        fuggveny( JSON.parse(this.responseText) );
    }
    if( typeof parameterek == 'string' ) {
        if( parameterek.length <= 0 ) {
            xhttp.open("GET", hivatkozas);
            xhttp.send();
        } else {
            xhttp.open("GET", hivatkozas);
            xhttp.send();
        }
    } else {
        xhttp.open("POST", hivatkozas);
        xhttp.send(parameterek);
    }
}

function simpleStringHash(string: string) {
    // https://linuxhint.com/javascript-hash-function/
    var hash = 0;
    if (string.length == 0) return hash;
    for (let x = 0; x <string.length; x++) {
        let ch = string.charCodeAt(x);
        hash = ((hash <<5) - hash) + ch;
        hash = hash & hash;
    }
    return hash;
}

function bajt_merette_valtasa(size) {
    let meret = parseFloat(size);
    let eredmeny = "";
    if( meret <= 1024) {
        eredmeny = String(meret) + ' B';
    } else {
        if( meret <= 1024 * 1024) {
            eredmeny = String(meret / 1024) + ' KB';
        } else {
            if( meret <= 1024 * 1024 * 1024) {
                eredmeny = String(meret / 1024 / 1024) + ' MB';
            } else {
                if( meret <= 1024 * 1024 * 1024 * 1024) {
                    eredmeny = String(meret / 1024 / 1024 / 1024) + ' GB';
                } else {
                    if( meret <= 1024 * 1024 * 1024 * 1024 * 1024) {
                        eredmeny = String(meret / 1024 / 1024  / 1024  / 1024) + ' GB';
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
    if( obj('sotetites_div') != null) {
        obj('sotetites_div').remove();
    }

    let metatagek = document.getElementsByTagName('meta')
    for (let i = 0; i < metatagek.length; i++) {
        if( /light/ig.test(metatagek[i].media) ) {
            metatagek[i].content = "rgb(245,245,245)";
        }
        if( /dark/ig.test(metatagek[i].media) ) {
            metatagek[i].content = "rgb(30,30,30)";
        }
    }

    if( eloterbe_helyezett_objectek_szama > 0 ) {
        for (let i = 0; i < eloterbe_helyezett_objectek_szama; i++) {
            let jelenlegi = obj(eloterbe_helyezett_objectek[i].id);
            if( jelenlegi != null ) {
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
    if( obj('sotetites_div') == null ) {
        let sotetites = document.createElement('div');
        sotetites.id = 'sotetites_div';
        sotetites.setAttribute('style', 'z-index: 10; position: fixed; background-color: black; opacity: 0.65; display: block; width: 100%; height: 100%; top: 0; left: 0;');
        document.body.appendChild(sotetites);
    }

    let metatagek = document.getElementsByTagName('meta');
    for (let i = 0; i < metatagek.length; i++) {
        if( /light/ig.test(metatagek[i].media) ) {
            metatagek[i].content = "rgb(85.75, 85.75, 85.75)";
        }
        if( /dark/ig.test(metatagek[i].media) ) {
            metatagek[i].content = "rgb(10.5, 10.5, 10.5)";
        }
    }

    if( kattintassal_vege ) {
        obj('sotetites_div').onclick = () => {
            eloterbe_helyezes_vege();
            if( typeof vege == 'function' ) {
                vege();
            }
        }
    } else {
        obj('sotetites_div').onclick = null;
    }

    regi_zindex = [];
    regi_position = [];
    eloterbe_helyezett_objectek = [];
    eloterbe_helyezett_objectek_szama = 0;
    objectek.forEach(object => {
        eloterbe_helyezett_objectek_szama += 1;
        regi_zindex = [...regi_zindex, object.style.zIndex];
        regi_position = [...regi_position, object.style.position];
        eloterbe_helyezett_objectek = [...eloterbe_helyezett_objectek, object];

        let van_position = false;
        for (let i = 0; i < object.style.length; i++) {
            if(object.style[i] == 'position') {
                van_position = true;
            }
        }
        if( !van_position ) {
            object.style.position = 'relative';
        }
        object.style.zIndex = '11';
    });
}

function masolas(event) {
    navigator.clipboard.writeText( event.target.innerHTML ).then(function() {
        uj_valasz_mutatasa(3000, "", "Token vágólapra másolva");
    }, function(err) {
        console.error(`Vágólap másolás hiba "${event.target.innerHTML}"`);
    });
}

function obj(szoveg) {
    if( !( /^#/.test(szoveg) ) ) {
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
    if( typeof ido == "undefined" ) {
        throw new Error('Ido paraméter nem definiált!!!');
    }
    if( typeof tipus == "undefined" ) {
        throw new Error('Tipus paraméter nem definiált!!!');
    }
    if( typeof valasz == "undefined" ) {
        throw new Error('Valasz paraméter nem definiált!!!');
    }

    if( typeof ido != "number" )
        throw new Error('Ido paraméter nem number típusú!!!');
    if( typeof tipus != "string" )
        throw new Error('Tipus paraméter nem string típusú!!!');
    if( typeof valasz != "string" )
        throw new Error('Valasz paraméter nem string típusú!!!');

    let valasz_uzenet = obj('valasz_uzenet');

    valasz_uzenet.style.border ='1px solid var(--szint-2-szin)';
    valasz_uzenet.style.backgroundColor ='var(--szint-1-szin)';

    if( /^hiba/ig.test(tipus) ) {
        valasz_uzenet.style.border ='1px solid var(--piros-1)';
        valasz_uzenet.style.backgroundColor ='var(--piros-0)';
    }
    
    if( /^ok/ig.test(tipus) ) {
        valasz_uzenet.style.border ='1px solid var(--zold-1)';
        valasz_uzenet.style.backgroundColor ='var(--zold-0)';
    }

    valasz_uzenet.innerHTML = `<p style="color: rgb(240,240,240)">${valasz}</p>`;
    valasz_uzenet.style.visibility = "visible";
    clearTimeout(uj_valasz_mutatasa_idozito);
    uj_valasz_mutatasa_idozito = setTimeout(() => {
        valasz_uzenet.style.visibility = 'hidden';
    }, ido);
}

function varakozas(feltetel, hiba, fuggveny) {
    let kezdet = Date.now();
    let interval = setInterval(() => {
        if( Date.now() - kezdet > 5000 ) {
            clearInterval(interval);
            throw new Error(hiba);
            return;
        }
        if( feltetel() ) {
            clearInterval(interval);
            fuggveny();
            return;
        }
    }, 3);
}

var domain = window.location.href.replace(/https?:\/\/([a-z0-9_\-\.]*).*/, '$1');

document.body.innerHTML += '<div id="valasz_uzenet" class="fit-content kerekites-10" style="z-index: 2; bottom: 5px; left: 5px; max-width: 300px; visibility: hidden; position: fixed; padding: 10px; text-shadow: 1px 1px rgb(70,70,70), -1px -1px rgb(70,70,70), 1px -1px rgb(70,70,70), -1px 1px rgb(70,70,70)"></div>';