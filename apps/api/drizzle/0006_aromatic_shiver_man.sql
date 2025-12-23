ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp DEFAULT NULL;
--> statement-breakpoint
