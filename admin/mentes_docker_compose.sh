#!/bin/bash

set -ex # hiba esetén ne fusson tovább a mentés

SCRIPT_PARAMETERE=$(readlink -f "$0")
MENTES_SCRIPT_HELYE=$(dirname "$SCRIPT_PARAMETERE")
FOMAPPA=$(dirname "$MENTES_SCRIPT_HELYE")
DATUM=$(date "+%F")

mkdir $FOMAPPA/admin/mentes/$DATUM

cd $FOMAPPA

echo "[SQL: adatbazis] Dump készítése hausz_ adatbázisokról"
mysqldump -u root -h 172.20.128.10 --password="root" hausz_ts > admin/mentes/$DATUM/hausz_ts.sql
mysqldump -u root -h 172.20.128.10 --password="root" hausz_megoszto > admin/mentes/$DATUM/hausz_megoszto.sql
mysqldump -u root -h 172.20.128.10 --password="root" hausz_log > admin/mentes/$DATUM/hausz_log.sql
echo "[SQL: adatbazis] kész"

echo "[SQL: teamspeak_adatbazis] Dump készítése teamspeak adatbázisról"
mysqldump -u root -h 172.20.128.14 --password="root" teamspeak > admin/mentes/$DATUM/teamspeak.sql
echo "[SQL: teamspeak_adatbazis] kész"

MAPPA="public/megoszto/fajlok"
CEL_FAJL="megoszto_fajlok.tar"
echo "[mappa: $MAPPA] Becsomagolás..."
tar -zcvf "admin/mentes/$DATUM/$CEL_FAJL" "$MAPPA" > /dev/null
echo "[mappa: $MAPPA] kész"

MAPPA="docker/teamspeak/szerver/adatok"
CEL_FAJL="teamspeak_szerver_fajlok.tar"
echo "[mappa: $MAPPA] Becsomagolás..."
tar -zcvf "admin/mentes/$DATUM/$CEL_FAJL" "$MAPPA" > /dev/null
echo "[mappa: $MAPPA] kész"

admin/mentes_privat.sh

du -sh $FOMAPPA/admin/mentes/$DATUM