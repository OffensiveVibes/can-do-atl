CREATE TABLE `serviceCards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardKey` varchar(64) NOT NULL,
	`imageUrl` varchar(512) NOT NULL,
	`imageKey` varchar(512),
	`hoverImageUrl` varchar(512) NOT NULL,
	`hoverImageKey` varchar(512),
	`imageAlt` varchar(255) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceCards_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceCards_cardKey_unique` UNIQUE(`cardKey`)
);
--> statement-breakpoint
CREATE TABLE `siteAppearance` (
	`id` int NOT NULL,
	`pageMode` varchar(16) NOT NULL,
	`pageColor` varchar(32) NOT NULL,
	`pageGradientFrom` varchar(32) NOT NULL,
	`pageGradientTo` varchar(32) NOT NULL,
	`pageImageUrl` varchar(512),
	`pageImageKey` varchar(512),
	`pageImageBlur` int NOT NULL DEFAULT 0,
	`pageOverlayOpacity` int NOT NULL DEFAULT 24,
	`headerMode` varchar(16) NOT NULL,
	`headerColor` varchar(32) NOT NULL,
	`headerGradientFrom` varchar(32) NOT NULL,
	`headerGradientTo` varchar(32) NOT NULL,
	`headerImageUrl` varchar(512),
	`headerImageKey` varchar(512),
	`headerImageBlur` int NOT NULL DEFAULT 0,
	`headerOverlayOpacity` int NOT NULL DEFAULT 8,
	`footerMode` varchar(16) NOT NULL,
	`footerColor` varchar(32) NOT NULL,
	`footerGradientFrom` varchar(32) NOT NULL,
	`footerGradientTo` varchar(32) NOT NULL,
	`footerImageUrl` varchar(512),
	`footerImageKey` varchar(512),
	`footerImageBlur` int NOT NULL DEFAULT 0,
	`footerOverlayOpacity` int NOT NULL DEFAULT 36,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteAppearance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `serviceCards_position_idx` ON `serviceCards` (`position`);