mysql -u root --password="root" -e "update mysql.user set Host = '%' where User like 'root';"
mysql -u root --password="root" -e "use mysql; ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';"

mysql -u root --password="root" -e "CREATE DATABASE teamspeak;"