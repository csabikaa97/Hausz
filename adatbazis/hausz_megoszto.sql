USE `hausz_megoszto`;

DROP TABLE IF EXISTS `files`;

CREATE TABLE `files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `filename` varchar(1000) CHARACTER SET utf8mb4 DEFAULT NULL,
  `added` datetime DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `private` tinyint(1) NOT NULL DEFAULT '0',
  `titkositott` tinyint(1) DEFAULT NULL,
  `titkositas_kulcs` varchar(1000) DEFAULT NULL,
  `members_only` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(1000) DEFAULT NULL,
  `sha256_password` varchar(1000) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `admin` varchar(10) DEFAULT 'nem',
  `megjeleno_nev` varchar(255) DEFAULT NULL,
  `minecraft_username` varchar(255) DEFAULT NULL,
  `minecraft_isLogged` SMALLINT(5) DEFAULT 0,
  `minecraft_lastlogin` BIGINT(19) DEFAULT 0,
  PRIMARY KEY (`id`)
);
-- admin                /   admin
-- automata_teszteles   /   automata_teszteles
INSERT INTO `users` (`username`, `sha256_password`, `megjeleno_nev`, `admin`) VALUES ('admin', '$SHA$8d93e8f0deed91097f4ae80a8e5ae79181ae7ba61d404f53a2e79fb0f21ac822$e7483ac4ed392771a519ddad6762febee112717d8d1e42fa28a5cad73eb46a16', 'admin', 'igen');
INSERT INTO `users` (`username`, `sha256_password`, `megjeleno_nev`) VALUES ('automata_teszteles', '$SHA$e2470dea81024809960afbbccc1a3accde248520fb3040d90af3c6e38218e4b5$f8896ae7a7729ffd4e803371d0a1bd37c57b84db2bbcf4b2f26613653acb0016', 'automata_teszteles');
INSERT INTO `users` (`username`, `megjeleno_nev`) VALUES ('ismeretlen', 'ismeretlen');
UPDATE `users` SET id = 0 WHERE username LIKE 'ismeretlen';

DROP TABLE IF EXISTS `users_requested`;

CREATE TABLE `users_requested` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `sha256_password` varchar(1000) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `megjeleno_nev` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`request_id`)
);

DELIMITER //
CREATE PROCEDURE add_user(IN igenyles_azonosito INT)
BEGIN
    INSERT INTO users (username, sha256_password, email, megjeleno_nev)
    SELECT username, sha256_password, email, megjeleno_nev FROM users_requested WHERE request_id = igenyles_azonosito;
    DELETE FROM users_requested WHERE request_id = igenyles_azonosito;
END //
DELIMITER ;

CREATE TABLE `meghivok` (
  `user_id` int(10) NOT NULL,
  `meghivo` varchar(255) NOT NULL,
  `request_date` datetime NOT NULL,
  PRIMARY KEY (`user_id`)
);

CREATE TABLE `sessionok` (
  `azonosito` int(11) NOT NULL,
  `session_kulcs` varchar(1000) DEFAULT NULL,
  `datum` datetime(6) DEFAULT NULL
);