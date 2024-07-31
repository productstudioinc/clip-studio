'use server';

import { getUser } from '@/actions/auth/user';
import { db } from '@/db';
import {
	planLimits,
	prices,
	products,
	socialMediaPosts,
	subscriptions,
	userUsage
} from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import { createServerAction, ZSAError } from 'zsa';

export const getProducts = unstable_cache(async () => {
	const result = await db.query.products.findMany({
		where: (products, { eq }) => eq(products.active, true),
		columns: {
			id: true,
			name: true,
			description: true,
			metadata: true
		},
		with: {
			prices: {
				where: (prices, { eq }) => eq(prices.active, true),
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

	return result;
}, ['products']);

export const getUserUsage = async () => {
	const { user } = await getUser();
	if (!user) {
		return null;
	}

	try {
		const result = await db
			.select({
				currentUsage: {
					exportSecondsLeft: userUsage.exportSecondsLeft,
					voiceoverCharactersLeft: userUsage.voiceoverCharactersLeft,
					transcriptionMinutesLeft: userUsage.transcriptionMinutesLeft,
					connectedAccountsLeft: userUsage.connectedAccountsLeft
				},
				totalLimits: {
					exportSeconds: planLimits.exportSeconds,
					voiceoverCharacters: planLimits.voiceoverCharacters,
					transcriptionMinutes: planLimits.transcriptionMinutes,
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
			return null;
		}

		return result[0];
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
	}
};

export type GetUserUsageResult = Awaited<ReturnType<typeof getUserUsage>>;

export type GetProductsResult = Awaited<ReturnType<typeof getProducts>>;

export const createSocialMediaPost = createServerAction()
	.input(z.void())
	.handler(async () => {
		const { user } = await getUser();
		if (!user) {
			throw new ZSAError('NOT_AUTHORIZED', 'You are not authorized to perform this action.');
		}
		try {
			const result = await db
				.insert(socialMediaPosts)
				.values({
					userId: user.id
				})
				.returning({
					insertedId: socialMediaPosts.id
				});
			return result[0].insertedId;
		} catch (error) {
			if (error instanceof Error || error instanceof Error) {
				throw new ZSAError('INTERNAL_SERVER_ERROR', error.message);
			}
		}
	});
