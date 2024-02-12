const express = require("express");
const app = express();
const webpush = require('web-push');
const cors = require("cors");

const port = 3000;
const vapidAdatok = require("/push_szerver/vapid_adatok.json");

webpush.setVapidDetails(
    vapidAdatok.email,
    vapidAdatok.publikus_kulcs,
    vapidAdatok.privat_kulcs
)

app.use(cors());
app.use(express.json());

app.get("/", (_, valasz) => {
    valasz.send("Web Push szerver!");
})

app.post("/ertesites_kuldese", (keres, valasz) => {
    let subscription_adat = keres.body.adatok;
    console.log({subscription_adat});
    let uzenet = keres.body.uzenet;
    console.log({uzenet});
    webpush.sendNotification(subscription_adat, uzenet);
    valasz.json({ "eredmeny": "ok", "valasz": "Üzenet sikeresen elküldve!" });
})

app.listen(port, () => {
    console.log(`A szerver elindult a http://127.0.0.1:${port} címen`);
})