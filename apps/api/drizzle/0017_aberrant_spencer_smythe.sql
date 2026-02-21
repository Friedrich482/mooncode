ALTER TABLE "email_verifications" DROP CONSTRAINT "email_verifications_username_unique";--> statement-breakpoint
ALTER TABLE "email_verifications" ADD COLUMN "verified_at" timestamp DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "email_verifications" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "email_verifications" DROP COLUMN "hashed_password";