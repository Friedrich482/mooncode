DO $$
BEGIN
	CREATE TABLE "daily_data" (
		"id" varchar(26) PRIMARY KEY NOT NULL,
		"user_id" varchar(26) NOT NULL,
		"date" date NOT NULL,
		"time_spent" integer NOT NULL,
		"created_at" timestamp DEFAULT now() NOT NULL,
		"updated_at" timestamp DEFAULT now() NOT NULL
	);--> statement-breakpoint
	CREATE TABLE "files" (
		"id" varchar(26) PRIMARY KEY NOT NULL,
		"project_id" varchar(26) NOT NULL,
		"language_id" varchar(26) NOT NULL,
		"name" text NOT NULL,
		"path" text NOT NULL,
		"time_spent" integer DEFAULT 0 NOT NULL,
		"created_at" timestamp DEFAULT now() NOT NULL,
		"updated_at" timestamp DEFAULT now() NOT NULL
	);--> statement-breakpoint
	CREATE TABLE "languages" (
		"id" varchar(26) PRIMARY KEY NOT NULL,
		"daily_data_id" varchar(26) NOT NULL,
		"language_slug" text NOT NULL,
		"time_spent" integer DEFAULT 0 NOT NULL,
		"created_at" timestamp DEFAULT now() NOT NULL,
		"updated_at" timestamp DEFAULT now() NOT NULL
	);--> statement-breakpoint
	CREATE TABLE "projects" (
		"id" varchar(26) PRIMARY KEY NOT NULL,
		"daily_data_id" varchar(26) NOT NULL,
		"name" text NOT NULL,
		"path" text NOT NULL,
		"time_spent" integer DEFAULT 0 NOT NULL,
		"created_at" timestamp DEFAULT now() NOT NULL,
		"updated_at" timestamp DEFAULT now() NOT NULL
	);--> statement-breakpoint
	CREATE TABLE "users" (
		"id" varchar(26) PRIMARY KEY NOT NULL,
		"name" text NOT NULL,
		"email" text NOT NULL,
		"password" text NOT NULL,
		"profile_picture" text NOT NULL,
		"created_at" timestamp DEFAULT now() NOT NULL,
		"updated_at" timestamp DEFAULT now() NOT NULL,
		CONSTRAINT "users_name_unique" UNIQUE("name"),
		CONSTRAINT "users_email_unique" UNIQUE("email")
	);--> statement-breakpoint
	ALTER TABLE "daily_data" ADD CONSTRAINT "daily_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
	ALTER TABLE "files" ADD CONSTRAINT "files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
	ALTER TABLE "files" ADD CONSTRAINT "files_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
	ALTER TABLE "languages" ADD CONSTRAINT "languages_daily_data_id_daily_data_id_fk" FOREIGN KEY ("daily_data_id") REFERENCES "public"."daily_data"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
	ALTER TABLE "projects" ADD CONSTRAINT "projects_daily_data_id_daily_data_id_fk" FOREIGN KEY ("daily_data_id") REFERENCES "public"."daily_data"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

EXCEPTION
    WHEN duplicate_table THEN
        NULL;

    WHEN duplicate_object THEN
        NULL;

END $$;