USE `hausz_felhasznalok`;

DROP TABLE IF EXISTS `felhasznalok`;

CREATE TABLE `felhasznalok` (
  `azonosito` int(11) NOT NULL AUTO_INCREMENT,
  `felhasznalonev` varchar(255) DEFAULT NULL,
  `jelszo` varchar(1000) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `admin` varchar(10) DEFAULT NULL,
  `megjeleno_nev` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`azonosito`)
);

DROP TABLE IF EXISTS `sessionok`;

CREATE TABLE `sessionok` (
  `azonosito` int(11) NOT NULL,
  `session_kulcs` varchar(1000) DEFAULT NULL,
  `datum` datetime(6) DEFAULT NULL
);

-- admin                /   admin
-- automata_teszteles   /   automata_teszteles
INSERT INTO `felhasznalok` (`felhasznalonev`, `jelszo`, `megjeleno_nev`, `admin`) VALUES ('admin', '$2y$10$I9Dw229eAERVxLdaFPmAuer.Q0XHeK4yIz50epqbBAXySm5yx/MpS', 'admin', 'igen');
INSERT INTO `felhasznalok` (`felhasznalonev`, `jelszo`, `megjeleno_nev`) VALUES ('automata_teszteles', '$2y$10$2rHzZBFyO618D4I7ep/ayuRfff8LsOLfi0feSPeEuCN8zpQT3.g8K', 'automata_teszteles');
INSERT INTO `felhasznalok` (`felhasznalonev`, `megjeleno_nev`) VALUES ('ismeretlen', 'ismeretlen');
UPDATE `felhasznalok` SET azonosito = 0 WHERE felhasznalonev LIKE 'ismeretlen';

DROP TABLE IF EXISTS `igenyelt_felhasznalok`;

CREATE TABLE `igenyelt_felhasznalok` (
  `igenyles_azonosito` int(11) NOT NULL AUTO_INCREMENT,
  `felhasznalonev` varchar(255) DEFAULT NULL,
  `jelszo` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `megjeleno_nev` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`igenyles_azonosito`)
);

DELIMITER //
CREATE PROCEDURE regisztralt_felhasznalo_jovahagyasa(IN igenyles_azonosito INT)
BEGIN
    INSERT INTO felhasznalok (felhasznalonev, jelszo, email, megjeleno_nev)
    SELECT felhasznalonev, jelszo, email, megjeleno_nev FROM igenyelt_felhasznalok WHERE igenyles_azonosito = igenyles_azonosito;
    DELETE FROM igenyelt_felhasznalok WHERE igenyles_azonosito = igenyles_azonosito;
END //
DELIMITER ;