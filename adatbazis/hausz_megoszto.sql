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
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `tarhely_statisztika`;

CREATE TABLE `tarhely_statisztika` (
  `datum` datetime DEFAULT NULL,
  `szabad` varchar(255) DEFAULT NULL,
  `foglalt` varchar(255) DEFAULT NULL
);

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(1000) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `admin` varchar(10) DEFAULT NULL,
  `megjeleno_nev` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `users_requested`;

CREATE TABLE `users_requested` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `megjeleno_nev` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`request_id`)
);
