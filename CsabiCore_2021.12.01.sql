-- MySQL dump 10.13  Distrib 5.7.33, for Linux (x86_64)
--
-- Host: localhost    Database: CsabiCore
-- ------------------------------------------------------
-- Server version	5.7.33-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `data_0,1,2,3`
--

USE `core`;
DROP TABLE IF EXISTS `data_0,1,2,3`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_0,1,2,3` (
  `id` int(11) NOT NULL,
  `0` int(11) DEFAULT NULL,
  `1` varchar(1000) DEFAULT NULL,
  `2` int(11) DEFAULT NULL,
  `3` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_0,1,2,3`
--

LOCK TABLES `data_0,1,2,3` WRITE;
/*!40000 ALTER TABLE `data_0,1,2,3` DISABLE KEYS */;
INSERT INTO `data_0,1,2,3` VALUES (7,NULL,'TesztMezo1',1234,'2021-11-11');
/*!40000 ALTER TABLE `data_0,1,2,3` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_0,1,2,3,4,5,6`
--

DROP TABLE IF EXISTS `data_0,1,2,3,4,5,6`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_0,1,2,3,4,5,6` (
  `id` int(11) NOT NULL,
  `0` int(11) DEFAULT NULL,
  `1` varchar(1000) DEFAULT NULL,
  `2` int(11) DEFAULT NULL,
  `3` date DEFAULT NULL,
  `4` date DEFAULT NULL,
  `5` varchar(1000) DEFAULT NULL,
  `6` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_0,1,2,3,4,5,6`
--

LOCK TABLES `data_0,1,2,3,4,5,6` WRITE;
/*!40000 ALTER TABLE `data_0,1,2,3,4,5,6` DISABLE KEYS */;
INSERT INTO `data_0,1,2,3,4,5,6` VALUES (20,NULL,'Teszt valami?32',12,'2021-11-25','2021-11-11','szöveg',12);
/*!40000 ALTER TABLE `data_0,1,2,3,4,5,6` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_1`
--

DROP TABLE IF EXISTS `data_1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_1` (
  `id` int(11) DEFAULT NULL,
  `1` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_1`
--

LOCK TABLES `data_1` WRITE;
/*!40000 ALTER TABLE `data_1` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_1001`
--

DROP TABLE IF EXISTS `data_1001`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_1001` (
  `id` int(11) DEFAULT NULL,
  `place` int(11) DEFAULT NULL,
  `adat` varchar(10000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_1001`
--

LOCK TABLES `data_1001` WRITE;
/*!40000 ALTER TABLE `data_1001` DISABLE KEYS */;
INSERT INTO `data_1001` VALUES (22,1,'teszt adat xddd'),(22,2,'teszt adat 2 xddd'),(22,3,'teszt adat 3 xddd');
/*!40000 ALTER TABLE `data_1001` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_1006`
--

DROP TABLE IF EXISTS `data_1006`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_1006` (
  `id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_1006`
--

LOCK TABLES `data_1006` WRITE;
/*!40000 ALTER TABLE `data_1006` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_1006` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_1,2`
--

DROP TABLE IF EXISTS `data_1,2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_1,2` (
  `id` int(11) DEFAULT NULL,
  `place` int(11) DEFAULT NULL,
  `adat` varchar(10000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_1,2`
--

LOCK TABLES `data_1,2` WRITE;
/*!40000 ALTER TABLE `data_1,2` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_1,2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_1,2,3`
--

DROP TABLE IF EXISTS `data_1,2,3`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_1,2,3` (
  `id` int(11) DEFAULT NULL,
  `1` varchar(1000) DEFAULT NULL,
  `2` int(11) DEFAULT NULL,
  `3` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_1,2,3`
--

LOCK TABLES `data_1,2,3` WRITE;
/*!40000 ALTER TABLE `data_1,2,3` DISABLE KEYS */;
INSERT INTO `data_1,2,3` VALUES (49,'Te',NULL,'2021-11-12'),(66,'teszt ',123,'2021-11-05');
/*!40000 ALTER TABLE `data_1,2,3` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_1,2,3,4,5,6`
--

DROP TABLE IF EXISTS `data_1,2,3,4,5,6`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_1,2,3,4,5,6` (
  `id` int(11) DEFAULT NULL,
  `1` varchar(1000) DEFAULT NULL,
  `2` int(11) DEFAULT NULL,
  `3` date DEFAULT NULL,
  `5` varchar(1000) DEFAULT NULL,
  `6` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_1,2,3,4,5,6`
--

LOCK TABLES `data_1,2,3,4,5,6` WRITE;
/*!40000 ALTER TABLE `data_1,2,3,4,5,6` DISABLE KEYS */;
INSERT INTO `data_1,2,3,4,5,6` VALUES (43,'teszt',NULL,NULL,NULL,NULL),(44,'teszt',NULL,NULL,NULL,NULL),(45,'teszt234567',NULL,NULL,NULL,NULL),(46,'teszt',NULL,NULL,NULL,NULL),(95,'Nev',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `data_1,2,3,4,5,6` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_1,2,3,nev`
--

DROP TABLE IF EXISTS `data_1,2,3,nev`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_1,2,3,nev` (
  `id` int(11) DEFAULT NULL,
  `1` varchar(1000) DEFAULT NULL,
  `2` int(11) DEFAULT NULL,
  `3` date DEFAULT NULL,
  `nev` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_1,2,3,nev`
--

LOCK TABLES `data_1,2,3,nev` WRITE;
/*!40000 ALTER TABLE `data_1,2,3,nev` DISABLE KEYS */;
INSERT INTO `data_1,2,3,nev` VALUES (52,'Ibb',531,'2021-12-31',NULL);
/*!40000 ALTER TABLE `data_1,2,3,nev` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_6`
--

DROP TABLE IF EXISTS `data_6`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_6` (
  `id` int(11) DEFAULT NULL,
  `6` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_6`
--

LOCK TABLES `data_6` WRITE;
/*!40000 ALTER TABLE `data_6` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_6` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Élelmiszer,Lejárati dátum,Egységszám`
--

DROP TABLE IF EXISTS `data_Élelmiszer,Lejárati dátum,Egységszám`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Élelmiszer,Lejárati dátum,Egységszám` (
  `id` int(11) DEFAULT NULL,
  `Élelmiszer` int(11) DEFAULT NULL,
  `Lejárati dátum` date DEFAULT NULL,
  `Egységszám` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Élelmiszer,Lejárati dátum,Egységszám`
--

LOCK TABLES `data_Élelmiszer,Lejárati dátum,Egységszám` WRITE;
/*!40000 ALTER TABLE `data_Élelmiszer,Lejárati dátum,Egységszám` DISABLE KEYS */;
INSERT INTO `data_Élelmiszer,Lejárati dátum,Egységszám` VALUES (194,201,'2021-11-26','12'),(210,201,'2021-11-30','12');
/*!40000 ALTER TABLE `data_Élelmiszer,Lejárati dátum,Egységszám` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Összeg,Indoklás,Dátum`
--

DROP TABLE IF EXISTS `data_Összeg,Indoklás,Dátum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Összeg,Indoklás,Dátum` (
  `id` int(11) DEFAULT NULL,
  `Összeg` double DEFAULT NULL,
  `Indoklás` varchar(1000) DEFAULT NULL,
  `Dátum` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Összeg,Indoklás,Dátum`
--

LOCK TABLES `data_Összeg,Indoklás,Dátum` WRITE;
/*!40000 ALTER TABLE `data_Összeg,Indoklás,Dátum` DISABLE KEYS */;
INSERT INTO `data_Összeg,Indoklás,Dátum` VALUES (154,12,NULL,'2021-11-13'),(155,123.1,'Szolnok -> BP','2021-11-13'),(157,1234,'Szolnok -> BP','2021-11-26'),(158,280000,':D','2021-11-26'),(159,200000,'valami ok fizuhoz','2021-11-25'),(180,10,'Mert','2021-11-27'),(183,250,'Vác -> BP','2021-11-27');
/*!40000 ALTER TABLE `data_Összeg,Indoklás,Dátum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Összeg,Indoklás,Típus,Dátum`
--

DROP TABLE IF EXISTS `data_Összeg,Indoklás,Típus,Dátum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Összeg,Indoklás,Típus,Dátum` (
  `id` int(11) DEFAULT NULL,
  `Összeg` double DEFAULT NULL,
  `Indoklás` varchar(1000) DEFAULT NULL,
  `Típus` varchar(1000) DEFAULT NULL,
  `Dátum` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Összeg,Indoklás,Típus,Dátum`
--

LOCK TABLES `data_Összeg,Indoklás,Típus,Dátum` WRITE;
/*!40000 ALTER TABLE `data_Összeg,Indoklás,Típus,Dátum` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_Összeg,Indoklás,Típus,Dátum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Dátum,Súly,Megjegyzés`
--

DROP TABLE IF EXISTS `data_Dátum,Súly,Megjegyzés`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Dátum,Súly,Megjegyzés` (
  `id` int(11) DEFAULT NULL,
  `Dátum` date DEFAULT NULL,
  `Súly` double DEFAULT NULL,
  `Megjegyzés` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Dátum,Súly,Megjegyzés`
--

LOCK TABLES `data_Dátum,Súly,Megjegyzés` WRITE;
/*!40000 ALTER TABLE `data_Dátum,Súly,Megjegyzés` DISABLE KEYS */;
INSERT INTO `data_Dátum,Súly,Megjegyzés` VALUES (174,'2021-11-20',65.8,'Otthon reggel'),(174,'2021-11-06',66.1,'Otthon reggel');
/*!40000 ALTER TABLE `data_Dátum,Súly,Megjegyzés` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Dataelement tesztelés extrém módra,szam,datum`
--

DROP TABLE IF EXISTS `data_Dataelement tesztelés extrém módra,szam,datum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Dataelement tesztelés extrém módra,szam,datum` (
  `id` int(11) DEFAULT NULL,
  `Dataelement tesztelés extrém módra` varchar(1000) DEFAULT NULL,
  `szam` int(11) DEFAULT NULL,
  `datum` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Dataelement tesztelés extrém módra,szam,datum`
--

LOCK TABLES `data_Dataelement tesztelés extrém módra,szam,datum` WRITE;
/*!40000 ALTER TABLE `data_Dataelement tesztelés extrém módra,szam,datum` DISABLE KEYS */;
INSERT INTO `data_Dataelement tesztelés extrém módra,szam,datum` VALUES (56,'tesztelés szóközzel meg minden',12,'2021-11-06');
/*!40000 ALTER TABLE `data_Dataelement tesztelés extrém módra,szam,datum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Fehérje,Só,Egység`
--

DROP TABLE IF EXISTS `data_Fehérje,Só,Egység`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Fehérje,Só,Egység` (
  `id` int(11) DEFAULT NULL,
  `Fehérje` double DEFAULT NULL,
  `Só` double DEFAULT NULL,
  `Egység` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Fehérje,Só,Egység`
--

LOCK TABLES `data_Fehérje,Só,Egység` WRITE;
/*!40000 ALTER TABLE `data_Fehérje,Só,Egység` DISABLE KEYS */;
INSERT INTO `data_Fehérje,Só,Egység` VALUES (123,12.31,5.61,'kg');
/*!40000 ALTER TABLE `data_Fehérje,Só,Egység` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Fehérje,Só,Egység,Egységár`
--

DROP TABLE IF EXISTS `data_Fehérje,Só,Egység,Egységár`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Fehérje,Só,Egység,Egységár` (
  `id` int(11) DEFAULT NULL,
  `Fehérje` double DEFAULT NULL,
  `Só` double DEFAULT NULL,
  `Egység` varchar(1000) DEFAULT NULL,
  `Egységár` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Fehérje,Só,Egység,Egységár`
--

LOCK TABLES `data_Fehérje,Só,Egység,Egységár` WRITE;
/*!40000 ALTER TABLE `data_Fehérje,Só,Egység,Egységár` DISABLE KEYS */;
INSERT INTO `data_Fehérje,Só,Egység,Egységár` VALUES (138,1.2,3.1,'kg',998.7),(144,1.2,3.8,'kg',998),(145,1.2,3.8,'kg',998.76),(160,1.2,3.87,'kg',1009),(161,NULL,1.2,NULL,NULL);
/*!40000 ALTER TABLE `data_Fehérje,Só,Egység,Egységár` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Név,Fehérje,Só,Egység,Egységár`
--

DROP TABLE IF EXISTS `data_Név,Fehérje,Só,Egység,Egységár`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Név,Fehérje,Só,Egység,Egységár` (
  `id` int(11) DEFAULT NULL,
  `Név` varchar(1000) DEFAULT NULL,
  `Fehérje` double DEFAULT NULL,
  `Só` double DEFAULT NULL,
  `Egység` varchar(1000) DEFAULT NULL,
  `Egységár` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Név,Fehérje,Só,Egység,Egységár`
--

LOCK TABLES `data_Név,Fehérje,Só,Egység,Egységár` WRITE;
/*!40000 ALTER TABLE `data_Név,Fehérje,Só,Egység,Egységár` DISABLE KEYS */;
INSERT INTO `data_Név,Fehérje,Só,Egység,Egységár` VALUES (163,'LIDL gouda sajt',1.2,6.5,'kg',1923.5),(196,'LIDL gouda sajt',1.2,3.4,'kg',1230),(197,'LIDL gouda sajt',1.2,3.45,'kg',1230),(198,'LIDL gouda sajt',NULL,NULL,NULL,NULL),(199,'LIDL gouda sajt',12,13,'kg',1230),(200,'LIDL gouda sajt',12,13,'kg',1230),(201,'LIDL gouda sajt',12,13,'kg',1230);
/*!40000 ALTER TABLE `data_Név,Fehérje,Só,Egység,Egységár` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Név,Ikon`
--

DROP TABLE IF EXISTS `data_Név,Ikon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Név,Ikon` (
  `id` int(11) DEFAULT NULL,
  `Név` varchar(1000) DEFAULT NULL,
  `Ikon` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Név,Ikon`
--

LOCK TABLES `data_Név,Ikon` WRITE;
/*!40000 ALTER TABLE `data_Név,Ikon` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_Név,Ikon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Név,valami,valami3`
--

DROP TABLE IF EXISTS `data_Név,valami,valami3`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Név,valami,valami3` (
  `id` int(11) DEFAULT NULL,
  `Név` varchar(1000) DEFAULT NULL,
  `valami` varchar(1000) DEFAULT NULL,
  `valami3` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Név,valami,valami3`
--

LOCK TABLES `data_Név,valami,valami3` WRITE;
/*!40000 ALTER TABLE `data_Név,valami,valami3` DISABLE KEYS */;
INSERT INTO `data_Név,valami,valami3` VALUES (53,'Teszt','Idunnooooo','Gcd');
/*!40000 ALTER TABLE `data_Név,valami,valami3` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Tétel,Élelmiszer,Lejárati dátum,Egységszám`
--

DROP TABLE IF EXISTS `data_Tétel,Élelmiszer,Lejárati dátum,Egységszám`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Tétel,Élelmiszer,Lejárati dátum,Egységszám` (
  `id` int(11) DEFAULT NULL,
  `Tétel` varchar(1000) DEFAULT NULL,
  `Élelmiszer` double DEFAULT NULL,
  `Lejárati dátum` date DEFAULT NULL,
  `Egységszám` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Tétel,Élelmiszer,Lejárati dátum,Egységszám`
--

LOCK TABLES `data_Tétel,Élelmiszer,Lejárati dátum,Egységszám` WRITE;
/*!40000 ALTER TABLE `data_Tétel,Élelmiszer,Lejárati dátum,Egységszám` DISABLE KEYS */;
INSERT INTO `data_Tétel,Élelmiszer,Lejárati dátum,Egységszám` VALUES (182,'Sajti sajti',0.03,NULL,'10'),(186,'valami',159,'2021-11-26',NULL);
/*!40000 ALTER TABLE `data_Tétel,Élelmiszer,Lejárati dátum,Egységszám` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_Terjesztési lista neve,nev,tesztelés ide`
--

DROP TABLE IF EXISTS `data_Terjesztési lista neve,nev,tesztelés ide`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_Terjesztési lista neve,nev,tesztelés ide` (
  `id` int(11) DEFAULT NULL,
  `Terjesztési lista neve` varchar(1000) DEFAULT NULL,
  `nev` varchar(1000) DEFAULT NULL,
  `tesztelés ide` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_Terjesztési lista neve,nev,tesztelés ide`
--

LOCK TABLES `data_Terjesztési lista neve,nev,tesztelés ide` WRITE;
/*!40000 ALTER TABLE `data_Terjesztési lista neve,nev,tesztelés ide` DISABLE KEYS */;
INSERT INTO `data_Terjesztési lista neve,nev,tesztelés ide` VALUES (54,'','Dsa','Ft');
/*!40000 ALTER TABLE `data_Terjesztési lista neve,nev,tesztelés ide` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_datum`
--

DROP TABLE IF EXISTS `data_datum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_datum` (
  `id` int(11) DEFAULT NULL,
  `datum` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_datum`
--

LOCK TABLES `data_datum` WRITE;
/*!40000 ALTER TABLE `data_datum` DISABLE KEYS */;
INSERT INTO `data_datum` VALUES (50,'2021-11-20');
/*!40000 ALTER TABLE `data_datum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_nev,datum,Jegyzetek`
--

DROP TABLE IF EXISTS `data_nev,datum,Jegyzetek`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_nev,datum,Jegyzetek` (
  `id` int(11) DEFAULT NULL,
  `nev` varchar(1000) DEFAULT NULL,
  `datum` date DEFAULT NULL,
  `Jegyzetek` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_nev,datum,Jegyzetek`
--

LOCK TABLES `data_nev,datum,Jegyzetek` WRITE;
/*!40000 ALTER TABLE `data_nev,datum,Jegyzetek` DISABLE KEYS */;
INSERT INTO `data_nev,datum,Jegyzetek` VALUES (178,'Tolnai','2021-11-19','Hmm');
/*!40000 ALTER TABLE `data_nev,datum,Jegyzetek` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_nev,szoveg,szam`
--

DROP TABLE IF EXISTS `data_nev,szoveg,szam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_nev,szoveg,szam` (
  `id` int(11) DEFAULT NULL,
  `nev` varchar(1000) DEFAULT NULL,
  `szoveg` varchar(1000) DEFAULT NULL,
  `szam` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_nev,szoveg,szam`
--

LOCK TABLES `data_nev,szoveg,szam` WRITE;
/*!40000 ALTER TABLE `data_nev,szoveg,szam` DISABLE KEYS */;
INSERT INTO `data_nev,szoveg,szam` VALUES (NULL,'dsa','321321',12),(NULL,'dsa','',12),(NULL,'dsa','',12),(31,'Valami','12132134dsadsadsa',12),(48,'etdsadsa','ha',12);
/*!40000 ALTER TABLE `data_nev,szoveg,szam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_nev,szoveg,szoveg,szam`
--

DROP TABLE IF EXISTS `data_nev,szoveg,szoveg,szam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_nev,szoveg,szoveg,szam` (
  `id` int(11) DEFAULT NULL,
  `place` int(11) DEFAULT NULL,
  `adat` varchar(10000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_nev,szoveg,szoveg,szam`
--

LOCK TABLES `data_nev,szoveg,szoveg,szam` WRITE;
/*!40000 ALTER TABLE `data_nev,szoveg,szoveg,szam` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_nev,szoveg,szoveg,szam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_szam,datum`
--

DROP TABLE IF EXISTS `data_szam,datum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_szam,datum` (
  `id` int(11) DEFAULT NULL,
  `szam` int(11) DEFAULT NULL,
  `datum` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_szam,datum`
--

LOCK TABLES `data_szam,datum` WRITE;
/*!40000 ALTER TABLE `data_szam,datum` DISABLE KEYS */;
INSERT INTO `data_szam,datum` VALUES (51,12,'2021-11-26');
/*!40000 ALTER TABLE `data_szam,datum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_tétel`
--

DROP TABLE IF EXISTS `data_tétel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_tétel` (
  `id` int(11) DEFAULT NULL,
  `tétel` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_tétel`
--

LOCK TABLES `data_tétel` WRITE;
/*!40000 ALTER TABLE `data_tétel` DISABLE KEYS */;
INSERT INTO `data_tétel` VALUES (170,'valami szar ami megromlot XDDD'),(176,'Xdd?');
/*!40000 ALTER TABLE `data_tétel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `master_tree`
--

DROP TABLE IF EXISTS `master_tree`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `master_tree` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `parent_id` int(11) NOT NULL,
  `icon` varchar(1000) NOT NULL,
  `dataelements` varchar(1000) NOT NULL,
  `endpoint` varchar(255) DEFAULT NULL,
  `children-dataelements` varchar(1000) DEFAULT NULL,
  `subobject-name` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=211 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `master_tree`
--

LOCK TABLES `master_tree` WRITE;
/*!40000 ALTER TABLE `master_tree` DISABLE KEYS */;
INSERT INTO `master_tree` VALUES (1,'&#x1f3e0;',0,'','','no',NULL,NULL),(53,'Idunno',52,'','Név,valami,valami3','yes',NULL,NULL),(90,'Inventory',1,'0001f4e6','','no',NULL,NULL),(146,'Bankszámla',1,'0001f4b2','','no','','aktivitás'),(149,'',148,'','Összeg,Indoklás,Dátum','yes','',''),(150,'',148,'','Összeg,Indoklás,Dátum','yes','',''),(152,'',151,'','Összeg,Indoklás,Dátum','yes','',''),(153,'Bevétel',146,'00002795','','no','Összeg,Indoklás,Dátum','bevétel'),(156,'Kiadás',146,'00002796','','no','Összeg,Indoklás,Dátum','kiadás'),(157,'Vásárlás',156,'','Összeg,Indoklás,Dátum','yes','',''),(158,'fizu október',153,'00002795','Összeg,Indoklás,Dátum','yes','',''),(159,'fizu november',153,'00002795','Összeg,Indoklás,Dátum','yes','',''),(164,'',133,'','tétel','yes','',''),(166,'',165,'','tétel','yes','',''),(173,'Súly',171,'0001fa7a','','no','Dátum,Súly,Megjegyzés','mérés'),(174,'',173,'','Dátum,Súly,Megjegyzés','yes','',''),(175,'',173,'','Dátum,Súly,Megjegyzés','yes','',''),(177,'Barátok',1,'0001f919','','no','nev,datum,Jegyzetek','barát'),(178,'',177,'','nev,datum,Jegyzetek','yes','',''),(180,'',153,'','Összeg,Indoklás,Dátum','yes','',''),(183,'',156,'','Összeg,Indoklás,Dátum','yes','',''),(184,'Típusok',146,'0001f4ac','','no','Név,Ikon','típus'),(185,'Bevétel új',146,'00002795','','no','Összeg,Indoklás,Típus,Dátum','bevétel'),(188,'',187,'','Élelmiszer,Lejárati dátum,Egységszám','yes','',''),(189,'',187,'','Élelmiszer,Lejárati dátum,Egységszám','yes','',''),(191,'',190,'','Élelmiszer,Lejárati dátum,Egységszám','yes','',''),(192,'',190,'','Élelmiszer,Lejárati dátum,Egységszám','yes','',''),(195,'Élelmiszer',1,'0001f357','','no','Név,Fehérje,Só,Egység,Egységár','termék'),(199,'',195,'','Név,Fehérje,Só,Egység,Egységár','yes','',''),(200,'',195,'','Név,Fehérje,Só,Egység,Egységár','yes','',''),(201,'LIDL gouda sajt',195,'','Név,Fehérje,Só,Egység,Egységár','yes','',''),(209,'Hűtő',90,'0001f9ca','','no','Élelmiszer,Lejárati dátum,Egységszám','tétel'),(210,'1',209,'','Élelmiszer,Lejárati dátum,Egységszám','yes','','');
/*!40000 ALTER TABLE `master_tree` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-12-01 12:55:29
