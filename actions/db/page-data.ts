import { db } from '@/db';
import { templates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Logger } from 'next-axiom';
import { unstable_cache } from 'next/cache';

const logger = new Logger({
	source: 'actions/db/page-data'
});

const getCachedTemplates = unstable_cache(
	async () => {
		try {
			const response = await db.select().from(templates).where(eq(templates.active, true));
			return response;
		} catch (error) {
			logger.error('Error fetching templates', {
				error: error instanceof Error ? error.message : String(error)
			});
			await logger.flush();
			throw error;
		}
	},
	['templates'],
	{ revalidate: 86400 }
);

const getCachedBackgrounds = unstable_cache(
	async () => {
		try {
			const result = await db.query.backgrounds.findMany({
				with: {
					backgroundParts: true
				}
			});
			return result;
		} catch (error) {
			logger.error('Error fetching backgrounds', {
				error: error instanceof Error ? error.message : String(error)
			});
			await logger.flush();
			throw error;
		}
	},
	['backgrounds'],
	{ revalidate: 86400 }
);

export const getTemplates = getCachedTemplates;

export const getBackgrounds = getCachedBackgrounds;
