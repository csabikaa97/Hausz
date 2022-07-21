# Kiadás - Javascript csomagoló

Ezzel az eszközzel lehet összecsomagolni külön lévő Javascript fájlokat

## Rendszerhez hozzáadás

    ```
    ln -s /var/www/html/forras/kiadas.js /usr/local/bin/kiadas.js
    
    ln -s /var/www/html/forras/osszes_kiadasa.sh /usr/local/bin/osszes_kiadasa.sh
    ```

## Használat

    kiadas.js [--be] < > --ki < > [--tomorites]
                      ^        ^
                      |        |
                      |        +----> kimeneti fájl elérési útja 
                      |
                      +-------------> becsomagolandó fájlok elérési útjai szóközzel elválasztva

    --tomorites     Eltávolítja a kimeneti fájlból az új sorokat, szóközöket, és egyéb felesleges karaktereket hely spórolás miatt