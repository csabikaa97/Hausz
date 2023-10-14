cd /var/www/forras/komponensek/sha256_bundle
npm install
npx webpack
cp /var/www/forras/komponensek/sha256_bundle/dist/bundle.js.LICENSE.txt /var/www/public/komponensek/sha256.js.LICENSE.txt
cp /var/www/forras/komponensek/sha256_bundle/dist/bundle.js /var/www/public/komponensek/sha256.js