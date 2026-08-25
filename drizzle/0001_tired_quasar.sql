CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` varchar(64) NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expertProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`registrationId` int NOT NULL,
	`headline` varchar(180),
	`bio` text,
	`avatarUrl` varchar(2048),
	`instagram` varchar(120),
	`generalSpecialties` json NOT NULL,
	`launchHistoryCount` int NOT NULL DEFAULT 0,
	`diagnosticCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expertProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `expertProfiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `expertProfiles_registrationId_unique` UNIQUE(`registrationId`)
);
--> statement-breakpoint
CREATE TABLE `launcherProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`registrationId` int NOT NULL,
	`headline` varchar(180),
	`bio` text,
	`avatarUrl` varchar(2048),
	`instagram` varchar(120),
	`niche` varchar(180) NOT NULL,
	`audienceDescription` text NOT NULL,
	`stage` enum('starting','growing','experienced') NOT NULL,
	`latestResult` text,
	`leoaCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `launcherProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `launcherProfiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `launcherProfiles_registrationId_unique` UNIQUE(`registrationId`)
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`interestId` int NOT NULL,
	`scheduledByUserId` int NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`location` varchar(180) NOT NULL,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`operationalNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meetings_id` PRIMARY KEY(`id`),
	CONSTRAINT `meetings_interestId_unique` UNIQUE(`interestId`)
);
--> statement-breakpoint
CREATE TABLE `projectInterests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`launcherProfileId` int NOT NULL,
	`status` enum('declared','requested','confirmed','closed') NOT NULL DEFAULT 'declared',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectInterests_id` PRIMARY KEY(`id`),
	CONSTRAINT `projectInterests_project_launcher_unique` UNIQUE(`projectId`,`launcherProfileId`)
);
--> statement-breakpoint
CREATE TABLE `projectTriages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`reviewerUserId` int NOT NULL,
	`nicheReviewed` boolean NOT NULL DEFAULT false,
	`avatarReviewed` boolean NOT NULL DEFAULT false,
	`romaReviewed` boolean NOT NULL DEFAULT false,
	`maturityReviewed` boolean NOT NULL DEFAULT false,
	`decision` enum('eligible','not_eligible') NOT NULL,
	`observation` text NOT NULL,
	`reviewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectTriages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expertProfileId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`niche` varchar(180) NOT NULL,
	`subniche` varchar(180) NOT NULL,
	`specialties` json NOT NULL,
	`maturity` enum('structuring','validated','launched') NOT NULL,
	`avatarDescription` text NOT NULL,
	`pains` json NOT NULL,
	`ambition` text NOT NULL,
	`roma` text NOT NULL,
	`mechanism` text NOT NULL,
	`offerFormat` varchar(120) NOT NULL,
	`priceRange` varchar(120) NOT NULL,
	`mainChannel` varchar(180) NOT NULL,
	`primaryLink` varchar(2048) NOT NULL,
	`evidence` text,
	`internalNote` text,
	`informationConfirmed` boolean NOT NULL DEFAULT false,
	`curationAuthorized` boolean NOT NULL DEFAULT false,
	`exposureAcknowledged` boolean NOT NULL DEFAULT false,
	`status` enum('draft','submitted','under_review','eligible','not_eligible') NOT NULL DEFAULT 'draft',
	`submittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_expertProfileId_unique` UNIQUE(`expertProfileId`)
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`requestedRole` enum('expert','lancador') NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`fullName` varchar(180) NOT NULL,
	`phone` varchar(32),
	`instagram` varchar(120),
	`approvedByUserId` int,
	`reviewNote` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `registrations_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expertProfiles` ADD CONSTRAINT `expertProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expertProfiles` ADD CONSTRAINT `expertProfiles_registrationId_registrations_id_fk` FOREIGN KEY (`registrationId`) REFERENCES `registrations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `launcherProfiles` ADD CONSTRAINT `launcherProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `launcherProfiles` ADD CONSTRAINT `launcherProfiles_registrationId_registrations_id_fk` FOREIGN KEY (`registrationId`) REFERENCES `registrations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_interestId_projectInterests_id_fk` FOREIGN KEY (`interestId`) REFERENCES `projectInterests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_scheduledByUserId_users_id_fk` FOREIGN KEY (`scheduledByUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectInterests` ADD CONSTRAINT `projectInterests_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectInterests` ADD CONSTRAINT `projectInterests_launcherProfileId_launcherProfiles_id_fk` FOREIGN KEY (`launcherProfileId`) REFERENCES `launcherProfiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectTriages` ADD CONSTRAINT `projectTriages_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectTriages` ADD CONSTRAINT `projectTriages_reviewerUserId_users_id_fk` FOREIGN KEY (`reviewerUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_expertProfileId_expertProfiles_id_fk` FOREIGN KEY (`expertProfileId`) REFERENCES `expertProfiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_approvedByUserId_users_id_fk` FOREIGN KEY (`approvedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `auditLogs_entity_idx` ON `auditLogs` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `projectInterests_status_idx` ON `projectInterests` (`status`);--> statement-breakpoint
CREATE INDEX `projectTriages_projectId_reviewedAt_idx` ON `projectTriages` (`projectId`,`reviewedAt`);--> statement-breakpoint
CREATE INDEX `projects_status_niche_idx` ON `projects` (`status`,`niche`);--> statement-breakpoint
CREATE INDEX `registrations_status_requestedRole_idx` ON `registrations` (`status`,`requestedRole`);