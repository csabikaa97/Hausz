function szinkron_keres(fuggveny, hivatkozas, parameterek) {
    if(hivatkozas == undefined) {
        return false;
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
