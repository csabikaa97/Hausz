<script lang="ts">
    import { obj, szinkron_keres } from "$lib/alap_fuggvenyek";
    import { szurendo_szavak } from "$lib/szurendo_szavak";
    import { közös_loggedin, közös_user_id } from "$lib/BeleptetoRendszer";
    import { bajt_merette_valtasa } from "$lib/alap_fuggvenyek";
    import { uj_valasz_mutatasa } from "$lib/Uzenet";
    import { idopontbol_datum } from "$lib/alap_fuggvenyek";
    import { browser } from "$app/environment";
    import Topbar from "$lib/Topbar.svelte";
    import BeleptetoRendszer from "$lib/BeleptetoRendszer.svelte";
    import Uzenet from "$lib/Uzenet.svelte";
    import { megoszto_fajl_tipusok } from "$lib/Konstansok";
    import { megoszto_fajl_elonezet_limit } from "$lib/Konstansok";

    let session_loggedin = false;
    let session_user_id = 0;
    közös_loggedin.subscribe((uj_ertek) => { session_loggedin = uj_ertek; })
    közös_user_id.subscribe((uj_ertek) => { session_user_id = uj_ertek; })

    class Fajl {
        megjeleno_nev: string;
        titkositott: number;
        id: number;
        size: number;
        filename: string;
        added: string;
        user_id: number;
        private: number;
        members_only: number
    }

    class FajlElem {
        fajl: Fajl;
        elonezet_tipus: string;
        elonezet_emoji: string;
        elonezet_tipusnev: string;
        datum_string: string;
    }

    class FajlLista {
        eredmeny: string;
        fajlok_szama: number;
        fajlok: Fajl[];
        valasz: string
    }

    let szabad_tarhely = 0;
    let foglalt_tarhely = 0;

    let filter_fajlnev: string = "";
    let filter_datum: string = "";
    let filter_feltolto: string = "";

    let nem_letezo_fajl_sor = false;
    let nincs_fajl_sor = false;

    let dropZone: HTMLElement;
    let dropZone_leiras: HTMLElement;

    let jobb_klikk_menu_aktivalva = false;
    let atnevezes_menu_aktivalva = false;
    let titkositas_feloldasa_menu_aktivalva = false;
    let v2_titkositas_feloldasa_menu_aktivalva = false;

    let feldolgozott_fajl_lista: FajlElem[] = [];

    let szures_aktivalva = false;

    let darken_background = false;

    let titkositott_fajl_letoltes_link = "";
    let titkositott_fajl_letoltes_fajlnev = "";
    let titkositatlan_fajl_letoltes_link = "";
    let v2_titkositas_feloldott_fajl = "";

    let kivalasztott_fajl: FajlElem;
    
    let elonezet_aktivalva = false;
    let elonezet_tartalom: string = "";

    let drop_zona_aktivalva = false;

    let jobb_klikk_menu_top = 0;
    let jobb_klikk_menu_left = 0;
    let jobb_klikk_menu_position = "fixed";

    let atnevezes_uj_nev = "";

    function szures_gomb_kattintas(event: Event) {
        szures_aktivalva = !szures_aktivalva;
        /*
        if (obj('szuro_sor').style.display == 'none' || obj('szuro_sor').style.display == '') {
            obj('szuro_sor').style.display = 'table-row';
            obj('szures_gomb').classList.remove("szint-3");
            obj('szures_gomb').classList.add("szint-4");
        } else {
            obj('fajlnev_szures_mezo').value = "";
            obj('datum_szures_mezo').value = "";
            obj('feltolto_szures_mezo').value = "";
            filter_frissites();
            obj('szuro_sor').style.display = 'none';
            obj('szures_gomb').classList.remove("szint-4");
            obj('szures_gomb').classList.add("szint-3");
        }
        */
    }

    function filter_frissites() {
        /*
        let filter_fajlnev = obj('fajlnev_szures_mezo').value;
        let filter_datum = obj('datum_szures_mezo').value;
        let filter_feltolto = obj('feltolto_szures_mezo').value;

        let tr_tagek = document.getElementsByTagName('tbody')[0].children;

        let maradt_sorok_szama = 0;

        for (let i = 0; i < tr_tagek.length; i++) {
            let sors = 'table-row';

            if (filter_feltolto.length > 0) {
                if (tr_tagek[i].attributes['sor_username'] != undefined) {
                    if (tr_tagek[i].attributes['sor_username'].value.toLowerCase() != filter_feltolto.toLowerCase() &&
                        !tr_tagek[i].attributes['sor_username'].value.toLowerCase().includes(filter_feltolto.toLowerCase())) {
                        sors = 'none';
                    }
                }
            }

            if (filter_fajlnev.length > 0) {
                if (tr_tagek[i].attributes['sor_filename'] != undefined) {
                    if (tr_tagek[i].attributes['sor_filename'].value.toLowerCase() != filter_fajlnev.toLowerCase() &&
                        !tr_tagek[i].attributes['sor_filename'].value.toLowerCase().includes(filter_fajlnev.toLowerCase())) {
                        sors = 'none';
                    }
                }
            }

            if (filter_datum.length > 0) {
                if (tr_tagek[i].attributes['sor_added'] != undefined) {
                    let datum = tr_tagek[i].attributes['sor_added'].value;
                    datum = datum.replace(/-/g, '.');
                    if (datum != filter_datum &&
                        !datum.includes(filter_datum)) {
                        sors = 'none';
                    }
                }
            }

            if (tr_tagek[i].id == 'nincs_fajl_sor') {
                sors = 'none';
            }

            tr_tagek[i].setAttribute('style', 'display: ' + sors);

            if (sors == 'table-row') {
                maradt_sorok_szama += 1;
            }
        }

        if (maradt_sorok_szama <= 3) {
            obj('nem_letezo_fajl_sor').style.display = "table-row";
        } else {
            obj('nem_letezo_fajl_sor').style.display = "none";
        }
        */
    }

    function fajlok_betoltese() {
        szinkron_keres("/megoszto/megoszto.🦀?fajlok=1", "", (uzenet: FajlLista) => {
            if(uzenet.eredmeny != 'ok') {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
                return;
            }

            if(uzenet.fajlok_szama <= 0) {
                nincs_fajl_sor = true;
            } else {
                nincs_fajl_sor = false;
            }

            let feldolgozas_alatt_allo_lista: FajlElem[] = [];

            for (let i = 0; i < uzenet.fajlok.length; i++) {
                let fajl = uzenet.fajlok[i];

                let hozzaadando_fajl_elem = new FajlElem();

                // BAD: let kiterjesztes = String(fajl.filename).replace(/(.*)(\..*)/, '$2');
                let kiterjesztes = "";
                if(fajl.filename.includes('.')) {
                    let split_fajlnev = fajl.filename.split('.');
                    if(split_fajlnev !== undefined) {
                        let utolso_elem = split_fajlnev.pop();
                        if(utolso_elem !== undefined) {
                            kiterjesztes = utolso_elem;
                        }
                    }
                }
                let elonezet_tipus = "egyeb";

                Object.values(megoszto_fajl_tipusok).forEach((sor) => {
                    sor.kiterjesztesek.forEach( jelenlegi_kiterjesztes => {
                        if ( kiterjesztes.includes(jelenlegi_kiterjesztes) ) {
                            elonezet_tipus = sor.tipus;
                            return;
                        }
                    });
                });

                hozzaadando_fajl_elem.elonezet_tipus = elonezet_tipus;

                szurendo_szavak.forEach(szo => {
                    let jelenlegi_szo_regexe = new RegExp(`${szo}`, 'i');
                    if( jelenlegi_szo_regexe.test(fajl.filename) ) {
                        let csere = "";
                        for (let i = 0; i < szo.length; i++) {   csere += "*"; }
                        fajl.filename = fajl.filename.replace( jelenlegi_szo_regexe, csere );
                    }
                });

                let elonezet_emoji = "";
                let elonezet_tipusnev = "";

                switch (elonezet_tipus) {
                    case "kep":         elonezet_emoji = '📷'; elonezet_tipusnev = 'Kép'; break;
                    case "audio":       elonezet_emoji = '🎵'; elonezet_tipusnev = 'Audió'; break;
                    case "video":       elonezet_emoji = '🎬'; elonezet_tipusnev = 'Videó'; break;
                    case "dokumentum":  elonezet_emoji = '📝'; elonezet_tipusnev = 'Dokumentum'; break;
                    case "szoftver":    elonezet_emoji = '💿'; elonezet_tipusnev = 'Szoftver'; break;
                    case "csomagolt":   elonezet_emoji = '📦'; elonezet_tipusnev = 'Csomagolt fájl'; break;
                    default:            elonezet_emoji = '❔'; elonezet_tipusnev = 'Egyéb'; break;
                }

                hozzaadando_fajl_elem.elonezet_emoji = elonezet_emoji;
                hozzaadando_fajl_elem.elonezet_tipusnev = elonezet_tipusnev;

                let datum_string = "";

                if( idopontbol_datum(new Date()) > idopontbol_datum(new Date(fajl.added)) ) {
                    datum_string = `${fajl.added.replace(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/, '$1.$2.$3')}`;
                } else {
                    datum_string = `${fajl.added.replace(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/, '$4:$5')}`;
                }

                hozzaadando_fajl_elem.datum_string = datum_string;

                hozzaadando_fajl_elem.fajl = fajl;

                feldolgozas_alatt_allo_lista = [...feldolgozas_alatt_allo_lista, hozzaadando_fajl_elem];
            }

            if (filter_fajlnev.length > 0 || filter_datum.length > 0 || filter_feltolto.length > 0) {
                filter_frissites();
            }

            feldolgozott_fajl_lista = feldolgozas_alatt_allo_lista;
            console.log({feldolgozott_fajl_lista});
        });

        szinkron_keres("/megoszto/megoszto.🦀?tarhely=1", "", (uzenet: {eredmeny: string, szabad_tarhely: number, foglalt_tarhely: number, valasz: string}) => {
            if( uzenet.eredmeny == 'ok' ) {
                szabad_tarhely = uzenet.szabad_tarhely;
                foglalt_tarhely = uzenet.foglalt_tarhely;

                setTimeout(() => {
                    let foglalt_tarhely_arany = foglalt_tarhely / szabad_tarhely * 100.0;
                    obj('div_hasznalt_tarhely').style.width = foglalt_tarhely_arany + '%';
                }, 50);
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    }

    function torles() {
        obj('jobb_klikk_menu').style.display = '';
        if (confirm('Biztosan szeretnéd törölni a "' + kivalasztott_fajl.fajl.filename + '" nevű fájlt?')) {
            uj_valasz_mutatasa(9999999, "sima", kivalasztott_fajl.fajl.filename + " nevű fájl törlése...");
            szinkron_keres("/megoszto/megoszto.🦀?delete=1&file_id=" + kivalasztott_fajl.fajl.id, "", (uzenet: {eredmeny: string, valasz: string}) => {
                if( uzenet.eredmeny == 'ok' ) {
                    uj_valasz_mutatasa(5000, "ok", uzenet.valasz);
                    
                    feldolgozott_fajl_lista = feldolgozott_fajl_lista.filter( fajl => fajl.fajl.id !== kivalasztott_fajl.fajl.id );
                } else {
                    uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
                }
            });
        }
    }

    function elonezet(fajl_id: number) {
        let fajl = feldolgozott_fajl_lista.find( elem => elem.fajl.id === fajl_id );
        if(fajl === undefined) {
            throw new Error('A fájl nem található id alapján: ' + fajl_id);
        }

        let hivatkozas = "/megoszto/megoszto.🦀?letoltes&file_id=" + fajl.fajl.id;
        if (fajl.fajl.size > megoszto_fajl_elonezet_limit) {
            uj_valasz_mutatasa(5000, "hiba", 'A fájl mérete nagyobb mint 10MB, ezért az előnézetet nem lehet hozzá betölteni.');
        } else {
            elonezet_aktivalva = true;
            darken_background = true;

            switch(fajl.elonezet_tipus) {
                case "kep": {
                    elonezet_tartalom = `<img alt="előnézet" id="elonezet_iframe" src="${hivatkozas}" title="Előnézet" style="max-width: 100%; max-height: 100%;" />`;
                    break;
                }
                case "audio": {
                    elonezet_tartalom = `<audio controls><source src="${hivatkozas}" type="audio/mpeg" /></audio>`;
                    break;
                }
                default: {
                    elonezet_tartalom = `<iframe style="height: 100%; width: 100%; background-color: white; color: black" id="elonezet_iframe" src="${hivatkozas}" title="Előnézet"></iframe>`;
                    break;
                }
            }
        }
    }

    function v2_titkositas_feloldasa(fajl_id: number, fajlnev: string) {
        /*
        if( file_id != jelenleg_feloldando_fajl_id || fajlnev != jelenleg_feloldando_fajl_nev ) {
            obj('v2_titkositott_fajl_letoltes_gomb').style.visibility = 'visible';
            obj('v2_titkositas_mentes_doboz').style.visibility = 'hidden';
        }
        jelenleg_feloldando_fajl_id = file_id;
        jelenleg_feloldando_fajl_nev = fajlnev;
        let caller = event.target;
        if (!caller) {
            if( !(<HTMLElement>caller).outerHTML.match(/^<td/)) {
                return;
            }
        }
        obj('v2_titkositas_feloldasa_box').style.visibility = 'visible';
        obj('darken_background').style.visibility = 'visible';
        obj('elonezet_bezaras_gomb').style.visibility = 'visible';
        */
    }

    function v1_titkositas_feloldasa(file_id: number, fajlnev: string) {
        // obj('titkositatlan_fajl_letoltes_link').innerHTML = "";
        // obj('titkositas_feloldasa_kulcs').value = "";
        // obj('titkositott_fajl_letoltes_link').innerHTML = "<br><br>Titkosított fájl letöltése";
        // obj('titkositott_fajl_letoltes_link').download = "titkositott_" + fajlnev;
        // obj('titkositott_fajl_letoltes_link').href = "/megoszto/megoszto.🦀?letoltes&file_id=" + file_id;
        titkositott_fajl_letoltes_link = "/megoszto/megoszto.🦀?letoltes&file_id=" + file_id;
        titkositott_fajl_letoltes_fajlnev = fajlnev;
        // obj('titkositas_feloldasa_box').style.visibility = 'visible';
        titkositas_feloldasa_menu_aktivalva = true;
        // obj('darken_background').style.visibility = 'visible';
        // obj('elonezet_bezaras_gomb').style.visibility = 'visible';
    }

    function titkositas_feloldasa_kuldes() {
        /*
        if ( obj('titkositas_feloldasa_kulcs').value.length <= 0 ) {
            uj_valasz_mutatasa(5000, "hiba", "Nem adtál meg titkosítási kulcsot, így nem lehet feloldani a fájlt.");
            return;
        }

        let post_parameterek_titkositas_feloldasa = new FormData();
        post_parameterek_titkositas_feloldasa.append('titkositas_feloldasa_kulcs', obj('titkositas_feloldasa_kulcs').value);

        szinkron_keres("/megoszto/megoszto.🦀?letoltes&file_id=" + file_id, post_parameterek_titkositas_feloldasa, (uzenet) => {
            if( uzenet.eredmeny == 'ok' ) {
                uj_valasz_mutatasa(99999, "", "Fájl letöltése...");
                let xhr = new XMLHttpRequest();
                xhr.open('POST', "/megoszto/megoszto.🦀?letoltes&file_id=" + file_id);
                xhr.responseType = 'blob';
                xhr.onload = () => {
                    let fajl = xhr.response;
                    let link = URL.createObjectURL(fajl);
                    obj('titkositatlan_fajl_letoltes_link').href = link;
                    obj('titkositatlan_fajl_letoltes_link').innerHTML = "<br><br>Titkosítatlan fájl letöltése";
                    obj('titkositatlan_fajl_letoltes_link').download = fajlnev;
                    uj_valasz_mutatasa(5000, "ok", "Fájl letöltése kész.");
                };
                let post_parameterek_letoltes = new FormData();
                post_parameterek_letoltes.append('titkositas_feloldasa_kulcs', obj('titkositas_feloldasa_kulcs').value);
                post_parameterek_letoltes.append('letoltes', '1');
                xhr.send(post_parameterek_letoltes);
            } else {
                uj_valasz_mutatasa(10000, "hiba", uzenet.valasz);
            }
        });
        */
    }

    function fajl_atnevezese() {
        jobb_klikk_menu_aktivalva = false;
        atnevezes_menu_aktivalva = true;
        darken_background = true;
    }

    function atnevezes_inditasa() {
        let link = "/megoszto/megoszto.🦀?atnevezes=1&file_id=" + kivalasztott_fajl.fajl.id + "&uj_nev=" + atnevezes_uj_nev;
        szinkron_keres(link, "", (uzenet: {eredmeny: string, valasz: string}) => {
            if( uzenet.eredmeny == 'ok' ) {
                uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
                elonezet_bezaras();

                feldolgozott_fajl_lista = feldolgozott_fajl_lista.map( fajl => {
                    if(fajl.fajl.id === kivalasztott_fajl.fajl.id) {
                        fajl.fajl.filename = atnevezes_uj_nev;
                    }
                    return fajl;
                });
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    }

    function claimeles() {
        szinkron_keres("/megoszto/megoszto.🦀?claim=1&file_id=" + kivalasztott_fajl.fajl.id, "", (uzenet: {eredmeny: string, valasz: string}) => {
            if( uzenet.eredmeny == 'ok' ) {
                uj_valasz_mutatasa(3000, "ok", uzenet.valasz);

                feldolgozott_fajl_lista = feldolgozott_fajl_lista.map( fajl => {
                    if(fajl.fajl.id === kivalasztott_fajl.fajl.id) {
                        fajl.fajl.user_id = session_user_id;
                    }
                    return fajl;
                });
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    }

    function konyvtarak_beallitasa() {
        /*
        if(typeof crypto_konyvtar == 'undefined') {
            uj_valasz_mutatasa(5000, "hiba", "A crypto könyvtár nem található");
            throw new Error('A crypto konyvtar nem talalhato.');
        }
        if(typeof window['Buffer'] == 'undefined' || typeof window['crypto'] == 'undefined') {
            window['Buffer'] = crypto_konyvtar.Buffer;
            window['crypto'] = crypto_konyvtar.crypto;
        }
        */
    }

    function feltoltes() {
        /*
        let fajlok = obj('fileToUpload').files;
        if (fajlok.length > 1) {
            uj_valasz_mutatasa(99999, "", 'Fájlok feltöltése...');
        } else {
            uj_valasz_mutatasa(99999, "", 'Fájl feltöltése...');
        }

        let feltoltes_statusz_doboz = document.createElement('div');
        feltoltes_statusz_doboz.style.padding = '20px';
        feltoltes_statusz_doboz.innerHTML = 'Fájl(ok) feltöltése folyamatban...';
        feltoltes_statusz_doboz.id = 'feltoltes_statusz_doboz';
        feltoltes_statusz_doboz.style.position = 'fixed';
        feltoltes_statusz_doboz.style.display = 'block';
        feltoltes_statusz_doboz.style.width = '100%';
        feltoltes_statusz_doboz.style.textAlign = 'center';
        feltoltes_statusz_doboz.style.top = '50%';
        document.body.appendChild(feltoltes_statusz_doboz);

        eloterbe_helyezes( [ feltoltes_statusz_doboz ], false, undefined );

        obj('fileToUpload').type = '';
        obj('fileToUpload_label').innerHTML = 'Feltöltés folyamatban...';

        let valid_fajlok_szama = 0;
        for (let i = 0; i < fajlok.length; i++) {
            if (fajlok[i].valid != "nem") {
                valid_fajlok_szama++;
            }
        }

        let kesz_fajlok_szama = 0;

        for (let i = 0; i < fajlok.length; i++) {
            let fajl = fajlok[i];

            if (fajl.valid == "nem") {
                continue;
            }

            let keres = new XMLHttpRequest();
            keres.onload = function() {
                console.log(this.responseText);
                console.log({formData: feltoltes_form_adatok});
                console.log(feltoltes_form_adatok.get('submit'));
                let uzenet = JSON.parse(this.responseText);
                if( uzenet.eredmeny == 'ok' ) {
                    kesz_fajlok_szama++;
                    if (kesz_fajlok_szama == valid_fajlok_szama) {
                        if (valid_fajlok_szama > 1) {
                            uj_valasz_mutatasa(5000, "ok", 'Fájlok feltöltése kész');
                        } else {
                            uj_valasz_mutatasa(5000, "ok", 'Fájl feltöltése kész');
                        }
                        obj('feltoltes_statusz_doboz').parentNode.removeChild(obj('feltoltes_statusz_doboz'));
                        obj('fileToUpload').type = 'file';
                        obj('fileToUpload_label').innerHTML = '&#128193; Kattints ide fájlok feltöltéséhez';
                        fajlok_betoltese();
                    }
                } else {
                    uj_valasz_mutatasa(5000, "hiba", this.responseText);
                }
                eloterbe_helyezes_vege();
            }
            let feltoltes_form_adatok = new FormData();
            if (obj('titkositas_kulcs').value.length > 0) {
                var titkositasi_kulcs_sha256_hash = crypto_konyvtar.hash_keszites(obj('titkositas_kulcs').value);
                feltoltes_form_adatok.append("titkositasi_kulcs_hash", crypto_konyvtar.hash_keszites(titkositasi_kulcs_sha256_hash));
                var string_iv = titkositasi_kulcs_sha256_hash.substring(32, 48);
                var titkositasi_kulcs_sha256_hash = titkositasi_kulcs_sha256_hash.substring(0, 32);
                var kulcs_arraybuffer = crypto_konyvtar.Buffer.from(titkositasi_kulcs_sha256_hash, 'utf-8');
                feltoltes_form_adatok.append("titkositas_iv", string_iv);
                var iv = crypto_konyvtar.Buffer.from(string_iv, 'utf8');

                crypto.subtle.importKey('raw', kulcs_arraybuffer, { 'length': 256, 'name': 'AES-GCM' }, false, [ 'encrypt', 'decrypt' ])
                    .then(key => {
                        var olvaso = new FileReader();
                        olvaso.onload = function() {
                            if(!(olvaso.result instanceof ArrayBuffer)) {
                                throw new Error('A fájl nem konvertálható ArrayBuffer típusra.');
                            }

                            crypto.subtle.encrypt({ 'name': 'AES-GCM', iv }, key, olvaso.result)
                                .then(encrypted => {
                                    fajl = new File([encrypted], fajl.name, { type: fajl.type });
                                    if(obj('private').checked) {
                                        feltoltes_form_adatok.append("private", "1");
                                    } else {
                                        feltoltes_form_adatok.append("private", "0");
                                    }
                                    if(obj('members_only').checked) {
                                        feltoltes_form_adatok.append("members_only", "1");
                                    } else {
                                        feltoltes_form_adatok.append("members_only", "0");
                                    }
                                    feltoltes_form_adatok.append("submit", "1");
                                    feltoltes_form_adatok.append("filename", fajl.name);
                                    feltoltes_form_adatok.append("fileToUpload", fajl);
                                    keres.open("POST", '/megoszto/megoszto.🦀');
                                    keres.send(feltoltes_form_adatok);
                                },
                                err => {
                                    console.error(err);
                                    throw new Error('A titkosítás nem sikerült.');
                                });
                        };
                        var blob = new Blob([fajl], { type: fajl.type });
                        olvaso.readAsArrayBuffer(blob);
                        
                    }, 
                    err => {
                        console.error(err);
                        throw new Error('A titkosítási kulcs készítés nem sikerült.');
                    });
            } else {
                if(obj('private').checked) {
                    feltoltes_form_adatok.append("private", "1");
                } else {
                    feltoltes_form_adatok.append("private", "0");
                }
                if(obj('members_only').checked) {
                    feltoltes_form_adatok.append("members_only", "1");
                } else {
                    feltoltes_form_adatok.append("members_only", "0");
                }
                feltoltes_form_adatok.append("submit", "1");
                feltoltes_form_adatok.append("filename", fajl.name);
                feltoltes_form_adatok.append("fileToUpload", fajl);
                keres.open("POST", '/megoszto/megoszto.🦀');
                keres.send(feltoltes_form_adatok);
            }
        }
        */
    }

    function v2_titkositas_feloldasa_decrypt() {
        /*
        var titkositasi_kulcs_sha256_hash = crypto_konyvtar.hash_keszites(obj('v2_titkositas_feloldasa_kulcs').value);
        var string_iv = titkositasi_kulcs_sha256_hash.substring(32, 48);
        var titkositasi_kulcs_sha256_hash = titkositasi_kulcs_sha256_hash.substring(0, 32);
        var kulcs_arraybuffer = crypto_konyvtar.Buffer.from(titkositasi_kulcs_sha256_hash, 'utf-8');
        var iv = crypto_konyvtar.Buffer.from(string_iv, 'utf8');

        var fajl = jelenleg_feloldando_fajl;

        crypto.subtle.importKey('raw', kulcs_arraybuffer, { 'length': 256, 'name': 'AES-GCM' }, false, [ 'encrypt', 'decrypt' ])
            .then(key => {
                var olvaso = new FileReader();
                olvaso.onload = function() {
                    if(!(olvaso.result instanceof ArrayBuffer)) {
                        throw new Error('A fájl nem konvertálható ArrayBuffer típusra.');
                    }

                    crypto.subtle.decrypt({ 'name': 'AES-GCM', iv }, key, olvaso.result)
                        .then(decrypted => {
                            uj_valasz_mutatasa(5000, "ok", "A fájl feoldása kész.");
                            feloldott_fajl = new Blob([decrypted], { type: fajl.type });
        
                            obj('v2_titkositas_feloldott_fajl').innerHTML = fajl.name;
                            obj('v2_titkositas_feloldott_fajl').download = fajl.name;
                            obj('v2_titkositas_feloldott_fajl').href = URL.createObjectURL(feloldott_fajl);
                            obj('v2_titkositas_feloldott_fajl').style.visibility = 'visible';
                        },
                        err => {
                            uj_valasz_mutatasa(5000, "hiba", "A fájl feoldása nem sikerült.");
                            console.error(err);
                            throw new Error('A fájl feloldása nem sikerült.');
                        });
                };
                olvaso.readAsArrayBuffer(fajl);
            }, 
            err => {
                uj_valasz_mutatasa(5000, "hiba", "A feloldókulcs készítés nem sikerült.");
                console.error(err);
                throw new Error('A feloldókulcs készítés nem sikerült.');
            });
        */
    }

    function v2_titkositas_feloldasa_kulcs_lekerdezes() {
        /*
        let post_parameterek_kulcs_ellenorzes = new FormData();
        var hash = crypto_konyvtar.hash_keszites(obj('v2_titkositas_feloldasa_kulcs').value);
        hash = crypto_konyvtar.hash_keszites(hash);
        post_parameterek_kulcs_ellenorzes.append('kulcs', hash);
        uj_valasz_mutatasa(99999, "", "A megadott kulcs ellenőrzése...");
        szinkron_keres("/megoszto/megoszto.🦀?kulcs_ellenorzese&file_id=" + jelenleg_feloldando_fajl_id, post_parameterek_kulcs_ellenorzes, (uzenet) => {
            if( uzenet.eredmeny == 'ok' ) {
                uj_valasz_mutatasa(5000, "ok", uzenet.valasz);
                obj('v2_titkositas_feloldasa_kulcs').style.visibility = 'hidden';
                obj('v2_titkositas_feloldasa_kulcs_ellenorzes_gomb').style.visibility = 'hidden';
                v2_titkositas_feloldasa_decrypt();
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
        */
    }

    function v2_titkositott_fajl_mentese() {
        /*
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = window.URL.createObjectURL(jelenleg_feloldando_fajl);
        link.download = jelenleg_feloldando_fajl_nev;
        document.body.appendChild(link);
        link.click();
        */
    }

    function v2_titkositott_fajl_letoltes() {
        /*
        uj_valasz_mutatasa(99999, "", "Fájl letöltése...");
        var download_link = "/megoszto/megoszto.🦀?letoltes&file_id=" + jelenleg_feloldando_fajl_id;
        fetch(download_link)
            .then(
                response => {
                    response.blob().then(
                        blob => {
                            jelenleg_feloldando_fajl = new File([blob], jelenleg_feloldando_fajl_nev, { type: blob.type });
                            obj('v2_titkositott_fajl_letoltes_kesz').style.visibility = 'visible';
                            obj('v2_titkositott_fajl_letoltes_gomb').style.visibility = 'hidden';
                            obj('v2_titkositas_mentes_doboz').style.visibility = 'visible';
                            uj_valasz_mutatasa(5000, "ok", "Fájl letöltése kész.");
                        },
                        err => {
                            uj_valasz_mutatasa(5000, "hiba", "A Blob kiolvasása nem sikerült.");
                            console.error(err);
                            throw new Error('A Blob kiolvasása nem sikerült.');
                        }
                        );
                    },
                    err => {
                    uj_valasz_mutatasa(5000, "hiba", "A fájl letöltése nem sikerült.");
                    console.error(err);
                    throw new Error('A fájl letöltése nem sikerült.');
                }
            )
        */
    }

    function elonezet_bezaras() {
        elonezet_aktivalva = false;
        jobb_klikk_menu_aktivalva = false;
        atnevezes_menu_aktivalva = false;
        darken_background = false;
        titkositas_feloldasa_menu_aktivalva = false;
    }

    function fajlnev_frissitese() {
        /*
        let fajlok = obj('fileToUpload').files;
        let fajlnevek = "";
        for (let i = 0; i < fajlok.length; i++) {
            let jelenlegi_fajl = fajlok[i];

            let jelenlegi_nev = jelenlegi_fajl.name;
            if (/['"`]/ig.test(jelenlegi_nev)) {
                let modositott_nev = jelenlegi_fajl.name.replace(/['"`]/ig, '');
                if ( !confirm(`"${jelenlegi_fajl.name}" át lesz nevezve "${modositott_nev}"-re. Szeretnéd így is feltölteni a fájlt?`) ) {
                    jelenlegi_fajl.valid = 'nem';
                    continue;
                }
                jelenlegi_nev = modositott_nev;
            }
            
            if( jelenlegi_fajl.size > 1024 * 1024 * 200 ) {
                uj_valasz_mutatasa(5000, "hiba", `A "${jelenlegi_nev}" nevű fájl mérete nagyobb mint 200MB, ezért azt nem lehet feltölteni.`);
                jelenlegi_fajl.valid = 'nem';
                continue;
            }

            jelenlegi_fajl.valid = 'igen';
            fajlnevek += jelenlegi_nev;
            if (i < fajlok.length - 1) {
                fajlnevek += '<br>';
            }
        }

        if (fajlnevek.length <= 0) {
            obj('fileToUpload_label').innerHTML = '&#128193; Kattints ide fájlok feltöltéséhez';
            obj('SubmitGomb').style.visibility = 'hidden';
        } else {
            obj('fileToUpload_label').innerHTML = fajlnevek;
            obj('SubmitGomb').style.visibility = 'visible';

            eloterbe_helyezes( [obj('privat_doboz'), obj('members_only_doboz'), obj('fileToUpload_label'), obj('SubmitGomb'), obj('titkositasi_kulcs_doboz')], true, undefined );
        }
        */
    }

    function bal_klikk(event: Event, fajl_id: number) {
        let fajl = feldolgozott_fajl_lista.find(f => f.fajl.id == fajl_id);
        if (window.innerWidth > 1024) {
            if (fajl !== undefined) {
                if (fajl.fajl.titkositott === 1) {
                    v1_titkositas_feloldasa(fajl_id, fajl.fajl.filename);
                } else if (fajl.fajl.titkositott === 2) {
                    v2_titkositas_feloldasa(fajl_id, fajl.fajl.filename);
                } else {
                    elonezet(fajl_id);
                }
            }
        } else {
            jobb_klikk_menu_kinyitas(event, fajl_id);
        }
    }

    function jobb_klikk_menu_kinyitas(event: Event, fajl_id: number) {
        let event_mouse = <MouseEvent>event;
        if (window.innerWidth > 1024) {
            if( 320 + 10 + event_mouse.pageY > window.innerHeight + window.pageYOffset ) {
                jobb_klikk_menu_top = window.innerHeight + window.pageYOffset - 320 - 10;
            } else {
                jobb_klikk_menu_top = event_mouse.pageY;
            }
            jobb_klikk_menu_left = event_mouse.pageX;
            jobb_klikk_menu_position = 'absolute';
        } else {
            jobb_klikk_menu_top = 100;
            jobb_klikk_menu_left = 30;
            jobb_klikk_menu_position = 'fixed';
        }

        jobb_klikk_menu_aktivalva = true;

        document.body.onscroll = () => {
            jobb_klikk_menu_aktivalva = false;
        };

        let jelolt = feldolgozott_fajl_lista.find(f => f.fajl.id == fajl_id);
        if(jelolt !== undefined) {
            kivalasztott_fajl = jelolt;
            console.log({kivalasztott_fajl});
            console.log(session_user_id);
        } else {
            throw new Error("Nem található a fájl id alapján: " + fajl_id);
        }
    }

    function privat_statusz_csere() {
        szinkron_keres("/megoszto/megoszto.🦀?privat_statusz_csere&file_id=" + kivalasztott_fajl.fajl.id, "", (uzenet: {eredmeny: string, valasz: string}) => {
            if( uzenet.eredmeny == 'ok' ) {
                uj_valasz_mutatasa(3000, "ok", uzenet.valasz);

                feldolgozott_fajl_lista = feldolgozott_fajl_lista.map( elem => {
                    if(elem.fajl.id === kivalasztott_fajl.fajl.id) {
                        elem.fajl.private = elem.fajl.private === 1 ? 0 : 1;
                    }
                    return elem;
                });

                elonezet_bezaras();
            } else {
                uj_valasz_mutatasa(3000, "hiba", uzenet.valasz);
            }
        })
    }

    function members_only_csere() {
        szinkron_keres("/megoszto/megoszto.🦀?members_only_csere&file_id=" + kivalasztott_fajl.fajl.id, "", (uzenet: {eredmeny: string, valasz: string}) => {
            if( uzenet.eredmeny == 'ok' ) {
                uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
                
                feldolgozott_fajl_lista = feldolgozott_fajl_lista.map( elem => {
                    if(elem.fajl.id === kivalasztott_fajl.fajl.id) {
                        elem.fajl.members_only = elem.fajl.members_only === 1 ? 0 : 1;
                    }
                    return elem;
                });
            } else {
                uj_valasz_mutatasa(3000, "hiba", uzenet.valasz);
            }
        })
    }

    function reszletek_panel_megnyitasa(fajl_azonosito: number) {
        /*
        let jobb_klikk_menu = obj('jobb_klikk_menu');
        jobb_klikk_menu.style.display = 'block';

        document.body.onscroll = () => {
            jobb_klikk_menu.style.display = '';
        };

        document.body.onclick = (event) => {
            if (window.innerWidth > 1024) {
                let kattintasJobbKlikkMenunVolt = false;
                event.composedPath().forEach(element => {
                    if ((<HTMLElement>element).id == 'jobb_klikk_menu') {
                        kattintasJobbKlikkMenunVolt = true;
                    }
                });

                if (!kattintasJobbKlikkMenunVolt) {
                    jobb_klikk_menu.style.display = '';
                }
            }
        };

        let buffer = '';
        buffer += `<h1 class="kozepre-szoveg" style="word-break: break-word">${tr.attributes['sor_filename'].value}</h1>`;
        if (tr.attributes['sor_private'].value == '1') {
            buffer += '👁️ Privát fájl (csak te látod)<br><br>';
        }
        if (tr.attributes['sor_members_only'].value == '1') {
            buffer += '<img src="/index/favicon.png" width="14px"> Csak Hausz tagok számára elérhető<br><br>';
        }
        if (tr.attributes['sor_titkositott'].value != '0') {
            buffer += '🔒 Jelszóval védett<br><br>';
        }

        buffer += `<b>Dátum: </b>${tr.attributes['sor_added'].value.replace(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/, '$1.$2.$3 $4:$5')}<br><br>`;
        buffer += `<b>Méret: </b>${bajt_merette_valtasa(tr.attributes['sor_size'].value)}<br><br>`;
        buffer += `<b>Feltöltő: </b>${tr.attributes['sor_username'].value}<br><br>`;
        if (tr.attributes['sor_titkositott'].value == '1') {
            buffer += `<div class="szint-3 gomb kerekites-10" onclick="v1_titkositas_feloldasa(event, '${tr.attributes['sor_id'].value}', '${tr.attributes['sor_filename'].value}');">Fájl feloldása</div><br>`;
        }
        if (tr.attributes['sor_titkositott'].value == '2') {
            buffer += `<div class="szint-3 gomb kerekites-10" onclick="v2_titkositas_feloldasa(event, '${tr.attributes['sor_id'].value}', '${tr.attributes['sor_filename'].value}');">Fájl feloldása</div><br>`;
        }
        if (tr.attributes['sor_titkositott'].value == '0') {
            let ismert_elonezet_tipus = false;
            let ismert_elonezet_tipusok = ['kep', 'audio', 'video', 'dokumentum'];
            for (let i = 0; i < ismert_elonezet_tipusok.length; i++) {
                if( tr.attributes['sor_elonezet_tipus'].value == ismert_elonezet_tipusok[i] ) {
                    ismert_elonezet_tipus = true;
                }
            }
            if (parseInt(tr.attributes['sor_size'].value) <= 1024 * 1024 * 10 && ismert_elonezet_tipus) {
                buffer += `<div class="szint-3 gomb kerekites-10" onclick='elonezet("/megoszto/megoszto.🦀?letoltes&file_id=${tr.attributes['sor_id'].value}", "${tr.attributes['sor_elonezet_tipus'].value}", "${tr.attributes['sor_size'].value}");'>Megnyitás</div><br>`;
            }
        }
        if (tr.attributes['sor_username'].value == session_username) {
            buffer += `<div class="szint-3 gomb kerekites-10" onclick='privat_statusz_csere("/megoszto/megoszto.🦀?privat_statusz_csere&file_id=${tr.attributes['sor_id'].value}");'>`;
            if(tr.attributes['sor_private'].value == '1') {
                buffer += `Publikussá tétel</div><br>`;
            } else {
                buffer += `Priváttá tétel</div><br>`;
            }

            buffer += `<div class="szint-3 gomb kerekites-10" onclick='members_only_csere("/megoszto/megoszto.🦀?members_only_csere&file_id=${tr.attributes['sor_id'].value}");'>`;
            if(tr.attributes['sor_members_only'].value == '1') {
                buffer += `Legyen mindenki számára elérhető</div><br>`;
            } else {
                buffer += `Csak Hausz tagok számára legyen elérhető</div><br>`;
            }
        }
        if (tr.attributes['sor_username'].value == 'ismeretlen' && session_loggedin == 'yes') {
            buffer += `<div class="szint-3 gomb kerekites-10" onclick='claimeles("/megoszto/megoszto.🦀?claim=1&file_id=${tr.attributes['sor_id'].value}");'>Claimelés</div><br>`;
        }
        if (tr.attributes['sor_username'].value == session_username || (tr.attributes['sor_username'].value == 'ismeretlen' && session_loggedin == 'yes')) {
            buffer += `<a class="linkDekoracioTiltas" onclick="torles('/megoszto/megoszto.🦀?delete=1&file_id=${tr.attributes['sor_id'].value}', '${tr.attributes['sor_filename'].value}')"><abbr class="linkDekoracioTiltas pointer f40" title="Törlés">❌</abbr></a>`;
        }
        if (tr.attributes['sor_username'].value == session_username) {
            buffer += `<a class="linkDekoracioTiltas" onclick="fajl_atnevezese(${tr.attributes['sor_id'].value}, '${tr.attributes['sor_filename'].value}')"><abbr class="linkDekoracioTiltas pointer f40" title="Átnevezés">✏️</abbr></a>`;
        }
        if (tr.attributes['sor_titkositott'].value == '0') {
            buffer += `<a class="linkDekoracioTiltas" href="/megoszto/megoszto.🦀?letoltes&file_id=${tr.attributes['sor_id'].value}"><abbr class="linkDekoracioTiltas pointer f40" title="Letöltés">💾</abbr></a>`;
        }
        jobb_klikk_menu.innerHTML = buffer;

        if (window.innerWidth > 1024) {
            if( jobb_klikk_menu.clientHeight + 10 + event.pageY > window.innerHeight + window.pageYOffset ) {
                jobb_klikk_menu.style.top = (window.innerHeight + window.pageYOffset - jobb_klikk_menu.clientHeight - 10) + 'px';
            } else {
                jobb_klikk_menu.style.top = event.pageY + 'px';
            }
            jobb_klikk_menu.style.left = event.pageX + 'px';
            jobb_klikk_menu.style.position = 'absolute';
        } else {
            jobb_klikk_menu.style.top = '100px';
            jobb_klikk_menu.style.left = '30px';
            jobb_klikk_menu.style.position = 'fixed';
        }
        */
    }

    function allowDrag(e: DragEvent) {
        if (true && e !== null && e.dataTransfer !== null) {
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
        }
    }

    function handleDrop(e: DragEvent) {
        if(e.dataTransfer === null) { return; }
        (<HTMLInputElement>obj('fileToUpload')).files = e.dataTransfer.files;
        fajlnev_frissitese();

        e.preventDefault();
        drop_zona_aktivalva = false;
    }

    function ismert_elonezet_tipus(tipus: string) {
        for (let i = 0; i < Object.values(megoszto_fajl_tipusok).length; i++) {
            const element = Object.values(megoszto_fajl_tipusok)[i];
            if(element.tipus == tipus) {
                return true;
            }
        }
        return false;
    }

    var jelenleg_feloldando_fajl_id = -1;
    var jelenleg_feloldando_fajl_nev = "";
    var jelenleg_feloldando_fajl: File;
    var feloldott_fajl;
    
    if(browser) {
        window.addEventListener('dragenter', function(e) {
            drop_zona_aktivalva = true;
        });

        document.addEventListener('contextmenu', function(event) {
            let id = -1;
            for (let i = 0; i < event.composedPath().length; i++) {
                const element = event.composedPath()[i];
                if ((<HTMLElement>element).tagName == 'TR') {
                    let jelolt = (<HTMLElement>element).getAttribute('id');
                    if( jelolt !== null) {
                        id = parseInt(jelolt);
                    }
                }
            }
            if (id !== -1) {
                event.preventDefault();
                jobb_klikk_menu_kinyitas(event, id);
            }
        }, false);

        document.body.onclick = (event) => {
            if(elonezet_aktivalva) {
                for (let i = 0; i < event.composedPath().length; i++) {
                    const element = event.composedPath()[i];
                    if ((<HTMLElement>element).id == 'darken_background') {
                        elonezet_bezaras();
                    }
                    if ((<HTMLElement>element).id == 'preview_box') {
                        return;
                    }
                    if ((<HTMLElement>element).tagName == 'TR') {
                        return;
                    }
                }
            }

            if(jobb_klikk_menu_aktivalva) {
                for (let i = 0; i < event.composedPath().length; i++) {
                    const element = event.composedPath()[i];
                    if ((<HTMLElement>element).id == 'jobb_klikk_menu') {
                        return;
                    }
                }
                jobb_klikk_menu_aktivalva = false;
            }
        };

        fajlok_betoltese();
    }
</script>

<Topbar />
<BeleptetoRendszer />
<Uzenet />

{#if elonezet_aktivalva}
    <div id='preview_box' class="preview_box" style="max-width: 60%; max-height: 60%;display: inline-block">
        {@html elonezet_tartalom}
    </div>
{/if}
{#if jobb_klikk_menu_aktivalva}
    <div id="jobb_klikk_menu" class="szint-2 kerekites-15 padding-10" style={`max-width: 240px; top: ${jobb_klikk_menu_top}px; left: ${jobb_klikk_menu_left}px; position: ${jobb_klikk_menu_position}; display: block;`}>
        <h1 class="kozepre-szoveg" style="word-break: break-word">{kivalasztott_fajl.fajl.filename}</h1>
        {#if kivalasztott_fajl.fajl.private === 1}
            👁️ Privát fájl (csak te látod)<br><br>
        {/if}
        {#if kivalasztott_fajl.fajl.members_only === 1}
            <img src="/index/favicon.png" alt="hausz logo" width="14px"> Csak Hausz tagok számára elérhető<br><br>
        {/if}
        {#if kivalasztott_fajl.fajl.titkositott === 1}
            🔒 Jelszóval védett<br><br>
        {/if}
        
        <b>Dátum: </b>{kivalasztott_fajl.fajl.added}<br><br>
        <b>Méret: </b>{bajt_merette_valtasa(kivalasztott_fajl.fajl.size)}<br><br>
        <b>Feltöltő: </b>{kivalasztott_fajl.fajl.megjeleno_nev}<br><br>
        {#if kivalasztott_fajl.fajl.titkositott === 1}
            <button class="szint-3 gomb kerekites-10" on:click={e => {v1_titkositas_feloldasa(kivalasztott_fajl.fajl.id, kivalasztott_fajl.fajl.filename);}}>Fájl feloldása (v1)</button><br>
        {/if}
        {#if kivalasztott_fajl.fajl.titkositott === 2}
            <button class="szint-3 gomb kerekites-10" on:click={e => {v2_titkositas_feloldasa(kivalasztott_fajl.fajl.id, kivalasztott_fajl.fajl.filename);}}>Fájl feloldása</button><br>
        {/if}
        {#if ismert_elonezet_tipus(kivalasztott_fajl.elonezet_tipus) && kivalasztott_fajl.fajl.size <= megoszto_fajl_elonezet_limit}
            <button class="szint-3 gomb kerekites-10" on:click={e => { elonezet(kivalasztott_fajl.fajl.id); }}>Megnyitás</button>
        {/if}

        {#if kivalasztott_fajl.fajl.user_id == session_user_id}
            <button class="szint-3 gomb kerekites-10" on:click={e => { privat_statusz_csere()}}>
                {#if kivalasztott_fajl.fajl.private === 1}
                    Publikussá tétel
                {:else}
                    Priváttá tétel
                {/if}
            </button>

            <button class="szint-3 gomb kerekites-10" on:click={e => { members_only_csere()}}>
                {#if kivalasztott_fajl.fajl.members_only === 1}
                    Legyen mindenki számára elérhető
                {:else}
                    Csak Hausz tagok számára legyen elérhető
                {/if}
            </button>
            <br>
        {/if}

        {#if kivalasztott_fajl.fajl.user_id == 0}
            <button class="szint-3 gomb kerekites-10" on:click={e => { claimeles() }}>
                Claimelés
            </button>
            <br>
        {/if}

        {#if kivalasztott_fajl.fajl.user_id == session_user_id || (kivalasztott_fajl.fajl.user_id == 0 && session_loggedin)}
            <button class="linkDekoracioTiltas" on:click={e => { torles() }}>
                <abbr class="linkDekoracioTiltas pointer f40" title="Törlés">❌</abbr>
            </button>
        {/if}

        {#if kivalasztott_fajl.fajl.user_id == session_user_id}
            <button class="linkDekoracioTiltas" on:click={e => { fajl_atnevezese() }}>
                <abbr class="linkDekoracioTiltas pointer f40" title="Átnevezés">✏️</abbr>
            </button>
        {/if}

        {#if kivalasztott_fajl.fajl.titkositott === 0}
            <a class="linkDekoracioTiltas" href={"/megoszto/megoszto.🦀?letoltes&file_id=" + kivalasztott_fajl.fajl.id}>
                <abbr class="linkDekoracioTiltas pointer f40" title="Letöltés">💾</abbr>
            </a>
        {/if}
    </div>
{/if}
{#if atnevezes_menu_aktivalva}
    <div id='atnevezes_box' class="preview_box kozepre" style="max-width: 60%; max-height: 60%;display: inline-block">
        <h3>Fájl átnevezése</h3>
        <label for="atnevezes_uj_nev">Add meg a fájl új nevét (kiterjesztéssel együtt)</label><br><br>
        <input type="text" id="atnevezes_uj_nev" name="atnevezes_uj_nev" placeholder={kivalasztott_fajl.fajl.filename} class="max-szelesseg" bind:value={atnevezes_uj_nev} /><br><br><br>
        <button class="gomb kerekites-15 padding-10" on:click={e => { atnevezes_inditasa() }}>Átnevezés</button>
    </div>
{/if}

{#if titkositas_feloldasa_menu_aktivalva}
    <div id='titkositas_feloldasa_box' class="preview_box kozepre" style="max-width: 60%; max-height: 60%;display: inline-block">
        <h3>Az elérni kívánt fájl titkosítva van 🔒</h3>
        <label for="titkositas_feloldasa_kulcs">Add meg a fájl titkosító kulcsát a feloldáshoz</label><br><br>
        <input type="password" id="titkositas_feloldasa_kulcs" name="titkositas_feloldasa_kulcs" placeholder="Kulcs" class="max-szelesseg" /><br><br><br>
        <button class="gomb kerekites-15 padding-10" on:click={() => { titkositas_feloldasa_kuldes(); }}>Titkosított fájl feloldása</button>
        <a href={titkositott_fajl_letoltes_link} download="">{titkositott_fajl_letoltes_link}</a>
        <a href={titkositatlan_fajl_letoltes_link} download="">{titkositatlan_fajl_letoltes_link}</a>
    </div>
{/if}
{#if v2_titkositas_feloldasa_menu_aktivalva}
    <div id='v2_titkositas_feloldasa_box' class="preview_box kozepre lathatatlan" style="max-width: 60%; max-height: 60%;display: inline-block">
        <h3>Az elérni kívánt fájl titkosítva van (v2) 🔒</h3>
        1. Töltsd le a fájlt ezzel a gombbal: <button on:click={e => { v2_titkositott_fajl_letoltes() }} id="v2_titkositott_fajl_letoltes_gomb">Letöltés</button><div id="v2_titkositott_fajl_letoltes_kesz" class="lathatatlan">&#9989;</div>
        2. Add meg a titkosítási kulcsot a feloldáshoz: <input id="v2_titkositas_feloldasa_kulcs" type="text" placeholder="Kulcs" />
        <button id="v2_titkositas_feloldasa_kulcs_ellenorzes_gomb" on:click={e => { v2_titkositas_feloldasa_kulcs_lekerdezes() }}>Ellenőrzés</button>
        3. Ha jó kulcsot adtál meg, akkor feloldhatod itt a fájlt <a href={v2_titkositas_feloldott_fajl}>{v2_titkositas_feloldott_fajl}</a>
        <br>
        <p id="v2_titkositas_mentes_doboz" class="lathatatlan">4. Ha saját magadtól szeretnéd inkább feloldani a fájlt, akkor ezzel a gombbal tudod letölteni: <button on:click={e => { v2_titkositott_fajl_mentese() }}>Mentés</button></p>
    </div>
{/if}
{#if drop_zona_aktivalva}
    <div id="fajl_drop_zona" 
        on:dragenter={e => { allowDrag(e) }} 
        on:dragover={e => { allowDrag(e) }}
        on:dragleave={e => { drop_zona_aktivalva = false }}
        on:drop={e => { handleDrop(e) }}
        class="zindex-9" 
        style="opacity: 0.0; top: 0; left: 0; width: 100%; height: 100%; position: fixed"
    />
    <div id="fajl_drop_zona_leiras" class="zindex-8" style="opacity: 0.75; background-color: black; top: 0; left: 0; width: 100%; height: 100%; position: fixed">
        <h1 class="kozepre-szoveg" style="margin-top: 25%">Dobd a fájlt bárhova az oldalon a feltöltéshez</h1>
    </div>
{/if}
{#if darken_background}
    <div id="darken_background" style="z-index: 1; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: black; opacity: 75%;"> </div>
{/if}

<h1 class="kozepre-szoveg">Megosztó</h1>
<p class="kozepre-szoveg">Fájl megosztó szolgáltatás, ahol a felhasználók privát és publikus módon tudnak fájlokat megosztani egymással.</p>
<p class="kozepre-szoveg">Tölts fel egy fájlt, vagy nézd meg hogy mások mit töltöttek eddig fel.</p><br>

<h2 class="kozepre-szoveg">Feltöltés</h2>
<form class="kozepre" enctype="multipart/form-data" autocomplete="off">
    <input type="file" multiple on:change={e => {fajlnev_frissitese()}} name="fileToUpload" id="fileToUpload" class="nodisplay" />
    <div class="kozepre fit-content padding-15 gomb szint-2 kerekites-15" id="fileToUpload_label" on:click={e => { obj("fileToUpload").click() }} style="padding: 20px 50px;">
        &#128193; Kattints ide fájlok feltöltéséhez
    </div>
    <br>
    
    {#if session_loggedin}
        <div class="kozepre fit-content lathatatlan padding-15 gomb szint-2 kerekites-15" id="privat_doboz" on:click={e => { obj("private").click() }}>
            <input type="checkbox" name="private" id="private" />
            Privát tárolás
        </div>
        <br>
        <div class="kozepre fit-content lathatatlan padding-15 gomb szint-2 kerekites-15" id="members_only_doboz" on:click={e => { obj("members_only").click() }}>
            <input type="checkbox" name="members_only" value="on" id="members_only" />
            Csak Hausz tagok számára
        </div>
        <br>
    {/if}

    <div class="kozepre fit-content padding-15 gomb szint-2 kerekites-15" id="titkositasi_kulcs_doboz" on:click={e => { obj("titkositas_kulcs").click() }} style="padding: 20px 10px">
        <label for="titkositas_kulcs">Titkosítási kulcs: </label>
        <input type="password" name="titkositas_kulcs" id="titkositas_kulcs" />
    </div>
</form>
<br><br>
<button on:click={e => { feltoltes() }} class="gomb kerekites-15 padding-10 lathatatlan kozepre" id="SubmitGomb" hidden>Feltöltés</button>

<h2 class="kozepre-szoveg">Feltöltött fájlok</h2>
<table id="tablazat" class="szint-1 kozepre fit-content" style="max-width: 95%; display: table">
    <tr class="szint-2">
        <th colspan="2" style="padding-bottom: 10px">
            <div id="szures_gomb" on:click={() => { szures_aktivalva = !szures_aktivalva }} class="gomb inline szint-3 kerekites-15">🔎</div> Fájlnév
        </th>
        <th class="mobilon-tiltas">Dátum</th>
        <th class="mobilon-tiltas">Méret</th>
        <th class="mobilon-tiltas">Feltöltő</th>
    </tr>
    {#if szures_aktivalva}
        <tr class="szint-1" id="szuro_sor">
            <th class="mobilon-tiltas"></th>
            <th>
                <input type="text" id="fajlnev_szures_mezo" on:input={e => { filter_frissites() }} class="max-szelesseg" />
            </th>
            <th class="mobilon-tiltas">
                <input type="text" id="datum_szures_mezo" on:input={e => { filter_frissites() }} style="max-width: 130px" />
            </th>
            <th class="mobilon-tiltas"></th>
            <th class="mobilon-tiltas">
                <input type="text" id="feltolto_szures_mezo" on:input={e => { filter_frissites() }} style="max-width: 75px" />
            </th>
        </tr>
    {/if}
    {#if nem_letezo_fajl_sor}
        <tr id="nem_letezo_fajl_sor">
            <td colspan="5">
                <h3 class="kozepre-szoveg">Nem létezik a keresett fájl</h3>
            </td>
        </tr>
    {/if}
    {#if nincs_fajl_sor}
        <tr class="kozepre-szoveg" id="nincs_fajl_sor">
            <td colspan="5">
                <h3 class="kozepre-szoveg">Jelenleg nincs feltöltve fájl</h3>
            </td>
        </tr>
    {/if}
    {#each feldolgozott_fajl_lista as fajl}
        <tr id={fajl.fajl.id.toString()} on:click={e => { bal_klikk(e, fajl.fajl.id) }}>
            <td>{fajl.elonezet_emoji}</td>
            <td class="padding-5">
                {#if fajl.fajl.private === 1}
                    <abbr class="linkDekoracioTiltas pointer" title="Privát (csak te látod)">👁️</abbr> 
                {/if}
                {#if fajl.fajl.members_only === 1}
                    <abbr class="linkDekoracioTiltas pointer" title="Csak Hausz tagok számára elérhető"><img src="/index/favicon.png" alt="hausz logo" width="14px"></abbr>
                {/if}
                {#if fajl.fajl.titkositott === 1 || fajl.fajl.titkositott === 2}
                    <abbr class="linkDekoracioTiltas pointer" title="Jelszóval titkosított">🔒</abbr> 
                {/if}
                {fajl.fajl.filename}
            </td>
            <td class="mobilon-tiltas">{fajl.fajl.added}</td>
            <td class="mobilon-tiltas">{fajl.fajl.size}</td>
            <td class="mobilon-tiltas">{fajl.fajl.megjeleno_nev}</td>
        </tr>
    {/each}
</table>

<br><br><br>
{#if szabad_tarhely !== 0 && foglalt_tarhely !== 0}
    <h2 class="kozepre-szoveg">Tárhely kihasználtsága</h2>
    <div class="kozepre zold-0" style="border: 1px solid black; border-radius: 10px; display: flex; width: 96%; max-width: 550px; height: auto">
        <div id="div_hasznalt_tarhely" class="piros-0" style="text-shadow: 1px 1px rgb(70,70,70), -1px -1px rgb(70,70,70), 1px -1px rgb(70,70,70), -1px 1px rgb(70,70,70); border-radius: 10px; padding: 10px">
            {'Szabad terület: ' + bajt_merette_valtasa(szabad_tarhely)}
        </div>
        <div id="div_szabad_tarhely" style="text-shadow: 1px 1px rgb(70,70,70), -1px -1px rgb(70,70,70), 1px -1px rgb(70,70,70), -1px 1px rgb(70,70,70); border-radius: 10px; padding: 10px; text-align: right">
            {'Felhasznált: ' + bajt_merette_valtasa(foglalt_tarhely)}
        </div>
    </div>
{/if}
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>