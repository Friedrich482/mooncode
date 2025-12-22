DO $$
BEGIN
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" text;--> statement-breakpoint
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_email" text;--> statement-breakpoint
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "auth_method" text DEFAULT 'email';--> statement-breakpoint
    ALTER TABLE "users" DROP CONSTRAINT "users_google_email_unique";--> statement-breakpoint

EXCEPTION
    WHEN duplicate_table THEN
        NULL;
    WHEN duplicate_object THEN
        NULL;
    WHEN unique_violation THEN
        NULL;
    WHEN undefined_object THEN
        NULL;
END$$;

DO $$
BEGIN
    ALTER TABLE "users" ADD CONSTRAINT "users_google_email_unique" UNIQUE("google_email");
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
    WHEN duplicate_object THEN
        NULL;
    WHEN unique_violation THEN
        NULL;
END$$;