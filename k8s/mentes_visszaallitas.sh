mysql -u root -p -h 10.43.1.1 teamspeak < teamspeak.sql
mysql -u root -p -h 10.43.1.2 hausz_megoszto < hausz_megoszto.sql
mysql -u root -p -h 10.43.1.2 hausz_log < hausz_log.sql
mysql -u root -p -h 10.43.1.2 hausz_ts < hausz_ts.sql
mv /mentes_feldolgozo/ÉÉÉÉ-HH-NN/public/megoszto/fajlok/* /hausz/public/megoszto/fajlok/
rm -rf /pvc-volumes/ts-pvc/
mv /mentes_feldolgozo/ÉÉÉÉ-HH-NN/teamspeak/szerver/adatok/virtualserver_1 /pvc-volumes/ts-pvc
mv /mentes_feldolgozo/ÉÉÉÉ-HH-NN/teamspeak/szerver/adatok/internal /pvc-volumes/ts-pvc