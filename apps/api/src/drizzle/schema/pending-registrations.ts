import { sql } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { PENDING_REGISTRATION_CODE_LENGTH } from "@repo/common/constants";

import { timestamps } from "../columns.helpers";

export const pendingRegistrations = pgTable("pending_registrations", {
  id: varchar("id", { length: 26 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid().toLowerCase()),

  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  code: varchar("code", { length: PENDING_REGISTRATION_CODE_LENGTH }).notNull(),
  attempts: integer().notNull().default(0),
  expiresAt: timestamp("expires_at")
    .notNull()
    .default(sql`now() + interval '30 minutes'`),
  ...timestamps,
});
