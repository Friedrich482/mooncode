import { varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { timestamps } from "../columns.helpers";
import { users } from "./users";

export const telemetry = pgTable(
  "telemetry",
  {
    id: varchar("id", { length: 26 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid().toLowerCase()),
    userId: varchar("user_id", { length: 26 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    machineId: text("machine_id").notNull(),
    extensionVersion: text("extension_version").notNull(),
    vscodeVersion: text("vscode_version").notNull(),
    ...timestamps,
  },
  (table) => [
    index("telemetry_user_id_index").on(table.userId),
    index("telemetry_vscode_version_index").on(table.vscodeVersion),
  ],
);
