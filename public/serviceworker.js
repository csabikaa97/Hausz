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

    fetch("http://127.0.0.1:3000/save-subscription", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
    })

});

self.addEventListener("push", function(event) {
    console.log("[SW] Push event");
    console.log({event});
    var data = event.data.text();
    console.log("Push data: ", {data});
    self.registration.showNotification("teszt", {
        body: data,
    });
});