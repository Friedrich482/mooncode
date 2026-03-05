import { sql } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { EMAIL_VERIFICATION_CODE_LENGTH } from "@repo/common/constants";

import { timestamps } from "../columns.helpers";

export const emailVerifications = pgTable("email_verifications", {
  id: varchar("id", { length: 26 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid().toLowerCase()),

  email: text("email").notNull().unique(),
  code: varchar("code", { length: EMAIL_VERIFICATION_CODE_LENGTH }).notNull(),
  attempts: integer().notNull().default(0),
  expiresAt: timestamp("expires_at")
    .notNull()
    .default(sql`now() + interval '30 minutes'`),
  verifiedAt: timestamp("verified_at").default(sql`NULL`),
  ...timestamps,
});
