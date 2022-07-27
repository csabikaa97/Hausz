#!/bin/bash

mysql --user="root" --password="root" -h 127.0.0.1 -e "DROP DATABASE IF EXISTS hausz_log; CREATE DATABASE hausz_log;"
mysql --user="root" --password="root" -h 127.0.0.1 -e "DROP DATABASE IF EXISTS hausz_egyuttnezo; CREATE DATABASE hausz_egyuttnezo;"
mysql --user="root" --password="root" -h 127.0.0.1 -e "DROP DATABASE IF EXISTS hausz_ts; CREATE DATABASE hausz_ts;"
mysql --user="root" --password="root" -h 127.0.0.1 -e "DROP DATABASE IF EXISTS hausz_megoszto; CREATE DATABASE hausz_megoszto;"

mysql --user="root" --password="root" -h 127.0.0.1 < hausz_log.sql
mysql --user="root" --password="root" -h 127.0.0.1 < hausz_egyuttnezo.sql
mysql --user="root" --password="root" -h 127.0.0.1 < hausz_ts.sql
mysql --user="root" --password="root" -h 127.0.0.1 < hausz_megoszto.sql