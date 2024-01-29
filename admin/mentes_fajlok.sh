#!/bin/bash

set -e # hiba esetén ne fusson tovább a mentés

SCRIPT_PARAMETERE=$(readlink -f "$0")
MENTES_SCRIPT_HELYE=$(dirname "$SCRIPT_PARAMETERE")
FOMAPPA=$(dirname "$MENTES_SCRIPT_HELYE")
DATUM=$(date "+%F")

mkdir $FOMAPPA/admin/mentes/$DATUM

cd $FOMAPPA

echo "[adatbazis SQL] mentés scriptek készítése hausz_ adatbázisokról"
mysqldump -u root --password="root" hausz_ts > admin/mentes/$DATUM/hausz_ts.sql
mysqldump -u root --password="root" hausz_megoszto > admin/mentes/$DATUM/hausz_megoszto.sql
mysqldump -u root --password="root" hausz_log > admin/mentes/$DATUM/hausz_log.sql
echo "[adatbazis SQL] kész"

echo "[teamspeak_adatbazis SQL] mentés készítése teamspeak adatbázisról"
mysqldump -u root --password="root" teamspeak > admin/mentes/$DATUM/teamspeak.sql
echo "[teamspeak_adatbazis SQL] kész"

echo "[megoszto_fajlok] Biztonsági mentés készítése public/megoszto/fajlok mappáról"
tar -zcvf "admin/mentes/$DATUM/megoszto_fajlok.tar" "public/megoszto/fajlok" > /dev/null
echo "[megoszto_fajlok] kész"

du -sh $FOMAPPA/admin/mentes/$DATUM

admin/mentes_privat.sh