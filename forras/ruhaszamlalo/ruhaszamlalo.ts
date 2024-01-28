/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// <reference path="/var/www/forras/komponensek/belepteto_rendszer.ts" />
/// <reference path="/var/www/forras/komponensek/topbar.ts" />

function belepes_kilepes_siker() {
    location.reload();
}

function hozzaadas(id) {
    szinkron_keres("/ruhaszamlalo/ruhaszamlalo.php?hozzaadas=" + id, "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            console.log({uzenet});
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            ruhak_frissitese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function csokkentes(id) {
    szinkron_keres("/ruhaszamlalo/ruhaszamlalo.php?csokkentes=" + id, "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            console.log({uzenet});
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            ruhak_frissitese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function kategoria_click(kategoria_szama: number) {
    let sorok = document.getElementsByClassName('kategoria-' + kategoria_szama.toString());

    let jelenleg_rejte_van = sorok[0].getAttribute('hidden') != null;

    let eltunteteshez = document.getElementsByTagName('tr');
    for (let i = 0; i < eltunteteshez.length; i++) {
        if( /kategoria-[0-9]/.test( eltunteteshez[i].className ) ) {
            eltunteteshez[i].setAttribute('hidden', "");
        }
    }
    
    if( jelenleg_rejte_van ) {
        for (let i = 0; i < sorok.length; i++) {
            sorok[i].removeAttribute('hidden');
        }
    } else {
        for (let i = 0; i < sorok.length; i++) {
            sorok[i].setAttribute('hidden', "");
        }
    }
}

function ruhak_frissitese() {
    if( session_loggedin != 'yes' || session_username != "Andi" ) {
        obj('belepve').setAttribute('style', 'display: none;');
        obj('nincs_belepve_hiba').setAttribute('style', 'display: block;');
        return;
    }
    
    obj('belepve').setAttribute('style', 'display: block;');
    obj('nincs_belepve_hiba').setAttribute('style', 'display: none;');

    szinkron_keres("/ruhaszamlalo/ruhaszamlalo.php?ruhak=1", "", (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            console.log({uzenet});

            let buffer = '';
            
            let kategoriak = [];

            for (let i = 0; i < uzenet.ruhak_szama; i++) {
                let van = false;
                for (let j = 0; j < kategoriak.length; j++) {
                    if( kategoriak[j] == uzenet.ruhak[i].kategoria ) {
                        van = true;
                    }
                }

                if( !van ) {
                    kategoriak = [...kategoriak, uzenet.ruhak[i].kategoria];
                }
            }

            for (let k = 0; k < kategoriak.length; k++) {
                buffer += `<tr kategoria="${k}" onclick="kategoria_click(${k});"><td class="padding-10"><dsa class="gomb szint-2 kerekites-15" style="font-weight: bold;">${kategoriak[k]}</dsa></td><td colspan="5"></td></tr>`

                for (let i = 0; i < uzenet.ruhak_szama; i++) {
                    if( uzenet.ruhak[i].kategoria != kategoriak[k] ) {
                        continue;
                    }

                    buffer += `<tr hidden `;
                    
                    let ruha = uzenet.ruhak[i];

                    let utolso_felvetel_szoveg: string;
    
                    if( ruha.utolso_felvetel == new Date().toJSON().slice(0, 10) ) {
                        utolso_felvetel_szoveg = "Ma";
                        buffer += 'style="background-color: rgb(100,220,100); text-shadow: 0px 0px 4px var(--szint-0-szin);"';
                    } else {
                        if( ruha.utolso_felvetel.length <= 0 ) {
                            utolso_felvetel_szoveg = "";
                        } else {
                            let nap_kulonbseg = (Date.now() - Date.parse( ruha.utolso_felvetel )) / (1000 * 60 * 60 * 24);
                            utolso_felvetel_szoveg = (Math.round(nap_kulonbseg).toString() + " napja");
                        }
                    }

                    if( k % 2 == 0 ) {
                        buffer += ' class="szint-1';
                    } else {
                        buffer += ' class="szint-2';
                    }
                    buffer += ` kategoria-${k}">`;
    
                    buffer += '<td colspan="2" style="';
                    if( /turis ?/ig.test(ruha.nev) ) {
                        buffer += 'color: orange; ';
                        ruha.nev = ruha.nev.replace(/turis? /ig, '');
                    }
                    buffer += "padding-top: 15px; padding-bottom: 15px;";
                    
                    let markak = [  'mango', 'h&m', 'lacoste', 'zara', 'no comment', 'calvin klein', 
                                    'bershka', 'mtv', 'lidl', 'butikos', 'abercrombie & fitch', 
                                    'debenhams', 'takko', 'sugarbird', 'mohito', 'new look', 'g star raw', 
                                    'adidas', 'nike', 'nasty gal', 'puma', 'converse', 'rieker', 
                                    'remonte', 'salamander'
                    ];
                    markak.forEach(marka => {
                        let jelenlegi_marka_regexe = new RegExp(`(${marka})`, 'ig');
                        if( jelenlegi_marka_regexe.test( ruha.nev ) ) {
                            ruha.nev = ruha.nev.replace( jelenlegi_marka_regexe, '<dsa style="text-decoration: underline;">$1</dsa>' );
                        }
                    });

                    buffer += `">${ruha.nev}</td><td>${utolso_felvetel_szoveg}</td>`;
                    buffer += `<td class="cella"><div class="szint-2 gomb kerekites-15" onclick="hozzaadas(${ruha.id})">+</div></td>`;
                    buffer += `<td>${ruha.szamlalo}</td>`;
                    buffer += '<td class="cella">';
                    if( ruha.szamlalo > 0 ) {
                        buffer += `<div class="szint-2 gomb kerekites-15" onclick="csokkentes(${ruha.id})">-</div>`;
                    }
                    buffer += '</td>';
                    buffer += "</tr>";
                }
            }

            document.getElementsByClassName('tablazat')[0].innerHTML = buffer;
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

function ruha_hozzaadasa(event) {
    event.preventDefault();

    let postdata = new FormData();
    postdata.append('ruha_kategoria', obj('ruhakategoria').value);
    postdata.append('ruha_nev', obj('ruhanev').value);

    szinkron_keres("/ruhaszamlalo/ruhaszamlalo.php?uj_ruha=1", postdata, (uzenet) => {
        if( uzenet.eredmeny == 'ok' ) {
            console.log({uzenet});
            uj_valasz_mutatasa(3000, "ok", uzenet.valasz);
            obj('ruhanev').value = "";
            ruhak_frissitese();
        } else {
            uj_valasz_mutatasa(5000, "hiba", uzenet.valasz);
        }
    });
}

topbar_betoltese();
belepteto_rendszer_beallitas( ruhak_frissitese, belepes_kilepes_siker, belepes_kilepes_siker );