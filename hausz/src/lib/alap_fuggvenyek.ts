import { browser } from "$app/environment";
import sha256 from 'sha256';
import { uj_valasz_mutatasa } from "./Uzenet";

export function hash_keszites(szoveg: string) {
    return sha256(szoveg);
}

export function obj(szoveg: string): HTMLElement {
    if( !( /^#/.test(szoveg) ) ) {
        return <HTMLElement>document.querySelector('#' + szoveg);
    }
    return <HTMLElement>document.querySelector(szoveg);
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