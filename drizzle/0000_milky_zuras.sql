CREATE TABLE `adminInvites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('pending','accepted','revoked') NOT NULL DEFAULT 'pending',
	`invitedBy` int NOT NULL,
	`invitedAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	CONSTRAINT `adminInvites_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminInvites_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`campus` varchar(160) NOT NULL,
	`details` text,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp,
	`linkHref` varchar(512),
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `heroSlides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eyebrow` varchar(120) NOT NULL,
	`headline` varchar(180) NOT NULL,
	`accent` varchar(180),
	`body` text NOT NULL,
	`imageUrl` varchar(512) NOT NULL,
	`imageKey` varchar(512),
	`imageAlt` varchar(255) NOT NULL,
	`volunteerHref` varchar(512),
	`donateHref` varchar(512),
	`position` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `heroSlides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteUpdates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`body` text NOT NULL,
	`linkLabel` varchar(80),
	`linkHref` varchar(512),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`authorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteUpdates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `adminInvites_status_idx` ON `adminInvites` (`status`);--> statement-breakpoint
CREATE INDEX `events_public_starts_idx` ON `events` (`isPublished`,`startsAt`);--> statement-breakpoint
CREATE INDEX `heroSlides_public_position_idx` ON `heroSlides` (`isPublished`,`position`);--> statement-breakpoint
CREATE INDEX `siteUpdates_status_created_idx` ON `siteUpdates` (`status`,`createdAt`);