## 👤 Felhasználói érdekű teendő

* Együttnéző
	* Hangerő állításhoz, és megtartáshoz tesztelés script
	* Videó link kérése közvetlen URL-el, lejátszó betöltése nélkül
	* YouTube natív lejátszóra hasonlító videó kezelés UI készítése (folyamatban)
	* rossz link beírása esetén hiba dobása
* Megosztó
	* törlés / egyéb cselekvés után filter megtartása
	* fájl akciók megjelenítése az előnézet alatt is
	* titkosítási és feloldási folyamat áthelyezése a kliensre: https://stackoverflow.com/questions/40680431/how-can-i-encrypt-decrypt-arbitrary-binary-files-using-javascript-in-the-browser
	* feltöltendő fájl paramétereit egy előugró ablakban lehessen megadni
	* törölt fájlok kukába helyezése végleges törlés helyett
	* Előnézet átalakítása
		* középen legyen
		* A lehető legtöbb helyet kitöltse
		* Látszódjanak rajta a fájlhoz tartozó akciók
	* feltöltés töltés animáció
	* nagy fájl esetén letöltés felajánlása hibára futás helyett
* TeamSpeak infó
	* Online felhasználók jelenlegi csatornáinak neveit mutassa simán név helyett
* Globális
	* Belépés töltés, és eredmény animáció
	* szerveren swap növelése 4 GB-ra
	* .md fájlokban linkek javítása
	* Megjelenő név és felhasználói név elkülönítése
		* felhasználó aktiválásnál kitöltés
		* együttnézőn új oszlop használata
		* teamspeak csatlakozás linknél új oszlop használata
	* Új üzenet animáció
	* Profil kezelő oldal
	* Beléptető rendszer módosítása mobilon: jobb-felső sarokban legyen, és jelenjen meg úgy mint a hausz oldalak gomb
	* Belépéshez használt felhasználónevek tárolása hash-ként, és sehol ne jelenjen meg

## 👨🏻‍💻 Fejlesztői érdekű teendó

* Automata tesztek elkészítése az összes oldalhoz:
	* [ ] megosztó
	* [ ] teamspeak
	* [ ] admin oldal
	* [ ] minecraft
	* [ ] meghivo
* API tesztekhez szoftver keresése, és tesztek írása
* Mentés visszaállításához használható scriptek automatikus létrehozása mentés készítésekor
* szerver felkészítése arra a lehetőségre hogy minden táblázat üres
* Együttnéző
	* websocket kommunikáció átírása JSON formátumra
		* felhasználók: ok: felhasznalok: 0
* Autómata tesztelés scriptek megírása
	* együttnéző
		* tekerés
		* megállítás / lejátszás
	* megosztó
	* teamspeak infó
* Dokumentációk írása az adott oldalakhoz, és fordítás Magyar nyelvre (potenciális reformatolás és takarítás is belefér)
* Saját hibaoldalak írása: 500, 404, stb...
* Backend cseréje Apache-ról saját fejlesztésű Node.js backend-re
* Adatbázisban belépés sessionöket kezelni, és kiléptetni minden felhasználót jelszó változtatásnál [guru99.com cookie mentés leírás](https://www.guru99.com/cookies-and-sessions.html)
* PHP GET és POST kérések használatának átgondolása

## 🧮 Adatszerkezeti és strukturális változtatások, egyszerűítések

* Régi style.css kivezetése
	* egyuttnezo
	* megoszto
* style="" egyszerűsítés ahol lehetséges, ismétlődő minták elnevezése és cseréje új class-ra
* pseudo elements ::before használásnak lehetőségét felmérni
* GraphQL-szerű php lekérdezési forma. Egy PHP fájl amin keresztül le lehet kérdezni bármit az adatbázisból
	* GET és POST metódusokkal lehet kiválasztani a releváns mezőket
	* Egységes JSON választ ad mindenre
		* OK:	{
					"eredmeny": "ok", 
					"valasz": {
						"kert-valtozo-1": 1,
						"kert-valtozo-2": 2
					}
				}
		* HIBA:	{
					"eredmeny": "hiba",
					"valasz": "Hiba leírása, potenciális javítás tipp"
				}
		* RESZLEGES:	{
							"eredmeny": "részleges",
							"valasz": {
								"sikeres-valtozo-1": 1,
								"sikeres-valtozo-2": 2
							}
						}
* Ötlet: JS szint-[0-9] classok automatikus osztása onload után DOM elhelyezkedés alapján ahol még nincs


## ✅ Implementált tennivalók

* Opcionális beállítás: "Fájlok letöltésének engedélyezése csak tagok számára"
* Kiadas.js: Fájlok compileolásának mellőzése ha létezik friss fájl (checksum ellenőrzéssel, minden forrásfájlhoz)
* Typescript használata minden oldalhoz
* Lidl pizza tier list kivezetése
* Együttnéző iframe, player, YouTube api, és egyéb komponensek betöltési sorrendjének javítása
* Megosztó link módosítása /uploads-ról /megoszto-ra .htaccess átirányítással
* /uploads mappa kivezetése Jul. 28 után
* .htaccess és .gitignore fájlok újraírása a mappastruktúra változás miatt
* Teamspeak szerver dockeresítése
* "megosztó?fajlok=1" -> ok: fajlok_szama: 0
* megosztón "jelenleg nincs feltöltve fájl" sor keresés után megjelenik
* Teamspeak szerver dockeresítése
	* https://noirth.com/threads/teamspeak-how-to-transfer-sqlite-to-mariadb.7784/
* Docker-kész az egész projekt: docker-compose build & up a főkönyvtárban minden modul futtatásához
* Új mappastruktúra:
	* public: A HTTPS kiszolgáló által közölt fájlok
	* forras: Az oldalak forráskódjai, és egyéb forráskódok
	* dokumentáció: -||-
	* priv: infrastruktúra egyedi fájljai, pl teamspeak szerver, és a vscode adatok is ott vannak
	* admin: mentések
	* adatbazis: Táblázatok elkészítéséhez mysql dump scriptek
* Általános: max 72 karakter hosszú jelszó
* Együttnéző hangerő eltárolása [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)-ben
* PHP válaszok JSON formátumra váltása
	* főoldal
	* admin
	* megosztó
	* regisztráció
	* jelszó változtatás
	* teamspeak
* Autómata tesztelés scriptek megírása
	* együttnéző
		* új videó
		* online felhasználók listában saját név változik
	* regisztráció
	* főoldal
	* beléptető rendszer (bejelentkezés / kilépés)
	* jelszó változtatás
* Megjelenő név és felhasználói név elkülönítése
	* adatbázisban kész az oszlop
	* Megosztón átállítva a forrás megjelenő fájloknál
* Előtérbe helyezés függvény
* Bonyolult JS részek átírása Template literal-okkal
* Megosztó Priváttá / publikussá tétel gomb
* Változó lifecycle javítása minden fájlban: let, var, const
* Új mappastruktúra kialakítása közös kódokhoz
	* komponensek mappa
	* külön mappa jelszó változtatásnak és regisztrációnak
* JS oldalak kijavítása Typescript compiler üzenetei alapján
	- [x] megosztó
	- [x] teamspeak infó
	- [x] együttnéző
* Minden txt fájl átírása, és formázása .md kiterjesztésre
* /index fájlok átrakása forras/komponensek mappába
* index.js áthelyezése /index mappába
* .gitignore fájlok egyesítése gyökérmappában
* [Saját bundler létrehozása](dokumentáció/kiadás.md)
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
* Néhány fájl eltakarása keresőmotor indexelés elől (pl: public/komponensek/topbar.html)
	* A .htaccess fájlokban "Header add" paranccsal hozzáadva az "X-Robots-Tag: noindex" header minden eltűntetendő fájlhoz
* Migrálás tesztelése új Ubuntu 22.04 server rendszerre: Siker! -> [Migráció eredmény](dokumentáció/szerver%20létrehozás.md)
* Git repo megtisztítva a jelszavaktól és tanúsítványoktól: [GitHub leírás](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
* TeamSpeak, együttnéző szerver és code-serverek bootolás utáni automatikus indítása: [Szolgáltatás készítés leírás](dokumentáció/linux%20szolgáltatás%20készítés/szolgáltatás%20készítés.md)
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
