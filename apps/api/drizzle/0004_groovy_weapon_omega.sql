DO $$
BEGIN
    ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_google_email_unique";--> statement-breakpoint
    ALTER TABLE "users" ADD CONSTRAINT "users_google_id_unique" UNIQUE("google_id");--> statement-breakpoint
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
    WHEN duplicate_object THEN
        NULL;
    WHEN unique_violation THEN
        NULL;
END$$;
