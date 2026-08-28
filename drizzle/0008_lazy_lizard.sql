CREATE TABLE `eventSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationPhase` enum('launcher_open','expert_open','closed') NOT NULL DEFAULT 'launcher_open',
	`maxLaunchersPerRoom` int NOT NULL DEFAULT 10,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eventSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `expertProfiles` ADD `fixedRoom` varchar(120);--> statement-breakpoint
ALTER TABLE `eventSettings` ADD CONSTRAINT `eventSettings_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;