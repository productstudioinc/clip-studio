ALTER TABLE "prices" ADD COLUMN IF NOT EXISTS "trial_period_days" integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "trial_start" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "trial_end" timestamp with time zone DEFAULT now();