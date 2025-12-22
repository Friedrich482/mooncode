DO $$
BEGIN
    CREATE INDEX "daily_data_user_id_index" ON "daily_data" USING btree ("user_id");--> statement-breakpoint
    CREATE INDEX "daily_data_date_index" ON "daily_data" USING btree ("date");--> statement-breakpoint
    CREATE INDEX "project_id_index" ON "files" USING btree ("project_id");--> statement-breakpoint
    CREATE INDEX "language_id_index" ON "files" USING btree ("language_id");--> statement-breakpoint
    CREATE INDEX "file_name_idx" ON "files" USING btree ("name");--> statement-breakpoint
    CREATE INDEX "file_path_idx" ON "files" USING btree ("path");--> statement-breakpoint
    CREATE INDEX "language_daily_data_id_index" ON "languages" USING btree ("daily_data_id");--> statement-breakpoint
    CREATE INDEX "language_slug_index" ON "languages" USING btree ("language_slug");--> statement-breakpoint
    CREATE INDEX "project_daily_data_id_index" ON "projects" USING btree ("daily_data_id");--> statement-breakpoint
    CREATE INDEX "project_name_index" ON "projects" USING btree ("name");--> statement-breakpoint
    CREATE INDEX "project_path_index" ON "projects" USING btree ("path");--> statement-breakpoint

EXCEPTION
    WHEN duplicate_table THEN
        NULL;

    WHEN duplicate_object THEN
        NULL;
END $$;
