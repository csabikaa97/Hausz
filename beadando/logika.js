window.addEventListener('load', init);

var nehezsegplusz = 0;
var JATEKMODXDD = 0;
var jatekosokpontjai = [];
var jatekosszam = 1;

function init() {
    document.querySelector('#halado').style.backgroundColor = "white";
    document.querySelector('#kezdo').style.backgroundColor = "gray";
    document.querySelector('#gyakorlas').style.backgroundColor = "gray";
    document.querySelector('#kezdesJatekszabalyGomb').onclick = kezdesJatekszabalyGombAction;
    document.querySelector('#kezdesJatekszabalyBezarGomb').onclick = kezdesJatekszabalyBezarGombAction;
    document.querySelector('#kezdesBeallitasokGomb').onclick = kezdesBeallitasokGombAction;
    document.querySelector('#kezdesBeallitasokBezarGomb').onclick = kezdesBeallitasokBezarGombAction;
    document.querySelector('#kezdesBeallitasokGomb').onclick = kezdesBeallitasokGombAction;
    document.querySelector('#jatekBezargomb').onclick = jatekBezargombAction;
    document.querySelector('#plusz').onclick = pluszaction;
    document.querySelector('#minusz').onclick = minuszaction;
    document.querySelector('#kezdesJatekinditas').onclick = inditasnemreal;
    document.querySelector('#kezdo').onclick = kezdo;
    document.querySelector('#halado').onclick = halado;
    document.querySelector('#gyakorlas').onclick = gyakorlas;
    document.querySelector('#verseny').onclick = verseny;
}

function inditasnemreal() {
    jatekosokpontjai = [];
    jatekosszam = parseInt(document.querySelector('#jatekosokszama').innerHTML);
    if( JATEKMODXDD == 0 ) {
        jatekosszam = 1;
    }
    inditas();
}

function kezdo() {
    document.querySelector('#halado').style.backgroundColor = "white";
    document.querySelector('#kezdo').style.backgroundColor = "gray";
    nehezsegplusz = 0;
}

function halado() {
    document.querySelector('#halado').style.backgroundColor = "gray";
    document.querySelector('#kezdo').style.backgroundColor = "white";
    nehezsegplusz = 1;
}

function verseny() {
    document.querySelector('#gyakorlas').style.backgroundColor = "white";
    document.querySelector('#verseny').style.backgroundColor = "gray";
    JATEKMODXDD = 1;
}

function gyakorlas() {
    document.querySelector('#gyakorlas').style.backgroundColor = "gray";
    document.querySelector('#verseny').style.backgroundColor = "white";
    JATEKMODXDD = 0;
}

var megvannakmaranevek = false;

function kezdesJatekszabalyGombAction(event) { document.querySelector('#kezdesJatekszabaly').hidden = false; }
function kezdesJatekszabalyBezarGombAction(event) { document.querySelector('#kezdesJatekszabaly').hidden = true; }
function kezdesBeallitasokGombAction(event) { 
    document.querySelector('#kezdesBeallitasok').hidden = false;
    if( !megvannakmaranevek ) {
        document.querySelector('#nemtudomilegyenennekanevemertannyiraelvesztemmarasokkodban').innerHTML = "";
        document.querySelector('#nemtudomilegyenennekanevemertannyiraelvesztemmarasokkodban').style.position = "relative";
        document.querySelector('#nemtudomilegyenennekanevemertannyiraelvesztemmarasokkodban').style.margin = "10px";
        megvannakmaranevek = true;
        for(var i=0; i<parseInt(document.querySelector('#jatekosokszama').innerHTML); i++) {
            document.querySelector('#nemtudomilegyenennekanevemertannyiraelvesztemmarasokkodban').innerHTML += '<p>' + (i+1) + ': <input id="jatekosnev' + (i+1) + '"type="text" value="játékos' + (i+1) + '" /></p>';
        }
    }
}
function kezdesBeallitasokBezarGombAction(event) { document.querySelector('#kezdesBeallitasok').hidden = true; }
function jatekBezargombAction() {
    document.querySelector('#kezdes').hidden = false;
    document.querySelector('#jatek').hidden = true;
}
function pluszaction() {
    if( document.querySelector('#jatekosokszama').innerHTML == "10" ) {
        alert("Maximum 10 játékos játszhatja a játékot egyszerre.");
    } else {
        document.querySelector('#jatekosokszama').innerHTML = (document.querySelector('#jatekosokszama').innerHTML)*1+1;
    }
}

function minuszaction() {
    if( document.querySelector('#jatekosokszama').innerHTML == "1" ) {
        alert("Minimum egy játékosra van szükség.")
    } else {
        document.querySelector('#jatekosokszama').innerHTML = (document.querySelector('#jatekosokszama').innerHTML)-1;
    }
}

var megjelolt = 0;
var pontszam = 0;
var megjeloltNevek = [];
var aktivlapokszama;

function joeigy() {
    var kartyak = [];
    for(var i=0; i<12; i++) {
        var string = document.querySelector('#kartya' + parseInt(i+1)).src;
        var neve = ""
        var realneve = ""
        for(var j=0; j<8; j++) {
            neve = string[string.length-1-j] + neve
        }

        for(var j=0; j<4; j++) {
            realneve = realneve + neve[j];
        }
        kartyak.push(realneve);
    }

    var teszthalmaz;
    
    for(var i=0; i<12; i++) {
        for(var j=0; j<12; j++) {
            for(var k=0; k<12; k++) {
                teszthalmaz = [];
                teszthalmaz.push( kartyak[i] );
                teszthalmaz.push( kartyak[j] );
                teszthalmaz.push( kartyak[k] );
                for(var l=0; l<9; l++) {
                    teszthalmaz.push("semmi");
                }
                //console.log("Teszthalmaz: " + teszthalmaz);
                if( joe(teszthalmaz) ) {
                    console.log("JOEEEEEEE + " + teszthalmaz);
                    return true;
                } 
            }
        }
    }

    return false;
}

var ennelajatekosnaljarunk = 0;
var mostanijatekos = "";

function inditas() {
    if( !megvannakmaranevek ) {
        kezdesBeallitasokGombAction();
        kezdesBeallitasokBezarGombAction();
    }
    
    var mostaniemberkeneve = document.querySelector('#jatekosnev' + (ennelajatekosnaljarunk+1) ).value;
    mostanijatekos = mostaniemberkeneve;
    if( jatekosszam > 1 ) {
        alert( '"' + mostaniemberkeneve + '" következik!' );
    }

    aktivlapokszama = 12;
    megjeloltNevek = [];
    pontszam = 0;
    megjelolt = 0;

    document.querySelector('#kezdes').hidden = true;
    document.querySelector('#jatek').hidden = false;

    do {
        kartyalapfajlnevek = [];

        console.log(kartyalapfajlnevek);

        var ennyi = 0;
        for(var szam=0; szam<3; szam++) {
            for(var forma=0; forma<3; forma++) {
                var formas;
                if( forma == 0 ) { formas = 'D'; }
                if( forma == 1 ) { formas = 'P'; }
                if( forma == 2 ) { formas = 'S'; }
                for(var szin=0; szin<3; szin++) {
                    var szins;
                    if( szin == 0 ) { szins = 'g'; }
                    if( szin == 1 ) { szins = 'p'; }
                    if( szin == 2 ) { szins = 'r'; }
                    if( nehezsegplusz == 0 ) {
                        kartyalapfajlnevek.push("ikonok/" + (szam+1) + 'S' + szins + formas + ".svg");
                        console.log( "ikonok/" + (szam+1) + 'S' + szins + formas + ".svg" );
                    } else {
                        for(var fill=0; fill<3; fill++) {
                            var fills;
                            if( fill == 0 ) { fills = 'H'; }
                            if( fill == 1 ) { fills = 'O'; }
                            if( fill == 2 ) { fills = 'S'; }
                            kartyalapfajlnevek.push("ikonok/" + (szam+1) + fills + szins + formas + ".svg");
                        }
                    }
                }
            }
        }

        console.log("itt kell: ");
        console.log(kartyalapfajlnevek);

        document.querySelector('#jatek').innerHTML = '</h1><button id="jatekBezargomb" onclick="jatekBezargombAction()" class="bezargomb">X</button><center><h1>Játék</h1></center>';
        document.querySelector('#jatek').innerHTML += '<h2>Hátralévő idő: <font id="progressszoveg"></font> mp</h2><br><h2>Pontszám: <font id="pontszamdisplay">0</font>';
        
        var kartyaid = 1;

        for(var sor = 0; sor<3; sor++) {
            for(var elem = 0; elem<4; elem++) {
                var szam = parseInt(Math.random()*1000000000) % kartyalapfajlnevek.length;
                var nev = 'kartya' + kartyaid;
                document.querySelector('#jatek').innerHTML += '<img id="' + nev + '" width="15%" alt="' + kartyaid + '" src="' + kartyalapfajlnevek[szam] + '" />';
                kartyalapfajlnevek[szam] = kartyalapfajlnevek[ kartyalapfajlnevek.length-1 ];
                kartyalapfajlnevek.pop();
                kartyaid++;
            }
            document.querySelector('#jatek').innerHTML += "<br>\n";
        }

        for(var i=0; i<kartyalapfajlnevek.length; i++) {
            megjeloltNevek[i] = "semmi";
        }
    } while( !joeigy() )

    var kartyaid = 1;
    for(var sor = 0; sor<3; sor++) {
        for(var elem = 0; elem<4; elem++) {
            var nev = 'kartya' + kartyaid;
            document.getElementById(nev).onclick = kartyakatt;
            kartyaid++;
        }
    }

    for(var i=1; i<=12; i++) {
        document.getElementById( 'kartya' + i ).style.opacity = 1.0;
    }

    kezdes = new Date().getTime();
    id = setInterval(progress,100);
}

var kezdes;
var id;

var ENNYIIDODVANXDD = 20.0;

function progress() {
    //document.querySelector('#ora').innerHTML = new Date().getTime();
    document.querySelector('#progressszoveg').innerHTML = parseInt(ENNYIIDODVANXDD - (parseInt( ( new Date().getTime() ) - kezdes ) / 1000));
    //console.log("megy a minusz: " + parseInt( ( new Date().getTime() ) - kezdes ));
    if( (parseInt( ( new Date().getTime() ) - kezdes ) / 1000) >= ENNYIIDODVANXDD ) {
        clearInterval(id);
        alert("Lejart az időd. Pontszámod: " + pontszam);
        megjelolt=0;
        if( ennelajatekosnaljarunk+1 == jatekosszam ) {
            eredmenyhirdetes();
            jatekBezargombAction();
        } else {
            ennelajatekosnaljarunk++;
            inditas();
        }
        jatekosokpontjai.push(pontszam);
    }
}

function joe(adat) {
    var ezekvannak = [];
    for(var i=0; i<12; i++) {
        if( (adat[i][0] >= '1' && adat[i][0] <= '3' ) ) {
            ezekvannak.push(adat[i]);
            //console.log("Jelölt: " + adat[i]);
        }
    }

    if( ezekvannak.length != 3 ){
        return false;
    } 

    var valamixddd = ezekvannak;

    console.log(valamixddd);

    var ennyiegyezes = 0;
    //console.log("Ezekvannak length: " + ezekvannak.length);
    for(var k=0; k<4; k++) {
        if( nehezsegplusz == 0 && k == 1 ) {
            k++;
        }
        if(ezekvannak[0][k] == ezekvannak[1][k] && ezekvannak[1][k] == ezekvannak[2][k]) {
            ennyiegyezes++;
        }
    }

    var ennyidistinct = 0;
    for(var k=0; k<4; k++) {
        if( nehezsegplusz == 0 && k == 1 ) {
            k++;
        }
        if( ezekvannak[0][k] != ezekvannak[1][k] && ezekvannak[1][k] != ezekvannak[2][k] && ezekvannak[0][k] != ezekvannak[2][k] ) {
            ennyidistinct++;
        }
    }

    //console.log("Egyezesek szama: "+ennyiegyezes);

    if( (ennyiegyezes == 0 && ennyidistinct == 3 + nehezsegplusz) || (ennyiegyezes == 2+nehezsegplusz && ennyidistinct == 1 ) ) {
        return true;
    } else {
        return false;
    }
}

function kartyakatt(event) {
    console.log(event);
    console.log( event.srcElement.src );
    var valami = event.srcElement.src;
    var fajlnev = "";

    for(var i=5; i<9; i++) {
        fajlnev = valami[valami.length - i] + fajlnev;
    }

    console.log("Fajlnev: " + fajlnev);

    megjeloltNevek[ parseInt(event.srcElement.alt)-1 ] = fajlnev;

    if( document.getElementById( event.srcElement.id ).style.opacity == 0.1 ) {
        document.getElementById( event.srcElement.id ).style.opacity = 1.0;
        megjeloltNevek[ parseInt(document.getElementById( event.srcElement.id ).alt)-1 ] = "semmi";
        megjelolt--;
    } else {
        document.getElementById( event.srcElement.id ).style.opacity = 0.1;
        megjeloltNevek[ parseInt(document.getElementById( event.srcElement.id ).alt)-1 ] = fajlnev;
        megjelolt++;
    }
    if( megjelolt == 3 ) {
        if( joe(megjeloltNevek) ) {
            alert("Kaptál +1 pontot!");
            pontszam++;

            document.querySelector('#pontszamdisplay').innerHTML = pontszam;

            if( kartyalapfajlnevek.length == 0 ) {
                for(var i=0; i<megjeloltNevek.length; i++) {
                    if( megjeloltNevek[i] != "semmi" && megjeloltNevek[i] != "ures" ) {
                        aktivlapokszama--;
                        document.getElementById('kartya' + parseInt(i+1)).src = "ikonok/ures.png";
                        document.getElementById('kartya' + parseInt(i+1)).style.opacity = 1.0;
                    }
                }
                if( !joeigy() ) {
                    alert("Vége a játéknak. Nincs több SET.\nPontszámod: " + pontszam);
                    jatekBezargombAction();
                }
            } else {
                for(var i=0; i<megjeloltNevek.length; i++) {
                    if( megjeloltNevek[i] != "semmi" && megjeloltNevek[i] != "ures" ) {
                        var szam = parseInt(Math.random()*1000000000) % kartyalapfajlnevek.length;
                        document.getElementById('kartya' + parseInt(i+1) ).src = kartyalapfajlnevek[ szam ];
                        document.getElementById('kartya' + parseInt(i+1) ).style.opacity = 1.0;
                        kartyalapfajlnevek[szam] = kartyalapfajlnevek[ kartyalapfajlnevek.length-1 ];
                        kartyalapfajlnevek.pop();
                    }
                }
                if( !joeigy() ) {
                    alert("Vége a játéknak. Nincs több SET.\nPontszámod: " + pontszam);
                    if( ennelajatekosnaljarunk+1 == jatekosszam ) {
                        eredmenyhirdetes();
                        jatekBezargombAction();
                    } else {
                        ennelajatekosnaljarunk++;
                        inditas();
                    }
                    jatekosokpontjai.push(pontszam);
                }
            }

            // cleanup
            megjelolt = 0;
            for(var i=0; i<12; i++) {
                if( megjeloltNevek[i] != "semmi" ) {
                    megjeloltNevek[i] = "semmi";
                }
            }
            kezdes = new Date().getTime();
        } else {
            alert("Vesztettél...\nEnnyi pontod volt: " + pontszam);
            megjelolt=0;
            clearInterval(id);
            if( ennelajatekosnaljarunk+1 == jatekosszam ) {
                eredmenyhirdetes();
                jatekBezargombAction();
            } else {
                ennelajatekosnaljarunk++;
                inditas();
            }
            jatekosokpontjai.push(pontszam);
        }

        if( aktivlapokszama == 0 ) {
            alert("Gratulálok, nyertél! Pontszámod: " + pontszam);
            if( ennelajatekosnaljarunk+1 == jatekosszam ) {
                eredmenyhirdetes();
                jatekBezargombAction();
            } else {
                ennelajatekosnaljarunk++;
                inditas();
            }
            jatekosokpontjai.push(pontszam);
        } 
    }
}

function eredmenyhirdetesbezarasa() {
    document.querySelector('#eredmenyhirdetes').hidden = true;
}

function eredmenyhirdetes() {
    console.log("elvileg megy");
    document.querySelector('#eredmenyhirdetes').hidden = false;
    document.querySelector('#eredmenyhirdetes').innerHTML = "";
    document.querySelector('#eredmenyhirdetes').innerHTML += '<button id="eredmenhirdetesBezargomb" class="bezargomb" onclick="eredmenyhirdetesbezarasa()">X</button>';
    document.querySelector('#eredmenyhirdetes').innerHTML += "<h1>Eredményhirdetés</h1>";

    for(var i=0; i<jatekosszam; i++) {
        document.querySelector('#eredmenyhirdetes').innerHTML += '<p>"' + document.querySelector('#jatekosnev' + (i+1)).value + '": ' + jatekosokpontjai[i] + '</p>';
    }
}