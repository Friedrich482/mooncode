import { sql } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { PASSWORD_RESET_CODE_LENGTH } from "@repo/common/constants";

import { timestamps } from "../columns.helpers";
import { users } from "./users";

export const passwordResets = pgTable(
  "password_resets",
  {
    id: varchar("id", { length: 26 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid().toLowerCase()),
    userId: varchar("user_id", { length: 26 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull().unique(),

    code: varchar("code", { length: PASSWORD_RESET_CODE_LENGTH }).notNull(),
    attempts: integer().notNull().default(0),
    expiresAt: timestamp("expires_at")
      .notNull()
      .default(sql`now() + interval '15 minutes'`),
    ...timestamps,
  },
  (table) => [
    index("password_resets_user_id_index").on(table.userId),
    index("password_resets_email_index").on(table.email),
  ]
);
