import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const templates = pgTable("templates", {
  id: integer("id").primaryKey(),
  value: text("value").notNull(),
  name: text("name").notNull(),
  previewUrl: text("preview_url").notNull(),
});

export type SelectTemplates = typeof templates.$inferSelect;
