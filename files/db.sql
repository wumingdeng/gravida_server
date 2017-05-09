CREATE TABLE `Pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name33` varchar(255) DEFAULT NULL,
  `name22` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0',
  `isMama` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;