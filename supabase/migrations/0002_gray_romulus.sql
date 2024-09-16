ALTER TABLE "plan_limits" ADD COLUMN "total_connected_accounts" integer;--> statement-breakpoint
ALTER TABLE "user_usage" ADD COLUMN "connected_accounts_left" integer;