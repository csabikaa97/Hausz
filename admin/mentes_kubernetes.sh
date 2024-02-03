#!/bin/bash

set -e # hiba esetén ne fusson tovább a mentés

SCRIPT_PARAMETERE=$(readlink -f "$0")
MENTES_SCRIPT_HELYE=$(dirname "$SCRIPT_PARAMETERE")
FOMAPPA=$(dirname "$MENTES_SCRIPT_HELYE")
DATUM=$(date "+%F")

mkdir $FOMAPPA/admin/mentes/$DATUM

cd $FOMAPPA

echo "[    ] SQL: hausz_ dump készítése"
mysqldump -u root -h 10.43.1.2 --password="root" hausz_ts > admin/mentes/$DATUM/hausz_ts.sql
mysqldump -u root -h 10.43.1.2 --password="root" hausz_megoszto > admin/mentes/$DATUM/hausz_megoszto.sql
mysqldump -u root -h 10.43.1.2 --password="root" hausz_log > admin/mentes/$DATUM/hausz_log.sql
echo "[    ] SQL: hausz_ kész"

echo "[    ] SQL: teamspeak_adatbazis dump készítése"
mysqldump -u root -h 10.43.1.1 --password="root" teamspeak > admin/mentes/$DATUM/teamspeak.sql
echo "[    ] SQL: teamspeak_adatbazis kész"

MAPPA="public/megoszto/fajlok"
CEL_FAJL="megoszto_fajlok.tar"
echo "[    ] mappa: $MAPPA Becsomagolás..."
tar -zcvf "admin/mentes/$DATUM/$CEL_FAJL" "$MAPPA" > /dev/null
echo "[    ] mappa: $MAPPA kész"

MAPPA="docker/teamspeak/szerver/adatok"
CEL_FAJL="teamspeak_szerver_fajlok.tar"
echo "[    ] mappa: $MAPPA Becsomagolás..."
tar -zcvf "admin/mentes/$DATUM/$CEL_FAJL" "$MAPPA" > /dev/null
echo "[    ] mappa: $MAPPA kész"

if [ -f "admin/mentes_privat.sh" ]; then
    cp "admin/mentes_privat.sh" "admin/mentes/$DATUM/mentes_privat.sh"
else
    echo "[INFO] admin/mentes_privat.sh nem található!"
    echo "[INFO] Futtatás kihagyva"
fi

du -sh $FOMAPPA/admin/mentes/$DATUM