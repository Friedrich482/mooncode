DO $$
BEGIN
    ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_google_email_unique";
    ALTER TABLE "users" ADD CONSTRAINT "users_google_email_unique" UNIQUE("google_email");
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;