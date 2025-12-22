DO $$
BEGIN
    ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp DEFAULT NULL;
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END $$;