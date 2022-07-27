#!/bin/bash

mysql -u root -e "use mysql; alter user 'root'@'localhost' identified by 'root';"
mysql -u root --password="root" -e "update mysql.user set Host = '%' where User like 'root';"

mysql -u root --password="root" -e "CREATE DATABASE hausz_ts;"
mysql -u root --password="root" -e "CREATE DATABASE hausz_log;"
mysql -u root --password="root" -e "CREATE DATABASE hausz_egyuttnezo;"
mysql -u root --password="root" -e "CREATE DATABASE hausz_megoszto;"

mysql -u root --password="root" < /telepites/hausz_ts.sql
mysql -u root --password="root" < /telepites/hausz_log.sql
mysql -u root --password="root" < /telepites/hausz_egyuttnezo.sql
mysql -u root --password="root" < /telepites/hausz_megoszto.sql