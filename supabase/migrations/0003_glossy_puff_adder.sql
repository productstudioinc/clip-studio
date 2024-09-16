CREATE TABLE IF NOT EXISTS "credit_equivalence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"export_seconds" integer NOT NULL,
	"voiceover_characters" integer NOT NULL,
	"transcribe_minutes" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plan_limits" ALTER COLUMN "total_credits" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_limits" ALTER COLUMN "total_connected_accounts" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_usage" ALTER COLUMN "credits_left" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_usage" ALTER COLUMN "connected_accounts_left" SET NOT NULL;