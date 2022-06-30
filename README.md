# Hausz

Ez a repository tartalmazza a Hausz Kft weboldalának és egyéb szolgáltatásainak forráskódját, tartalmát, és dokumentációjat, illetve itt található minden olyan fájl ami a Hausz szolgáltatások üzemeltetéséhez szükséges.

### Haladás

* A tennivalók, a megtett lépések, illetve a megvalósított funkciók a [TODO.md](TODO.md) fájlban találhatóak

### Újítások

* A változtatásokat a [főoldalon](https://hausz.stream/) az újítások részen, és a git commitokban lehet követni

### Szolgáltatások

* [TeamSpeak 3 szerver](https://hausz.stream/teamspeak/) - [Dokumentáció](dokumentáció/teamspeak/leírás.txt)
* [Megosztó](https://hausz.stream/uploads/) - [Dokumentáció](dokumentáció/megosztó/leírás.txt)
* [Együttnéző (csak tesztelésre)](https://hausz.stream/egyuttnezo/) - [Dokumentáció](dokumentáció/együttnéző/leírás.txt)

### Jelenlegi szerver specifikációk, és használt szoftverek

* Hoszt: Amazon AWS
* Processzor: 1 mag - Intel(R) Xeon(R) CPU E5-2676 v3 @ 2.40GHz
* Memória: 1GB
* Tárhely: 30GB SSD
> 
* Operációs rendszer: Ubuntu 16.04
* Kiszolgáló: Apache2 + PHP
* Adatbázis: MySQL
* TeamSpeak 3 szerver
* Együttnéző backend: Node.js
* Fejlesztői környezet: [code-server](https://github.com/coder/code-server)