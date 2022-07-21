# Autómatizált tesztelés

Az autómatizált end-to-end tesztek jelenleg a következő komponensek / oldalak ellenőrzésére vannak megírva:
* együttnéző
* főoldal
* regisztráció

* beléptető rendszer (még csak az együttnézőn és a főoldalon, de tervben van az összes oldal ellenőrzése amin implementálva van)

## Szükséges szoftverek

[Cypress](https://cypress.io)

```npm install -D cypress```

A Cypress által használt előfeltételek:

```apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb```

## Használat

Asztali környezetben ezzel a paranccsal lehet megnyitni a Cypress felületet:

```npx cypress open```

Terminál környezetben ezzel a paranccsal lehet a meglévő teszteket lefuttatni:

```npx cypress run```

A ```--browser``` kapcsolóval lehet böngészőt váltani:

```npx cypress run --browser chrome```

Ezen a repositoryn a cél böngésző a Chrome és a Safari (utóbbi nem támogatott a Cypress által, de csak olyan lehetőségek vannak kihasználva, amik mindkettőben léteznek)

    A használható böngészők platformtól függően mások lehetnek!