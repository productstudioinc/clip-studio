import { getYoutubeChannelInfo } from '@/actions/youtube';
import { db } from '@/db';
import { youtubeChannels } from '@/db/schema';
import { createClient } from '@/supabase/server';
import youtubeAuthClient from '@/utils/youtube';
import { and, DrizzleError, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const GET = async (request: Request) => {
	const requestUrl = new URL(request.url);
	const error = requestUrl.searchParams.get('error');
	const code = requestUrl.searchParams.get('code');
	const origin = requestUrl.origin;

	try {
		if (error) {
			return NextResponse.redirect(`${origin}/account?error=${error}`);
		} else if (code) {
			const { tokens } = await youtubeAuthClient.getToken(code);
			const channelInfo = await getYoutubeChannelInfo(tokens);
			if (!channelInfo) {
				return NextResponse.redirect(
					`${origin}/account?error=We could not connect your Youtube channel. Please try again.`
				);
			}
			const { customUrl, accessToken, channelId } = channelInfo;
			const supabase = createClient();
			const currentUser = await supabase.auth.getUser();
			const userId = currentUser.data.user?.id;
			if (!customUrl || !accessToken || !channelId || !userId) {
				console.log('Essential channel details are missing or incomplete.');
				return NextResponse.redirect(
					`${origin}/account?error=Sorry, something unexpected happened. Our team is looking into it.`
				);
			}
			const isAlreadySaved = await checkIfYoutubeChannelIsAlreadySaved({
				channelId,
				userId
			});
			if (isAlreadySaved) {
				return NextResponse.redirect(`${origin}/account`);
			}
			try {
				await db.insert(youtubeChannels).values({
					credentials: { ...tokens },
					channelCustomUrl: customUrl,
					id: channelId,
					userId: userId
				});
			} catch (err) {
				return NextResponse.redirect(
					`${origin}/account?error=${err instanceof Error ? err.message : String(err)}`
				);
			}
		}
	} catch (error: any) {
		return NextResponse.redirect(
			`${origin}/account?error=${error instanceof Error ? error.message : String(error)}`
		);
	}

	revalidatePath('/account');
	return NextResponse.redirect(`${origin}/account`);
};

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
		if (error instanceof DrizzleError) {
			throw new Error(error.message);
		}
	}
};
