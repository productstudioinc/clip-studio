CREATE TABLE IF NOT EXISTS "music" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"audio_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_usage" DROP CONSTRAINT IF EXISTS "user_usage_subscription_id_subscriptions_id_fk";
--> statement-breakpoint
ALTER TABLE "user_usage" ALTER COLUMN "connected_accounts_left" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_usage" DROP COLUMN IF EXISTS "subscription_id";