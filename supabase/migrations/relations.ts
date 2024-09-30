import { relations } from "drizzle-orm/relations";
import { users, tiktokAccounts, backgrounds, backgroundParts, socialMediaPosts, tiktokPosts, customers, products, prices, subscriptions, feedback, pastRenders, youtubeChannels, youtubePosts, planLimits, userUsage } from "./schema";

export const tiktokAccountsRelations = relations(tiktokAccounts, ({one, many}) => ({
	user: one(users, {
		fields: [tiktokAccounts.userId],
		references: [users.id]
	}),
	tiktokPosts: many(tiktokPosts),
}));

export const usersRelations = relations(users, ({many}) => ({
	tiktokAccounts: many(tiktokAccounts),
	tiktokPosts: many(tiktokPosts),
	customers: many(customers),
	subscriptions: many(subscriptions),
	feedbacks: many(feedback),
	pastRenders: many(pastRenders),
	socialMediaPosts: many(socialMediaPosts),
	youtubeChannels: many(youtubeChannels),
	youtubePosts: many(youtubePosts),
	userUsages: many(userUsage),
}));

export const backgroundPartsRelations = relations(backgroundParts, ({one}) => ({
	background: one(backgrounds, {
		fields: [backgroundParts.backgroundId],
		references: [backgrounds.id]
	}),
}));

export const backgroundsRelations = relations(backgrounds, ({many}) => ({
	backgroundParts: many(backgroundParts),
}));

export const tiktokPostsRelations = relations(tiktokPosts, ({one}) => ({
	socialMediaPost: one(socialMediaPosts, {
		fields: [tiktokPosts.parentSocialMediaPostId],
		references: [socialMediaPosts.id]
	}),
	tiktokAccount: one(tiktokAccounts, {
		fields: [tiktokPosts.tiktokAccountId],
		references: [tiktokAccounts.id]
	}),
	user: one(users, {
		fields: [tiktokPosts.userId],
		references: [users.id]
	}),
}));

export const socialMediaPostsRelations = relations(socialMediaPosts, ({one, many}) => ({
	tiktokPosts: many(tiktokPosts),
	user: one(users, {
		fields: [socialMediaPosts.userId],
		references: [users.id]
	}),
	youtubePosts: many(youtubePosts),
}));

export const customersRelations = relations(customers, ({one}) => ({
	user: one(users, {
		fields: [customers.id],
		references: [users.id]
	}),
}));

export const pricesRelations = relations(prices, ({one, many}) => ({
	product: one(products, {
		fields: [prices.productId],
		references: [products.id]
	}),
	subscriptions: many(subscriptions),
}));

export const productsRelations = relations(products, ({many}) => ({
	prices: many(prices),
	planLimits: many(planLimits),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	price: one(prices, {
		fields: [subscriptions.priceId],
		references: [prices.id]
	}),
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));

export const feedbackRelations = relations(feedback, ({one}) => ({
	user: one(users, {
		fields: [feedback.userId],
		references: [users.id]
	}),
}));

export const pastRendersRelations = relations(pastRenders, ({one}) => ({
	user: one(users, {
		fields: [pastRenders.userId],
		references: [users.id]
	}),
}));

export const youtubeChannelsRelations = relations(youtubeChannels, ({one, many}) => ({
	user: one(users, {
		fields: [youtubeChannels.userId],
		references: [users.id]
	}),
	youtubePosts: many(youtubePosts),
}));

export const youtubePostsRelations = relations(youtubePosts, ({one}) => ({
	socialMediaPost: one(socialMediaPosts, {
		fields: [youtubePosts.parentSocialMediaPostId],
		references: [socialMediaPosts.id]
	}),
	user: one(users, {
		fields: [youtubePosts.userId],
		references: [users.id]
	}),
	youtubeChannel: one(youtubeChannels, {
		fields: [youtubePosts.youtubeChannelId],
		references: [youtubeChannels.id]
	}),
}));

export const planLimitsRelations = relations(planLimits, ({one}) => ({
	product: one(products, {
		fields: [planLimits.productId],
		references: [products.id]
	}),
}));

export const userUsageRelations = relations(userUsage, ({one}) => ({
	user: one(users, {
		fields: [userUsage.userId],
		references: [users.id]
	}),
}));