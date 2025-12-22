DO $$
BEGIN
    ALTER TABLE "pending_registrations" RENAME COLUMN "password" TO "hashed_password";--> statement-breakpoint
EXCEPTION
    WHEN undefined_column THEN 
        NULL;
        
    WHEN duplicate_column THEN 
        NULL;
END $$;
