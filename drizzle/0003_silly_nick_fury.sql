CREATE TABLE `service_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`occasion` varchar(64) NOT NULL,
	`occasionLabel` varchar(128) NOT NULL,
	`date` varchar(20) NOT NULL,
	`budget` varchar(64) NOT NULL,
	`budgetLabel` varchar(128) NOT NULL,
	`notes` text,
	`status` enum('new','contacted','completed','cancelled') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_requests_id` PRIMARY KEY(`id`)
);
