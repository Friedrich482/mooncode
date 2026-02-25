CREATE TYPE "public"."auth_method" AS ENUM ('email', 'google', 'both');

--> statement-breakpoint
ALTER TABLE "users"
ALTER COLUMN "auth_method" TYPE "public"."auth_method" USING auth_method::"public"."auth_method";