CREATE INDEX IF NOT EXISTS "daily_data_user_id_index" ON "daily_data" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_data_date_index" ON "daily_data" USING btree ("date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_id_index" ON "files" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "language_id_index" ON "files" USING btree ("language_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_name_idx" ON "files" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_path_idx" ON "files" USING btree ("path");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "language_daily_data_id_index" ON "languages" USING btree ("daily_data_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "language_slug_index" ON "languages" USING btree ("language_slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_daily_data_id_index" ON "projects" USING btree ("daily_data_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_name_index" ON "projects" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_path_index" ON "projects" USING btree ("path");