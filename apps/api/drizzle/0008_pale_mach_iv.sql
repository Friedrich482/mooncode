DO $$
BEGIN
	CREATE TABLE "pending_registrations" (
		"id" varchar(26) PRIMARY KEY NOT NULL,
		"name" text NOT NULL,
		"email" text NOT NULL,
		"password" text NOT NULL,
		"created_at" timestamp DEFAULT now() NOT NULL,
		"updated_at" timestamp DEFAULT now() NOT NULL,
		CONSTRAINT "pending_registrations_name_unique" UNIQUE("name"),
		CONSTRAINT "pending_registrations_email_unique" UNIQUE("email")
	);--> statement-breakpoint

EXCEPTION
    WHEN duplicate_table THEN
        NULL;

END $$;
