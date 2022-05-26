# Hausz

Ez a repository tartalmazza a Hausz Kft weboldalának forráskódját és tartalmát.

#### Tennivalók:

- Adatbázisban belépés sessionöket kezelni, és kiléptetni minden felhasználót jelszó változtatásnál
- Hausz youtube együttnéző (https://developers.google.com/youtube/iframe_api_reference)
    0. Prerequisite:
        - Belépés standardizálása és kiterjesztése együttnézőre
    1. Adatok szinkronizálása felhasználók között
    
    - Hangerő mentése felhasználónak
    - 

#### Implementált:

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
> 80      Apache2
> 443     Apache2
> 8080    code-server
> 9987    TS
> 30033   TS Fájl és avatar átvitel
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
