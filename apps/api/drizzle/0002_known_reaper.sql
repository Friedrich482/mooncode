DO $$
BEGIN
    DROP INDEX "file_name_idx";--> statement-breakpoint
    DROP INDEX "file_path_idx";--> statement-breakpoint
    CREATE INDEX "file_name_index" ON "files" USING btree ("name");--> statement-breakpoint
    CREATE INDEX "file_path_index" ON "files" USING btree ("path");--> statement-breakpoint
EXCEPTION
    WHEN undefined_object THEN
        NULL;
    WHEN duplicate_table THEN
        NULL;

    WHEN duplicate_object THEN
        NULL;
END $$;
