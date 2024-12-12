ALTER TABLE "user_uploads" DROP CONSTRAINT "user_uploads_template_id_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "user_uploads" DROP COLUMN IF EXISTS "template_id";