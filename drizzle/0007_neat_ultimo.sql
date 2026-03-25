CREATE TABLE `occasion_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`occasionKey` varchar(64) NOT NULL,
	`occasionLabel` varchar(128) NOT NULL,
	`imageUrl` text NOT NULL,
	`caption` varchar(255),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `occasion_photos_id` PRIMARY KEY(`id`)
);
