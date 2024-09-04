'use server';

import { z } from 'zod';
import { createServerAction, ZSAError } from 'zsa';
import { getUser } from './auth/user';

const redditUrlSchema = z
	.string()
	.url()
	.refine((url) => url.includes('reddit.com/r/') && url.includes('/comments/'), {
		message: 'Invalid Reddit post URL'
	});

export const getRedditInfo = createServerAction()
	.input(redditUrlSchema)
	.handler(async ({ input }) => {
		const user = await getUser();
		if (!user) {
			throw new ZSAError('FORBIDDEN', 'User not found');
		}
		const postId = input.split('/').pop()?.split('?')[0];
		console.log(postId);
	});
