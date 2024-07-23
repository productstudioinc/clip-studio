import { relations } from 'drizzle-orm';
import { foreignKey, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const templates = pgTable('templates', {
	id: integer('id').primaryKey(),
	value: text('value').notNull(),
	name: text('name').notNull(),
	previewUrl: text('preview_url').notNull()
});

export const backgrounds = pgTable('backgrounds', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	previewUrl: text('preview_url').notNull()
});

export const backgroundsRelations = relations(backgrounds, ({ many }) => ({
	backgroundParts: many(backgroundParts)
}));

export const backgroundParts = pgTable('background_parts', {
	id: integer('id').primaryKey(),
	backgroundId: integer('background_id')
		.notNull()
		.references(() => backgrounds.id),
	partUrl: text('part_url').notNull()
});

export const backgroundPartsRelations = relations(backgroundParts, ({ one }) => ({
	background: one(backgrounds, {
		fields: [backgroundParts.backgroundId],
		references: [backgrounds.id]
	})
}));

export const socialMediaPosts = pgTable(
	'social_media_posts',
	{
		createdAt: timestamp('created_at').notNull().defaultNow(),
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id').notNull()
	},
	(table) => {
		return {
			userIdForeignKey: foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id]
			})
		};
	}
);

export const youtubeChannels = pgTable(
	'youtube_channels',
	{
		channelCustomUrl: text('channel_custom_url').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		credentials: jsonb('credentials').notNull(),
		id: text('id').primaryKey(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
		userId: uuid('user_id').notNull()
	},
	(table) => {
		return {
			userIdForeignKey: foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id]
			})
		};
	}
);

export const youtubePosts = pgTable(
	'youtube_posts',
	{
		createdAt: timestamp('created_at').notNull().defaultNow(),
		id: uuid('id').primaryKey().defaultRandom(),
		parentSocialMediaPostId: uuid('parent_social_media_post_id').notNull(),
		title: text('title').notNull(),
		userId: uuid('user_id').notNull(),
		youtubeChannelId: uuid('youtube_channel_id').notNull()
	},
	(table) => {
		return {
			parentSocialMediaPostIdForeignKey: foreignKey({
				columns: [table.parentSocialMediaPostId],
				foreignColumns: [socialMediaPosts.id]
			}),
			userIdForeignKey: foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id]
			}),
			youtubeChannelIdForeignKey: foreignKey({
				columns: [table.youtubeChannelId],
				foreignColumns: [youtubeChannels.id]
			})
		};
	}
);

export const users = pgTable('users', {
	id: uuid('id').primaryKey().notNull(),
	fullName: text('full_name'),
	avatarUrl: text('avatar_url'),
	billingAddress: jsonb('billing_address'),
	paymentMethod: jsonb('payment_method')
});

export type SelectTemplates = typeof templates.$inferSelect;
export type SelectBackgrounds = typeof backgrounds.$inferSelect;
export type SelectBackgroundParts = typeof backgroundParts.$inferSelect;

export type SelectBackgroundWithParts = SelectBackgrounds & {
	backgroundParts: SelectBackgroundParts[];
};
