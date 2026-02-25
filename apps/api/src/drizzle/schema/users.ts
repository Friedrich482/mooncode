import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { timestamps } from "../columns.helpers";

export const authMethodEnum = ["email", "google", "both"] as const;

export const authMethodColumn = pgEnum("auth_method", authMethodEnum);

export const users = pgTable("users", {
  id: varchar("id", { length: 26 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid().toLowerCase()),

  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  profilePicture: text("profile_picture"),
  googleId: text("google_id").unique(),
  googleEmail: text("google_email").unique(),
  authMethod: authMethodColumn("auth_method").notNull(),
  emailVerifiedAt: timestamp("email_verified_at").default(sql`NULL`),
  ...timestamps,
});
