CREATE TABLE `teamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`role` varchar(160) NOT NULL,
	`bio` text,
	`imageUrl` varchar(512),
	`imageKey` varchar(512),
	`linkedinUrl` varchar(512),
	`instagramUrl` varchar(512),
	`facebookUrl` varchar(512),
	`tiktokUrl` varchar(512),
	`youtubeUrl` varchar(512),
	`websiteUrl` varchar(512),
	`position` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `teamMembers_public_position_idx` ON `teamMembers` (`isPublished`,`position`);