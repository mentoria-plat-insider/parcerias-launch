CREATE TABLE `adminAccessGrants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`fullName` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('pending','active','revoked') NOT NULL DEFAULT 'pending',
	`createdByUserId` int NOT NULL,
	`activatedAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminAccessGrants_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminAccessGrants_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `adminAccessGrants` ADD CONSTRAINT `adminAccessGrants_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `adminAccessGrants` ADD CONSTRAINT `adminAccessGrants_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `adminAccessGrants_status_idx` ON `adminAccessGrants` (`status`);