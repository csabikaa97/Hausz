#!/bin/bash

tar --exclude="/var/www/html/megoszto/fajlok/*" --exclude="/var/www/html/admin/backup/*" --exclude="/var/www/html/.git/*" -zcvf /var/www/$(date "+%F")'-backup.tar' /var/www/html/

mv /var/www/$(date "+%F")'-backup.tar' /var/www/html/admin/backup/$(date "+%F")'-backup.tar'

echo ' '
echo ' '
ls -lh /var/www/html/admin/backup/$(date "+%F")'-backup.tar'

echo ' '
echo ' '
echo Biztonsági mentés kész '->' /var/www/html/admin/backup/$(date "+%F")'-backup.tar'