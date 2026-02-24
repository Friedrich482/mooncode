ALTER TABLE "users"
ALTER COLUMN "profile_picture"
DROP NOT NULL;

UPDATE "public"."users"
SET
    profile_picture = NULL
WHERE
    auth_method = 'email';