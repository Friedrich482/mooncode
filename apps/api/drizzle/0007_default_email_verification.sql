DO $$
BEGIN
    UPDATE users SET email_verified_at = NOW() WHERE email_verified_at IS NULL;--> statement-breakpoint
END $$;