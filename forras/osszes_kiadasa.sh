#!/bin/bash  

cd /var/www/

forras/kiadas.js $1 forras/megoszto/megoszto.js --ki public/megoszto/megoszto.js
forras/kiadas.js $1 forras/admin/admin.js --ki public/admin/admin.js
forras/kiadas.js $1 forras/egyuttnezo/egyuttnezo.js --ki public/egyuttnezo/egyuttnezo.js
forras/kiadas.js $1 forras/komponensek/index.js --ki public/index/index.js
forras/kiadas.js $1 forras/egyuttnezo/egyuttnezo.js --ki public/egyuttnezo/egyuttnezo.js
forras/kiadas.js $1 forras/erettsegiszamlalo/erettsegiszamlalo.js --ki public/erettsegiszamlalo/erettsegiszamlalo.js
forras/kiadas.js $1 forras/hauszkft/hauszkft.js --ki public/hauszkft/hauszkft.js
forras/kiadas.js $1 forras/kezelo/jelszo_valtoztatas.js --ki public/kezelo/jelszo_valtoztatas.js
forras/kiadas.js $1 forras/kezelo/regisztracio.js --ki public/kezelo/regisztracio.js
forras/kiadas.js $1 forras/pizzatierlist/pizzatierlist.js --ki public/pizzatierlist/pizzatierlist.js
forras/kiadas.js $1 forras/teamspeak/teamspeak.js --ki public/teamspeak/teamspeak.js
forras/kiadas.js $1 forras/webjosda/josda.js --ki public/webjosda/josda.js
forras/kiadas.js $1 forras/webjosda/fizetos.js --ki public/webjosda/fizetos.js