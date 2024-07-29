'use server';

import { db } from '@/db';
import { createClient } from '@/supabase/server';
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
	try {
		const response = await db.query.subscriptions.findFirst({
			where: (subscriptions, { inArray }) => inArray(subscriptions.status, ['trialing', 'active']),
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

		return response?.price?.product?.name || null;
	} catch (error) {
		console.error(error);
		return null;
	}
});

export type GetUserSubscriptionResult = Awaited<ReturnType<typeof getUserSubscription>>;

export const signOut = async () => {
	const supabase = createClient();
	const { error } = await supabase.auth.signOut();
	if (error) {
		return redirect('/login?message=' + error.message);
	}
	return redirect('/');
};
