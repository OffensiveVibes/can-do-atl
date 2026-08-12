ALTER TABLE `siteAppearance` ADD `siteName` varchar(80) DEFAULT 'Can Do ATL' NOT NULL;--> statement-breakpoint
ALTER TABLE `siteAppearance` ADD `tabTitle` varchar(100) DEFAULT 'Can Do ATL — Student-led mutual aid' NOT NULL;--> statement-breakpoint
ALTER TABLE `siteAppearance` ADD `logoUrl` varchar(512) DEFAULT '/manus-storage/cando-atlanta-pencil-logo_ae816652.png' NOT NULL;--> statement-breakpoint
ALTER TABLE `siteAppearance` ADD `logoKey` varchar(512);--> statement-breakpoint
ALTER TABLE `siteAppearance` ADD `logoAlt` varchar(255) DEFAULT 'Atlanta pencil surrounded by grocery essentials' NOT NULL;--> statement-breakpoint
ALTER TABLE `siteAppearance` ADD `primaryColor` varchar(32) DEFAULT '#3A5A40' NOT NULL;--> statement-breakpoint
ALTER TABLE `siteAppearance` ADD `accentColor` varchar(32) DEFAULT '#BC6C25' NOT NULL;--> statement-breakpoint
ALTER TABLE `siteAppearance` ADD `highlightColor` varchar(32) DEFAULT '#F1CB6B' NOT NULL;--> statement-breakpoint
ALTER TABLE `siteAppearance` ADD `inkColor` varchar(32) DEFAULT '#2C2C2C' NOT NULL;--> statement-breakpoint
ALTER TABLE `siteAppearance` ADD `buttonShape` varchar(16) DEFAULT 'pill' NOT NULL;