# Hausz

Ez a repository tartalmazza a Hausz Kft weboldalának és egyéb szolgáltatásainak forráskódját, tartalmát, és dokumentációjat, illetve itt található minden olyan fájl ami a Hausz szolgáltatások üzemeltetéséhez szükséges.

### Haladás

* A tennivalók, a megtett lépések, illetve a megvalósított funkciók a [TODO.md](TODO.md) fájlban találhatóak

### Újítások

* A változtatásokat a [főoldalon](https://hausz.stream/) az újítások részen, és a git commitokban lehet követni

### Szolgáltatások

<table>
    <tr>
        <th></th>
        <th>Backend</th>
        <th>Bridge</th>
        <th>Frontend</th>
        <th>Dokumentáció</th>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/teamspeak/">Főoldal</a></td>
        <td></td>
        <td><a href="index.js">index.js</a></td>
        <td><a href="index.html">index.html</a></td>
        <td></td>
    </tr>
    <tr>
        <td>TeamSpeak 3 szerver</td>
        <td>ts3server</td>
        <td></td>
        <td></td>
        <td><a href="dokumentáció/teamspeak/leírás.txt">leírás.txt</a></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/teamspeak/">TeamSpeak szerver infó</a></td>
        <td><a href="megoszto/teamspeak.php">teamspeak.php</a></td>
        <td><a href="megoszto/teamspeak.js">teamspeak.js</a></td>
        <td><a href="megoszto/teamspeak.html">teamspeak.html</a></td>
        <td></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/megoszto/">Megosztó</a></td>
        <td><a href="megoszto/megoszto.php">megoszto.php</a></td>
        <td><a href="megoszto/megoszto.js">megoszto.js</a></td>
        <td><a href="megoszto/feltoltes.html">feltoltes.html</a></td>
        <td><a href="dokumentáció/megosztó/leírás.txt">leírás.txt</a></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/egyuttnezo/">Együttnéző (csak tesztelésre)</a></td>
        <td><a href="egyuttnezo/egyuttnezo_szerver.js">egyuttnezo_szerver.js<br>(Node.js websocket)</a></td>
        <td><a href="egyuttnezo/egyuttnezo.js">egyuttnezo.js</a></td>
        <td><a href="egyuttnezo/egyuttnezo.html">egyuttnezo.html</a></td>
        <td><a href="dokumentáció/együttnéző/leírás.txt">leírás.txt</a></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/include/regisztracio.html">Regisztráció</a></td>
        <td><a href="include/regisztracio.php">regisztracio.php</a></td>
        <td><a href="include/regisztracio.js">regisztracio.js</a></td>
        <td><a href="include/regisztracio.html">regisztracio.html</a></td>
        <td></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/include/jelszo_valtoztatas.html">Jelszó változtatás</a></td>
        <td><a href="include/jelszo_valtoztatas.php">jelszo_valtoztatas.php</a></td>
        <td><a href="include/jelszo_valtoztatas.js">jelszo_valtoztatas.js</a></td>
        <td><a href="include/jelszo_valtoztatas.html">jelszo_valtoztatas.html</a></td>
        <td></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/admin/">Rendszergazda felület</a></td>
        <td><a href="admin/admin.php">admin.php</a></td>
        <td><a href="admin/admin.js">admin.js</a></td>
        <td><a href="admin/admin.html">admin.html</a></td>
        <td></td>
    </tr>
</table>

### Komponensek

<table>
    <tr>
        <th></th>
        <th>Backend</th>
        <th>Bridge</th>
        <th>Frontend</th>
        <th>Dokumentáció</th>
    </tr>
    <tr>
        <td>Beléptető rendszer</td>
        <td><a href="include/belepteto_rendszer.php">belepteto_rendszer.php</a></td>
        <td><a href="include/belepteto_rendszer.js">belepteto_rendszer.js</a></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>Adatbázis segítő (PHP)</td>
        <td><a href="include/adatbazis.php">adatbazis.php</a></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>Alap függvények (PHP)</td>
        <td><a href="include/alap_fuggvenyek.php">alap_fuggvenyek.php</a></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>Alap függvények (JS)</td>
        <td></td>
        <td><a href="include/alap_fuggvenyek.js">alap_fuggvenyek.js</a></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>Topbar betöltő (JS)</td>
        <td></td>
        <td><a href="include/topbar.js">topbar.js</a></td>
        <td><a href="index/topbar.html">topbar.html</a></td>
        <td></td>
    </tr>
</table>

### Jelenlegi szerver specifikációk, és használt szoftverek

* Hoszt: Amazon AWS
* Processzor: 1 mag - Intel(R) Xeon(R) CPU E5-2676 v3 @ 2.40GHz
    * [GeekBench Single: 627 Multi: 2315](https://browser.geekbench.com/processors/intel-xeon-e5-2676-v3)
* Memória: 1GB
* Tárhely: 30GB SSD
> 
* Operációs rendszer: Ubuntu 16.04
* Kiszolgáló: Apache2 + PHP
* Adatbázis: MySQL
* TeamSpeak 3 szerver
* Együttnéző backend: Node.js
* Fejlesztői környezet: [code-server](https://github.com/coder/code-server)