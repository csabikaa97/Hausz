mysql -u root -e "use mysql; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';"
mysql -u root --password="root" -e "UPDATE mysql.user SET Host = '%' WHERE User LIKE 'root';"

mysql -u root --password="root" -e "CREATE DATABASE teamspeak;"

mysql -u root --password="root" < /telepites/mentes.sql