var szamlalo = new Date("May 6, 2019 8:00:00").getTime();

function ido_frissitese() {
    most = new Date().getTime();
    var lesz = szamlalo - most;

    var nap = Math.floor(lesz / (1000 * 60 * 60 * 24));
    var ora = Math.floor((lesz % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var perc = Math.floor((lesz % (1000 * 60 * 60)) / (1000 * 60));
    var masodperc = Math.floor((lesz % (1000 * 60)) / 1000);

    obj("nap").innerHTML = nap;
    obj("ora").innerHTML = ora;
    obj("perc").innerHTML = perc;
    obj("masodperc").innerHTML = masodperc;
}

var x = setInterval( () => { ido_frissitese(); }, 1000);