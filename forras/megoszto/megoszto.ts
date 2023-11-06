/// <reference path="../komponensek/alap_fuggvenyek.ts" />
/// <reference path="../komponensek/belepteto_rendszer.ts" />
/// <reference path="../komponensek/topbar.ts" />
/// <reference path="../../priv/szurendo_szavak.ts" />

function belepteto_rendszer_frissult() {
    if( session_loggedin == "yes" ) {
        obj('privat_doboz').style.visibility = 'visible';
        obj('members_only_doboz').style.visibility = 'visible';
    } else {
        obj('privat_doboz').style.visibility = 'hidden';
        obj('members_only_doboz').style.visibility = 'hidden';
    }
}

function szures_gomb_kattintas(event) {
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
}

function filter_frissites() {
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
}

function fajlok_betoltese() {
    if(obj('jobb_klikk_menu') != null) {
        obj('jobb_klikk_menu').style.display = '';
    }

    let filter_fajlnev = "";
    let filter_datum = "";
    let filter_feltolto = "";
    if (obj('fajlnev_szures_mezo') != null) {
        filter_fajlnev = obj('fajlnev_szures_mezo').value;
    }
    if (obj('datum_szures_mezo') != null) {
        filter_datum = obj('datum_szures_mezo').value;
    }
    if (obj('feltolto_szures_mezo') != null) {
        filter_feltolto = obj('feltolto_szures_mezo').value;
    }

    szinkron_keres("/megoszto/megoszto.php?fajlok=1", "", (uzenet) => {
        if(uzenet.eredmeny != 'ok') {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            return;
        }

        obj('nincs_fajl_sor').style.display = uzenet.fajlok_szama <= 0 ? 'table-row' : '';

        let buffer = "";
        for (let i = 0; i < uzenet.fajlok_szama; i++) {
            let fajl = uzenet.fajlok[i];
            if( fajl.id == '-' ) {
                buffer = `<td class="kozepre-szoveg nagy-kepernyon-tiltas" style="padding-left: 15px; padding-right: 15px"><h3>Jelenleg nincsenek fájlok a megosztón</h3></td>`;
                buffer += `<td colspan="5" class="mobilon-tiltas" style="padding-left: 15px; padding-right: 15px"><h3 class="kozepre-szoveg">Jelenleg nincsenek fájlok a megosztón</h3></td>`;
                return;
            }

            let kiterjesztes = String(fajl.filename).replace(/(.*)(\..*)/, '$2');
            let elonezet_tipus = "egyéb";

            let tipusok = {
                'kep': ['jpg', 'png', 'heic', 'gif', 'svg', 'webp', 'bmp', 'jpeg'],
                'audio': ['mp3', 'wav'],
                'video': ['mkv', 'avi', 'mp4', 'webm'],
                'dokumentum': ['pdf', 'csv', 'c', 'cpp', 'm', 'py', 'css', 'txt', 'sql', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'ahk', 'md', 'sh'],
                'szoftver': ['exe', 'msi', 'iso', 'apk', 'rpm', 'deb', 'dmg', 'pkg'],
                'csomagolt': ['torrent', 'zip', '7z', 'tar', 'rar', 'gz']
            }

            Object.keys(tipusok).forEach( tipus => {
                tipusok[tipus].forEach( tipus_kiterjesztes => {
                    let jelenlegi_tipus_regexe = new RegExp(`\\.${tipus_kiterjesztes}$`, 'i');
                    if ( jelenlegi_tipus_regexe.test(kiterjesztes) ) { 
                        elonezet_tipus = tipus;
                        return;
                    }
                });
            });

            szurendo_szavak.forEach(szo => {
                let jelenlegi_szo_regexe = new RegExp(`${szo}`, 'i');
                if( jelenlegi_szo_regexe.test(fajl.filename) ) {
                    let csere = "";
                    for (let i = 0; i < szo.length; i++) {   csere += "*"; }
                    fajl.filename = fajl.filename.replace( jelenlegi_szo_regexe, csere );
                }
            });

            buffer += "<tr";

            buffer += ` sor_id="${fajl.id}"`;
            buffer += ` sor_size="${fajl.size}"`;
            buffer += ` sor_filename="${fajl.filename}"`;
            buffer += ` sor_added="${fajl.added}"`;
            buffer += ` sor_username="${fajl.megjeleno_nev}"`;
            buffer += ` sor_private="${fajl.private}"`;
            buffer += ` sor_titkositott="${fajl.titkositott}"`;
            buffer += ` sor_elonezet_tipus="${elonezet_tipus}"`;
            buffer += ` sor_members_only="${fajl.members_only}"`;

            buffer += `onclick='bal_klikk(event)'>`;

            buffer += '<td class="mobilon-tiltas"><abbr class="linkDekoracioTiltas pointer" title="';
            switch (elonezet_tipus) {
                case "kep":         buffer += 'Kép">📷'; break;
                case "audio":       buffer += 'Audió">🎵'; break;
                case "video":       buffer += 'Videó">🎬'; break;
                case "dokumentum":  buffer += 'Dokumentum">📝'; break;
                case "szoftver":    buffer += 'Szoftver">💿'; break;
                case "csomagolt":   buffer += 'Csomagolt fájl">📦'; break;
                default:            buffer += 'Egyéb">❔'; break;
            }
            buffer += '</abbr></td>';

            buffer += '<td class="padding-5">';
            if (fajl.private == '1') {
                buffer += '<abbr class="linkDekoracioTiltas pointer" title="Privát (csak te látod)">👁️</abbr> ';
            }
            if (fajl.titkositott != '0') {
                buffer += '<abbr class="linkDekoracioTiltas pointer" title="Jelszóval titkosított">🔒</abbr> ';
            }
            if (fajl.members_only == '1') {
                buffer += '<abbr class="linkDekoracioTiltas pointer" title="Csak Hausz tagok számára elérhető"><img src="/index/favicon.png" width="14px"></abbr> ';
            }

            buffer += fajl.filename + '</td>';

            if( idopontbol_datum(new Date()) > idopontbol_datum(new Date(fajl.added)) ) {
                buffer += `<td class="mobilon-tiltas">${fajl.added.replace(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/, '$1.$2.$3')}</td>`;
            } else {
                buffer += `<td class="mobilon-tiltas">${fajl.added.replace(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/, '$4:$5')}</td>`;
            }

            buffer += `<td class="mobilon-tiltas">${bajt_merette_valtasa(fajl.size)}</td>`;
            buffer += `<td class="mobilon-tiltas">${fajl.megjeleno_nev}</td>`;
        }

        let local_tablazat = document.getElementById('tablazat');
        if(local_tablazat == null) {
            throw new Error('A táblázat nem található: #tablazat');
        }
        let hossz = local_tablazat.children[0].children.length;
        let torlendo_reszek = local_tablazat.children[0].children;
        let torles_index = 0;

        for (let i = 0; i < hossz; i++) {
            if(typeof torlendo_reszek[torles_index] != "undefined") {
                if(torlendo_reszek[torles_index].getAttribute('sor_id') != null) {
                    torlendo_reszek[torles_index].remove();
                } else {
                    torles_index++;
                }
            }
        }

        obj('tablazat').children[0].innerHTML += buffer;

        if (filter_fajlnev.length > 0 || filter_datum.length > 0 || filter_feltolto.length > 0) {
            filter_frissites();
        }
    });

    szinkron_keres("/megoszto/megoszto.php?tarhely=1", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            let szabad_tarhely = uzenet.szabad_tarhely;
            let foglalt_tarhely = uzenet.foglalt_tarhely;

            let foglalt_tarhely_arany = parseFloat(foglalt_tarhely) / parseFloat(szabad_tarhely) * 100.0;
            let szabad_tarhely_arany = parseFloat(szabad_tarhely) / parseFloat(foglalt_tarhely) * 100.0;
            obj('div_hasznalt_tarhely').style.width = foglalt_tarhely_arany + '%';
            if (szabad_tarhely_arany > 15.0) {
                obj('div_szabad_tarhely').innerHTML = 'Szabad terület: ' + bajt_merette_valtasa(szabad_tarhely);
            }
            if (foglalt_tarhely_arany > 15.0) {
                obj('div_hasznalt_tarhely').innerHTML = 'Felhasznált: ' + bajt_merette_valtasa(foglalt_tarhely);
            }
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function torles(link, fajlnev) {
    obj('jobb_klikk_menu').style.display = '';
    if (confirm('Biztosan szeretnéd törölni a "' + fajlnev + '" nevű fájlt?')) {
        uj_valasz_mutatasa(9999999, "", fajlnev + " nevű fájl törlése...");
        szinkron_keres(link, "", (uzenet) => {
            if( uzenet.eredmeny == 'ok' ) {
                uj_valasz_mutatasa(5000, "ok", uzenet.valasz);
                fajlok_betoltese();
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
            }
        });
    }
}

function elonezet(hivatkozas, tipus, meret) {
    if (meret > 1024 * 1024 * 10) {
        uj_valasz_mutatasa(5000, "hiba", 'A fájl mérete nagyobb mint 10MB, ezért az előnézetet nem lehet hozzá betölteni.');
    } else {
        obj('preview_box').style.visibility = 'visible';
        obj('darken_background').style.visibility = 'visible';
        obj('elonezet_bezaras_gomb').style.visibility = 'visible';

        if (tipus == "kep") {
            obj('preview_box').innerHTML = `<img alt="előnézet" id="elonezet_iframe" src="${hivatkozas}" title="Előnézet" style="max-width: 100%; max-height: 100%;" />`;
            return;
        }
        if (tipus == "audio") {
            obj('preview_box').innerHTML = `<audio controls><source src="${hivatkozas}" type="audio/mpeg" /></audio>`;
            return;
        }
        let iframe = document.createElement('iframe');
        iframe.setAttribute('style', "height: 100%; width: 100%; background-color: white; color: black");
        iframe.id = "elonezet_iframe";
        iframe.src = hivatkozas;
        iframe.title = "Előnézet";
        iframe.onload = function() {
            if(iframe.contentWindow != null) {
                iframe.contentWindow.document.body.style.color = 'black';
                iframe.contentWindow.document.body.style.backgroundColor = 'white';
            }
        };
        obj('preview_box').appendChild(iframe);
    }
}

function v2_titkositas_feloldasa(event, file_id, fajlnev) {
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
}

function v1_titkositas_feloldasa(event, file_id, fajlnev) {
    let caller = event.target;
    if (!caller) {
        if( !(<HTMLElement>caller).outerHTML.match(/^<td/)) {
            return;
        }
    }
    obj('titkositatlan_fajl_letoltes_link').innerHTML = "";
    obj('titkositas_feloldasa_kulcs').value = "";

    obj('titkositott_fajl_letoltes_link').innerHTML = "<br><br>Titkosított fájl letöltése";
    obj('titkositott_fajl_letoltes_link').download = "titkositott_" + fajlnev;
    obj('titkositott_fajl_letoltes_link').href = "/megoszto/megoszto.php?letoltes&file_id=" + file_id;
    obj('titkositas_feloldasa_box').style.visibility = 'visible';
    obj('darken_background').style.visibility = 'visible';
    obj('elonezet_bezaras_gomb').style.visibility = 'visible';
    obj('titkositas_feloldasa_kuldes_gomb').onclick = function() {
        titkositas_feloldasa_kuldes(file_id, fajlnev, caller);
    };
}

function titkositas_feloldasa_kuldes(file_id, fajlnev, caller) {
    if ( obj('titkositas_feloldasa_kulcs').value.length <= 0 ) {
        uj_valasz_mutatasa(5000, "hiba", "Nem adtál meg titkosítási kulcsot, így nem lehet feloldani a fájlt.");
        return;
    }

    let post_parameterek_titkositas_feloldasa = new FormData();
    post_parameterek_titkositas_feloldasa.append('titkositas_feloldasa_kulcs', obj('titkositas_feloldasa_kulcs').value);

    szinkron_keres("/megoszto/megoszto.php?letoltes&file_id=" + file_id, post_parameterek_titkositas_feloldasa, (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uj_valasz_mutatasa(99999, "", "Fájl letöltése...");
            let xhr = new XMLHttpRequest();
            xhr.open('POST', "/megoszto/megoszto.php?letoltes&file_id=" + file_id);
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
}

function fajl_atnevezese(id, fajlnev) {
    obj('atnevezes_box').style.visibility = 'visible';
    obj('atnevezes_box').style.position = 'fixed';
    obj('darken_background').style.visibility = 'visible';
    obj('elonezet_bezaras_gomb').style.visibility = '';
    obj('atnevezes_uj_nev').placeholder = fajlnev;
    obj('atnevezes_uj_nev').value = fajlnev;
    obj('atnevezes_uj_nev').azonosito = id;
}

function atnevezes_inditasa() {
    elonezet_bezaras();
    let link = "/megoszto/megoszto.php?atnevezes=1&file_id=" + obj('atnevezes_uj_nev').azonosito + "&uj_nev=" + obj('atnevezes_uj_nev').value;
    szinkron_keres(link, "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            fajlok_betoltese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function claimeles(link) {
    szinkron_keres(link, "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            fajlok_betoltese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function konyvtarak_beallitasa() {
    if(typeof crypto_konyvtar == 'undefined') {
        uj_valasz_mutatasa(5000, "hiba", "A crypto könyvtár nem található");
        throw new Error('A crypto konyvtar nem talalhato.');
    }
    if(typeof window['Buffer'] == 'undefined' || typeof window['crypto'] == 'undefined') {
        window['Buffer'] = crypto_konyvtar.Buffer;
        window['crypto'] = crypto_konyvtar.crypto;
    }
}

function feltoltes() {
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
                                keres.open("POST", '/megoszto/megoszto.php');
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
            keres.open("POST", '/megoszto/megoszto.php');
            keres.send(feltoltes_form_adatok);
        }
    }
}

function v2_titkositas_feloldasa_decrypt() {
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
}

function v2_titkositas_feloldasa_kulcs_lekerdezes() {
    let post_parameterek_kulcs_ellenorzes = new FormData();
    var hash = crypto_konyvtar.hash_keszites(obj('v2_titkositas_feloldasa_kulcs').value);
    hash = crypto_konyvtar.hash_keszites(hash);
    post_parameterek_kulcs_ellenorzes.append('kulcs', hash);
    uj_valasz_mutatasa(99999, "", "A megadott kulcs ellenőrzése...");
    szinkron_keres("/megoszto/megoszto.php?kulcs_ellenorzese&file_id=" + jelenleg_feloldando_fajl_id, post_parameterek_kulcs_ellenorzes, (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uj_valasz_mutatasa(5000, "ok", uzenet.valasz);
            obj('v2_titkositas_feloldasa_kulcs').style.visibility = 'hidden';
            obj('v2_titkositas_feloldasa_kulcs_ellenorzes_gomb').style.visibility = 'hidden';
            v2_titkositas_feloldasa_decrypt();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function v2_titkositott_fajl_mentese() {
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = window.URL.createObjectURL(jelenleg_feloldando_fajl);
    link.download = jelenleg_feloldando_fajl_nev;
    document.body.appendChild(link);
    link.click();
}

function v2_titkositott_fajl_letoltes() {
    uj_valasz_mutatasa(99999, "", "Fájl letöltése...");
    var download_link = "/megoszto/megoszto.php?letoltes&file_id=" + jelenleg_feloldando_fajl_id;
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
}

function elonezet_bezaras() {
    obj('preview_box').style.visibility = 'hidden';
    obj('atnevezes_box').style.visibility = 'hidden';
    obj('darken_background').style.visibility = 'hidden';
    obj('elonezet_bezaras_gomb').style.visibility = 'hidden';
    obj('titkositas_feloldasa_box').style.visibility = 'hidden';
    obj('v2_titkositas_feloldasa_box').style.visibility = 'hidden';
    obj('v2_titkositott_fajl_letoltes_kesz').style.visibility = 'hidden';
    obj('v2_titkositas_mentes_doboz').style.visibility = 'hidden';
    obj('preview_box').innerHTML = "";
}

function fajlnev_frissitese() {
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
}

function bal_klikk(event) {
    let volt_tr = false;
    let tr;
    event.composedPath().forEach(element => {
        if (element.tagName == 'TR') {
            tr = element;
            volt_tr = true;
        }
    });
    if (window.innerWidth > 1024) {
        if (volt_tr) {
            var empty_event = { target: tr };
            if (tr.attributes['sor_titkositott'].value == '1') {
                v1_titkositas_feloldasa(empty_event, tr.attributes['sor_id'].value, tr.attributes['sor_filename'].value);
            } else if (tr.attributes['sor_titkositott'].value == '2') {
                v2_titkositas_feloldasa(empty_event, tr.attributes['sor_id'].value, tr.attributes['sor_filename'].value);
            } else {
                elonezet("/megoszto/megoszto.php?letoltes&file_id=" + tr.attributes['sor_id'].value, tr.attributes['sor_elonezet_tipus'].value, tr.attributes['sor_size'].value);
            }
        }
    } else {
        jobb_klikk_menu_kinyitas(event, tr);
    }
}

function privat_statusz_csere(link) {
    szinkron_keres(link, "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            fajlok_betoltese();
        } else {
            uj_valasz_mutatasa(3000, "hiba", uzenet.valasz);
        }
    })
}

function members_only_csere(link) {
    szinkron_keres(link, "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            fajlok_betoltese();
        } else {
            uj_valasz_mutatasa(3000, "hiba", uzenet.valasz);
        }
    })
}

function jobb_klikk_menu_kinyitas(event, tr) {
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
            buffer += `<div class="szint-3 gomb kerekites-10" onclick='elonezet("/megoszto/megoszto.php?letoltes&file_id=${tr.attributes['sor_id'].value}", "${tr.attributes['sor_elonezet_tipus'].value}", "${tr.attributes['sor_size'].value}");'>Megnyitás</div><br>`;
        }
    }
    if (tr.attributes['sor_username'].value == session_username) {
        buffer += `<div class="szint-3 gomb kerekites-10" onclick='privat_statusz_csere("/megoszto/megoszto.php?privat_statusz_csere&file_id=${tr.attributes['sor_id'].value}");'>`;
        if(tr.attributes['sor_private'].value == '1') {
            buffer += `Publikussá tétel</div><br>`;
        } else {
            buffer += `Priváttá tétel</div><br>`;
        }

        buffer += `<div class="szint-3 gomb kerekites-10" onclick='members_only_csere("/megoszto/megoszto.php?members_only_csere&file_id=${tr.attributes['sor_id'].value}");'>`;
        if(tr.attributes['sor_members_only'].value == '1') {
            buffer += `Legyen mindenki számára elérhető</div><br>`;
        } else {
            buffer += `Csak Hausz tagok számára legyen elérhető</div><br>`;
        }
    }
    if (tr.attributes['sor_username'].value == 'ismeretlen' && session_loggedin == 'yes') {
        buffer += `<div class="szint-3 gomb kerekites-10" onclick='claimeles("/megoszto/megoszto.php?claim=1&file_id=${tr.attributes['sor_id'].value}");'>Claimelés</div><br>`;
    }
    if (tr.attributes['sor_username'].value == session_username || (tr.attributes['sor_username'].value == 'ismeretlen' && session_loggedin == 'yes')) {
        buffer += `<a class="linkDekoracioTiltas" onclick="torles('/megoszto/megoszto.php?delete=1&file_id=${tr.attributes['sor_id'].value}', '${tr.attributes['sor_filename'].value}')"><abbr class="linkDekoracioTiltas pointer f40" title="Törlés">❌</abbr></a>`;
    }
    if (tr.attributes['sor_username'].value == session_username) {
        buffer += `<a class="linkDekoracioTiltas" onclick="fajl_atnevezese(${tr.attributes['sor_id'].value}, '${tr.attributes['sor_filename'].value}')"><abbr class="linkDekoracioTiltas pointer f40" title="Átnevezés">✏️</abbr></a>`;
    }
    if (tr.attributes['sor_titkositott'].value == '0') {
        buffer += `<a class="linkDekoracioTiltas" href="/megoszto/megoszto.php?letoltes&file_id=${tr.attributes['sor_id'].value}"><abbr class="linkDekoracioTiltas pointer f40" title="Letöltés">💾</abbr></a>`;
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
}

function drop_zona_aktivalas() {
    dropZone = obj('fajl_drop_zona');
    dropZone_leiras = obj('fajl_drop_zona_leiras');


    dropZone.addEventListener('dragenter', allowDrag);
    dropZone.addEventListener('dragover', allowDrag);
    dropZone.addEventListener('dragleave', function(e) {
        hideDropZone();
    });

    dropZone.addEventListener('drop', handleDrop);
}

function showDropZone() {
    dropZone.style.visibility = "visible";
    dropZone_leiras.style.visibility = "visible";
}

function hideDropZone() {
    dropZone.style.visibility = "hidden";
    dropZone_leiras.style.visibility = "hidden";
}

function allowDrag(e) {
    if (true) {
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
    }
}

function handleDrop(e) {
    obj('fileToUpload').files = e.dataTransfer.files;
    fajlnev_frissitese();

    e.preventDefault();
    hideDropZone();
}

belepes_siker = fajlok_betoltese;
kilepes_siker = belepes_siker;

var dropZone;
var dropZone_leiras;

var jelenleg_feloldando_fajl_id = -1;
var jelenleg_feloldando_fajl_nev = "";
var jelenleg_feloldando_fajl: File;
var feloldott_fajl;

topbar_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult, belepes_siker, kilepes_siker );
fajlok_betoltese();
    
window.addEventListener('dragenter', function(e) {
    drop_zona_aktivalas();
    showDropZone();
});

document.addEventListener('contextmenu', function(event) {
    let volt_tr = false;
    let tr;
    event.composedPath().forEach(element => {
        if ((<HTMLElement>element).tagName == 'TD') {
            volt_tr = true;
            tr = (<HTMLElement>element).parentElement;
        }
    });
    if (volt_tr) {
        event.preventDefault();
        jobb_klikk_menu_kinyitas(event, tr);
    }
}, false);