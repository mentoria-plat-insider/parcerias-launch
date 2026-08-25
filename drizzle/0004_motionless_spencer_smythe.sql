ALTER TABLE `meetings` ADD `resource` varchar(120) DEFAULT 'A definir' NOT NULL;--> statement-breakpoint
ALTER TABLE `meetings` ADD `resource` varchar(120) NOT NULL DEFAULT 'A definir';--> statement-breakpoint
ALTER TABLE `meetings` ADD `durationMinutes` int DEFAULT 30 NOT NULL;--> statement-breakpoint
CREATE INDEX `meetings_resource_schedule_idx` ON `meetings` (`resource`,`scheduledFor`);
