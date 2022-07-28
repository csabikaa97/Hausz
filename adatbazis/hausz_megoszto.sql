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
-- admin                /   admin
-- automata_teszteles   /   automata_teszteles
INSERT INTO `users` (`username`, `password`, `megjeleno_nev`, `admin`) VALUES ('admin', '$2y$10$I9Dw229eAERVxLdaFPmAuer.Q0XHeK4yIz50epqbBAXySm5yx/MpS', 'admin', 'igen');
INSERT INTO `users` (`username`, `password`, `megjeleno_nev`) VALUES ('automata_teszteles', '$2y$10$IU947uFHA9.9JjFq2qhD/uPmJ4Ugmz4C3amLJ7nTEUZ5JGJOMidCW', 'automata_teszteles');

DROP TABLE IF EXISTS `users_requested`;

CREATE TABLE `users_requested` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `megjeleno_nev` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`request_id`)
);
