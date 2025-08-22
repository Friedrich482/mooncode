ALTER TABLE "users" ADD COLUMN "google_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_method" text DEFAULT 'email';--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_google_email_unique" UNIQUE("google_email");