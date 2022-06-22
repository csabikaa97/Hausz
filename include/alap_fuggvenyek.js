function szinkron_keres(fuggveny, hivatkozas, parameterek) {
    if(hivatkozas == undefined) {
        return false;
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        fuggveny(this.responseText);
    }
    if (parameterek == undefined) {
        xhttp.open("GET", hivatkozas);
        xhttp.send();
    } else {
        xhttp.open("POST", hivatkozas);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.send(parameterek);
    }
}