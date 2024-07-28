'use server';

import { db } from '@/db';
import { youtubeChannels } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Credentials } from 'google-auth-library';
import { getYoutubeChannelInfo } from '../youtube';

export type YoutubeChannel = {
	profile_picture_path: string | null | undefined;
	min_video_duration: number;
	max_video_duration: number;
	max_video_size: number;
	error: string;
	id: string;
	userId: string;
	createdAt: Date;
	channelCustomUrl: string;
	credentials: unknown;
	updatedAt: Date;
};

export const fetchUserConnectSocialMediaAccounts = async (userId: string) => {
	const youtubeChannelsResponse = await db
		.select()
		.from(youtubeChannels)
		.where(eq(youtubeChannels.userId, userId));

	const youtubeChannelsWithSignedUrl = youtubeChannelsResponse
		? await Promise.all(
				youtubeChannelsResponse?.map(async (channel) => {
					const channelInfo = await getYoutubeChannelInfo(channel.credentials as Credentials);
					return {
						...channel,
						profile_picture_path: channelInfo?.thumbnail,
						min_video_duration: 3,
						max_video_duration: 60,
						max_video_size: 1024 * 1024 * 1024 * 256,
						error: channelInfo ? '' : 'Please reconnect your Youtube Channel'
					};
				})
			)
		: [];
	return {
		youtubeChannels: youtubeChannelsWithSignedUrl
	};
};
