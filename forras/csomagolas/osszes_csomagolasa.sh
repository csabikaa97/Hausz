#!/bin/bash

cd /var/www/forras/komponensek/crypto_bundle
npm install
npx webpack
cp /var/www/forras/komponensek/crypto_bundle/dist/bundle.js.LICENSE.txt /var/www/public/komponensek/crypto.js.LICENSE.txt
echo "crypto.js.LICENSE.txt másolva"
cp /var/www/forras/komponensek/crypto_bundle/dist/bundle.js /var/www/public/komponensek/crypto.js
echo "crypto.js másolva"

/var/www/forras/csomagolas/privat_csomagolasa.sh