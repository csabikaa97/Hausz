var joslatok = [
    "Nemsoká pénz áll a házhoz.", "Meglepetés fog érni.", "Levegőt fogsz venni."
    , "Szerencse vár.", "Ha most lépsz, szerencséd lesz.", "Köss békét."
    , "Az esőt hamarosan felváltja a jó idő vagy fordítva.", "Az utazás szerencsét hoz."
    , "Nehéz lesz meggyógyítani.", "Némi időbe telik, míg megvalósul.", "Érdemes nyugodtan kivárni."
    , "Megérkeznek.", "Keleten található.", "Megnyerhető.", "Bajnok leszel."
    , "A fizetős verzióban nagyobb szerencsére lelsz.", "Gazdag leszel."
    , "Tényleg ennyire szerencsétlen vagy hogy feljöttél ide tanácsért?!"
    , "Visszajön majd egyszer, vagy nem...", "Csak a pozitivitás G a G-hez."
];

function joslas() {
    var szam = Math.floor(Math.random() * 21);
    alert(joslatok[szam]);
}

belepteto_rendszer_beallitas();
topbar_betoltese();