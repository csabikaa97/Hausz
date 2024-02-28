import { writable } from "svelte/store";

import { szinkron_keres } from "./alap_fuggvenyek";
import { BelepesStatusz } from "./Tipusok";
import { Uzenet } from "./Tipusok";
import { alap_url } from "./Konstansok";
import { hash_keszites } from "./alap_fuggvenyek";
import { uj_valasz_mutatasa } from "./Uzenet";

let loggedin = false;
let username = "";
let admin = false;
let user_id = 0;

export let közös_loggedin = writable(false);
export let közös_user_id = writable(0);
export let közös_username = writable("");
export let közös_admin = writable(false);
export let közös_statusz_lekerve = writable(false);

közös_loggedin.subscribe((uj_ertek) => { loggedin = uj_ertek; })
közös_username.subscribe((uj_ertek) => { username = uj_ertek; })
közös_admin.subscribe((uj_ertek) => { admin = uj_ertek; })
közös_user_id.subscribe((uj_ertek) => { user_id = uj_ertek; })

export async function kilepes() {
    szinkron_keres("/include/belepteto_rendszer.🦀?logout=igen", "", (uzenet: Uzenet<string>) => {
        if( uzenet.eredmeny == 'ok' ) {
            közös_loggedin.set(false);
            közös_username.set("");
            közös_admin.set(false);
            közös_user_id.set(-1);
            uj_valasz_mutatasa(3000, "sima", "Sikeres kilépés");
        } else {
            uj_valasz_mutatasa(3000, "hiba", uzenet.valasz);
        }
    });
}

export async function belepes(felhasználónév: string, jelszó: string) {
    let post_parameterek_salt_keres = new FormData();
    post_parameterek_salt_keres.append('get_salt', 'yes');
    post_parameterek_salt_keres.append('username', felhasználónév);

    szinkron_keres(`${alap_url}/include/belepteto_rendszer.🦀`, post_parameterek_salt_keres, async (uzenet: {eredmeny: string, salt: string, valasz: string}) => {
        if(uzenet.eredmeny == 'ok') {
            let salt = uzenet.salt;
            let post_parameterek_belepes = new FormData();
            post_parameterek_belepes.append('login', 'yes');
            post_parameterek_belepes.append('username', felhasználónév);

            let jelszo = await hash_keszites(jelszó);
            let saltos_jelszo = await hash_keszites(jelszo + salt);
            post_parameterek_belepes.append('sha256_password', saltos_jelszo);

            szinkron_keres("/include/belepteto_rendszer.🦀", post_parameterek_belepes, (uzenet: Uzenet<string>) => {
                if(uzenet.eredmeny == 'ok') {
                    uj_valasz_mutatasa(3000, "ok", "Sikeres belépés");
                    statusz_lekerese();
                } else {
                    uj_valasz_mutatasa(3000, "hiba", uzenet.valasz);
                }
            });
        } else {
            uj_valasz_mutatasa(3000, "hiba", uzenet.valasz);
        }
    });
}

export function statusz_lekerese() {
    szinkron_keres(`${alap_url}/include/belepteto_rendszer?statusz=1`, "", (uzenet: {
        eredmeny: string;
        session_loggedin: string,
        session_username: string,
        session_admin: string,
        session_user_id: number
    }) => {
        if( uzenet.eredmeny == 'ok' ) {
            közös_loggedin.set(uzenet.session_loggedin == "yes");
            közös_username.set(uzenet.session_username);
            közös_admin.set(uzenet.session_admin == "igen");
            közös_user_id.set(uzenet.session_user_id);
        } else {
            közös_loggedin.set(false);
            közös_username.set("");
            közös_admin.set(false);
            közös_user_id.set(-1);
        }
        közös_statusz_lekerve.set(true);
    });
}