'use server';

import { getUser } from '@/actions/auth/user';
import { db } from '@/db';
import { prices, products, socialMediaPosts } from '@/db/schema';
import { and, desc, DrizzleError, eq, sql } from 'drizzle-orm';
import { cache } from 'react';
import { z } from 'zod';
import { createServerAction, ZSAError } from 'zsa';

export const getProducts = cache(async () => {
	const result = await db
		.select({
			product: products,
			prices: prices
		})
		.from(products)
		.leftJoin(prices, eq(products.id, prices.productId))
		.where(and(eq(products.active, true), eq(prices.active, true)))
		.orderBy(sql`${products.metadata}->>'index'`, desc(prices.unitAmount));

	return result;
});

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
			if (error instanceof DrizzleError || error instanceof Error) {
				throw new ZSAError('INTERNAL_SERVER_ERROR', error.message);
			}
		}
	});
