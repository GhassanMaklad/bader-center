ALTER TABLE `orders` MODIFY COLUMN `status` enum('pending','confirmed','paid','cancelled') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `customerEmail`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `myfatoorahInvoiceId`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `myfatoorahPaymentId`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `invoiceUrl`;