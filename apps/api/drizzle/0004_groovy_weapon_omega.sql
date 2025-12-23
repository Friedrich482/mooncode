DO $$
BEGIN
    BEGIN
        ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_google_email_unique";
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;

    BEGIN
        ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_google_id_unique";
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;

    ALTER TABLE "users" ADD CONSTRAINT "users_google_id_unique" UNIQUE("google_id");

EXCEPTION
    WHEN duplicate_object OR duplicate_table OR unique_violation THEN
        NULL;
END $$;