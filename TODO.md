## 💭 Tennivalók

* Együttnézp iframe, player, YouTube api, és egyéb komponensek betöltési sorrendjének javítása
* Együttnézőhöz külön videó kezelés UI készítése (folyamatban)
* Fiókokhoz megjelenő név beállítás, profil oldal /kezelo/
* /uploads mappa kivezetése Jul. 28 után
* Régi style.css kivezetése
	* egyuttnezo
	* megoszto
* Új mappastruktúra kialakítása közös kódokhoz
	* komponensek mappa
	* külön mappa jelszó változtatásnak és regisztrációnak
	* Vaagy, külön fiok mappa, benne:
		* beléptető rendszer
		* jelszó változatás
		* regisztráció
		* jövőben lehetséges profil lap
* Globális: előtérbe helyezés függvény
* Megosztó: feltöltés paramétereit egy előugró ablakban lehessen megadni
* Megosztó link módosítása /uploads-ról /megoszto-ra .htaccess átirányítással
	* Google-ról SEO tool-ban leszedni a régi linkeket
* Megosztó: törölt fájlok kukába helyezése végleges törlés helyett
* Beléptető rendszer módosítása mobilon: jobb-felső sarokban legyen, és jelenjen meg úgy mint a hausz oldalak gomb
* Megosztó: nagy fájl esetén letöltés felajánlása hibára futás helyett
* Megosztó feltöltés töltés animáció
* LIDL pizza tier list leírás (személyes vélemények leírása egyes pizzákról)
* Megosztó előnézet középre igazítás
* Backend cseréje Apache-ról saját fejlesztésű Node.js backend-re
* Saját hibaoldalak írása: 500, 404, stb...
* Header tagek használatát áttervezni
* Együttnéző széleskörű tesztelése és bugok javítása
	* Csúszás megoldása belső kliens oldali számlálóval
* Dokumentációk írása az adott oldalakhoz, és fordítás Magyar nyelvre (potenciális reformatolás és takarítás is belefér)
* Adatbázisban belépés sessionöket kezelni, és kiléptetni minden felhasználót jelszó változtatásnál [guru99.com cookie mentés leírás](https://www.guru99.com/cookies-and-sessions.html)
* Google Search Console (SEO) hibák javítása és javasolt lépések megtétele
	* Mobil barát oldalak (már csak a megosztó van hátra)
	* Rich results hibák


## ✅ Implementált tennivalók

* JS oldalak kijavítása Typescript compiler üzenetei alapján
	- [x] megosztó
	- [x] teamspeak infó
	- [x] együttnéző
* Minden txt fájl átírása, és formázása .md kiterjesztésre
* /index fájlok átrakása forras/komponensek mappába
* index.js áthelyezése /index mappába
* .gitignore fájlok egyesítése gyökérmappában
* [Saját bundler létrehozása](dokumentáció/kiadas/leírás.md)
* uj_valasz_mutatasa() függvény átírása az alap_fuggvenyek.js-ben, és implementáció az összes oldalon
* alapok.css: Szín párok létrehozása ligth és dark mode-hoz
* Régi style.css kivezetése
	- [x] index
	- [x] admin
	- [x] hauszkft
	- [x] pizzatierlist
	- [x] erettsegiszamlalo
	- [x] josda
	- [x] josda/fizetos
* Ismétlődő, sokszor előforduló kódok csökkentése
	* document.GetElementById() -> obj()
* HTML JS részek külön fájlba helyezése
* Megosztó link módosítása /uploads-ról /megoszto-ra .htaccess átirányítással
	* Belső hivatkozások átírva
* Jelszó változtatás, regisztrálás, együttnéző oldal átírás Javascript-be
* Adatkezelői nyilatkozat regisztrációs oldalon
* Új readme készítése, és jelenlegi readme átváltoztatása todo-ra
* Megosztó: Bal alsó sarokban megjelenő státusz szöveg időzítésének javítása
* Megosztó: 10MB méretes előnézet felett csak a bal alsó sarokban ír üzenetet alert() helyett
* Általános log készítése minden funkció használatáról: Admin oldalon lehet megtekinteni
* Megosztó: 200MB méretlimitet feltöltés előtt vizsgálni JS-ben
* Megosztó jobb-klikk menük
* Fájl értesítés ha át lesz nevezve confirm funkcióval
* Megosztó csak saját fájlok mutatása (keresés fájlnév, dátum és feltöltő neve alapján)
* Megosztó PHP fájlok által küldött adatmennyiség csökkentése a HTML részek teljes kivonásával, áttérés javascript-re
* AJAX-osítani a beléptető rendszert és a megosztót (Javascript implementáció)
* Stíluslapok áttervezése
	* A leggyakoribb tulajdonságokat class-okba szervezni, és azt használni az elementeken közvetlenül (deklaratív CSS)
	* Standard elemek készítése: gomb, táblázat, div, stb..
	* Mélység hatás: mindenen soft árnyékok
	* Gombok intuitívan megkülönböztethetőek
* Teamspeak oldal leírás
* Megosztón titkosított fájlfeltöltés jelszóvédelemmel: [php.net OpenSSL encrypt](https://www.php.net/manual/en/function.openssl-encrypt.php) [php.net OpenSSL decrypt](https://www.php.net/manual/en/function.openssl-decrypt.php)
* Megosztón utolsó parancs üzenete 3 mp-ig a sarokban jelenjen meg
* Title-ök átírása "cím - Hausz" formátumra, meta leírások átfogalmazása, és egyéb SEO tippek alkalmazása
* Néhány fájl eltakarása keresőmotor indexelés elől (pl: forras/komponensek/topbar.html)
	* A .htaccess fájlokban "Header add" paranccsal hozzáadva az "X-Robots-Tag: noindex" header minden eltűntetendő fájlhoz
* Migrálás tesztelése új Ubuntu 22.04 server rendszerre: Siker! -> [Migráció eredmény](dokumentáció/2022.06.15%20migráció%20teszt/jegyzetek.md)
* Git repo megtisztítva a jelszavaktól és tanúsítványoktól: [GitHub leírás](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
* TeamSpeak, együttnéző szerver és code-serverek bootolás utáni automatikus indítása: [Szolgáltatás készítés leírás](dokumentáció/linux%20szolgáltatás/szolgáltatás%20készítés.md)
* Megosztó átírás websocket alapra:
	* Node.js alapú websocket szerver (WSS, hausz.stream certet használva)
	* Kell hozzá a ws modul hogy működjön: "npm install ws"
	* a node modul mappát és a package json-öket ignore listára vettem hogy ne legyen tele velük a repository
* Admin oszlop adatbázisban és admin oldal a felhasználók kezeléséhez
* Megosztón fájlok átnevezése
* TeamSpeak szolgáltatás státusz mutatása a TS oldalon
* Hausz youtube együttnéző: [YouTube iframe API dokumentáció](https://developers.google.com/youtube/iframe_api_reference)
* Belépés standardizálása és kiterjesztése együttnézőre
* SEO dolgok: [Google SEO leírás](https://developers.google.com/search/docs/advanced/guidelines/get-started)
* Log-in form best practicek megvalósítva: [web.dev leírás](https://web.dev/sign-in-form-best-practices/#show-password)
	* Belépéskor automatikusan kitölti a belépési adatokat a böngésző
* Session mentése Cookie-ba
	*  Ez kellett ahhoz hogy belépve maradjanak a felhasználók
	*  PHP-ben session_start()-ot bármilyen más output előtt kell futtatni, és így magától a cookie-ba menti az adatokat.
* Tárhely állapot a megosztó oldal alján
* CSS fájlok egységesítve
* Csak szükséges portok engedélyezése
	* 80      Apache2
	* 443     Apache2
	* 8080    code-server
	* 9987    TS
	* 30033   TS Fájl és avatar átvitel
* Dark mode [w3schools.com](https://www.w3schools.com/howto/howto_js_toggle_dark_mode.asp) [css-tricks.com](https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/#os-level)
* W3 validátorral megjavítva az aloldalak: [validator.w3.org](https://validator.w3.org/)
* Adatbázis újrastruktúrálás, egy adatbázisra
	*  Mostmár csak hausz_megoszto van, de ezt később még át kell migrálni sima Hausz-ra
* Stílusok egyesítése aloldalakon
* Youtube letöltő és az általa használt C++ alapú programok törlése
	*  Elvault a program amire alapult a letöltő, és mivel a Google aktívan megakadályoz minden próbálkozást, ezért nincs elég időm mindig frissíteni
* TS fájlok áthelyezése a megosztóra "TS szerver" felhasználó alá
