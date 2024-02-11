#!/bin/bash

set -e

cd /var/www/

# tsc --showConfig

kiadas.js forras/erettsegiszamlalo/erettsegiszamlalo.ts public/erettsegiszamlalo/erettsegiszamlalo.js
kiadas.js forras/megoszto/megoszto.ts public/megoszto/megoszto.js
kiadas.js forras/admin/admin.ts public/admin/admin.js
kiadas.js forras/hauszkft/hauszkft.ts public/hauszkft/hauszkft.js
kiadas.js forras/kezelo/regisztracio.ts public/kezelo/regisztracio.js
kiadas.js forras/teamspeak/teamspeak.ts public/teamspeak/teamspeak.js
kiadas.js forras/webjosda/josda.ts public/webjosda/josda.js
kiadas.js forras/komponensek/index.ts public/index/index.js
kiadas.js forras/webjosda/fizetos.ts public/webjosda/fizetos.js
kiadas.js forras/minecraft/minecraft.ts public/minecraft/minecraft.js
kiadas.js forras/minecraft/minecraft.ts public/minecraft/minecraft.js
kiadas.js forras/beallitasok/beallitasok.ts public/beallitasok/beallitasok.js

echo "[    ] Minden fájl sikeresen kiadva"