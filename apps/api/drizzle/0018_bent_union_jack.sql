ALTER TABLE "users" ALTER COLUMN "auth_method" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "auth_method" SET NOT NULL;