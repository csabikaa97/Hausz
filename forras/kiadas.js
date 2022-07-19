#!/usr/bin/node

const fs = require('fs');

var parameterek = process.argv;
var be_lista = Array();
var be_elemek = 0;
var alap_komponensek = [
    '/var/www/html/forras/komponensek/belepteto_rendszer.js',
    '/var/www/html/forras/komponensek/alap_fuggvenyek.js',
    '/var/www/html/forras/komponensek/topbar.js'
];
alap_komponensek.forEach(komponens => {
    be_lista[ be_elemek ] = komponens;
    be_elemek++;
});

var ki = '';
var tomorites = false;

for (let i = 2; i < parameterek.length; i++) {
    if( parameterek[i] == '--tomorites' ) {   tomorites = true; continue; }
    if( parameterek[i] == '--ki' ) {
        ki = parameterek[++i];
        continue;
    }

    be_lista[ be_elemek ] = parameterek[i];
    if( !/\.js$/.test(parameterek[i]) ) { throw new Error('Csak .js kiterjesztésű(ek) lehet(nek) a bemeneti fájl(ok).'); }
    be_elemek++;
}

if(ki == '') {
    throw new Error('Nincs megadva kimeneti fájl elérési út');
}

if( !/\.js$/.test(ki) ) { throw new Error('Csak .js fájl lehet a kimenet.'); }

var kimenet = `// Kiadás dátuma: ${String( new Date() )}\n`;

for (let i = 0; i < be_elemek; i++) {
    let data = String( fs.readFileSync(be_lista[i]) );
    if( tomorites ) {
        data = data.replace(/\n[\s\t]{1,99}/ig, '\n');
        data = data.replace(/(.*)\/\/(.*)\n/ig, '$1');
        data = data.replace(/\/\*(.*?)\*\//ig, '');
        data = data.replace(/\n{2,99}/ig, '\n');
        data = data.replace(/;\n/ig, ';');
        data = data.replace(/([\}\}])\n(?!(if|let|var))/ig, '$1');
        data = data.replace(/\s{2,99}/ig, ' ');
    }
    kimenet += `// ${be_lista[i]}\n${data}\n`;
}

fs.writeFileSync(ki, kimenet);

var tabok = '';
for (let i = 0; i < 50 - ki.replace(/(.*)\/(.*?)\.js$/ig, '$2.js').length; i++) {
    tabok += ' ';
}

console.log( ki.replace(/(.*)\/(.*?)\.js$/ig, '$2.js') + tabok + 'KÉSZ' + (tomorites ? ' tömörítve' : ''));