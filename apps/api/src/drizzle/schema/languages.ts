import { index, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { dailyData } from "./dailyData";
import { timestamps } from "../columns.helpers";
import { ulid } from "ulid";

export const languages = pgTable(
  "languages",
  {
    id: varchar("id", { length: 26 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid().toLowerCase()),
    dailyDataId: varchar("daily_data_id", { length: 26 })
      .notNull()
      .references(() => dailyData.id, { onDelete: "cascade" }),

    languageSlug: text("language_slug").notNull(),
    timeSpent: integer("time_spent").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("language_daily_data_id_index").on(table.dailyDataId),
    index("language_slug_index").on(table.languageSlug),
  ],
);
