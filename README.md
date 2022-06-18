# Hausz

Ez a repository tartalmazza a Hausz Kft weboldalának és egyéb szolgáltatásainak forráskódját, tartalmát, és dokumentációjat, illetve itt található minden olyan fájl ami a Hausz szolgáltatások üzemeltetéséhez szükséges.

## 💭 Tennivalók
* Header tagek használatát áttervezni
* Együttnéző széleskörű tesztelése és bugok javítása
	* Csúszás megoldása belső kliens oldali számlálóval
* AJAX-osítani a beléptető rendszert
* Dokumentációk írása az adott oldalakhoz, és fordítás Magyar nyelvre (potenciális reformatolás és takarítás is belefér)
* Adatbázisban belépés sessionöket kezelni, és kiléptetni minden felhasználót jelszó változtatásnál
* Google Search Console (SEO) hibák javítása és javasolt lépések megtétele
	* Mobil barát oldalak
	* Rich results hibák

## ✅ Implementált funkciók / megtett lépések

* Title-ök átírása "cím - Hausz" formátumra, meta leírások átfogalmazása, és egyéb SEO tippek alkalmazása
* Néhány fájl eltakarása keresőmotor indexelés elől (pl: index/topbar.html)
	* A .htaccess fájlokban "Header add" paranccsal hozzáadva az "X-Robots-Tag: noindex" header minden eltűntetendő fájlhoz
* Migrálás tesztelése új Ubuntu 22.04 server rendszerre: Siker! -> [Migráció eredmény](dokumentacio/2022.06.15%20migráció%20teszt/jegyzetek.txt)
* Git repo megtisztítva a jelszavaktól és tanúsítványoktól: [GitHub leírás](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
* TeamSpeak, együttnéző szerver és code-serverek bootolás utáni automatikus indítása: [Szolgáltatás készítés leírás](dokumentacio/linux%20szolgáltatás/szolgáltatás%20készítés.txt)
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
