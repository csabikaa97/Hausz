/// <reference path="../komponensek/alap_fuggvenyek.ts" />
/// <reference path="../komponensek/belepteto_rendszer.ts" />
/// <reference path="../komponensek/topbar.ts" />

topbar_betoltese();
belepteto_rendszer_beallitas();

var ujitasok_doboz = obj('ujitasok');
var ujitasok = {
    '2023.10.18': ["Alap: A szerveren sikerült átállni a SHA256 hashelési algoritmusra. Az új megoldás miatt a weboldal már nem küldi el a felhasználók jelszavát a szerverre, így a jelszavak használata és tárolása jelentősen biztonságosabb lett."]
    , '2023.10.09': ["Megosztó: Be lehet állítani minden fájlhoz, hogy csak Hausz tagok, vagy minden felhasználó számára legyen elérhető."]
    , '2023.10.14': ["Minecraft: Letöltési linkeket és csatlakozási lépéseket lehet megtekinteni a Minecraft oldalon."]
    , '2023.10.04': ["Alap: Minden meglévő felhasználó tud meghívót generálni, amivel a regisztráló felhasználó fiókja azonnal aktiválódik."]
    , '2023.01.27': ["TeamSpeak oldal: Egy új 'Fiók varázsló' nevű funkcióval vissza lehet állítani a korábbi fiókokkal elveszett rangokat."]
    , '2022.07.22': ["Együttnéző: Már csak pár funkció befejezése, és egy kis bővítés szükséges ahhoz hogy készen álljon használatra. Jelenleg folyik a BETA tesztelés."]
    , '2022.07.18': ["Megosztó: Minden felhasználó tudja a jobb-klikk menüvel változtatni a saját fájljainak privát / publikus státuszát."]
    , '2022.06.30': [   
        "Megosztó: Fájlokra lehet jobb-klikkelni egyéb opciók eléréséhez, több fájlt is fel lehet tölteni egyszerre, lehet a feltöltött állományok között keresni, és át lehet húzni a weboldalra bármilyen fájlokat a feltöltéshez."                   
        , "Globális: Sokkal mobilbarátabb az összes oldal"
      ]
    , '2022.06.21': ["Megosztó: 🔑🔒 Lehet jelszóval titkosítani feltöltéskor a fájlokat, és teljesen újra lett írva az egész."]
    , '2022.06.01': ["TeamSpeak oldal: Rövid leírás új felhasználók számára, jogosultságot igénylés, szerver státuszát, és online felhasználó lista."]
    , '2022.05.26': ["Együttnéző: Nagyon alpha verzió még."]
}


var doboz = obj('ujitasok_doboz');

Object.keys(ujitasok).forEach(datum => {
    doboz.innerHTML += `<p class="tab-1">${datum}</p>`;
    ujitasok[datum].forEach(ujitas => {
        if( ujitas.length > 0 ) {
            if( /:/.test(ujitas) ) {
                ujitas = ujitas.split(':');
                doboz.innerHTML += `<p class="tab-2"><font style="text-decoration: underline">${ujitas[0]}</font>:${ujitas[1]}</p><br>`;
            } else {
                doboz.innerHTML += `<p class="tab-2">${ujitas}</p><br>`;
            }
        }
    });
});

