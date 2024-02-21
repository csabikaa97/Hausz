import { browser } from "$app/environment";

export async function hash_keszites(szoveg: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(szoveg);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return hash.toString();
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