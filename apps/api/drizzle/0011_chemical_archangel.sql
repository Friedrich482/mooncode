DO $$
BEGIN
    ALTER TABLE "users" RENAME COLUMN "password" TO "hashed_password";
EXCEPTION
    WHEN undefined_column OR duplicate_column THEN NULL;
END $$;
--> statement-breakpoint