var uj_valasz_mutatasa_idozito;

function szinkron_keres(hivatkozas, fuggveny, parameterek) {
    if(typeof parameterek === 'function') {
        fuggveny = parameterek;
    }
    if(hivatkozas == undefined) {
        throw new Error('Nincs megadva URL!!!');
    }
    if(fuggveny == undefined) {
        throw new Error('Nincs definiálva függvény!!!');
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        fuggveny(this.responseText);
    }
    if (parameterek == undefined) {
        xhttp.open("GET", hivatkozas);
        xhttp.send();
    } else {
        xhttp.open("POST", hivatkozas);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.send(parameterek);
    }
}

function bajt_merette_valtasa(size) {
    meret = parseFloat(size);
    if( meret <= 1024) {
        meret = String(meret) + ' B';
    } else {
        if( meret <= 1024 * 1024) {
            meret = String(meret / 1024) + ' KB';
        } else {
            if( meret <= 1024 * 1024 * 1024) {
                meret = String(meret / 1024 / 1024) + ' MB';
            } else {
                if( meret <= 1024 * 1024 * 1024 * 1024) {
                    meret = String(meret / 1024 / 1024 / 1024) + ' GB';
                } else {
                    if( meret <= 1024 * 1024 * 1024 * 1024 * 1024) {
                        meret = String(meret / 1024 / 1024  / 1024  / 1024) + ' GB';
                    }
                }
            }
        }
    }
    meret = meret.replace(/([0-9])\.([0-9][0-9]).* ([KMG]?B)/, '$1.$2 $3');
    meret = meret.replace(/([0-9][0-9])\.([0-9]).* ([KMG]?B)/, '$1.$2 $3');
    meret = meret.replace(/([0-9][0-9][0-9])\..* ([KMG]?B)/, '$1 $2');
    return meret;
}

function eloterbe_helyezes(object) {
    if( obj('sotetites_div') == null ) {
        sotetites = document.createElement('div');
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
    if( typeof ido == "undefined" ) {
        throw new Error('Nem adtál meg időt: uj_valasz_mutatasa(ido, tipus ?, valasz)');
    }
    if( typeof tipus == "undefined" ) {
        throw new Error('Nem adtál meg üzenetet: uj_valasz_mutatasa(ido, tipus ?, valasz)');
    }
    
    if( obj('valasz_uzenet') == null ) {
        document.body.innerHTML += '<div id="valasz_uzenet" class="bottom_left_corner_div kerekites-10" style="z-index: 2; bottom: 5px; left: 5px; max-width: 20%; visibility: hidden; position: fixed; padding: 10px; text-shadow: 1px 1px rgb(70,70,70), -1px -1px rgb(70,70,70), 1px -1px rgb(70,70,70), -1px 1px rgb(70,70,70)"></div>';
    }
    if( typeof valasz == "undefined" ) {
        valasz = tipus;
        if( /^HIBA:/i.test(valasz) ) {
            obj('valasz_uzenet').style.border ='1px solid var(--piros-1)';
            obj('valasz_uzenet').style.backgroundColor ='var(--piros-0)';
        } else {
            obj('valasz_uzenet').style.border ='1px solid var(--szint-2-szin)';
            obj('valasz_uzenet').style.backgroundColor ='var(--szint-1-szin)';
        }
    } else {
        if( tipus == "hiba" ) {
            obj('valasz_uzenet').style.border ='1px solid var(--piros-1)';
            obj('valasz_uzenet').style.backgroundColor ='var(--piros-0)';
        } else {
            obj('valasz_uzenet').style.border ='1px solid var(--zold-1)';
            obj('valasz_uzenet').style.backgroundColor ='var(--zold-0)';
        }
    }
    obj('valasz_uzenet').innerHTML = "<p>" + valasz + "</p>";
    obj('valasz_uzenet').style.visibility = "visible";
    clearTimeout(uj_valasz_mutatasa_idozito);
    uj_valasz_mutatasa_idozito = setTimeout(() => {
        obj('valasz_uzenet').style.visibility = 'hidden';
    }, ido);
}