import { index, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { timestamps } from "../columns.helpers";
import { branches } from "./branches";
import { languages } from "./languages";

export const files = pgTable(
  "files",
  {
    id: varchar("id", { length: 26 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid().toLowerCase()),
    branchId: varchar("branch_id", { length: 26 })
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    languageId: varchar("language_id", { length: 26 })
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    path: text("path").notNull(),
    timeSpent: integer("time_spent").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("language_id_index").on(table.languageId),
    index("file_name_index").on(table.name),
    index("file_path_index").on(table.path),
  ],
);
