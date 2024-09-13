import { pgTable, foreignKey, pgEnum, text, uuid, timestamp, integer, boolean, bigint, jsonb, unique } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const planTier = pgEnum("plan_tier", ['hobby', 'creator', 'pro'])
export const pricingPlanInterval = pgEnum("pricing_plan_interval", ['day', 'week', 'month', 'year'])
export const pricingType = pgEnum("pricing_type", ['one_time', 'recurring'])
export const subscriptionStatus = pgEnum("subscription_status", ['trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused'])


export const tiktokAccounts = pgTable("tiktok_accounts", {
	id: text("id").primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => users.id),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const templates = pgTable("templates", {
	id: integer("id").primaryKey().notNull(),
	name: text("name").notNull(),
	previewUrl: text("preview_url").notNull(),
	value: text("value").notNull(),
});

export const backgrounds = pgTable("backgrounds", {
	id: integer("id").primaryKey().notNull(),
	name: text("name").notNull(),
	previewUrl: text("preview_url").notNull(),
});

export const backgroundParts = pgTable("background_parts", {
	id: integer("id").primaryKey().notNull(),
	backgroundId: integer("background_id").notNull().references(() => backgrounds.id),
	partUrl: text("part_url").notNull(),
});

export const tiktokPosts = pgTable("tiktok_posts", {
	userId: uuid("user_id").notNull().references(() => users.id),
	tiktokAccountId: text("tiktok_account_id").notNull().references(() => tiktokAccounts.id),
	parentSocialMediaPostId: uuid("parent_social_media_post_id").notNull().references(() => socialMediaPosts.id),
	caption: text("caption"),
	disableComment: boolean("disable_comment").notNull(),
	disableDuet: boolean("disable_duet").notNull(),
	disableStitch: boolean("disable_stitch").notNull(),
	privacyLevel: text("privacy_level").notNull(),
	publicalyAvailablePostId: text("publicaly_available_post_id"),
	publishId: text("publish_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	videoCoverTimestampMs: bigint("video_cover_timestamp_ms", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	id: uuid("id").defaultRandom().primaryKey().notNull(),
});

export const users = pgTable("users", {
	id: uuid("id").primaryKey().notNull(),
	fullName: text("full_name"),
	avatarUrl: text("avatar_url"),
	billingAddress: jsonb("billing_address"),
	paymentMethod: jsonb("payment_method"),
});

export const customers = pgTable("customers", {
	id: uuid("id").primaryKey().notNull().references(() => users.id),
	stripeCustomerId: text("stripe_customer_id"),
});

export const products = pgTable("products", {
	id: text("id").primaryKey().notNull(),
	active: boolean("active"),
	name: text("name"),
	description: text("description"),
	image: text("image"),
	metadata: jsonb("metadata"),
	planTier: planTier("plan_tier"),
	defaultPriceId: text("default_price_id"),
	marketingFeatures: jsonb("marketing_features"),
});

export const prices = pgTable("prices", {
	id: text("id").primaryKey().notNull(),
	productId: text("product_id").references(() => products.id),
	active: boolean("active"),
	description: text("description"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	unitAmount: bigint("unit_amount", { mode: "number" }),
	currency: text("currency"),
	type: pricingType("type"),
	interval: pricingPlanInterval("interval"),
	intervalCount: integer("interval_count"),
	metadata: jsonb("metadata"),
});

export const subscriptions = pgTable("subscriptions", {
	id: text("id").primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => users.id),
	status: subscriptionStatus("status"),
	metadata: jsonb("metadata"),
	priceId: text("price_id").references(() => prices.id),
	quantity: integer("quantity"),
	cancelAtPeriodEnd: boolean("cancel_at_period_end"),
	created: timestamp("created", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	currentPeriodStart: timestamp("current_period_start", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	endedAt: timestamp("ended_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	cancelAt: timestamp("cancel_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	canceledAt: timestamp("canceled_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const feedback = pgTable("feedback", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => users.id),
	feedbackType: text("feedback_type").notNull(),
	rating: integer("rating"),
	comment: text("comment"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const pastRenders = pgTable("past_renders", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => users.id),
	videoUrl: text("video_url").notNull(),
	templateName: text("template_name").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const socialMediaPosts = pgTable("social_media_posts", {
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => users.id),
});

export const youtubeChannels = pgTable("youtube_channels", {
	channelCustomUrl: text("channel_custom_url").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	credentials: jsonb("credentials").notNull(),
	id: text("id").primaryKey().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull().references(() => users.id),
});

export const youtubePosts = pgTable("youtube_posts", {
	id: text("id").primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => users.id),
	youtubeChannelId: text("youtube_channel_id").notNull().references(() => youtubeChannels.id),
	parentSocialMediaPostId: uuid("parent_social_media_post_id").notNull().references(() => socialMediaPosts.id),
	title: text("title").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const planLimits = pgTable("plan_limits", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	productId: text("product_id").references(() => products.id),
	voiceoverCharacters: integer("voiceover_characters").notNull(),
	transcriptionSeconds: integer("transcription_seconds").notNull(),
	connectedAccounts: integer("connected_accounts").notNull(),
	exportSeconds: integer("export_seconds").notNull(),
});

export const userUsage = pgTable("user_usage", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => users.id),
	subscriptionId: text("subscription_id").references(() => subscriptions.id),
	voiceoverCharactersLeft: integer("voiceover_characters_left").notNull(),
	transcriptionSecondsLeft: integer("transcription_seconds_left").notNull(),
	connectedAccountsLeft: integer("connected_accounts_left").notNull(),
	lastResetDate: timestamp("last_reset_date", { mode: 'string' }).defaultNow().notNull(),
	exportSecondsLeft: integer("export_seconds_left").notNull(),
},
(table) => {
	return {
		userUsageUserIdUnique: unique("user_usage_user_id_unique").on(table.userId),
	}
});