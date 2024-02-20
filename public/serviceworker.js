function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
    var rawData = atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

self.addEventListener("install", function(event) {
    console.log("[SW] Install event");
});

self.addEventListener("activate", async (e) => {
    console.log("[SW] Activate event");
    const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array("BH6UJLBLsbGMLV-DuXF7CYc_VzY3hYbU8Wj0JnnkJdOBAPFmq9YXdvbZf68JJj4hq-4UUYYFh9A3-UHbQNBEAGs"),
    });

    console.log("[SW] subscription:");
    console.log({subscription});
    console.log(JSON.stringify(subscription));
    let form_adatok = new FormData();
    form_adatok.append("adatok", JSON.stringify(subscription));
    let megjegyzes = navigator.platform + " " + navigator.userAgent;
    form_adatok.append("megjegyzes", megjegyzes);

    fetch('beallitasok.🦀?push_ertesites_adatok_mentese', {
        method: "POST",
        body: form_adatok,
    });
});

self.addEventListener("push", function(event) {
    console.log("[SW] Push event");
    console.log({event});
    var data = JSON.parse(event.data.text());
    console.log("Push data: ", {data});
    self.registration.showNotification(data.cim, {
        body: data.uzenet,
        icon: "/favicon.png"
    });
});