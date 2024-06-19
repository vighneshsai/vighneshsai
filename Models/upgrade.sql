CREATE TABLE `appliedLeave` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `employeeId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `reason` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `approval` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `employee` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `phoneNumber` bigint DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `dob` datetime DEFAULT NULL,
  `appliedLeave` datetime DEFAULT NULL,
  `bloodGroup` char(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `personalLeave` int DEFAULT '0',
  `sickLeave` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `employee` (`id`, `name`, `age`, `phoneNumber`, `email`, `dob`, `appliedLeave`, `bloodGroup`, `personalLeave`, `sickLeave`)
VALUES
	(1, 'vicky', 39, 7896537257, 'vighnesh@gmail.com', '1985-05-17 00:00:00', NULL, NULL, 3, 4),
	(3, 'siva', 37, 7896537435, 'siva@gmail.com', '1987-05-17 00:00:00', NULL, NULL, 7, 5);
  
INSERT INTO `appliedLeave` (`id`, `startDate`, `endDate`, `employeeId`, `createdAt`, `updatedAt`, `reason`, `approval`)
VALUES
	(1, '2024-06-30', '2024-07-02', 1, NULL, NULL, 'not feeling Well', 1),
	(2, '2024-06-28', '2024-07-01', 1, NULL, NULL, 'going to marriage function', 0),
	(3, '2024-06-29', '2024-06-29', 3, NULL, NULL, 'gonna take licence', 0),
	(5, '2024-07-01', '2024-07-01', 1, NULL, NULL, 'House warming function', 0);

ALTER TABLE appliedLeave
MODIFY COLUMN approval ENUM('Approved', 'Waiting', 'Rejected') NOT NULL DEFAULT 'Waiting';  


