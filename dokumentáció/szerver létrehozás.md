# Teendők szerver példány létrehozásakor

2022.06.15 Teszt migrálás Ubuntu 22.04 környezetbe sikeres volt! Minden meglévő szolgáltatás működött.
2022.07.27 Teszt migrálás Ubuntu 22.04 környezetbe, Dockert használva. 

1.  Szükséges csomagok telepítése

```
apt update

apt install git docker.io docker-compose letsencrypt certbot python3-certbot-apache
```

2.  Repository letöltése

```
cd /var

git clone https://github.com/csabikaa97/hausz

mv hausz www
```

3. Certificate beszerzése

```
mkdir /var/www/priv

cd /var/www/priv

certbot --apache --domains <domain ide>

cp /etc/letsencrypt/live/<domain ide>/* /var/www/priv/
cp /etc/letsencrypt/live/<domain ide>/* /var/www/public/
```

4. code-server telepítése

```
curl -fsSL https://code-server.dev/install.sh | sh
```

5.  Adatbázisok telepítése

```
>>> docker-compose build adatbazis teamspeak-adatbazis

>>> docker container ls

CONTAINER ID   IMAGE                     COMMAND                  CREATED         STATUS         PORTS                                                  NAMES
0241cef9b51c   www_adatbazis             "docker-entrypoint.s…"   5 minutes ago   Up 5 minutes   0.0.0.0:3306->3306/tcp, :::3306->3306/tcp, 33060/tcp   adatbazis
d0055c6ac5f1   www_teamspeak-adatbazis   "docker-entrypoint.s…"   5 minutes ago   Up 5 minutes   33060/tcp, 0.0.0.0:3307->3306/tcp, :::3307->3306/tcp   teamspeak-adatbazis

>>> docker exec -it <adatbázis container ID ide> /bin/bash

bash-4.4# >>> /telepites/telepites.sh

bash-4.4# >>> exit

>>> docker exec -it <teamspeak adatbázis container ID ide> /bin/bash

bash-4.4# >>> /telepites/telepites.sh

bash-4.4# >>> exit
```

6. JS fájlok kiadása: ```/var/www/forras/osszes_kiadasa.sh```

7. Docker futtatása

```
docker-compose build

docker-compose up
```