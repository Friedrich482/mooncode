DROP INDEX IF EXISTS "file_name_idx";
--> statement-breakpoint
DROP INDEX IF EXISTS "file_path_idx";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_name_index" ON "files" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_path_index" ON "files" USING btree ("path");