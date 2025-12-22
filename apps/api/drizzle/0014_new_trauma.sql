DO $$
BEGIN
    ALTER TABLE "pending_registrations" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END$$;