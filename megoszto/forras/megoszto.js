function belepteto_rendszer_frissult( session_loggedin, session_username, session_admin ) {
    if( session_loggedin == "yes" ) {
        obj('privat_doboz').style.visibility = 'visible';
    } else {
        obj('privat_doboz').style.visibility = 'hidden';
    }
}

function szures_gomb_kattintas(event) {
    if (obj('szuro_sor').style.display == 'none') {
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

        tr_tagek[i].style.display = sors;

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
        jobb_klikk_menu_eltuntetes();
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
        let sorok = uzenet.replace(/(^<)|(>$)/, '');
        sorok = sorok.split('><');
        let buffer = "";
        sorok.forEach(sor => {
            let elemek = sor.split('|');

            let id, size, filename, added, username, private, titkositott;
            [id, size, filename, added, username, private, titkositott] = elemek;

            // EMOJI IKON
            let kiterjesztes = filename.replace(/(.*)(\..*)/, '$2');
            let elonezet_tipus = "egyéb";

            let tipusok = {
                'kep': ['jpg', 'png', 'heic', 'gif', 'svg', 'webp', 'bmp', 'jpeg'],
                'audio': ['mp3', 'wav'],
                'video': ['mkv', 'avi', 'mp4', 'webm'],
                'dokumentum': ['pdf', 'c', 'cpp', 'm', 'py', 'css', 'txt', 'sql', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'ahk', 'md'],
                'szoftver': ['exe', 'msi', 'iso', 'apk', 'rpm', 'deb', 'dmg', 'pkg'],
                'csomagolt': ['torrent', 'zip', '7z', 'tar', 'rar', 'gz']
            }

            Object.keys(tipusok).forEach( tipus => {
                tipusok[tipus].forEach( tipus_kiterjesztes => {
                    let jelenlegi_tipus_regexe = new RegExp('\\.' + tipus_kiterjesztes + '$', 'i');
                    if ( jelenlegi_tipus_regexe.test(kiterjesztes) ) { 
                        elonezet_tipus = tipus;
                        return;
                    }
                });
            });

            buffer += "<tr ";

            buffer += 'sor_id="' + id + '"';
            buffer += 'sor_size="' + size + '"';
            buffer += 'sor_filename="' + filename + '"';
            buffer += 'sor_added="' + added + '"';
            buffer += 'sor_username="' + username + '"';
            buffer += 'sor_private="' + private + '"';
            buffer += 'sor_titkositott="' + titkositott + '"';
            buffer += 'sor_elonezet_tipus="' + elonezet_tipus + '"';

            buffer += 'onclick=\'bal_klikk(event)\'>';

            buffer += '<td class="mobilon-tiltas"><abbr class="linkDekoracioTiltas" style="cursor: pointer" title="';
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

            // private? encrypted? név
            buffer += '<td class="padding-5">';
            if (private == '1') {
                buffer += '<abbr class="linkDekoracioTiltas" style="cursor: pointer" title="Privát (csak te látod)">👁️</abbr> ';
            }
            if (titkositott == '1') {
                buffer += '<abbr class="linkDekoracioTiltas" style="cursor: pointer" title="Jelszóval titkosított">🔒</abbr> ';
            }
            buffer += filename + '</td>';

            // DÁTUM 2022-04-19 19:34:14
            buffer += '<td class="mobilon-tiltas">';
            buffer += added.replace(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/, '$1.$2.$3 $4:$5');
            buffer += '</td>';

            // MÉRET
            buffer += '<td class="mobilon-tiltas">' + bajt_merette_valtasa(size) + '</td>';

            // feltöltő
            buffer += '<td class="mobilon-tiltas">' + username + '</td>';
        });

        let hossz = document.getElementById('tablazat').children[0].children.length;
        let torlendo_reszek = document.getElementById('tablazat').children[0].children;

        for (let i = 3; i < hossz; i++) {
            if(typeof torlendo_reszek[3] != "undefined") {
                torlendo_reszek[3].remove();
            }
        }

        obj('tablazat').children[0].innerHTML += buffer;

        if (filter_fajlnev.length > 0 || filter_datum.length > 0 || filter_feltolto.length > 0) {
            filter_frissites();
        }
    });

    szinkron_keres("/megoszto/megoszto.php?tarhely=1", "", (uzenet) => {
        if (/^OK:/.test(uzenet)) {
            let ertekek = uzenet.replace(/^OK:/, '');
            ertekek = ertekek.split(',');
            let szabad_tarhely = ertekek[0];
            let foglalt_tarhely = ertekek[1];
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
            uj_valasz_mutatasa(5000, "hiba", uzenet);
        }
    });

}

function torles(link, fajlnev) {
    if (confirm('Biztosan szeretnéd törölni a "' + fajlnev + '" nevű fájlt?')) {
        uj_valasz_mutatasa(9999999, "", fajlnev + " nevű fájl törlése...");
        szinkron_keres(link, "", (uzenet) => {
            if (/^OK:/.test(uzenet)) {
                let valasz = uzenet.replace(/^OK:/, '');
                uj_valasz_mutatasa(5000, "ok", valasz);
                fajlok_betoltese();
            } else {
                uj_valasz_mutatasa(5000, "hiba", uzenet);
            }
        });
    }
}

function elonezet(hivatkozas, tipus, meret) {
    if (meret > 1024 * 1024 * 10) {
        uj_valasz_mutatasa(5000, "hiba", 'A fájl mérete nagyobb mint 10MB, ezért az előnézetet nem lehet hozzá betölteni.');
    } else {
        obj('preview_box').style.visibility = '';
        obj('darken_background').style.visibility = '';
        obj('elonezet_bezaras_gomb').style.visibility = '';

        if (tipus == "kep") {
            obj('preview_box').innerHTML = '<img alt="előnézet" id="elonezet_iframe" src="' + hivatkozas + '" title="Előnézet" style="max-width: 100%; max-height: 100%;" />';
            return;
        }
        if (tipus == "audio") {
            obj('preview_box').innerHTML = '<audio controls><source src="' + hivatkozas + '" type="audio/mpeg" /></audio>';
            return;
        }
        let iframe = document.createElement('iframe');
        iframe.style = "height: 100%; width: 100%; background-color: white; color: black";
        iframe.id = "elonezet_iframe";
        iframe.src = hivatkozas;
        iframe.title = "Előnézet";
        iframe.onload = function() {
            iframe.contentWindow.document.body.style.color = 'black';
            iframe.contentWindow.document.body.style.backgroundColor = 'white';
        };
        obj('preview_box').appendChild(iframe);
    }
}

function titkositas_feloldasa(file_id, fajlnev) {
    let caller = event.target;
    if (!caller) {
        if( !caller.outerHTML.match(/^<td/)) {
            return;
        }
    }
    obj('titkositatlan_fajl_letoltes_link').innerHTML = "";
    obj('titkositas_feloldasa_kulcs').value = "";

    obj('titkositott_fajl_letoltes_link').innerHTML = "<br><br>Titkosított fájl letöltése";
    obj('titkositott_fajl_letoltes_link').download = "titkositott_" + fajlnev;
    obj('titkositott_fajl_letoltes_link').href = "/megoszto/megoszto.php?letoltes&file_id=" + file_id;
    obj('titkositas_feloldasa_box').style.visibility = '';
    obj('darken_background').style.visibility = '';
    obj('elonezet_bezaras_gomb').style.visibility = '';
    obj('titkositas_feloldasa_kuldes_gomb').onclick = function() {
        titkositas_feloldasa_kuldes(file_id, fajlnev, caller);
    };
}

function titkositas_feloldasa_kuldes(file_id, fajlnev, caller) {
    if ( obj('titkositas_feloldasa_kulcs').value.length <= 0 ) {
        uj_valasz_mutatasa(5000, "hiba", "Nem adtál meg titkosítási kulcsot, így nem lehet feloldani a fájlt.");
        return;
    }

    let keres = new XMLHttpRequest();
    keres.onload = function() {
        if (/^OK:/.test(this.responseText)) {
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
            let post_parameterek_letoltes = "letoltes=1&titkositas_feloldasa_kulcs=" + obj('titkositas_feloldasa_kulcs').value;
            xhr.send(post_parameterek_letoltes);
        }
        if (/^HIBA:/.test(this.responseText)) {
            uj_valasz_mutatasa(10000, "hiba", this.responseText);
        }
    }
    let post_parameterek_titkositas_feloldasa = "titkositas_feloldasa_kulcs=" + obj('titkositas_feloldasa_kulcs').value;
    keres.open("POST", "/megoszto/megoszto.php?letoltes&file_id=" + file_id);
    keres.send(post_parameterek_titkositas_feloldasa);
}

function fajl_atnevezese(id, fajlnev) {
    obj('atnevezes_box').style.visibility = '';
    obj('darken_background').style.visibility = '';
    obj('elonezet_bezaras_gomb').style.visibility = '';
    obj('atnevezes_uj_nev').placeholder = fajlnev;
    obj('atnevezes_uj_nev').value = fajlnev;
    obj('atnevezes_uj_nev').azonosito = id;
}

function atnevezes_inditasa() {
    elonezet_bezaras();
    let link = "/megoszto/megoszto.php?atnevezes=1&file_id=" + obj('atnevezes_uj_nev').azonosito + "&uj_nev=" + obj('atnevezes_uj_nev').value;
    szinkron_keres(link, "", (uzenet) => {
        if (/^OK:/.test(uzenet)) {
            let valasz = uzenet.replace(/^OK:/, '');
            uj_valasz_mutatasa(3000, "ok", valasz);
            fajlok_betoltese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", valasz);
        }
    });
}

function claimeles(link) {
    szinkron_keres(link, "", (uzenet) => {
        if (/^OK:/.test(uzenet)) {
            let valasz = uzenet.replace(/^OK:/, '');
            uj_valasz_mutatasa(3000, "ok", valasz);
            fajlok_betoltese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", valasz);
        }
    });
}

function feltoltes() {
    let fajlok = obj('fileToUpload').files;
    if (fajlok.length > 1) {
        uj_valasz_mutatasa(99999, "", 'Fájlok feltöltése...');
    } else {
        uj_valasz_mutatasa(99999, "", 'Fájl feltöltése...');
    }

    obj('fileToUpload').type = '';
    obj('fileToUpload_label').innerHTML = 'Feltöltés folyamatban...';

    let valid_fajlok_szama = 0;
    for (let i = 0; i < fajlok.length; i++) {
        if (fajlok[i].valid != "nem") {
            valid_fajlok_szama++;
        }
    }

    let kesz_fajlok_szama = 0;

    let upload_progress_interval;

    for (let i = 0; i < fajlok.length; i++) {
        let fajl = fajlok[i];

        if (fajl.valid == "nem") {
            continue;
        }

        let keres = new XMLHttpRequest();
        keres.onload = function() {
            if (/^OK:/.test(this.responseText)) {
                kesz_fajlok_szama++;
                if (kesz_fajlok_szama == valid_fajlok_szama) {
                    if (valid_fajlok_szama > 1) {
                        uj_valasz_mutatasa(5000, "ok", 'Fájlok feltöltése kész');
                    } else {
                        uj_valasz_mutatasa(5000, "ok", 'Fájl feltöltése kész');
                    }
                    obj('fileToUpload').type = 'file';
                    obj('fileToUpload_label').innerHTML = '&#128193; Kattints ide fájlok feltöltéséhez';
                    fajlok_betoltese();
                }
            } else {
                uj_valasz_mutatasa(5000, "hiba", this.responseText);
            }
        }
        let formData = new FormData();
        if (obj('titkositas_kulcs').value.length > 0) {
            formData.append("titkositas_kulcs", obj('titkositas_kulcs').value);
        }
        if (obj('private') != null) {
            if (obj('private').checked) {
                formData.append("private", "1");
            }
        }
        formData.append("fileToUpload", fajl);
        formData.append("submit", "1");
        keres.open("POST", '/megoszto/megoszto.php');
        keres.send(formData);
    }
}

function elonezet_bezaras() {
    obj('preview_box').style.visibility = 'hidden';
    obj('atnevezes_box').style.visibility = 'hidden';
    obj('darken_background').style.visibility = 'hidden';
    obj('elonezet_bezaras_gomb').style.visibility = 'hidden';
    obj('titkositas_feloldasa_box').style.visibility = 'hidden';
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
            if (!confirm('"' + jelenlegi_fajl.name + '" át lesz nevezve "' + modositott_nev + '"-re. Szeretnéd így is feltölteni a fájlt?')) {
                jelenlegi_fajl.valid = 'nem';
                continue;
            }
            jelenlegi_nev = modositott_nev;
        }
        
        if( jelenlegi_fajl.size > 1024 * 1024 * 200 ) {
            uj_valasz_mutatasa(5000, "hiba", 'A "' + jelenlegi_nev + '" nevű fájl mérete nagyobb mint 200MB, ezért azt nem lehet feltölteni.');
            jelenlegi_fajl.valid = 'nem';
            continue;
        }

        jelenlegi_fajl.valid = 'igen';
        fajlnevek += '"' + jelenlegi_nev + '"';
        if (i < fajlok.length - 1) {
            fajlnevek += '<br>';
        }
    }

    if (fajlnevek.length <= 0) {
        obj('fileToUpload_label').innerHTML = '&#128193; Kattints ide fájlok feltöltéséhez';
        obj('SubmitGomb').style.visibility = 'hidden';
    } else {
        obj('fileToUpload_label').innerHTML = fajlnevek;
        obj('SubmitGomb').style.visibility = '';
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
            if (tr.attributes['sor_titkositott'].value == '1') {
                titkositas_feloldasa(tr.attributes['sor_id'].value, tr.attributes['sor_filename'].value);
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
        if( /^OK:/.test(uzenet) ) {
            uzenet = uzenet.replace(/^OK:/, '');
            uj_valasz_mutatasa(3000, "ok", uzenet);
            fajlok_betoltese();
        } else {
            uj_valasz_mutatasa(3000, "hiba", uzenet);
        }
    })
}

function jobb_klikk_menu_eltuntetes() {
    obj('jobb_klikk_menu').style.display = 'none';
}

function jobb_klikk_menu_kinyitas(event, tr) {
    let jobb_klikk_menu = obj('jobb_klikk_menu');
    jobb_klikk_menu.style.display = 'block';

    // menü eltűntetése tekerés esetén
    document.body.onscroll = () => {
        jobb_klikk_menu_eltuntetes();
    };

    // menü eltűntetése máshova kattintás esetén
    document.body.onclick = (event) => {
        if (window.innerWidth > 1024) {
            let kattintas_jobb_klikk_menun_volt = false;
            event.composedPath().forEach(element => {
                if (element.id == 'jobb_klikk_menu') {
                    kattintas_jobb_klikk_menun_volt = true;
                }
            });

            if (!kattintas_jobb_klikk_menun_volt) {
                jobb_klikk_menu_eltuntetes();
            }
        }
    };

    if (window.innerWidth > 1024) {
        jobb_klikk_menu.style.left = event.pageX + 'px';
    } else {
        jobb_klikk_menu.style.left = '30px';
    }
    jobb_klikk_menu.style.top = event.pageY + 'px';
    jobb_klikk_menu.innerHTML = '';
    jobb_klikk_menu.innerHTML += '<h1 class="kozepre-szoveg" style="word-break: break-word">' + tr.attributes['sor_filename'].value + '</h1>';
    if (tr.attributes['sor_private'].value == '1') {
        jobb_klikk_menu.innerHTML += '👁️ Privát fájl (csak te látod)<br><br>';
    }
    if (tr.attributes['sor_titkositott'].value == '1') {
        jobb_klikk_menu.innerHTML += '🔒 Jelszóval védett<br><br>';
    }

    jobb_klikk_menu.innerHTML += '<b>Dátum: </b>' + tr.attributes['sor_added'].value.replace(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/, '$1.$2.$3 $4:$5') + '<br><br>';
    jobb_klikk_menu.innerHTML += '<b>Méret: </b>' + bajt_merette_valtasa(tr.attributes['sor_size'].value) + '<br><br>';
    jobb_klikk_menu.innerHTML += '<b>Feltöltő: </b>' + tr.attributes['sor_username'].value + '<br><br>';
    if (tr.attributes['sor_titkositott'].value == '1') {
        jobb_klikk_menu.innerHTML += '<div class="szint-3 gomb kerekites-10" onclick=\'titkositas_feloldasa("' + tr.attributes['sor_id'].value + '", "' + tr.attributes['sor_filename'].value + '");\'>Fájl feloldása</div><br>';
    } else {
        if (parseInt(tr.attributes['sor_size'].value) <= 1024 * 1024 * 10 && ['kep', 'audio', 'video', 'dokumentum'].includes(tr.attributes['sor_elonezet_tipus'].value)) {
            jobb_klikk_menu.innerHTML += '<div class="szint-3 gomb kerekites-10" onclick=\'elonezet("/megoszto/megoszto.php?letoltes&file_id=' + tr.attributes['sor_id'].value + '", "' + tr.attributes['sor_elonezet_tipus'].value + '", "' + tr.attributes['sor_size'].value + '");\'>Megnyitás</div><br>';
        }
    }
    if (tr.attributes['sor_username'].value == session_username) {
        if(tr.attributes['sor_private'].value == '1') {
            jobb_klikk_menu.innerHTML += '<div class="szint-3 gomb kerekites-10" onclick=\'privat_statusz_csere("/megoszto/megoszto.php?privat_statusz_csere&file_id=' + tr.attributes['sor_id'].value + '");\'>Publikussá tétel</div><br>';
        } else {
            jobb_klikk_menu.innerHTML += '<div class="szint-3 gomb kerekites-10" onclick=\'privat_statusz_csere("/megoszto/megoszto.php?privat_statusz_csere&file_id=' + tr.attributes['sor_id'].value + '");\'>Priváttá tétel</div><br>';
        }
    }
    if (tr.attributes['sor_username'].value == 'ismeretlen' && session_loggedin == 'yes') {
        jobb_klikk_menu.innerHTML += '<div class="szint-3 gomb kerekites-10" onclick=\'claimeles("/megoszto/megoszto.php?claim=1&file_id=' + tr.attributes['sor_id'].value + '");\'>Claimelés</div><br>';
    }
    if (tr.attributes['sor_username'].value == session_username || (tr.attributes['sor_username'].value == 'ismeretlen' && session_loggedin == 'yes')) {
        jobb_klikk_menu.innerHTML += '<a class="linkDekoracioTiltas" onclick="torles(\'/megoszto/megoszto.php?delete=1&file_id=' + tr.attributes['sor_id'].value + '\', \'' + tr.attributes['sor_filename'].value + '\')"><abbr class="linkDekoracioTiltas" style="font-size: 40px; cursor: pointer" title="Törlés">❌</abbr></a>';
    }
    if (tr.attributes['sor_username'].value == session_username) {
        jobb_klikk_menu.innerHTML += '<a class="linkDekoracioTiltas" onclick="fajl_atnevezese(' + tr.attributes['sor_id'].value + ', \'' + tr.attributes['sor_filename'].value + '\')"><abbr class="linkDekoracioTiltas" style="font-size: 40px; cursor: pointer" title="Átnevezés">✏️</abbr></a>';
    }
    if (tr.attributes['sor_titkositott'].value != '1') {
        jobb_klikk_menu.innerHTML += '<a class="linkDekoracioTiltas" href="/megoszto/megoszto.php?letoltes&file_id=' + tr.attributes['sor_id'].value + '"><abbr class="linkDekoracioTiltas" style="font-size: 40px; cursor: pointer" title="Letöltés">💾</abbr></a>';
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

function belepes_siker() {
    fajlok_betoltese();
}

function kilepes_siker() {
    belepes_siker();
}

// main()

var dropZone;
var dropZone_leiras;

topbar_betoltese();
fajlok_betoltese();
belepteto_rendszer_beallitas( belepteto_rendszer_frissult, belepes_siker, kilepes_siker );
    
window.addEventListener('dragenter', function(e) {
    drop_zona_aktivalas();
    showDropZone();
});

document.addEventListener('contextmenu', function(event) {
    let volt_tr = false;
    let tr;
    event.composedPath().forEach(element => {
        if (element.tagName == 'TD') {
            volt_tr = true;
            tr = element.parentElement;
        }
    });
    if (volt_tr) {
        event.preventDefault();
        jobb_klikk_menu_kinyitas(event, tr);
    }
}, false);