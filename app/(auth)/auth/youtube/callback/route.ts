import { getYoutubeChannelInfo } from '@/actions/youtube';
import { db } from '@/db';
import { userUsage, youtubeChannels } from '@/db/schema';
import { createClient } from '@/supabase/server';
import youtubeAuthClient from '@/utils/youtube';
import { and, eq, sql } from 'drizzle-orm';
import { AxiomRequest, withAxiom } from 'next-axiom';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const GET = withAxiom(async (request: AxiomRequest) => {
	const logger = request.log.with({
		path: '/auth/youtube/callback',
		method: 'GET'
	});

	const requestUrl = new URL(request.url);
	const error = requestUrl.searchParams.get('error');
	const code = requestUrl.searchParams.get('code');
	const origin = requestUrl.origin;

	logger.info('YouTube auth callback initiated', { error: !!error, code: !!code });

	try {
		if (error) {
			logger.warn('Error in YouTube auth callback', { error });
			return NextResponse.redirect(`${origin}/account?error=${error}`);
		} else if (code) {
			const { tokens } = await youtubeAuthClient.getToken(code);
			logger.info('Obtained tokens from YouTube');

			const channelInfo = await getYoutubeChannelInfo(tokens);
			if (!channelInfo) {
				logger.error('Failed to get YouTube channel info');
				return NextResponse.redirect(
					`${origin}/account?error=We could not connect your Youtube channel. Please try again.`
				);
			}

			const { customUrl, accessToken, channelId } = channelInfo;
			const supabase = createClient();
			const currentUser = await supabase.auth.getUser();
			const userId = currentUser.data.user?.id;

			if (!customUrl || !accessToken || !channelId || !userId) {
				logger.error('Missing essential channel details', {
					customUrl,
					accessToken,
					channelId,
					userId
				});
				return NextResponse.redirect(
					`${origin}/account?error=Sorry, something unexpected happened. Our team is looking into it.`
				);
			}

			let canConnect = false;
			await db.transaction(async (tx) => {
				const userUsageData = await tx
					.select({ connectedAccountsLeft: userUsage.connectedAccountsLeft })
					.from(userUsage)
					.where(eq(userUsage.userId, userId));

				if (userUsageData.length === 0) {
					logger.warn('User does not have usage data', { userId });
					canConnect = false;
					return;
				}

				const remainingAccounts = userUsageData[0].connectedAccountsLeft;
				logger.info('Checking remaining connected accounts', {
					remaining: remainingAccounts
				});

				if (remainingAccounts === null || remainingAccounts < 1) {
					canConnect = false;
					return;
				}
				await tx
					.update(userUsage)
					.set({
						connectedAccountsLeft: sql`connected_accounts_left - 1`
					})
					.where(eq(userUsage.userId, userId));
				canConnect = true;
			});

			if (!canConnect) {
				logger.warn('User cannot connect account', { userId });
				return NextResponse.redirect(
					`${origin}/account?error=You must have a subscription to use this feature.`
				);
			}

			const isAlreadySaved = await checkIfYoutubeChannelIsAlreadySaved({
				channelId,
				userId
			});
			if (isAlreadySaved) {
				logger.info('YouTube channel already saved', { channelId, userId });
				return NextResponse.redirect(`${origin}/account`);
			}

			try {
				await db.insert(youtubeChannels).values({
					credentials: { ...tokens },
					channelCustomUrl: customUrl,
					id: channelId,
					userId: userId
				});
				logger.info('Successfully saved YouTube channel', { channelId, userId });
			} catch (err) {
				logger.error('Error saving YouTube channel', {
					error: err instanceof Error ? err.message : String(err)
				});
				return NextResponse.redirect(
					`${origin}/account?error=${err instanceof Error ? err.message : String(err)}`
				);
			}
		}
	} catch (error: any) {
		logger.error('Unexpected error in YouTube auth callback', {
			error: error instanceof Error ? error.message : String(error)
		});
		return NextResponse.redirect(
			`${origin}/account?error=${error instanceof Error ? error.message : String(error)}`
		);
	}

	revalidatePath('/account');
	logger.info('YouTube auth callback completed successfully');
	return NextResponse.redirect(`${origin}/account`);
});

const checkIfYoutubeChannelIsAlreadySaved = async ({
	channelId,
	userId
}: {
	channelId: string;
	userId: string;
}) => {
	try {
		const response = await db
			.select()
			.from(youtubeChannels)
			.where(and(eq(youtubeChannels.userId, userId), eq(youtubeChannels.id, channelId)));
		return response.length > 0;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
	}
};
