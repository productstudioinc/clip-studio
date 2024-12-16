DO $$ BEGIN
 CREATE TYPE "public"."upload_status" AS ENUM('pending', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user_uploads" ADD COLUMN "status" "upload_status" DEFAULT 'completed' NOT NULL;