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
	const response = await db;
});

export const signOut = async () => {
	const supabase = createClient();
	const { error } = await supabase.auth.signOut();
	if (error) {
		return redirect('/login?message=' + error.message);
	}
	return redirect('/');
};
