CREATE TABLE IF NOT EXISTS "users" (
    "id" varchar(26) PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "password" text NOT NULL,
    "profile_picture" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "users_name_unique" UNIQUE("name"),
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "daily_data" (
    "id" varchar(26) PRIMARY KEY NOT NULL,
    "user_id" varchar(26) NOT NULL,
    "date" date NOT NULL,
    "time_spent" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "languages" (
    "id" varchar(26) PRIMARY KEY NOT NULL,
    "daily_data_id" varchar(26) NOT NULL,
    "language_slug" text NOT NULL,
    "time_spent" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "projects" (
    "id" varchar(26) PRIMARY KEY NOT NULL,
    "daily_data_id" varchar(26) NOT NULL,
    "name" text NOT NULL,
    "path" text NOT NULL,
    "time_spent" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "files" (
    "id" varchar(26) PRIMARY KEY NOT NULL,
    "project_id" varchar(26) NOT NULL,
    "language_id" varchar(26) NOT NULL,
    "name" text NOT NULL,
    "path" text NOT NULL,
    "time_spent" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "daily_data" ADD CONSTRAINT "daily_data_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "languages" ADD CONSTRAINT "languages_daily_data_id_daily_data_id_fk" 
    FOREIGN KEY ("daily_data_id") REFERENCES "public"."daily_data"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "projects" ADD CONSTRAINT "projects_daily_data_id_daily_data_id_fk" 
    FOREIGN KEY ("daily_data_id") REFERENCES "public"."daily_data"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "files" ADD CONSTRAINT "files_project_id_projects_id_fk" 
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "files" ADD CONSTRAINT "files_language_id_languages_id_fk" 
    FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;