USE `hausz_egyuttnezo`;

DROP TABLE IF EXISTS `gyorsitotar`;

CREATE TABLE `gyorsitotar` (
  `parancs_id` int(11) NOT NULL,
  `kimenet` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`parancs_id`)
);

DROP TABLE IF EXISTS `statusz`;

CREATE TABLE `statusz` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `video_id` varchar(255) DEFAULT NULL,
  `masodperc` double DEFAULT NULL,
  `lejatszas` varchar(10) DEFAULT NULL,
  `sebesseg` float DEFAULT NULL,
  `datum` datetime(6) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `visszajelzes`;

CREATE TABLE `visszajelzes` (
  `nev` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `datum` datetime(6) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL
);