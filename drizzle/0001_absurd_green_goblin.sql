CREATE TABLE `impactMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricKey` varchar(64) NOT NULL,
	`value` int NOT NULL DEFAULT 0,
	`label` varchar(180) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`updatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `impactMetrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `impactMetrics_metricKey_unique` UNIQUE(`metricKey`)
);
--> statement-breakpoint
CREATE INDEX `impactMetrics_position_idx` ON `impactMetrics` (`position`);