import { browser } from "$app/environment";
import sha256 from 'sha256';
import { uj_valasz_mutatasa } from "./Uzenet";

export function hash_keszites(szoveg: string) {
    return sha256(szoveg);
}

export function obj(szoveg: string): HTMLElement {
    let azonosito = szoveg;
    if( !szoveg.startsWith('#') ) { azonosito = '#' + szoveg; }
    if( document.querySelector(azonosito) !== null) {
        return <HTMLElement>document.querySelector(azonosito);
    } else {
        throw new Error('Nincs ilyen azonosítójú elem: ' + azonosito);
    }
}

export function masolas(event: Event) {
    if(browser) {
        navigator.clipboard.writeText( (<HTMLElement>event.target).innerHTML ).then(function() {
            uj_valasz_mutatasa(3000, "ok", "Token vágólapra másolva");
        });
    }
}

export function szinkron_keres(hivatkozas: string, parameterek: string | FormData, fuggveny: Function) {
    if(!browser) {
        return;
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

export function idopontbol_datum(datum: Date) {
    datum.setHours(0);
    datum.setSeconds(0);
    datum.setMinutes(0);
    datum.setMilliseconds(0);
    return datum;
}

export function bajt_merette_valtasa(meret: number) {
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
                        eredmeny = String(meret / 1024 / 1024  / 1024  / 1024) + ' TB';
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