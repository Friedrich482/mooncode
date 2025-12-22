DO $$
BEGIN
    ALTER TABLE "pending_registrations" ADD COLUMN "expires_at" timestamp DEFAULT now() + interval '30 minutes' NOT NULL;--> statement-breakpoint
EXCEPTION
    WHEN duplicate_column THEN
        NULL;

END $$;
