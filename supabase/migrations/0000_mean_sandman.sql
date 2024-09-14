DO $$ BEGIN
 CREATE TYPE "public"."plan_tier" AS ENUM('hobby', 'creator', 'pro');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."pricing_plan_interval" AS ENUM('day', 'week', 'month', 'year');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."pricing_type" AS ENUM('one_time', 'recurring');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."subscription_status" AS ENUM('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "background_parts" (
	"id" integer PRIMARY KEY NOT NULL,
	"background_id" integer NOT NULL,
	"part_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "backgrounds" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"preview_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"stripe_customer_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"feedback_type" text NOT NULL,
	"rating" integer,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "past_renders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_url" text,
	"template_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plan_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text,
	"export_seconds" integer NOT NULL,
	"voiceover_characters" integer NOT NULL,
	"transcription_seconds" integer NOT NULL,
	"connected_accounts" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prices" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text,
	"active" boolean,
	"description" text,
	"unit_amount" bigint,
	"currency" text,
	"type" "pricing_type",
	"interval" "pricing_plan_interval",
	"interval_count" integer,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" text PRIMARY KEY NOT NULL,
	"active" boolean,
	"name" text,
	"description" text,
	"image" text,
	"metadata" jsonb,
	"marketing_features" jsonb,
	"default_price_id" text,
	"plan_tier" "plan_tier"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_media_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "subscription_status",
	"metadata" jsonb,
	"price_id" text,
	"quantity" integer,
	"cancel_at_period_end" boolean,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"current_period_start" timestamp with time zone DEFAULT now() NOT NULL,
	"current_period_end" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone DEFAULT now(),
	"cancel_at" timestamp with time zone DEFAULT now(),
	"canceled_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "templates" (
	"id" integer PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"name" text NOT NULL,
	"preview_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tiktok_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tiktok_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tiktok_account_id" text NOT NULL,
	"parent_social_media_post_id" uuid NOT NULL,
	"caption" text,
	"disable_comment" boolean NOT NULL,
	"disable_duet" boolean NOT NULL,
	"disable_stitch" boolean NOT NULL,
	"privacy_level" text NOT NULL,
	"publicaly_available_post_id" text,
	"publish_id" text NOT NULL,
	"video_cover_timestamp_ms" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" text,
	"export_seconds_left" integer NOT NULL,
	"voiceover_characters_left" integer NOT NULL,
	"transcription_seconds_left" integer NOT NULL,
	"connected_accounts_left" integer NOT NULL,
	"last_reset_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_usage_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"billing_address" jsonb,
	"payment_method" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "youtube_channels" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"channel_custom_url" text NOT NULL,
	"credentials" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "youtube_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"youtube_channel_id" text NOT NULL,
	"parent_social_media_post_id" uuid NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "background_parts" ADD CONSTRAINT "background_parts_background_id_backgrounds_id_fk" FOREIGN KEY ("background_id") REFERENCES "public"."backgrounds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customers" ADD CONSTRAINT "customers_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "past_renders" ADD CONSTRAINT "past_renders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_limits" ADD CONSTRAINT "plan_limits_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prices" ADD CONSTRAINT "prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "social_media_posts" ADD CONSTRAINT "social_media_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_price_id_prices_id_fk" FOREIGN KEY ("price_id") REFERENCES "public"."prices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tiktok_accounts" ADD CONSTRAINT "tiktok_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tiktok_posts" ADD CONSTRAINT "tiktok_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tiktok_posts" ADD CONSTRAINT "tiktok_posts_tiktok_account_id_tiktok_accounts_id_fk" FOREIGN KEY ("tiktok_account_id") REFERENCES "public"."tiktok_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tiktok_posts" ADD CONSTRAINT "tiktok_posts_parent_social_media_post_id_social_media_posts_id_fk" FOREIGN KEY ("parent_social_media_post_id") REFERENCES "public"."social_media_posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_usage" ADD CONSTRAINT "user_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_usage" ADD CONSTRAINT "user_usage_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "youtube_channels" ADD CONSTRAINT "youtube_channels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "youtube_posts" ADD CONSTRAINT "youtube_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "youtube_posts" ADD CONSTRAINT "youtube_posts_youtube_channel_id_youtube_channels_id_fk" FOREIGN KEY ("youtube_channel_id") REFERENCES "public"."youtube_channels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "youtube_posts" ADD CONSTRAINT "youtube_posts_parent_social_media_post_id_social_media_posts_id_fk" FOREIGN KEY ("parent_social_media_post_id") REFERENCES "public"."social_media_posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
