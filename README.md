# Hausz

Ez a repository tartalmazza a Hausz Kft weboldalának forráskódját és tartalmát.

#### Tennivalók:

- Együttnéző széleskörű tesztelése és bugok javítása
> - Csúszás megoldása belső kliens oldali számlálóval
- AJAX-osítani a beléptető rendszert
- Dokumentációk írása az adott oldalakhoz, és fordítás Magyar nyelvre (potenciális reformatolás és takarítás is belefér)
- Migráció tesztelés újabb Ubuntu verzióra, és szükséges lépések illetve igényelt szoftver csomagok dokumentálása
> - Jelenleg telepített apt csomagokról lista mentés
> - Ubuntu server 22.04-en deployolás
- Adatbázisban belépés sessionöket kezelni, és kiléptetni minden felhasználót jelszó változtatásnál
- Google Search Console (SEO) hibák javítása és javasolt lépések megtétele
> - Mobil barát oldalak
> - Rich results hibák

#### Implementált:

- TeamSpeak, együttnéző szerver és code-serverek bootolás utáni automatikus indítása:
> - Lásd: dokumentacio/linux szolgáltatás/szolgáltatás készítés.txt
- Megosztó átírás websocket alapra:
> - Node.js alapú websocket szerver (WSS, hausz.stream certet használva)
> - Kell hozzá a ws modul hogy működjön: "npm install ws"
> - a node modul mappát és a package json-öket ignore listára vettem hogy ne legyen tele velük a repository
- Admin oszlop adatbázisban és admin oldal a felhasználók kezeléséhez
- Megosztón fájlok átnevezése
- TeamSpeak szolgáltatás státusz mutatása a TS oldalon
- Hausz youtube együttnéző (https://developers.google.com/youtube/iframe_api_reference)
- Belépés standardizálása és kiterjesztése együttnézőre
- SEO dolgok
> https://developers.google.com/search/docs/advanced/structured-data/video
> https://developers.google.com/search/docs/advanced/structured-data/product
> https://developers.google.com/search/docs/advanced/structured-data/carousel
> https://developers.google.com/search/docs/advanced/structured-data/logo
> https://developers.google.com/search/docs/advanced/structured-data/breadcrumb
> https://moz.com/learn/seo/schema-structured-data#:~:text=Schema.org%20(often%20called%20schema,represent%20your%20page%20in%20SERPs.
> https://developers.google.com/search/docs/beginner/seo-starter-guide
> https://developers.google.com/search/docs/advanced/crawling/block-indexing
> https://developers.google.com/search/docs/advanced/robots/intro
- Log-in form best practicek megvalósítva
> Belépéskor automatikusan kitölti a belépési adatokat a böngésző
> https://web.dev/sign-in-form-best-practices/#show-password
- Session mentése Cookie-ba
> Ez kellett ahhoz hogy belépve maradjanak a felhasználók
> PHP-ben session_start()-ot bármilyen más output előtt kell futtatni, és így magától a cookie-ba menti az adatokat.
- Tárhely állapot a megosztó oldal alján
- CSS fájlok egységesítve
- Csak szükséges portok engedélyezése
> - 80      Apache2
> - 443     Apache2
> - 8080    code-server
> - 9987    TS
> - 30033   TS Fájl és avatar átvitel
- Dark mode
> https://www.w3schools.com/howto/howto_js_toggle_dark_mode.asp
> https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/#os-level
- W3 validátorral megjavítva az aloldalak
> https://validator.w3.org/
- Adatbázis újrastruktúrálás, egy adatbázisra
> Mostmár csak hausz_megoszto van, de ezt később még át kell migrálni sima Hausz-ra
- Stílusok egyesítése aloldalakon
- Youtube letöltő és az általa használt C++ alapú programok törlése
> Elvault a program amire alapult a letöltő, és mivel a Google aktívan megakadályoz minden próbálkozást, ezért nincs elég időm mindig frissíteni
- TS fájlok áthelyezése a megosztóra "TS szerver" felhasználó alá
