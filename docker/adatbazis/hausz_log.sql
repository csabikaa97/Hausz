USE `hausz_log`;

DROP TABLE IF EXISTS `log`;

CREATE TABLE `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `szolgaltatas` varchar(255) DEFAULT NULL,
  `bejegyzes` varchar(255) DEFAULT NULL,
  `komment` varchar(1000) DEFAULT NULL,
  `felhasznalo` varchar(255) DEFAULT NULL,
  `datum` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4;