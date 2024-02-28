export const domain = "hausz.stream"
// TODO: egyesíteni a kettőt
export const alap_url = "https://localhost"

export const ujitas_lista: Array<{[datum: string]: string[]}> = [
    {'2024.01.30': ["Alap: Az összes szolgáltatást sikerült kihejezni a régi fizetős Amazon szerverről saját szerverre, így mostmár több lehetőség van hosztolás szempontjából, a meglévő szolgáltatások pedig gyorsabban működnek."]}
    , {'2023.11.08': [
        "Alap: A Webszerver újra lett írva Rust nyelven, és a régi kódokat kiváltotta egy új, sokkal modernebb, és biztonságosabb megoldás."
        , "Alap: A belépés új session-öket használ, aminek köszönhetően nem kell fél óránként belépni az oldalon."
        , "Megosztó: Az új Webszervernek köszönhetően egy újabb titkosítási megoldást sikerült bevezetni, amely 100%-ban a feltöltő számítógépen titkosítja, és oldja fel a fájlokat. A v2 verziójú titkosítás során a titkosítatlan fájl, és a hozzátartozó titkosítási kulcs sem kerül fel a szerverre."
        , "Alap: Az új Webszerver a már meglévő újabb funkciót mellett rengeteg lehetőséget ad a jövőbeni fejlesztésekhez, ezért érdemes lesz figyelni a weboldalt, és a forráskódot a következő hónapokban."
    ]}
    , {'2023.10.18': ["Alap: A szerveren sikerült átállni a SHA256 hashelési algoritmusra. Az új megoldás miatt a weboldal már nem küldi el a felhasználók jelszavát a szerverre, így a jelszavak használata és tárolása jelentősen biztonságosabb lett."]}
    , {'2023.10.09': ["Megosztó: Be lehet állítani minden fájlhoz, hogy csak Hausz tagok, vagy minden felhasználó számára legyen elérhető."]}
    , {'2023.10.14': ["Minecraft: Letöltési linkeket és csatlakozási lépéseket lehet megtekinteni a Minecraft oldalon."]}
    , {'2023.10.04': ["Alap: Minden meglévő felhasználó tud meghívót generálni, amivel a regisztráló felhasználó fiókja azonnal aktiválódik."]}
    , {'2023.01.27': ["TeamSpeak oldal: Egy új 'Fiók varázsló' nevű funkcióval vissza lehet állítani a korábbi fiókokkal elveszett rangokat."]}
    , {'2022.07.22': ["Együttnéző: Már csak pár funkció befejezése, és egy kis bővítés szükséges ahhoz hogy készen álljon használatra. Jelenleg folyik a BETA tesztelés."]}
    , {'2022.07.18': ["Megosztó: Minden felhasználó tudja a jobb-klikk menüvel változtatni a saját fájljainak privát / publikus státuszát."]}
    , {'2022.06.30': [   
        "Megosztó: Fájlokra lehet jobb-klikkelni egyéb opciók eléréséhez, több fájlt is fel lehet tölteni egyszerre, lehet a feltöltött állományok között keresni, és át lehet húzni a weboldalra bármilyen fájlokat a feltöltéshez."                   
        , "Globális: Sokkal mobilbarátabb az összes oldal"
    ]}
    , {'2022.06.21': ["Megosztó: 🔑🔒 Lehet jelszóval titkosítani feltöltéskor a fájlokat, és teljesen újra lett írva az egész."]}
    , {'2022.06.01': ["TeamSpeak oldal: Rövid leírás új felhasználók számára, jogosultságot igénylés, szerver státuszát, és online felhasználó lista."]}
    , {'2022.05.26': ["Együttnéző: Nagyon alpha verzió még."]}
];

export const megoszto_fajl_tipusok: Array<{tipus: string, kiterjesztesek: string[]}> = [
    {tipus: 'kep', kiterjesztesek: ['jpg', 'png', 'heic', 'gif', 'svg', 'webp', 'bmp', 'jpeg']},
    {tipus: 'audio', kiterjesztesek: ['mp3', 'wav']},
    {tipus: 'video', kiterjesztesek: ['mkv', 'avi', 'mp4', 'webm']},
    {tipus: 'dokumentum', kiterjesztesek: ['pdf', 'csv', 'c', 'cpp', 'm', 'py', 'css', 'txt', 'sql', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'ahk', 'md', 'sh']},
    {tipus: 'szoftver', kiterjesztesek: ['exe', 'msi', 'iso', 'apk', 'rpm', 'deb', 'dmg', 'pkg']},
    {tipus: 'csomagolt', kiterjesztesek: ['torrent', 'zip', '7z', 'tar', 'rar', 'gz']}
];

export const megoszto_fajl_elonezet_limit = 1024 * 1024 * 10;