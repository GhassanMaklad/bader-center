ALTER TABLE `occasions` ADD `title` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `occasions` ADD `desc` varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `occasionKeys` text;--> statement-breakpoint
ALTER TABLE `occasions` DROP COLUMN `nameAr`;