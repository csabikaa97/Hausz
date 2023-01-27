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

DROP TABLE IF EXISTS `jogosultsag_igenylesek`;

CREATE TABLE `jogosultsag_igenylesek` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hausz_felhasznalo_id` int(11),
  `igenyles_datuma` datetime(6),
  `igenyelt_fiokok` TEXT,
  `igenyelt_fiok_idk` TEXT,
  `jelenlegi_fiok_kivalasztott` int(11),
  PRIMARY KEY (`id`)
);