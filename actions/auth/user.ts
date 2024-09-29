'use server';

import { db } from '@/db';
import { createClient } from '@/supabase/server';
import { endingFunctionString, errorString, startingFunctionString } from '@/utils/logging';
import { Logger } from 'next-axiom';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const getUser = cache(async () => {
	const supabase = createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	return { user };
});

export const getUserSubscription = cache(async () => {
	const { user } = await getUser();
	if (!user) {
		return null;
	}

	const logger = new Logger().with({
		function: 'getUserSubscription',
		userId: user.id
	});

	try {
		const response = await db.query.subscriptions.findFirst({
			where: (subscriptions, { and, inArray, eq }) =>
				and(
					inArray(subscriptions.status, ['trialing', 'active']),
					eq(subscriptions.userId, user.id)
				),
			with: {
				price: {
					with: {
						product: {
							columns: {
								name: true
							}
						}
					}
				}
			}
		});

		logger.info('User subscription retrieved', { subscription: response?.price?.product?.name });
		await logger.flush();
		return response?.price?.product?.name || null;
	} catch (error) {
		if (error instanceof Error) {
			logger.error(errorString, error);
			await logger.flush();
			throw error;
		}
	}
});

export type GetUserSubscriptionResult = Awaited<ReturnType<typeof getUserSubscription>>;

export const signOut = async () => {
	const supabase = createClient();
	const logger = new Logger().with({ function: 'signOut' });
	logger.info(startingFunctionString);
	try {
		const { error } = await supabase.auth.signOut();
		if (error) {
			logger.error(errorString, error);
			await logger.flush();
			redirect('/login?message=' + error.message);
		}
		logger.info(endingFunctionString);
		await logger.flush();
		redirect('/');
	} catch (error) {
		logger.error('Error during sign out', {
			error: error instanceof Error ? error.message : String(error)
		});
		await logger.flush();
		// Handle the error gracefully, e.g., show an error message to the user
		// or redirect to a different page
	}
};
