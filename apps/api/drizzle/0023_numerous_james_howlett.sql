CREATE TABLE "telemetry" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"user_id" varchar(26) NOT NULL,
	"machine_id" text NOT NULL,
	"extension_version" text NOT NULL,
	"vscode_version" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "telemetry_user_id_index" ON "telemetry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "telemetry_vscode_version_index" ON "telemetry" USING btree ("vscode_version");