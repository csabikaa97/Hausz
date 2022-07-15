var uj_valasz_mutatasa_idozito;

function szinkron_keres(hivatkozas, parameterek, fuggveny) {
    if(typeof hivatkozas != 'string')
        throw new Error('Hivatkozás paraméter nem string típusú!!!');
    if(typeof fuggveny != 'function')
        throw new Error('Fuggveny paraméter nem függvény típusú!!!');
    if(typeof parameterek != 'object' && typeof parameterek != 'string')
        throw new Error('Parameterek fuggveny nem string típusú!!!');

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        fuggveny(this.responseText);
    }
    if( typeof parameterek == 'string' ) {
        if( parameterek.length <= 0 ) {
            xhttp.open("GET", hivatkozas);
            xhttp.send();
        }
    }
    xhttp.open("POST", hivatkozas);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(parameterek);
}

function bajt_merette_valtasa(size) {
    var meret = parseFloat(size);
    var eredmeny = "";
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

function eloterbe_helyezes(object) {
    if( obj('sotetites_div') == null ) {
        var sotetites = document.createElement('div');
        sotetites.id = 'sotetites_div';
        sotetites.style = "z-index: 10; background-color: black; opacity: 0.65; display: block; width: 100%; height: 100%; top: 0; left: 0;";
        document.body.appendChild(sotetites);
    }

    object.style.zIndex = '';
}

function masolas(event) {
    navigator.clipboard.writeText( event.target.innerHTML ).then(function() {
        
    }, function(err) {
        console.error('Vágólap másolás hiba "'+event.target.innerHTML+'"');
    });
}

function obj(szoveg) {
    if( !( /^#/.test(szoveg) ) ) {
        return document.querySelector('#' + szoveg);
    }
    return document.querySelector(szoveg);
}

function uj_valasz_mutatasa(ido, tipus, valasz) {
    if( typeof ido != "number" )
        throw new Error('Ido paraméter nem number típusú!!!');
    if( typeof tipus != "string" )
        throw new Error('Tipus paraméter nem string típusú!!!');
    if( typeof valasz != "string" )
        throw new Error('Valasz paraméter nem string típusú!!!');
    
    if( obj('valasz_uzenet') == null ) {
        document.body.innerHTML += '<div id="valasz_uzenet" class="bottom_left_corner_div kerekites-10" style="z-index: 2; bottom: 5px; left: 5px; max-width: 20%; visibility: hidden; position: fixed; padding: 10px; text-shadow: 1px 1px rgb(70,70,70), -1px -1px rgb(70,70,70), 1px -1px rgb(70,70,70), -1px 1px rgb(70,70,70)"></div>';
    }

    if( /^hiba/ig.test(tipus) ) {
        obj('valasz_uzenet').style.border ='1px solid var(--piros-1)';
        obj('valasz_uzenet').style.backgroundColor ='var(--piros-0)';
    }
    
    if( /^ok/ig.test(tipus) ) {
        obj('valasz_uzenet').style.border ='1px solid var(--zold-1)';
        obj('valasz_uzenet').style.backgroundColor ='var(--zold-0)';
    }

    obj('valasz_uzenet').innerHTML = "<p>" + valasz + "</p>";
    obj('valasz_uzenet').style.visibility = "visible";
    clearTimeout(uj_valasz_mutatasa_idozito);
    uj_valasz_mutatasa_idozito = setTimeout(() => {
        obj('valasz_uzenet').style.visibility = 'hidden';
    }, ido);
}

function varakozas(feltetel, hiba, fuggveny) {
    var kezdet = Date.now();
    var interval = setInterval(() => {
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