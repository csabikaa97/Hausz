#!/bin/bash  

cd /var/www/html/

forras/kiadas.js $1 megoszto/forras/megoszto.js --ki megoszto/megoszto.js
forras/kiadas.js $1 admin/forras/admin.js --ki admin/admin.js
forras/kiadas.js $1 egyuttnezo/forras/egyuttnezo.js --ki egyuttnezo/egyuttnezo.js
forras/kiadas.js $1 forras/komponensek/index.js --ki index/index.js
forras/kiadas.js $1 egyuttnezo/forras/egyuttnezo.js --ki egyuttnezo/egyuttnezo.js
forras/kiadas.js $1 erettsegiszamlalo/forras/erettsegiszamlalo.js --ki erettsegiszamlalo/erettsegiszamlalo.js
forras/kiadas.js $1 hauszkft/forras/hauszkft.js --ki hauszkft/hauszkft.js
forras/kiadas.js $1 kezelo/forras/jelszo_valtoztatas.js --ki kezelo/jelszo_valtoztatas.js
forras/kiadas.js $1 kezelo/forras/regisztracio.js --ki kezelo/regisztracio.js
forras/kiadas.js $1 pizzatierlist/forras/pizzatierlist.js --ki pizzatierlist/pizzatierlist.js
forras/kiadas.js $1 teamspeak/forras/teamspeak.js --ki teamspeak/teamspeak.js
forras/kiadas.js $1 webjosda/forras/josda.js --ki webjosda/josda.js
forras/kiadas.js $1 webjosda/forras/fizetos.js --ki webjosda/fizetos.js