ALTER TABLE "pending_registrations" RENAME TO "email_verifications";--> statement-breakpoint
ALTER TABLE "email_verifications" DROP CONSTRAINT "pending_registrations_username_unique";--> statement-breakpoint
ALTER TABLE "email_verifications" DROP CONSTRAINT "pending_registrations_email_unique";--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_username_unique" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_email_unique" UNIQUE("email");