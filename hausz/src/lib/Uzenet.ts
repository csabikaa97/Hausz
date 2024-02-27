import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { obj } from "./alap_fuggvenyek";

export let jelenlegi_valasz = writable("");
export let jelenleg_lathato = writable(false);
let helyi_idozito: number = 0;

export function uj_valasz_mutatasa(ido: number, tipus: "hiba" | "ok" | "sima", valasz: string) {
    if(!browser) { return; }

    let valasz_uzenet = obj('valasz_uzenet');

    if(valasz_uzenet === null) {
        throw new Error("valasz_uzenet Null!!!");
    }

    switch(tipus) {
        case "sima": {
            valasz_uzenet.style.border ='1px solid var(--szint-2-szin)';
            valasz_uzenet.style.backgroundColor ='var(--szint-1-szin)';
            break;
        }
        case "hiba": {
            valasz_uzenet.style.border ='1px solid var(--piros-1)';
            valasz_uzenet.style.backgroundColor ='var(--piros-0)';
            break;
        }
        case "ok": {
            valasz_uzenet.style.border ='1px solid var(--zold-1)';
            valasz_uzenet.style.backgroundColor ='var(--zold-0)';
            break;
        }
    }

    jelenlegi_valasz.set(valasz);
    jelenleg_lathato.set(true);

    window.clearTimeout(helyi_idozito);
    helyi_idozito = window.setTimeout(() => {
        jelenleg_lathato.set(false);
    }, ido);
}