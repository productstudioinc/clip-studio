ALTER TABLE "plan_limits" ADD COLUMN "total_credits" integer;--> statement-breakpoint
ALTER TABLE "user_usage" ADD COLUMN "credits_left" integer;--> statement-breakpoint
ALTER TABLE "plan_limits" DROP COLUMN IF EXISTS "export_seconds";--> statement-breakpoint
ALTER TABLE "plan_limits" DROP COLUMN IF EXISTS "voiceover_characters";--> statement-breakpoint
ALTER TABLE "plan_limits" DROP COLUMN IF EXISTS "transcription_seconds";--> statement-breakpoint
ALTER TABLE "plan_limits" DROP COLUMN IF EXISTS "connected_accounts";--> statement-breakpoint
ALTER TABLE "user_usage" DROP COLUMN IF EXISTS "export_seconds_left";--> statement-breakpoint
ALTER TABLE "user_usage" DROP COLUMN IF EXISTS "voiceover_characters_left";--> statement-breakpoint
ALTER TABLE "user_usage" DROP COLUMN IF EXISTS "transcription_seconds_left";--> statement-breakpoint
ALTER TABLE "user_usage" DROP COLUMN IF EXISTS "connected_accounts_left";