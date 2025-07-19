-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: kemelonline
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `accion` varchar(255) NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `beneficios_pan`
--

DROP TABLE IF EXISTS `beneficios_pan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beneficios_pan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `producto_id` int DEFAULT NULL,
  `descripcion` text NOT NULL,
  `calorias` decimal(10,2) DEFAULT NULL,
  `estado` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `beneficios_pan_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beneficios_pan`
--

LOCK TABLES `beneficios_pan` WRITE;
/*!40000 ALTER TABLE `beneficios_pan` DISABLE KEYS */;
/*!40000 ALTER TABLE `beneficios_pan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ciudades`
--

DROP TABLE IF EXISTS `ciudades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ciudades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ciudades`
--

LOCK TABLES `ciudades` WRITE;
/*!40000 ALTER TABLE `ciudades` DISABLE KEYS */;
INSERT INTO `ciudades` VALUES (1,'Bucaramanga','activo'),(2,'Floridablanca','activo'),(3,'Giron','activo'),(4,'Piedecuesta','activo');
/*!40000 ALTER TABLE `ciudades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `condiciones_pan`
--

DROP TABLE IF EXISTS `condiciones_pan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `condiciones_pan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `producto_id` int DEFAULT NULL,
  `condiciones` text NOT NULL,
  `estado` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `condiciones_pan_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `condiciones_pan`
--

LOCK TABLES `condiciones_pan` WRITE;
/*!40000 ALTER TABLE `condiciones_pan` DISABLE KEYS */;
/*!40000 ALTER TABLE `condiciones_pan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `pedido_id` int DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) DEFAULT NULL,
  `estado` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturas`
--

LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_pedido`
--

DROP TABLE IF EXISTS `historial_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_pedido` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `pedido_id` int DEFAULT NULL,
  `estado_anterior` enum('pendiente','procesado','enviado','entregado','cancelado') DEFAULT NULL,
  `nuevo_estado` enum('pendiente','procesado','enviado','entregado','cancelado') DEFAULT NULL,
  `fecha_cambio` datetime DEFAULT CURRENT_TIMESTAMP,
  `cambiado_por` int DEFAULT NULL,
  `estado` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  KEY `cambiado_por` (`cambiado_por`),
  CONSTRAINT `historial_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `historial_pedido_ibfk_2` FOREIGN KEY (`cambiado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_pedido`
--

LOCK TABLES `historial_pedido` WRITE;
/*!40000 ALTER TABLE `historial_pedido` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `producto_id` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `estado` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `pedido_id` int DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta','transferencia') DEFAULT NULL,
  `fecha_pago` datetime DEFAULT CURRENT_TIMESTAMP,
  `confirmado` tinyint(1) DEFAULT '0',
  `estado` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_detalles`
--

DROP TABLE IF EXISTS `pedido_detalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_detalles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `pedido_id` int DEFAULT NULL,
  `producto_id` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `estado` enum('pendiente','aprobado','preparado','entregado','cancelado') DEFAULT 'pendiente',
  `estado_registro` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  `subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `pedido_detalles_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `pedido_detalles_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_detalles`
--

LOCK TABLES `pedido_detalles` WRITE;
/*!40000 ALTER TABLE `pedido_detalles` DISABLE KEYS */;
INSERT INTO `pedido_detalles` VALUES (1,'Pan Café Chocolate 200g',1,4,1,26500.00,'pendiente','activo',26500.00),(2,'Pan Banano Nuez 125g',1,5,1,16500.00,'pendiente','activo',16500.00),(3,'Pan Café Chocolate 200g',2,4,1,26500.00,'pendiente','activo',26500.00),(4,'Pan Banano Nuez 125g',2,5,1,16500.00,'pendiente','activo',16500.00),(5,'Pan Banano Nuez 200g',2,6,1,26500.00,'pendiente','activo',26500.00),(6,'Pan Café Chocolate 200g',3,4,1,26500.00,'pendiente','activo',26500.00),(7,'Pan Banano Nuez 125g',3,5,1,16500.00,'pendiente','activo',16500.00),(8,'Pan Banano Nuez 200g',3,6,1,26500.00,'pendiente','activo',26500.00),(9,'Pan Manzana Verde 200g',4,2,1,26500.00,'pendiente','activo',26500.00),(10,'Pan Café Chocolate 125g',4,3,1,16500.00,'pendiente','activo',16500.00),(11,'Pan Banano Nuez 200g',4,6,1,26500.00,'pendiente','activo',26500.00),(12,'Pan Manzana Verde 125g',5,1,1,16500.00,'pendiente','activo',16500.00),(13,'Pan Manzana Verde 200g',5,2,1,26500.00,'pendiente','activo',26500.00),(14,'Pan Café Chocolate 125g',5,3,1,16500.00,'pendiente','activo',16500.00),(15,'Pan Banano Nuez 125g',5,5,1,16500.00,'pendiente','activo',16500.00),(16,'Pan Café Chocolate 200g',6,4,2,26500.00,'pendiente','activo',53000.00),(17,'Pan Banano Nuez 125g',6,5,1,16500.00,'pendiente','activo',16500.00),(18,'Pan Banano Nuez 200g',6,6,1,26500.00,'pendiente','activo',26500.00),(19,'Pan Café Chocolate 200g',7,4,1,26500.00,'pendiente','activo',26500.00),(20,'Pan Banano Nuez 125g',7,5,1,16500.00,'pendiente','activo',16500.00);
/*!40000 ALTER TABLE `pedido_detalles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `fecha_pedido` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','aprobado','preparado','entregado','cancelado') DEFAULT 'pendiente',
  `direccion_entrega` varchar(255) DEFAULT NULL,
  `ciudad_id` int DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `estado_registro` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `ciudad_id` (`ciudad_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`ciudad_id`) REFERENCES `ciudades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,'Pedido de cliente',5,'2025-07-19 07:35:44','aprobado','calle 68#16-12',1,43000.00,'activo'),(2,'Pedido de cliente',5,'2025-07-19 07:37:23','aprobado','calle 68#16-12',1,69500.00,'activo'),(3,'Pedido de cliente',5,'2025-07-19 07:37:27','preparado','calle 68#16-12',1,69500.00,'eliminado'),(4,'Pedido de cliente',5,'2025-07-19 07:47:10','aprobado','calle 68#16-12',1,69500.00,'activo'),(5,'Pedido de cliente',5,'2025-07-19 08:33:32','aprobado','calle 68#16-12',1,76000.00,'activo'),(6,'Pedido de cliente',5,'2025-07-19 08:33:38','preparado','calle 68#16-12',1,96000.00,'eliminado'),(7,'Pedido de cliente',5,'2025-07-19 11:27:40','aprobado','calle 68#16-12',1,43000.00,'activo');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `creado_por` int DEFAULT NULL,
  `estado` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `creado_por` (`creado_por`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Pan Manzana Verde 125g','Delicioso pan casero con trozos de manzana verde fresca, perfecto para el desayuno.',16500.00,'1.png','2025-07-19 07:12:28',1,'activo'),(2,'Pan Manzana Verde 200g','Delicioso pan casero con trozos de manzana verde fresca, perfecto para el desayuno. Tamaño familiar.',26500.00,'2.png','2025-07-19 07:12:28',1,'activo'),(3,'Pan Café Chocolate 125g','Exquisito pan con sabor a café y chips de chocolate, ideal para los amantes del café.',16500.00,'1.png','2025-07-19 07:12:28',1,'activo'),(4,'Pan Café Chocolate 200g','Exquisito pan con sabor a café y chips de chocolate, ideal para los amantes del café. Tamaño familiar.',26500.00,'2.png','2025-07-19 07:12:28',1,'activo'),(5,'Pan Banano Nuez 125g','Pan nutritivo con banano maduro y nueces crujientes, rico en potasio y omega 3.',16500.00,'1.png','2025-07-19 07:12:28',1,'activo'),(6,'Pan Banano Nuez 200g','Pan nutritivo con banano maduro y nueces crujientes, rico en potasio y omega 3. Tamaño familiar.',26500.00,'2.png','2025-07-19 07:12:28',1,'activo'),(7,'panaderopan','qwerasfed',499.99,'1752946890050_captura_de_pantalla_2025_07_15_203106.png','2025-07-19 12:41:30',NULL,'activo');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `clave` varchar(255) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ciudad_id` int DEFAULT NULL,
  `rol` enum('admin','cliente','panaderia') DEFAULT 'cliente',
  `refresh_token` text,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('activo','inactivo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `ciudad_id` (`ciudad_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`ciudad_id`) REFERENCES `ciudades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','Administrador','admin123','admin@kemel.com','1234567890','Dirección admin',1,'panaderia',NULL,'2025-07-19 07:12:28','activo'),(2,'panadero2','Panadero Dos','$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','panadero2@kemel.com','3001234567','Calle Panadería 123',1,'panaderia',NULL,'2025-07-19 07:12:28','activo'),(3,'jllozada289','Jose Luis paez lozada','$2b$12$56aVwlaMMIXnv1nzUl0GFeidUS8y1SdndzVPL0rJh493WQn6e4wEG','jllozada289@gmail.com','3175183501','calle 68#16-12',1,'admin','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJqbGxvemFkYTI4OUBnbWFpbC5jb20iLCJub21icmUiOiJKb3NlIEx1aXMgcGFleiBsb3phZGEiLCJyb2wiOiJhZG1pbiIsImlhdCI6MTc1Mjk0NTg0NSwiZXhwIjoxNzUyOTQ2NDQ1fQ.Gl3BDVrahW4fycBlwOlf7ieBHswPaPffxYFpsPiZXFk','2025-07-19 07:12:58','activo'),(4,'panadero','panaderopan','$2b$12$qnaD4DtAxBWXOHi9tw7hBOBwccMCIVGpPAQtfgWkKikk1cYqNf1My','panadero@gmail.com','3175183501','calle 68#16-12',1,'panaderia','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJwYW5hZGVyb0BnbWFpbC5jb20iLCJub21icmUiOiJwYW5hZGVyb3BhbiIsInJvbCI6InBhbmFkZXJpYSIsImlhdCI6MTc1Mjk0MjUwMSwiZXhwIjoxNzUyOTQzMTAxfQ.18UekMHsYrgG6QB606Aex_8y89LOON8hVsy7YqkpxkE','2025-07-19 07:20:03','activo'),(5,'cliente','cliente','$2b$12$gcqY6ZHb5E7artKluVd9i.s8jm1AnMNNQQOGsGeLY2KPzBII.9WqS','cliente@gmail.com','3175183501','calle 68#16-12',1,'cliente','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjbGllbnRlQGdtYWlsLmNvbSIsIm5vbWJyZSI6ImNsaWVudGUiLCJyb2wiOiJjbGllbnRlIiwiaWF0IjoxNzUyOTQyNDQ3LCJleHAiOjE3NTI5NDMwNDd9.7juK-EILbCB9tUcapWunH4RxpbtPlpJHQiyVg-iR2Lc','2025-07-19 07:34:22','activo');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-19 12:44:48
