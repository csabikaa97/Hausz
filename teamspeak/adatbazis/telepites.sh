mysql -u root -e "use mysql; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';"
mysql -u root --password="root" -e "update mysql.user set Host = '%' where User like 'root';"

mysql -u root --password="root" -e "CREATE DATABASE teamspeak;"

mysql -u root --password="root" < /telepites/mentes.sql
mysql -u root --password="root" -p teamspeak < /telepites/convert_mysql_to_mariadb.sql