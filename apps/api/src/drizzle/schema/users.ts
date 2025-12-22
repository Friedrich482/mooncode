import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { timestamps } from "../columns.helpers";

export const authMethodEnum = ["email", "google", "both"] as const;

export const users = pgTable("users", {
  id: varchar("id", { length: 26 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid().toLowerCase()),

  username: text("name").notNull().unique(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  profilePicture: text("profile_picture").notNull(),
  googleId: text("google_id").unique(),
  googleEmail: text("google_email").unique(),
  authMethod: text("auth_method", {
    enum: authMethodEnum,
  }).default("email"),
  emailVerifiedAt: timestamp("email_verified_at").default(sql`NULL`),
  ...timestamps,
});
