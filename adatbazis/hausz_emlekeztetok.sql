USE `hausz_emlekeztetok`;

DROP TABLE IF EXISTS `emlekeztetok`;

CREATE TABLE `emlekeztetok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `szoveg` varchar(1000) CHARACTER SET utf8mb4 DEFAULT NULL,
  `added` datetime DEFAULT NULL,
  `target` datetime DEFAULT NULL,
  `difference` int(11) DEFAULT NULL,
  `done` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
);