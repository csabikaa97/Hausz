# Teendők szerver példány létrehozásakor

2022.06.15 Teszt migrálás Ubuntu 22.04 környezetbe sikeres volt! Minden meglévő szolgáltatás működött.
2022.07.27 Teszt migrálás Ubuntu 22.04 környezetbe, Dockert használva. 

1.  Szükséges csomagok telepítése

```
apt update

apt install git docker.io docker-compose git
```

2.  Repository letöltése

```
cd /var

git clone https://github.com/csabikaa97/hausz

mv hausz www
```

3. Certificate beszerzése, és elhelyezése a ```priv``` mappában

```
openssl req -x509 -newkey rsa:4096 -keyout privkey.pem -out cert.pem -sha256 -days 365

cert.pem

chain.pem

fullchain.pem

privkey.pem
```

4.  Adatbázisok telepítése

```
>>> docker-compose build adatbazis teamspeak_adatbazis

>>> docker-compose start adatbazis teamspeak_adatbazis

>>> docker exec -it teamspeak_adatbazis /bin/bash /telepites/telepites.sh

>>> docker exec -it adatbazis /bin/bash /telepites/telepites.sh

>>> docker-compose stop adatbazis teamspeak_adatbazis
```

5. JS fájlok csomagolása: 
```
>>> docker-compose build csomagolas

>>> docker-compose up csomagolas
```

6. JS fájlok kiadása: 
```
>>> docker-compose build kiadas

>>> docker-compose up kiadas
```

7. Docker futtatása

```
docker-compose build

docker-compose start
```

7. A teamspeak szerver kimenetében meg kell keresi a ServerQuery kulcsot, és ki kell cserélni a következő fájlokban:

- create_token.sh
- list_clients.sh