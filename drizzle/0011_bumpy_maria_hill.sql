CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`icon` varchar(16) NOT NULL DEFAULT '✨',
	`text` varchar(300) NOT NULL,
	`cta` varchar(50) NOT NULL DEFAULT '',
	`ctaLink` varchar(255) NOT NULL DEFAULT '/request',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
