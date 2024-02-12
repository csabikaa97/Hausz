const express = require("express");
const webpush = require('web-push');
const cors = require("cors");


const port = 3000;
const vapidAdatok = require("./vapid_adatok.json");

webpush.setVapidDetails(
    vapidAdatok.email,
    vapidAdatok.publikus_kulcs,
    vapidAdatok.privat_kulcs
)
    
const app = express();
        
app.use(cors());
app.use(express.json());

app.get("/", (_, valasz) => {
    valasz.send("Web Push szerver!");
})

app.post("/ertesites_kuldese", async (keres, valasz) => {
    let csomag = {
        uzenet: keres.body.uzenet,
        cim: keres.body.cim,
    }

    try {
        await webpush.sendNotification(keres.body.adatok, JSON.stringify(csomag));
        valasz.json({ "eredmeny": "ok", "valasz": "Az értesítés elküldve" });
    }
    catch (hiba) {
        valasz.json({ "eredmeny": "hiba", "valasz": "Belső WebPush hiba" });
    }
})

app.listen(port, () => {
    console.log(`A szerver elindult a http://127.0.0.1:${port} címen`);
})