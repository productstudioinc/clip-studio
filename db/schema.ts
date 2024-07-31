import { relations } from 'drizzle-orm';
import {
	bigint,
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid
} from 'drizzle-orm/pg-core';

// Enums
const pricingTypeEnum = pgEnum('pricing_type', ['one_time', 'recurring']);
const pricingPlanIntervalEnum = pgEnum('pricing_plan_interval', ['day', 'week', 'month', 'year']);
const subscriptionStatusEnum = pgEnum('subscription_status', [
	'incomplete',
	'incomplete_expired',
	'trialing',
	'active',
	'past_due',
	'canceled',
	'unpaid',
	'paused'
]);
const planTierEnum = pgEnum('plan_tier', ['hobby', 'creator', 'pro']);

// User-related tables and relations
export const users = pgTable('users', {
	id: uuid('id').primaryKey().notNull(),
	fullName: text('full_name'),
	avatarUrl: text('avatar_url'),
	billingAddress: jsonb('billing_address'),
	paymentMethod: jsonb('payment_method')
});

export const customers = pgTable('customers', {
	id: uuid('id')
		.primaryKey()
		.notNull()
		.references(() => users.id),
	stripeCustomerId: text('stripe_customer_id')
});

// Product and pricing tables and relations
export const products = pgTable('products', {
	id: text('id').primaryKey().notNull(),
	active: boolean('active'),
	name: text('name'),
	description: text('description'),
	image: text('image'),
	metadata: jsonb('metadata'),
	planTier: planTierEnum('plan_tier')
});

export const planLimits = pgTable('plan_limits', {
	id: uuid('id').primaryKey().defaultRandom(),
	productId: text('product_id').references(() => products.id),
	exportSeconds: integer('export_seconds').notNull(),
	voiceoverCharacters: integer('voiceover_characters').notNull(),
	transcriptionMinutes: integer('transcription_minutes').notNull(),
	connectedAccounts: integer('connected_accounts').notNull()
});

export const prices = pgTable('prices', {
	id: text('id').primaryKey(),
	productId: text('product_id').references(() => products.id),
	active: boolean('active'),
	description: text('description'),
	unitAmount: bigint('unit_amount', { mode: 'number' }),
	currency: text('currency'),
	type: pricingTypeEnum('type'),
	interval: pricingPlanIntervalEnum('interval'),
	intervalCount: integer('interval_count'),
	metadata: jsonb('metadata')
});

export const productsRelations = relations(products, ({ many, one }) => ({
	prices: many(prices),
	planLimits: one(planLimits, {
		fields: [products.id],
		references: [planLimits.productId]
	})
}));

export const planLimitsRelations = relations(planLimits, ({ one }) => ({
	product: one(products, {
		fields: [planLimits.productId],
		references: [products.id]
	})
}));

export const pricesRelations = relations(prices, ({ one }) => ({
	product: one(products, {
		fields: [prices.productId],
		references: [products.id]
	})
}));

// Subscription and usage tables and relations
export const subscriptions = pgTable('subscriptions', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	status: subscriptionStatusEnum('status'),
	metadata: jsonb('metadata'),
	priceId: text('price_id').references(() => prices.id),
	quantity: integer('quantity'),
	cancelAtPeriodEnd: boolean('cancel_at_period_end'),
	created: timestamp('created', { withTimezone: true }).notNull().defaultNow(),
	currentPeriodStart: timestamp('current_period_start', { withTimezone: true })
		.notNull()
		.defaultNow(),
	currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull().defaultNow(),
	endedAt: timestamp('ended_at', { withTimezone: true }).defaultNow(),
	cancelAt: timestamp('cancel_at', { withTimezone: true }).defaultNow(),
	canceledAt: timestamp('canceled_at', { withTimezone: true }).defaultNow()
});

export const userUsage = pgTable('user_usage', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id)
		.unique(),
	subscriptionId: text('subscription_id').references(() => subscriptions.id),
	exportSecondsLeft: integer('export_seconds_left').notNull(),
	voiceoverCharactersLeft: integer('voiceover_characters_left').notNull(),
	transcriptionMinutesLeft: integer('transcription_minutes_left').notNull(),
	connectedAccountsLeft: integer('connected_accounts_left').notNull(),
	lastResetDate: timestamp('last_reset_date').notNull().defaultNow()
});

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
	price: one(prices, {
		fields: [subscriptions.priceId],
		references: [prices.id]
	}),
	userUsage: many(userUsage)
}));

// Content-related tables and relations
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

export const backgroundParts = pgTable('background_parts', {
	id: integer('id').primaryKey(),
	backgroundId: integer('background_id')
		.notNull()
		.references(() => backgrounds.id),
	partUrl: text('part_url').notNull()
});

export const backgroundsRelations = relations(backgrounds, ({ many }) => ({
	backgroundParts: many(backgroundParts)
}));

export const backgroundPartsRelations = relations(backgroundParts, ({ one }) => ({
	background: one(backgrounds, {
		fields: [backgroundParts.backgroundId],
		references: [backgrounds.id]
	})
}));

// Social media related tables
export const socialMediaPosts = pgTable('social_media_posts', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const youtubeChannels = pgTable('youtube_channels', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	channelCustomUrl: text('channel_custom_url').notNull(),
	credentials: jsonb('credentials').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const youtubePosts = pgTable('youtube_posts', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	youtubeChannelId: text('youtube_channel_id')
		.notNull()
		.references(() => youtubeChannels.id),
	parentSocialMediaPostId: uuid('parent_social_media_post_id')
		.notNull()
		.references(() => socialMediaPosts.id),
	title: text('title').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Types
export type SelectTemplates = typeof templates.$inferSelect;
export type SelectBackgrounds = typeof backgrounds.$inferSelect;
export type SelectBackgroundParts = typeof backgroundParts.$inferSelect;

export type SelectBackgroundWithParts = SelectBackgrounds & {
	backgroundParts: SelectBackgroundParts[];
};
