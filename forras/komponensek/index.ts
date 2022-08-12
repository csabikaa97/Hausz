/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// <reference path="/var/www/forras/komponensek/belepteto_rendszer.ts" />
/// <reference path="/var/www/forras/komponensek/topbar.ts" />

topbar_betoltese();
belepteto_rendszer_beallitas();

var ujitasok_doboz = obj('ujitasok');
var ujitasok = {
    '2022.07.22': ["Együttnéző: Már csak pár funkció befejezése, és egy kis bővítés szükséges ahhoz hogy készen álljon használatra. Jelenleg folyik a BETA tesztelés."],
    '2022.07.18': ["Megosztó: Minden felhasználó tudja a jobb-klikk menüvel változtatni a saját fájljainak privát / publikus státuszát."],
    '2022.06.30': ["Megosztó: Fájlokra lehet jobb-klikkelni egyéb opciók eléréséhez, több fájlt is fel lehet tölteni egyszerre, lehet a feltöltött állományok között keresni, és át lehet húzni a weboldalra bármilyen fájlokat a feltöltéshez."
        , "Globális: Sokkal mobilbarátabb az összes oldal"],
    '2022.06.21': ["Megosztó: 🔑🔒 Lehet jelszóval titkosítani feltöltéskor a fájlokat, és teljesen újra lett írva az egész."],
    '2022.06.01': ["TeamSpeak oldal: Rövid leírás új felhasználók számára, jogosultságot igénylés, szerver státuszát, és online felhasználó lista."],
    '2022.05.26': ["Együttnéző: Nagyon alpha verzió még."]
}


var doboz = obj('ujitasok_doboz');

Object.keys(ujitasok).forEach(datum => {
    doboz.innerHTML += `<p class="tab-1">${datum}</p>`;
    ujitasok[datum].forEach(ujitas => {
        if( ujitas.length > 0 ) {
            if( /:/.test(ujitas) ) {
                ujitas = ujitas.split(':');
                doboz.innerHTML += `<li class="tab-2"><font style="text-decoration: underline">${ujitas[0]}</font>:${ujitas[1]}</li><br>`;
            } else {
                doboz.innerHTML += `<li class="tab-2">${ujitas}</li><br>`;
            }
        }
    });
});

