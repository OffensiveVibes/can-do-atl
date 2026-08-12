CREATE TABLE `siteText` (
	`id` int AUTO_INCREMENT NOT NULL,
	`textKey` varchar(80) NOT NULL,
	`value` text NOT NULL,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteText_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteText_textKey_unique` UNIQUE(`textKey`)
);
--> statement-breakpoint
CREATE INDEX `siteText_key_idx` ON `siteText` (`textKey`);