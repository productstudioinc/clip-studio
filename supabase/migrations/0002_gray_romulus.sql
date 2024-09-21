ALTER TABLE "plan_limits" ADD COLUMN IF NOT EXISTS "total_connected_accounts" integer;--> statement-breakpoint
ALTER TABLE "user_usage" ADD COLUMN IF NOT EXISTS "connected_accounts_left" integer;