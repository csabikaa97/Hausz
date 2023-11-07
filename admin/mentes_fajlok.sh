#!/bin/bash

set -e # hiba esetén ne fusson tovább a mentés

SCRIPT_PARAMETERE=$(readlink -f "$0")
MENTES_SCRIPT_HELYE=$(dirname "$SCRIPT_PARAMETERE")
FOMAPPA=$(dirname "$MENTES_SCRIPT_HELYE")
DATUM=$(date "+%F")

mkdir $FOMAPPA/admin/mentes/$DATUM

cd $FOMAPPA

echo "[adatbazis SQL] mentés scriptek készítése hausz_ adatbázisokról"
docker-compose exec adatbazis sh -c '/usr/bin/mysqldump -u root --password="root" hausz_ts > /mentes/hausz_ts.sql' >/dev/null
docker-compose exec adatbazis sh -c '/usr/bin/mysqldump -u root --password="root" hausz_megoszto > /mentes/hausz_megoszto.sql' >/dev/null
docker-compose exec adatbazis sh -c '/usr/bin/mysqldump -u root --password="root" hausz_felhasznalok > /mentes/hausz_felhasznalok.sql' >/dev/null
docker-compose exec adatbazis sh -c '/usr/bin/mysqldump -u root --password="root" hausz_log > /mentes/hausz_log.sql' >/dev/null
docker-compose exec adatbazis sh -c '/usr/bin/mysqldump -u root --password="root" hausz_egyuttnezo > /mentes/hausz_egyuttnezo.sql' >/dev/null
mv admin/mentes/hausz_log.sql admin/mentes/$DATUM/hausz_log.sql
mv admin/mentes/hausz_egyuttnezo.sql admin/mentes/$DATUM/hausz_egyuttnezo.sql
mv admin/mentes/hausz_megoszto.sql admin/mentes/$DATUM/hausz_megoszto.sql
mv admin/mentes/hausz_felhasznalok.sql admin/mentes/$DATUM/hausz_felhasznalok.sql
mv admin/mentes/hausz_ts.sql admin/mentes/$DATUM/hausz_ts.sql
echo "[adatbazis SQL] kész"

echo "[adatbazis_fajlok] mentés készítése adatbazis/adatok mappáról"
tar -zcvf "admin/mentes/$DATUM/adatbazis_fajlok.tar" adatbazis/adatok >/dev/null
echo "[adatbazis_fajlok] kész"

echo "[teamspeak_fajlok]" Biztonsági mentés készítése teamspeak/szerver/adatok mappáról.
tar -zcvf "admin/mentes/$DATUM/teamspeak_fajlok.tar" teamspeak/szerver/adatok >/dev/null
echo "[teamspeak_fajlok] kész"

echo "[teamspeak_adatbazis] mentés készítése teamspeak adatbázisról"
docker-compose exec teamspeak_adatbazis sh -c '/usr/bin/mysqldump -u root --password="root" teamspeak > /mentes/teamspeak.sql' >/dev/null
mv admin/mentes/teamspeak.sql admin/mentes/$DATUM/teamspeak.sql
echo "[teamspeak_adatbazis] kész"

echo "[teamspeak_adatbazis_fajlok] mentés készítése teamspeak/szerver/adatok mappáról"
tar -zcvf admin/mentes/$DATUM/'teamspeak_adatbazis_fajlok.tar' teamspeak/adatbazis/adatok >/dev/null
echo "[teamspeak_adatbazis_fajlok] kész"

echo "[megoszto_fajlok] Biztonsági mentés készítése public/megoszto/fajlok mappáról"
tar -zcvf "admin/mentes/$DATUM/megoszto_fajlok.tar" "public/megoszto/fajlok" > /dev/null
echo "[megoszto_fajlok] kész"

du -sh $FOMAPPA/admin/mentes/$DATUM