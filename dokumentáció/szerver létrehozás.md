# Teendők szerver példány létrehozásakor

## 

1.  Alapvető csomagok telepítése

    ```
    apt install git apache2 nodejs php mysql-server letsencrypt certbot python3-certbot-apache htop php-mysql libapache2-mod-xsendfile expect libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
    ```

2.  Portok nyitása szerveren / internet szolgáltató eszközén

<table>
    <tbody>
        <tr>
            <td>TCP</td>
            <td>UDP</td>
        </tr>
        <tr>
            <td>22, 80, 443, 8080, 8090, 9987, 30033</td>
            <td>9987, 30033</td>
        </tr>
    </tbody>
</table>

3.  Tűzfal kikapcsolása / konfigurálása
    ```
    ufw disable
    ```

4.  Fő mappa átmásolása éles szerverről scp-vel

    ```
    cd /var/www/

    rm -rf html
    
    scp -r <felhasználó>@hausz.stream:/var/www/html ./
    ```

5.  Certificate igénylése certbottal, és átmásolása priv mappába

    ```
    certbot --apache

    rm /var/ww/html/priv/*.pem

    cp /etc/letsencrypt/live/<domain>/* /var/www/html/priv/
    ```

6.  code-server telepítése

    ```
    curl -fsSL https://code-server.dev/install.sh | sh
    ```

7.  Szolgáltatások létrehozása doksi alapján: <a href="dokumentáció/linux%20szolgáltatás%20készítés/szolgáltatás%20készítés.md">szolgáltatás készítés.md</a>

8.  MySQL szerveren root user jelszavának megadása

    ```sql
    ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
    ```

9.  Éles szerveren adatbázis mentés készítése

    ```
    mysqldump --all-databases --single-transaction --quick --lock-tables=false > teljes_mentes.sql -u root -p
    ```

10. Új szerveren mentés visszaállítása

    ```sql
    CREATE DATABASE hausz_egyuttnezo;
    CREATE DATABASE hausz_megoszto;
    CREATE DATABASE hausz_ts;
    ```
    
    ```
    mysql -root -p hausz_egyuttnezo < full-backup.sql
    ```

11. "/etc/apache2/apache2.conf" fájlban a directoryhoz "AllowOverride All"-ra módosítás: Ez engedélyezi a .htaccess fájlok betöltését

12. Engedélyezni kell a header modult "a2enmod headers": Emiatt lehet .htaccess fájlokban "Header" parancsot használni

13. Telepíteni kell az együttnéző szerverhez használt 'ws' modult

    ```
    cd /var/www/html/egyuttnezo/

    npm install ws
    ```

14. Be kell csomagolni az összes összetett Javascript fájlt a Kiadás eszközzel

    ```
    cd /var/www/html/forras/

    ./osszes_kiadasa.sh
    ```

# Opcionális lépések

15. kiadás eszköz és osszes_kiadasa.sh script felvétele /usr/local/bin mappába

    [kiadás.md](dokumentáció/kiadás.md)

16. Cypress telepítése

    ```
    cd /var/www/html/teszteles/

    npm install -D cypress
    ```

2022.06.15 Teszt migrálás Ubuntu 22.04 környezetbe sikeres volt! Minden meglévő szolgáltatás működött.
2022.07.26 Következik áttérés docker-re, ezért ez a dokumentum irreleváns már