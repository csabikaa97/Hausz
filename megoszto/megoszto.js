function belepes_siker() {
    document.getElementById('privat_doboz').style.display = 'block';
}

function kilepes_siker() {
    session_admin = '';
    session_loggedin = '';
    session_username = '';
    document.getElementById('privat_doboz').style.display = 'block';
}

function belepteto_rendszer_frissult() {
    fajlok_betoltese();
}

function szures_gomb_kattintas(event) {
    if (document.getElementById('szuro_sor').style.display == 'none') {
        document.getElementById('szuro_sor').style.display = 'table-row';
        document.getElementById('szures_gomb').classList.remove("szint-3");
        document.getElementById('szures_gomb').classList.add("szint-4");
    } else {
        document.getElementById('fajlnev_szures_mezo').value = "";
        document.getElementById('datum_szures_mezo').value = "";
        document.getElementById('feltolto_szures_mezo').value = "";
        filter_frissites();
        document.getElementById('szuro_sor').style.display = 'none';
        document.getElementById('szures_gomb').classList.remove("szint-4");
        document.getElementById('szures_gomb').classList.add("szint-3");
    }
}

function filter_frissites() {
    filter_fajlnev = document.getElementById('fajlnev_szures_mezo').value;
    filter_datum = document.getElementById('datum_szures_mezo').value;
    filter_feltolto = document.getElementById('feltolto_szures_mezo').value;

    tr_tagek = document.getElementsByTagName('tbody')[0].children;

    var maradt_sorok_szama = 0;

    for (let i = 0; i < tr_tagek.length; i++) {
        var sors = 'table-row';

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
                datum = tr_tagek[i].attributes['sor_added'].value;
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
        document.getElementById('nem_letezo_fajl_sor').style.display = "table-row";
    } else {
        document.getElementById('nem_letezo_fajl_sor').style.display = "none";
    }
}

function fajlok_betoltese() {
    jobb_klikk_menu_eltuntetes();

    var filter_fajlnev = "";
    var filter_datum = "";
    var filter_feltolto = "";
    if (document.getElementById('fajlnev_szures_mezo') != null) {
        filter_fajlnev = document.getElementById('fajlnev_szures_mezo').value;
    }
    if (document.getElementById('datum_szures_mezo') != null) {
        filter_datum = document.getElementById('datum_szures_mezo').value;
    }
    if (document.getElementById('feltolto_szures_mezo') != null) {
        filter_feltolto = document.getElementById('feltolto_szures_mezo').value;
    }

    buffer = '<tr class="szint-2"><th colspan="2" style="padding-bottom: 10px"><div id="szures_gomb" onclick="szures_gomb_kattintas(event)" class="gomb szint-3 kerekites-15" style="display: inline">🔎</div> Fájlnév</th><th class="mobilon-tiltas">Dátum</th><th class="mobilon-tiltas">Méret</th><th class="mobilon-tiltas">Feltöltő</th>';
    buffer += '<tr class="szint-1" id="szuro_sor" style="display: none"><th class="mobilon-tiltas"></th>';
    buffer += '<th><input type="text" id="fajlnev_szures_mezo" value="' + filter_fajlnev + '" oninput="filter_frissites()" style="width: 100%"></input></th>';
    buffer += '<th class="mobilon-tiltas"><input type="text" id="datum_szures_mezo" value="' + filter_datum + '" oninput="filter_frissites()" style="max-width: 130px"></input></th><th class="mobilon-tiltas"></th>';
    buffer += '<th class="mobilon-tiltas"><input type="text" id="feltolto_szures_mezo" value="' + filter_feltolto + '" oninput="filter_frissites()" style="max-width: 75px"></input></th>';
    buffer += '</tr>';
    buffer += '<tr style="display: none" id="nem_letezo_fajl_sor"><td colspan="5"><h3 class="kozepre-szoveg">Nem létezik a keresett fájl</h3></td></tr>';

    szinkron_keres("/megoszto/megoszto.php?fajlok=1", (uzenet) => {
        sorok = uzenet.replace(/^</, '');
        sorok = sorok.replace(/>$/, '');
        sorok = sorok.split('><');
        sorok.forEach(sor => {
            elemek = sor.split('|');

            id = elemek[0];
            size = elemek[1];
            filename = elemek[2];
            added = elemek[3];
            username = elemek[4];
            private = elemek[5];
            titkositott = elemek[6];

            // EMOJI IKON
            kiterjesztes = filename.replace(/(.*)(\..*)/, '$2');
            elonezet_tipus = "egyéb";

            kep_regexek = [/\.jpg$/i, /\.png$/i, /\.heic$/i, /\.gif$/i, /\.svg$/i, /\.webp$/i, /\.bmp$/i, /\.jpeg$/i, ]
            audio_regexek = [/\.mp3$/i, /\.wav$/i]
            video_regexek = [/\.mkv$/i, /\.avi$/i, /\.mp4/i, /\.webm/i]
            dokumentum_regexek = [/\.pdf$/i, /\.c$/i, /\.cpp$/i, /\.m$/i, /\.py$/i, /\.css$/i, /\.txt$/i, /\.sql$/i,
                /\.xls$/i, /\.xlsx$/i, /\.doc$/i, /\.docx$/i, /\.ppt$/i, /\.pptx$/i, /\.ahk$/i,
                /\.md$/i
            ]
            szoftver_regexek = [/\.exe$/i, /\.msi$/i, /\.iso$/i, /\.apk$/i, /\.rpm$/i, /\.deb$/i, /\.dmg$/i, /\.pkg$/i]
            csomagolt_regexek = [/\.torrent$/i, /\.zip$/i, /\.7z$/i, /\.tar$/i, /\.rar$/i, /\.gz$/i, ]

            kep_regexek.forEach(kep_regex => {
                if (kep_regex.test(kiterjesztes)) {
                    elonezet_tipus = "kep";
                }
            });
            audio_regexek.forEach(audio_regex => {
                if (audio_regex.test(kiterjesztes)) {
                    elonezet_tipus = "audio";
                }
            });
            video_regexek.forEach(video_regex => {
                if (video_regex.test(kiterjesztes)) {
                    elonezet_tipus = "video";
                }
            });
            dokumentum_regexek.forEach(dokumentum_regex => {
                if (dokumentum_regex.test(kiterjesztes)) {
                    elonezet_tipus = "dokumentum";
                }
            });
            szoftver_regexek.forEach(szoftver_regex => {
                if (szoftver_regex.test(kiterjesztes)) {
                    elonezet_tipus = "szoftver";
                }
            });
            csomagolt_regexek.forEach(csomagolt_regex => {
                if (csomagolt_regex.test(kiterjesztes)) {
                    elonezet_tipus = "csomagolt";
                }
            });

            buffer += '<tr ';

            buffer += 'sor_id="' + id + '"';
            buffer += 'sor_size="' + size + '"';
            buffer += 'sor_filename="' + filename + '"';
            buffer += 'sor_added="' + added + '"';
            buffer += 'sor_username="' + username + '"';
            buffer += 'sor_private="' + private + '"';
            buffer += 'sor_titkositott="' + titkositott + '"';
            buffer += 'sor_elonezet_tipus="' + elonezet_tipus + '"';

            buffer += 'onclick=\'bal_klikk(event)\'>';

            buffer += '<td class="mobilon-tiltas">';
            switch (elonezet_tipus) {
                case "kep":
                    buffer += '<abbr class="linkDekoracioTiltas" style="cursor: pointer" title="Kép">📷</abbr>';
                    break;
                case "audio":
                    buffer += '<abbr class="linkDekoracioTiltas" style="cursor: pointer" title="Audió">🎵</abbr>';
                    break;
                case "video":
                    buffer += '<abbr class="linkDekoracioTiltas" style="cursor: pointer" title="Videó">🎬</abbr>';
                    break;
                case "dokumentum":
                    buffer += '<abbr class="linkDekoracioTiltas" style="cursor: pointer" title="Dokumentum">📝</abbr>';
                    break;
                case "szoftver":
                    buffer += '<abbr class="linkDekoracioTiltas" style="cursor: pointer" title="Szoftver">💿</abbr>';
                    break;
                case "csomagolt":
                    buffer += '<abbr class="linkDekoracioTiltas" style="cursor: pointer" title="Csomagolt fájl">📦</abbr>';
                    break;
                default:
                    buffer += '<abbr class="linkDekoracioTiltas" style="cursor: pointer" title="Egyéb">❔</abbr>';
                    break;
            }
            buffer += '</td>';


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
            buffer += '<td class="mobilon-tiltas">' + bajt_merette_valtas(size) + '</td>';

            // feltöltő
            buffer += '<td class="mobilon-tiltas">' + username + '</td>';
        });

        document.getElementById('tablazat').innerHTML = buffer;

        if (filter_fajlnev.length > 0 || filter_datum.length > 0 || filter_feltolto.length > 0) {
            filter_frissites();
        }
    });

    szinkron_keres("/megoszto/megoszto.php?tarhely=1", (uzenet) => {
        if (/^OK:/.test(uzenet)) {
            ertekek = uzenet.replace(/^OK:/, '');
            ertekek = ertekek.split(',');
            szabad_tarhely = ertekek[0];
            foglalt_tarhely = ertekek[1];
            foglalt_tarhely_arany = parseFloat(foglalt_tarhely) / parseFloat(szabad_tarhely) * 100.0;
            szabad_tarhely_arany = parseFloat(szabad_tarhely) / parseFloat(foglalt_tarhely) * 100.0;
            document.getElementById('div_hasznalt_tarhely').style.width = foglalt_tarhely_arany + '%';
            if (szabad_tarhely_arany > 15.0) {
                document.getElementById('div_szabad_tarhely').innerHTML = 'Szabad terület: ' + bajt_merette_valtas(szabad_tarhely);
            }
            if (foglalt_tarhely_arany > 15.0) {
                document.getElementById('div_hasznalt_tarhely').innerHTML = 'Felhasznált: ' + bajt_merette_valtas(foglalt_tarhely);
            }
        } else {
            alert(uzenet);
        }
    });

}

function torles(link, fajlnev) {
    if (confirm('Biztosan szeretnéd törölni a "' + fajlnev + '" nevű fájlt?')) {
        szinkron_keres(link, (uzenet) => {
            if (/^OK:/.test(uzenet)) {
                valasz = uzenet.replace(/^OK:/, '');
                uj_valasz_mutatasa(valasz, 5000);
                fajlok_betoltese();
            } else {
                valasz = uzenet.replace(/^HIBA:/, 'HIBA: ');
                alert(valasz);
            }
        });
    }
}

function elonezet(hivatkozas, tipus, meret) {
    if (meret > 1024 * 1024 * 10) {
        uj_valasz_mutatasa('A fájl mérete nagyobb mint 10MB, ezért az előnézetet nem lehet hozzá betölteni.', 5000);
    } else {
        document.getElementById('preview_box').style.visibility = '';
        document.getElementById('darken_background').style.visibility = '';
        document.getElementById('elonezet_bezaras_gomb').style.visibility = '';

        if (tipus == "kep") {
            document.getElementById('preview_box').innerHTML = '<img alt="előnézet" id="elonezet_iframe" src="' + hivatkozas + '" title="Előnézet" />';
            return;
        }
        if (tipus == "audio") {
            document.getElementById('preview_box').innerHTML = '<audio controls><source src="' + hivatkozas + '" type="audio/mpeg" /></audio>';
            return;
        }
        iframe = document.createElement('iframe');
        iframe.style = "height: 100%; width: 100%; background-color: white; color: black";
        iframe.id = "elonezet_iframe";
        iframe.src = hivatkozas;
        iframe.title = "Előnézet";
        document.getElementById('preview_box').appendChild(iframe);
        setTimeout(() => {
            iframe.contentWindow.document.body.style.color = 'black';
            iframe.contentWindow.document.body.style.backgroundcolor = 'white';
        }, 100);
        document.getElementById('preview_box').style.height = '100%';
        document.getElementById('preview_box').style.width = '80%';
    }
}

function titkositas_feloldasa(file_id, fajlnev) {
    var caller = event.target;
    if (!caller && !caller.outerHTML.match(/^<td/)) {
        return;
    }
    document.getElementById('titkositatlan_fajl_letoltes_link').innerHTML = "";
    document.getElementById('titkositas_feloldasa_kulcs').value = "";

    document.getElementById('titkositott_fajl_letoltes_link').innerHTML = "<br><br>Titkosított fájl letöltése";
    document.getElementById('titkositott_fajl_letoltes_link').download = "titkositott_" + fajlnev;
    document.getElementById('titkositott_fajl_letoltes_link').href = "/megoszto/megoszto.php?letoltes&file_id=" + file_id;
    document.getElementById('titkositas_feloldasa_box').style.visibility = '';
    document.getElementById('darken_background').style.visibility = '';
    document.getElementById('elonezet_bezaras_gomb').style.visibility = '';
    document.getElementById('titkositas_feloldasa_kuldes_gomb').onclick = function() {
        titkositas_feloldasa_kuldes(file_id, fajlnev, caller);
    };
}

function titkositas_feloldasa_kuldes(file_id, fajlnev, caller) {
    if (document.getElementById('titkositas_feloldasa_kulcs').value.length <= 0) {
        alert("Nem adtál meg titkosítási kulcsot, így nem lehet feloldani a fájlt.");
        return;
    }

    let keres = new XMLHttpRequest();
    keres.onload = function() {
        if (/^OK:/.test(this.responseText)) {
            uj_valasz_mutatasa("Fájl letöltése...", 99999);
            var xhr = new XMLHttpRequest();
            xhr.open('POST', "/megoszto/megoszto.php?letoltes&file_id=" + file_id);
            xhr.responseType = 'blob';
            xhr.onload = () => {
                fajl = xhr.response;
                link = URL.createObjectURL(fajl);
                document.getElementById('titkositatlan_fajl_letoltes_link').href = link;
                document.getElementById('titkositatlan_fajl_letoltes_link').innerHTML = "<br><br>Titkosítatlan fájl letöltése";
                document.getElementById('titkositatlan_fajl_letoltes_link').download = fajlnev;
                uj_valasz_mutatasa("Fájl letöltése kész.", 5000);
            };
            let post_parameterek_letoltes = "letoltes=1&titkositas_feloldasa_kulcs=" + document.getElementById('titkositas_feloldasa_kulcs').value;
            xhr.send(post_parameterek_letoltes);
        }
        if (/^HIBA:/.test(this.responseText)) {
            uj_valasz_mutatasa(this.responseText, 10000);
        }
    }
    let post_parameterek_titkositas_feloldasa = "titkositas_feloldasa_kulcs=" + document.getElementById('titkositas_feloldasa_kulcs').value;
    keres.open("POST", "/megoszto/megoszto.php?letoltes&file_id=" + file_id);
    keres.send(post_parameterek_titkositas_feloldasa);
}

function fajl_atnevezese(id, fajlnev) {
    document.getElementById('atnevezes_box').style.visibility = '';
    document.getElementById('darken_background').style.visibility = '';
    document.getElementById('elonezet_bezaras_gomb').style.visibility = '';
    document.getElementById('atnevezes_uj_nev').placeholder = fajlnev;
    document.getElementById('atnevezes_uj_nev').value = fajlnev;
    document.getElementById('atnevezes_uj_nev').azonosito = id;
}

function uj_valasz_mutatasa(valasz, ido) {
    document.getElementById('valasz_uzenet').innerHTML = "<p>" + valasz + "</p>";
    document.getElementById('valasz_uzenet').style.opacity = "100%";
    clearTimeout(uj_valasz_mutatasa_idozito);
    uj_valasz_mutatasa_idozito = setTimeout(() => {
        document.getElementById('valasz_uzenet').style.opacity = "0%";
    }, ido);
}

function atnevezes_inditasa() {
    elonezet_bezaras();
    link = "/megoszto/megoszto.php?atnevezes=1&file_id=" + document.getElementById('atnevezes_uj_nev').azonosito + "&uj_nev=" + document.getElementById('atnevezes_uj_nev').value;
    szinkron_keres(link, (uzenet) => {
        if (/^OK:/.test(uzenet)) {
            valasz = uzenet.replace(/^OK:/, '');
            uj_valasz_mutatasa(valasz, 3000);
            fajlok_betoltese();
        } else {
            alert(uzenet);
        }
    });
}

function claimeles(link) {
    szinkron_keres(link, (uzenet) => {
        if (/^OK:/.test(uzenet)) {
            valasz = uzenet.replace(/^OK:/, '');
            uj_valasz_mutatasa(valasz, 3000);
            fajlok_betoltese();
        } else {
            alert(uzenet);
        }
    });
}

function feltoltes() {
    fajlok = document.getElementById('fileToUpload').files;
    if (fajlok.length > 1) {
        uj_valasz_mutatasa('Fájlok feltöltése...', 99999);
    } else {
        uj_valasz_mutatasa('Fájl feltöltése...', 99999);
    }

    document.getElementById('fileToUpload').type = '';
    document.getElementById('fileToUpload_label').innerHTML = 'Feltöltés folyamatban...';

    var valid_fajlok_szama = 0;
    for (let i = 0; i < fajlok.length; i++) {
        if (fajlok[i].valid != "nem") {
            valid_fajlok_szama++;
        }
    }

    var kesz_fajlok_szama = 0;

    var upload_progress_interval;

    for (let i = 0; i < fajlok.length; i++) {
        var fajl = fajlok[i];

        if (fajl.valid == "nem") {
            continue;
        }

        let keres = new XMLHttpRequest();
        keres.onload = function() {
            if (/^OK:/.test(this.responseText)) {
                kesz_fajlok_szama++;
                if (kesz_fajlok_szama == valid_fajlok_szama) {
                    if (valid_fajlok_szama > 1) {
                        uj_valasz_mutatasa('Fájlok feltöltése kész', 5000);
                    } else {
                        uj_valasz_mutatasa('Fájl feltöltése kész', 5000);
                    }
                    document.getElementById('fileToUpload').type = 'file';
                    document.getElementById('fileToUpload_label').innerHTML = '&#128193; Kattints ide fájlok feltöltéséhez';
                    fajlok_betoltese();
                }
            } else {
                alert(this.responseText);
            }
        }
        let formData = new FormData();
        if (document.getElementById('titkositas_kulcs').value.length > 0) {
            formData.append("titkositas_kulcs", document.getElementById('titkositas_kulcs').value);
        }
        if (document.getElementById('private') != null) {
            if (document.getElementById('private').checked) {
                formData.append("private", "1");
            }
        }
        formData.append("fileToUpload", fajl);
        formData.append("submit", "1");
        keres.onloadstart = () => {

        }
        keres.onloadend = () => {

        }
        keres.onprogress = (event) => {
            console.log(event);
        }
        keres.open("POST", '/megoszto/megoszto.php');
        keres.send(formData);
    }
}

function elonezet_bezaras() {
    document.getElementById('preview_box').style.visibility = 'hidden';
    document.getElementById('atnevezes_box').style.visibility = 'hidden';
    document.getElementById('darken_background').style.visibility = 'hidden';
    document.getElementById('elonezet_bezaras_gomb').style.visibility = 'hidden';
    document.getElementById('titkositas_feloldasa_box').style.visibility = 'hidden';
    document.getElementById('preview_box').innerHTML = "";
}

function fajl_drop(event) {
    evenet.preventDefault();
    console.log(event);
}

function fajlnev_frissitese() {
    fajlok = document.getElementById('fileToUpload').files;
    fajlnevek = "";
    for (let i = 0; i < fajlok.length; i++) {
        var jelenlegi_fajl = fajlok[i];

        jelenlegi_nev = jelenlegi_fajl.name;
        if (/['"`]/ig.test(jelenlegi_nev)) {
            modositott_nev = jelenlegi_fajl.name.replace(/['"`]/ig, '');
            if (!confirm('"' + jelenlegi_fajl.name + '" át lesz nevezve "' + modositott_nev + '"-re. Szeretnéd így is feltölteni a fájlt?')) {
                jelenlegi_fajl.valid = 'nem';
                continue;
            }
            jelenlegi_nev = modositott_nev;
        }
        
        if( jelenlegi_fajl.size > 1024 * 1024 * 200 ) {
            alert('A "' + jelenlegi_nev + '" nevű fájl mérete nagyobb mint 200MB, ezért azt nem lehet feltölteni.');
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
        document.getElementById('fileToUpload_label').innerHTML = '&#128193; Kattints ide fájlok feltöltéséhez';
        document.getElementById('SubmitGomb').style.visibility = 'hidden';
    } else {
        document.getElementById('fileToUpload_label').innerHTML = fajlnevek;
        document.getElementById('SubmitGomb').style.visibility = '';
    }

}

function bal_klikk(event) {
    var volt_tr = false;
    var tr;
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
        } else {
            alert('NINCS TR');
        }
    } else {
        jobb_klikk_menu_kinyitas(event, tr);
    }
}

function jobb_klikk_menu_eltuntetes() {
    jobb_klikk_menu.style.display = 'none';
}

function jobb_klikk_menu_kinyitas(event, tr) {
    jobb_klikk_menu = document.getElementById('jobb_klikk_menu');
    jobb_klikk_menu.style.display = 'block';

    // menü eltűntetése tekerés esetén
    document.body.onscroll = () => {
        jobb_klikk_menu_eltuntetes();
    };

    // menü eltűntetése máshova kattintás esetén
    document.body.onclick = (event) => {
        if (window.innerWidth > 1024) {
            var kattintas_jobb_klikk_menun_volt = false;
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
    jobb_klikk_menu.innerHTML += '<b>Méret: </b>' + bajt_merette_valtas(tr.attributes['sor_size'].value) + '<br><br>';
    jobb_klikk_menu.innerHTML += '<b>Feltöltő: </b>' + tr.children[4].innerHTML + '<br><br>';
    if (tr.attributes['sor_titkositott'].value == '1') {
        jobb_klikk_menu.innerHTML += '<div class="szint-3 gomb kerekites-10" onclick=\'titkositas_feloldasa("' + tr.attributes['sor_id'].value + '", "' + tr.attributes['sor_filename'].value + '");\'>Fájl feloldása</div><br>';
    } else {
        if (parseInt(tr.attributes['sor_size'].value) <= 1024 * 1024 * 10 && ['kep', 'audio', 'video', 'dokumentum'].includes(tr.attributes['sor_elonezet_tipus'].value)) {
            jobb_klikk_menu.innerHTML += '<div class="szint-3 gomb kerekites-10" onclick=\'elonezet("/megoszto/megoszto.php?letoltes&file_id=' + tr.attributes['sor_id'].value + '", "' + tr.attributes['sor_elonezet_tipus'].value + '", "' + tr.attributes['sor_size'].value + '");\'>Megnyitás</div><br>';
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
    dropZone = document.getElementById('fajl_drop_zona');
    dropZone_leiras = document.getElementById('fajl_drop_zona_leiras');


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
    document.getElementById('fileToUpload').files = e.dataTransfer.files;
    fajlnev_frissitese();
    console.log();

    e.preventDefault();
    hideDropZone();
}

var dropZone;
var dropZone_leiras;

var uj_valasz_mutatasa_idozito;

function body_onload() {
    window.addEventListener('dragenter', function(e) {
        drop_zona_aktivalas();
        showDropZone();
    });
    
    document.addEventListener('contextmenu', function(event) {
        var volt_tr = false;
        var tr;
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
}
