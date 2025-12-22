DO $$
BEGIN
    ALTER TABLE "pending_registrations" ADD COLUMN "code" varchar(8) NOT NULL;--> statement-breakpoint
EXCEPTION
    WHEN duplicate_column THEN
        NULL;

END $$;
