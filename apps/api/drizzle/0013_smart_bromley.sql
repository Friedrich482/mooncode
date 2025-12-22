DO $$
BEGIN
	CREATE TABLE "password_resets" (
		"id" varchar(26) PRIMARY KEY NOT NULL,
		"user_id" varchar(26) NOT NULL,
		"email" text NOT NULL,
		"code" varchar(8) NOT NULL,
		"attempts" integer DEFAULT 0 NOT NULL,
		"expires_at" timestamp DEFAULT now() + interval '15 minutes' NOT NULL,
		"created_at" timestamp DEFAULT now() NOT NULL,
		"updated_at" timestamp DEFAULT now() NOT NULL,
		CONSTRAINT "password_resets_email_unique" UNIQUE("email")
	);
	--> statement-breakpoint
	ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
	CREATE INDEX "password_resets_user_id_index" ON "password_resets" USING btree ("user_id");--> statement-breakpoint
	CREATE INDEX "password_resets_email_index" ON "password_resets" USING btree ("email");--> statement-breakpoint
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
    WHEN duplicate_object THEN
        NULL;
    WHEN unique_violation THEN
        NULL;
END$$;
