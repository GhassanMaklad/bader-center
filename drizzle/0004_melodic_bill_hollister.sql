CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320),
	`customerPhone` varchar(30),
	`totalAmount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'KWD',
	`status` enum('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
	`myfatoorahInvoiceId` varchar(100),
	`myfatoorahPaymentId` varchar(100),
	`invoiceUrl` text,
	`cartItems` text NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
