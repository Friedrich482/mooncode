import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { ulid } from "ulid";

const authMethodEnum = ["email", "google", "both"] as const;

export const users = pgTable("users", {
  id: varchar("id", { length: 26 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid().toLowerCase()),

  username: text("name").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  profilePicture: text("profile_picture").notNull(),
  googleId: text("google_id").unique(),
  googleEmail: text("google_email"),
  authMethod: text("auth_method", {
    enum: authMethodEnum,
  }).default("email"),
  ...timestamps,
});
