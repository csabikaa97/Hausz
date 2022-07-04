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
        <td><a href="https://hausz.stream/teamspeak/">TeamSpeak 3 szerver</a></td>
        <td>TeamSpeak 3 szerver szolgáltatás</td>
        <td>-</td>
        <td>-</td>
        <td><a href="dokumentáció/teamspeak/leírás.txt">leírás.txt</a></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/megoszto/">Megosztó</a></td>
        <td><a href="megoszto/feltoltes.php">feltoltes.php</a><br>megoszto/request.php</td>
        <td>megoszto/megoszto.js</td>
        <td>megoszto/feltoltes.html</td>
        <td><a href="dokumentáció/megosztó/leírás.txt">leírás.txt</a></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/egyuttnezo/">Együttnéző (csak tesztelésre)</a></td>
        <td>egyuttnezo/egyuttnezo.php</td>
        <td>-||-</td>
        <td>-||-</td>
        <td><a href="dokumentáció/együttnéző/leírás.txt">leírás.txt</a></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/include/regisztracio.html">Regisztráció</a></td>
        <td>include/regisztracio.php</td>
        <td>include/regisztracio.js</td>
        <td>include/regisztracio.html</td>
        <td></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/include/jelszo_valtoztatas.html">Jelszó változtatás</a></td>
        <td>include/jelszo_valtoztatas.php</td>
        <td>include/jelszo_valtoztatas.js</td>
        <td>include/jelszo_valtoztatas.html</td>
        <td></td>
    </tr>
    <tr>
        <td><a href="https://hausz.stream/admin/">Rendszergazda felület</a></td>
        <td>admin/admin.php</td>
        <td>admin/admin.js</td>
        <td>admin/admin.html</td>
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