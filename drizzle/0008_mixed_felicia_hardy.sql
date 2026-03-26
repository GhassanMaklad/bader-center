CREATE TABLE `occasions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`nameAr` varchar(128) NOT NULL,
	`icon` varchar(64) NOT NULL DEFAULT '🎉',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `occasions_id` PRIMARY KEY(`id`),
	CONSTRAINT `occasions_key_unique` UNIQUE(`key`)
);
