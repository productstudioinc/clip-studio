'use server';

import { getUser, signOut } from '@/actions/auth/user';
import { db } from '@/db';
import {
	customers,
	planLimits,
	prices,
	products,
	socialMediaPosts,
	subscriptions,
	users,
	userUsage
} from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { Logger } from 'next-axiom';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import { createServerAction, ZSAError } from 'zsa';

const logger = new Logger({
	source: 'actions/db/user-queries'
});

export const getProducts = unstable_cache(async () => {
	logger.info('Fetching products');
	try {
		const result = await db.query.products.findMany({
			where: (products, { eq }) => eq(products.active, true),
			columns: {
				id: true,
				name: true,
				description: true,
				metadata: true,
				defaultPriceId: true,
				marketingFeatures: true
			},
			with: {
				prices: {
					columns: {
						id: true,
						productId: true,
						unitAmount: true,
						currency: true,
						interval: true
					}
				}
			}
		});
		logger.info('Products fetched successfully', { count: result.length });
		await logger.flush();
		return result;
	} catch (error) {
		logger.error('Error fetching products', {
			error: error instanceof Error ? error.message : String(error)
		});
		await logger.flush();
		throw error;
	}
}, ['products']);

export const getUserUsage = async () => {
	const { user } = await getUser();
	if (!user) {
		logger.warn('Attempted to get user usage for unauthenticated user');
		await logger.flush();
		return null;
	}

	logger.info('Fetching user usage', { userId: user.id });
	try {
		const result = await db
			.select({
				currentUsage: {
					exportSecondsLeft: userUsage.exportSecondsLeft,
					voiceoverCharactersLeft: userUsage.voiceoverCharactersLeft,
					transcriptionSecondsLeft: userUsage.transcriptionSecondsLeft,
					connectedAccountsLeft: userUsage.connectedAccountsLeft
				},
				totalLimits: {
					exportSeconds: planLimits.exportSeconds,
					voiceoverCharacters: planLimits.voiceoverCharacters,
					transcriptionSeconds: planLimits.transcriptionSeconds,
					connectedAccounts: planLimits.connectedAccounts
				}
			})
			.from(subscriptions)
			.innerJoin(userUsage, eq(subscriptions.userId, userUsage.userId))
			.innerJoin(prices, eq(subscriptions.priceId, prices.id))
			.innerJoin(products, eq(prices.productId, products.id))
			.innerJoin(planLimits, eq(products.id, planLimits.productId))
			.where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, 'active')))
			.limit(1);

		if (result.length === 0) {
			logger.warn('No active subscription found for user', { userId: user.id });
			await logger.flush();
			return null;
		}

		logger.info('User usage fetched successfully', { userId: user.id });
		await logger.flush();
		return result[0];
	} catch (error) {
		logger.error('Error fetching user usage', {
			userId: user.id,
			error: error instanceof Error ? error.message : String(error)
		});
		await logger.flush();
		throw error;
	}
};

export type GetUserUsageResult = Awaited<ReturnType<typeof getUserUsage>>;

export type GetProductsResult = Awaited<ReturnType<typeof getProducts>>;

export const createSocialMediaPost = createServerAction()
	.input(z.void())
	.handler(async () => {
		const { user } = await getUser();
		if (!user) {
			logger.warn('Attempted to create social media post for unauthenticated user');
			await logger.flush();
			throw new ZSAError('NOT_AUTHORIZED', 'You are not authorized to perform this action.');
		}
		logger.info('Creating social media post', { userId: user.id });
		try {
			const result = await db
				.insert(socialMediaPosts)
				.values({
					userId: user.id
				})
				.returning({
					insertedId: socialMediaPosts.id
				});
			logger.info('Social media post created successfully', {
				userId: user.id,
				postId: result[0].insertedId
			});
			await logger.flush();
			return result[0].insertedId;
		} catch (error) {
			logger.error('Error creating social media post', {
				userId: user.id,
				error: error instanceof Error ? error.message : String(error)
			});
			await logger.flush();
			throw new ZSAError('INTERNAL_SERVER_ERROR', 'Failed to create social media post');
		}
	});

export const deleteUser = createServerAction()
	.input(z.void())
	.handler(async () => {
		const { user } = await getUser();
		if (!user) {
			logger.warn('Attempted to delete user for unauthenticated user');
			await logger.flush();
			throw new ZSAError('NOT_AUTHORIZED', 'You are not authorized to perform this action.');
		}
		logger.info('Deleting user', { userId: user.id });
		try {
			await db.delete(customers).where(eq(customers.id, user.id));
			await db.delete(users).where(eq(users.id, user.id));
			await signOut();
			logger.info('User deleted successfully', { userId: user.id });
			await logger.flush();
		} catch (error) {
			logger.error('Error deleting user', {
				userId: user.id,
				error: error instanceof Error ? error.message : String(error)
			});
			console.log(error);
			await logger.flush();
			throw new ZSAError('INTERNAL_SERVER_ERROR', 'Failed to delete user');
		}
	});
