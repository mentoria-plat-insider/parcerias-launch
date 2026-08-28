ALTER TABLE `launcherProfiles` ADD `launchHistoryCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `launcherProfiles` ADD `revenueLevel` varchar(120);--> statement-breakpoint
ALTER TABLE `launcherProfiles` ADD `launchDuration` varchar(120);--> statement-breakpoint
ALTER TABLE `launcherProfiles` ADD `mainDifficulties` text;--> statement-breakpoint
ALTER TABLE `registrations` ADD `termsAcceptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `registrations` ADD `regulationAcceptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `registrations` ADD `leoaCompleted` boolean;--> statement-breakpoint
ALTER TABLE `registrations` ADD `launchHistoryCount` int;--> statement-breakpoint
ALTER TABLE `registrations` ADD `revenueLevel` varchar(120);--> statement-breakpoint
ALTER TABLE `registrations` ADD `launchDuration` varchar(120);--> statement-breakpoint
ALTER TABLE `registrations` ADD `mainDifficulties` text;