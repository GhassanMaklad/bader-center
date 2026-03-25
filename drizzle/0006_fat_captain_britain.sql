CREATE TABLE `gallery_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`image` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`span` varchar(100) NOT NULL DEFAULT 'col-span-1 row-span-1',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`features` text NOT NULL,
	`bgGradient` varchar(255) NOT NULL DEFAULT 'linear-gradient(135deg, #B89050 0%, #9C7A3C 40%, #7A5C28 100%)',
	`iconColor` varchar(20) NOT NULL DEFAULT '#FFF3D0',
	`accentColor` varchar(20) NOT NULL DEFAULT '#F5E0A0',
	`image` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_cards_id` PRIMARY KEY(`id`)
);
