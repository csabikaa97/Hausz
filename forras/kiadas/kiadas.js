#!/usr/local/bin/node

const fs = require('fs');
const { exec, execSync, spawnSync } = require("child_process");
const crypto = require('crypto');

function checksum_szamitasa_fajlhoz(eleresi_ut) {
    let fajl = String(fs.readFileSync(eleresi_ut));
    let checksum = crypto.createHash('md5').update(fajl).digest("hex");
    return checksum;
}

var parameterek = process.argv;

if(parameterek.length != 4) {
    process.exit(1);
}

var bemeneti = parameterek[2];
var kimeneti = parameterek[3];
console.log(bemeneti + '  ->  ' + kimeneti);

if( !(/\.js/.test(kimeneti)) ) {
    console.log('\tCsak .js fájl lehet a kimenet');
    process.exit(1);
}


if( !(/\.ts$/.test(bemeneti)) ) {
    console.log('\tCsak .ts fájl lehet a bemenet');
    process.exit(1);
}

// ha typescript, akkor megnézzük hogy van-e kész .js fájl
let checksum = checksum_szamitasa_fajlhoz( bemeneti );

try {
    fs.accessSync(kimeneti, fs.constants.R_OK);
    let kimeneti_fajl = fs.readFileSync(kimeneti);
    let szoveg = String(kimeneti_fajl);

    let kilephet = true;

    // fő fájl checksum ellenőrzésekor ne lépjen ki ha nem egyezik
    if( !szoveg.includes('// Kiadás checksum: ' + checksum) ) {
        kilephet = false;
    }

    let referenciak = szoveg.split('\n');
    for (let i = 0; i < referenciak.length; i++) {
        if( /^\/\/\/ <ref/.test( referenciak[i] ) ) {
            let sor = referenciak[i];
            let fajlnev = sor.replace( /^\/\/\/ <reference path="(.*)" \/>/, '$1');
            let valos_checksum = checksum_szamitasa_fajlhoz( fajlnev );
            if( /^\/\/\/ Checksum: /.test( referenciak[i+1] ) ) {
                let mentett_checksum = referenciak[i+1].replace( /^\/\/\/ Checksum: (.*)/, '$1');
                if( mentett_checksum != valos_checksum ) {
                    console.log('\tNem egyezik a valós és a mentett checksum: ' + fajlnev);
                    kilephet = false;
                    break;
                }
                i = i + 1;
            } else {
                console.log('\tNincs mentett checksum: ' + fajlnev);
                kilephet = false;
                break;
            }
        }
    }

    if( kilephet ) {
        process.exit(0);
    }
        
    let child = spawnSync("rm", [kimeneti], { encoding : 'utf8' });
    if( child.status != 0 ) {
        console.log(child.stdout);
        console.log(child.stderr);
        console.log(child.error);
        console.log(child.status);
        process.exit(1);
    }
} catch (error) {
    
}

console.log('\tCompileolás...');
let child = spawnSync("/usr/local/bin/tsc", [bemeneti, "-out", kimeneti], { encoding : 'utf8' });
if( child.stdout.length > 0 ) {
    console.log(child.stdout);
}
if(child.status != 0) {
    console.log("exit code: ", child.status);
    process.exit(1);
}

var datum_es_checksum = `// Kiadás dátuma: ${String( new Date() )}\n// Kiadás checksum: ${checksum}\n`;

let data = String(fs.readFileSync(kimeneti));

let referenciak = data.split('\n');
for (let i = 0; i < referenciak.length; i++) {
    if( /^\/\/\/ <ref/.test( referenciak[i] ) ) {
        let sor = referenciak[i];
        let fajlnev = sor.replace( /^\/\/\/ <reference path="(.*)" \/>/, '$1');
        let generalt_checksum = checksum_szamitasa_fajlhoz(fajlnev);
        let item = "/// Checksum: " + generalt_checksum;
        referenciak.splice(i+1, 0, item);
    }
}

data = "";
referenciak.forEach(sor => {
    data += sor + '\n';
});

data = datum_es_checksum + data;
fs.writeFileSync(kimeneti, data);
console.log('\tKÉSZ');