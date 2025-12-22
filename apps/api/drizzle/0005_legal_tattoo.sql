DO $$
BEGIN
    ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_google_email_unique";--> statement-breakpoint
    ALTER TABLE "users" ADD CONSTRAINT "users_google_email_unique" UNIQUE("google_email");--> statement-breakpoint
END$$;