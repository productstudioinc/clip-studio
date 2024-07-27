import { and, desc, eq, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '.';
import { prices, products } from './schema';

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
