CREATE TABLE `user_conversations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`history` varchar(8192) NOT NULL,
	`categories` varchar(255),
	`style` varchar(255),
	CONSTRAINT `user_conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_conversations_user_idx` UNIQUE(`user_id`,`started_at`)
);
--> statement-breakpoint
ALTER TABLE `user_conversations` ADD CONSTRAINT `user_conversations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;