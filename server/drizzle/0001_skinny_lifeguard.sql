CREATE TABLE `danielknowledge` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`body` longtext NOT NULL,
	`tags` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `danielknowledge_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jennyknowledge` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`body` longtext NOT NULL,
	`tags` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jennyknowledge_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tylerknowledge` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`body` longtext NOT NULL,
	`tags` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tylerknowledge_id` PRIMARY KEY(`id`)
);
