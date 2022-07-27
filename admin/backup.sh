#!/bin/bash

tar --exclude="/var/www/public/megoszto/fajlok/*" --exclude="/var/www/admin/backup/*" --exclude="/var/www/.git/*" -zcvf /var/www/admin/backup/$(date "+%F")'-backup.tar' /var/www/

echo ' '
echo ' '
ls -lh /var/www/admin/backup/$(date "+%F")'-backup.tar'

echo ' '
echo ' '
echo Biztonsági mentés kész '->' /var/www/admin/backup/$(date "+%F")'-backup.tar'