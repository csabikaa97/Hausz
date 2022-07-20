topbar_betoltese();
belepteto_rendszer_beallitas();

const szamlalo = new Date("May 6, 2019 8:00:00").getTime();

function ido_frissitese() {
    let most = new Date().getTime();
    let kulonbseg = szamlalo - most;

    let nap = Math.floor(kulonbseg / (1000 * 60 * 60 * 24));
    let ora = Math.floor((kulonbseg % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let perc = Math.floor((kulonbseg % (1000 * 60 * 60)) / (1000 * 60));
    let masodperc = Math.floor((kulonbseg % (1000 * 60)) / 1000);

    obj("nap").innerHTML = nap;
    obj("ora").innerHTML = ora;
    obj("perc").innerHTML = perc;
    obj("masodperc").innerHTML = masodperc;
}

var frissites = setInterval( ido_frissitese(), 1000);