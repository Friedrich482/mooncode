ALTER TABLE "files"
DROP CONSTRAINT "files_project_id_projects_id_fk";

--> statement-breakpoint
DROP INDEX "project_id_index";

--> statement-breakpoint
ALTER TABLE "files"
DROP COLUMN "project_id";

ALTER TABLE "files"
ALTER COLUMN branch_id
SET
    NOT NULL