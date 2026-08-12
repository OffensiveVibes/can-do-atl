CREATE TABLE `adminAccessRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`note` text,
	`status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending',
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`decidedBy` int,
	`decidedAt` timestamp,
	CONSTRAINT `adminAccessRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminAccessRequests_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `adminAccessRequests_status_requested_idx` ON `adminAccessRequests` (`status`,`requestedAt`);