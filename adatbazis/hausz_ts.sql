USE `hausz_ts`;

DROP TABLE IF EXISTS `felhasznalo_tokenek`;

CREATE TABLE `felhasznalo_tokenek` (
  `user_id` int(11) DEFAULT NULL,
  `token` varchar(1000) DEFAULT NULL,
  `generalasi_datum` datetime DEFAULT NULL
);

DROP TABLE IF EXISTS `szolgaltatas_statusz`;

CREATE TABLE `szolgaltatas_statusz` (
  `datum` datetime(6) DEFAULT NULL,
  `statusz` varchar(255) DEFAULT NULL
);