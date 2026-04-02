CREATE TABLE `artifacts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`creator_name` text NOT NULL,
	`public_url` text NOT NULL,
	`local_path` text,
	`reaction_count` integer DEFAULT 0 NOT NULL,
	`ingested_at` integer NOT NULL,
	`processed_flag` integer DEFAULT false NOT NULL,
	`kannaka_score` real,
	`narrative` text,
	`rarity_score` integer,
	`drop_id` text
);
--> statement-breakpoint
CREATE TABLE `drops` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`rarity_tier` text NOT NULL,
	`price` real NOT NULL,
	`created_at` integer NOT NULL
);
