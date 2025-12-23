DO $$
BEGIN
    ALTER TABLE "pending_registrations" RENAME COLUMN "password" TO "hashed_password";
EXCEPTION
    WHEN undefined_column OR duplicate_column THEN NULL;
END $$;