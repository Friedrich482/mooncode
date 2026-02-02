import { index, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { timestamps } from "../columns.helpers";
import { dailyData } from "./daily-data";

export const projects = pgTable(
  "projects",
  {
    id: varchar("id", { length: 26 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid().toLowerCase()),
    dailyDataId: varchar("daily_data_id", { length: 26 })
      .notNull()
      .references(() => dailyData.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    path: text("path").notNull(),
    timeSpent: integer("time_spent").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("project_daily_data_id_index").on(table.dailyDataId),
    index("project_name_index").on(table.name),
    index("project_path_index").on(table.path),
  ],
);
