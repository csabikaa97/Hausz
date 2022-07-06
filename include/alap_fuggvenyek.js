function szinkron_keres(hivatkozas, parameterek, fuggveny) {
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

function bajt_merette_valtas(size) {
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
    if( document.getElementById('sotetites_div') == null ) {
        sotetites = document.createElement('div');
        sotetites.id = 'sotetites_div';
        sotetites.style = "z-index: 10; background-color: black; opacity: 0.65; display: block; width: 100%; height: 100%; top: 0; left: 0;";
        document.body.appendChild(sotetites);
    }

    object.style.zIndex = '';
}

function masolas(event) {
    navigator.clipboard.writeText( event.target.innerHTML ).then(function() {
        console.log('Vágólapra kimásolva: "'+event.target.innerHTML+'"');
    }, function(err) {
        console.error('Vágólap másolás hiba "'+event.target.innerHTML+'"');
    });
}