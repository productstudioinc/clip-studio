import { db } from '@/db';
import { tiktokAccounts, userUsage } from '@/db/schema';
import { createClient } from '@/supabase/server';
import { and, eq, sql } from 'drizzle-orm';
import { AxiomRequest, withAxiom } from 'next-axiom';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const GET = withAxiom(async (request: AxiomRequest) => {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get('code');
	const error = requestUrl.searchParams.get('error');
	const origin = requestUrl.origin;

	const logger = request.log.with({
		method: 'GET',
		path: '/auth/tiktok/callback',
		code: !!code,
		error: !!error,
		origin
	});

	logger.info('TikTok auth callback initiated');

	try {
		if (error) {
			logger.warn('Error in TikTok auth callback', { error });
			return NextResponse.redirect(`${origin}/account?error=${error}`);
		} else if (code) {
			const supabase = createClient();
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (!user) {
				logger.error('User not found');
				return NextResponse.redirect(`${origin}/account?error=User not found`);
			}

			const response = await fetch(`https://open.tiktokapis.com/v2/oauth/token/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `code=${code}&client_key=${process.env.TIKTOK_CLIENT_KEY}&client_secret=${process.env.TIKTOK_CLIENT_SECRET}&grant_type=authorization_code&redirect_uri=${process.env.TIKTOK_REDIRECT_URI}`
			});

			const data = (await response.json()) as {
				access_token?: string;
				refresh_token?: string;
				open_id?: string;
				error?: string;
				error_description?: string;
			};

			if (!response.ok) {
				logger.error('Error in TikTok token response', {
					error: data.error,
					error_description: data.error_description
				});
				return NextResponse.redirect(
					`${origin}/account?error=${data.error_description || 'Failed to get TikTok token'}`
				);
			}

			logger.info('Obtained tokens from TikTok');

			const { access_token, refresh_token, open_id } = data;
			if (!access_token || !refresh_token || !open_id) {
				logger.error('Missing essential TikTok details', { access_token, refresh_token, open_id });
				return NextResponse.redirect(
					`${origin}/account?error=Sorry, something unexpected happened. Our team is looking into it.`
				);
			}

			let canConnect = false;
			await db.transaction(async (tx) => {
				const remainingAccounts = await tx
					.select({ connectedAccountsLeft: userUsage.connectedAccountsLeft })
					.from(userUsage)
					.where(eq(userUsage.userId, user.id));
				logger.info('Checking remaining connected accounts', {
					remaining: remainingAccounts[0].connectedAccountsLeft
				});

				if (remainingAccounts[0].connectedAccountsLeft < 1) {
					canConnect = false;
					return;
				}
				await tx
					.update(userUsage)
					.set({
						connectedAccountsLeft: sql`connected_accounts_left - 1`
					})
					.where(eq(userUsage.userId, user.id));
				canConnect = true;
			});

			if (!canConnect) {
				logger.warn('User reached limit of connected accounts', { userId: user.id });
				return NextResponse.redirect(
					`${origin}/account?error=You have reached your limit of connected accounts.`
				);
			}

			const isAlreadySaved = await checkIfTiktokChannelIsAlreadySaved({
				openId: open_id,
				userId: user.id
			});
			if (isAlreadySaved) {
				logger.info('TikTok account already saved', { openId: open_id, userId: user.id });
				return NextResponse.redirect(`${origin}/account`);
			}

			try {
				await db.insert(tiktokAccounts).values({
					id: open_id,
					accessToken: access_token,
					refreshToken: refresh_token,
					userId: user.id
				});
				logger.info('Successfully saved TikTok account', { openId: open_id, userId: user.id });
			} catch (err) {
				logger.error('Error saving TikTok account', {
					error: err instanceof Error ? err.message : String(err)
				});
				return NextResponse.redirect(
					`${origin}/account?error=${err instanceof Error ? err.message : String(err)}`
				);
			}
		}
	} catch (error: any) {
		logger.error('Unexpected error in TikTok auth callback', {
			error: error instanceof Error ? error.message : String(error)
		});
		return NextResponse.redirect(
			`${origin}/account?error=${error instanceof Error ? error.message : String(error)}`
		);
	}

	revalidatePath('/account');
	logger.info('TikTok auth callback completed successfully');
	return NextResponse.redirect(`${origin}/account`);
});

const checkIfTiktokChannelIsAlreadySaved = async ({
	openId,
	userId
}: {
	openId: string;
	userId: string;
}) => {
	try {
		const response = await db
			.select()
			.from(tiktokAccounts)
			.where(and(eq(tiktokAccounts.userId, userId), eq(tiktokAccounts.id, openId)));
		return response.length > 0;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
	}
};
