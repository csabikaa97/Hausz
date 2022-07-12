if( typeof belepteto_rendszer_beallitas != 'function' ) {   throw new Error('Nincs importálva a belepteto_rendszer.js!!!'); }
if( typeof topbar_betoltese != 'function' ) {   throw new Error('Nincs importálva a topbar.js!!!'); }

belepteto_rendszer_beallitas();
topbar_betoltese();

ujitasok_doboz = obj('ujitasok');
ujitasok = Array();

ujitasok.push('');
ujitasok[''] = [
    ""
    ,""
]

ujitasok.push('2022.06.30');
ujitasok['2022.06.30'] = [
    "Megosztó: Fájlokra lehet jobb-klikkelni egyéb opciók eléréséhez, több fájlt is fel lehet tölteni egyszerre, lehet a feltöltött állományok között keresni, és át lehet húzni a weboldalra bármilyen fájlokat a feltöltéshez."
    , "Globális: Sokkal mobilbarátabb az összes oldal"
]

ujitasok.push('2022.06.21');
ujitasok['2022.06.21'] = [
    "Megosztó: 🔑🔒 Lehet jelszóval titkosítani feltöltéskor a fájlokat, és teljesen újra lett írva az egész."
]

ujitasok.push('2022.06.01');
ujitasok['2022.06.01'] = [
    "TeamSpeak oldal: Rövid leírás új felhasználók számára, jogosultságot igénylés, szerver státuszát, és online felhasználó lista."
]

ujitasok.push('2022.05.26');
ujitasok['2022.05.26'] = [
    "Együttnéző: Nagyon alpha verzió még."
]

ujitasok_doboz = obj('ujitasok_doboz');

ujitasok.forEach(datum => {
    ujitasok_doboz.innerHTML += '<p class="tab-1">'+datum+'</p>';
    ujitasok[datum].forEach(ujitas => {
        if( ujitas.length > 0 ) {
            if( /:/.test(ujitas) ) {
                ujitas = ujitas.split(':');
                ujitasok_doboz.innerHTML += '<li class="tab-2"><font style="text-decoration: underline">' + ujitas[0] + '</font>:' + ujitas[1] + '</li><br>';
            } else {
                ujitasok_doboz.innerHTML += '<li class="tab-2">' + ujitas + '</li><br>';
            }
        }
    });
});
