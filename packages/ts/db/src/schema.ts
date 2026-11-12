// TypeScript view of the tables. The SQL in /db/migrations is the source of truth:
// change the SQL first, then mirror it here (or run `pnpm --filter @kit/db pull`).
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
