import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const templates = pgTable("templates", {
  id: integer("id").primaryKey(),
  value: text("value").notNull(),
  name: text("name").notNull(),
  previewUrl: text("preview_url").notNull(),
});

export const backgrounds = pgTable("backgrounds", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  previewUrl: text("preview_url").notNull(),
});

export const backgroundsRelations = relations(backgrounds, ({ many }) => ({
  backgroundParts: many(backgroundParts),
}));

export const backgroundParts = pgTable("background_parts", {
  id: integer("id").primaryKey(),
  backgroundId: integer("background_id")
    .notNull()
    .references(() => backgrounds.id),
  partUrl: text("part_url").notNull(),
});

export const backgroundPartsRelations = relations(
  backgroundParts,
  ({ one }) => ({
    background: one(backgrounds, {
      fields: [backgroundParts.backgroundId],
      references: [backgrounds.id],
    }),
  })
);

export type SelectTemplates = typeof templates.$inferSelect;
export type SelectBackgrounds = typeof backgrounds.$inferSelect;
export type SelectBackgroundParts = typeof backgroundParts.$inferSelect;

export type SelectBackgroundWithParts = SelectBackgrounds & {
  backgroundParts: SelectBackgroundParts[];
};
