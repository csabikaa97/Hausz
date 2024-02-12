const express = require("express");
const app = express();
const webpush = require('web-push');
const cors = require("cors")

const port = 3000;
const vapidAdatok = require("./vapid_adatok.json");
const subscription_adatok = [];

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

app.post("/save-subscription", (keres, valasz) => {
    subscription_adatok.push(keres.body);
    valasz.json({ "eredmeny": "ok", "valasz": "Adatok sikeresen elmentve" })
    console.log("Új adatok elmentve: ", subscription_adatok[0]);
})

app.get("/send-notification", (_, valasz) => {
    webpush.sendNotification(subscription_adatok[0], "Teszt üzenet a push szolgáltatásból!");
    valasz.json({ "eredmeny": "ok", "valasz": "Üzenet sikeresen elküldve!" });
})

app.listen(port, () => {
    console.log(`A szerver elindult a http://127.0.0.1:${port} címen`);
})