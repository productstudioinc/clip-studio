'use server';

import { db } from '@/db';
import { templates } from '@/db/schema';
import { unstable_cache } from 'next/cache';

const getCachedTemplates = unstable_cache(
	async () => {
		const response = await db.select().from(templates);
		return response;
	},
	['templates'],
	{ revalidate: 86400 }
);

const getCachedBackgrounds = unstable_cache(
	async () => {
		const result = await db.query.backgrounds.findMany({
			with: {
				backgroundParts: true
			}
		});
		return result;
	},
	['backgrounds'],
	{ revalidate: 86400 }
);

export const getTemplates = getCachedTemplates;

export const getBackgrounds = getCachedBackgrounds;
