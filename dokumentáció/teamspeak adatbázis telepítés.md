1. Futtatni kell a ```docker-compose start teamspeak_adatbazis``` paranccsal a TeamSpeak szerver MySQL adatbázisát

2. (Opcionális) Be kell tölteni az adatokat a korábbi szerverből: ```mysql -u root -p -h 172.20.128.14 < mentes.sql```

    Mentést Sqlite formátumból így lehet csinálni: ```sqlite3 ts3server.sqlitedb .dump > mentes.sql```

3. Futtatni kell a TeamSpeak 3 szerverhez csomagolt 'convert_mysql_to_mariadb.sql' fájlt az adatbázison

    ```mysql -u root -p -h 172.20.128.14 < convert_mysql_to_mariadb.sql```

4. Mostmár lehet a ```docker-compose up``` paranccsal normálisan indítani az adatbázist és a szervert egyszerre.