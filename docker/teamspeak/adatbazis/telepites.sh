mysql -u root -e "use mysql; alter user 'root'@'localhost' identified with mysql_native_password by 'root';"
mysql -u root --password="root" -e "use mysql; alter user 'root'@'%' identified with mysql_native_password by 'root';"
mysql -u root --password="root" -e "CREATE DATABASE IF NOT EXISTS teamspeak;"