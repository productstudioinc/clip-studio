import { db } from '@/db';
import { youtubeChannels } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Credentials } from 'google-auth-library';
import { Logger } from 'next-axiom';
import { getYoutubeChannelInfo } from '../youtube';

const logger = new Logger({
	source: 'actions/db/social-media-queries'
});

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
	logger.info('Fetching user connected social media accounts', { userId });

	try {
		const youtubeChannelsResponse = await db
			.select()
			.from(youtubeChannels)
			.where(eq(youtubeChannels.userId, userId));

		logger.info('Fetched YouTube channels', {
			userId,
			channelCount: youtubeChannelsResponse.length
		});

		const youtubeChannelsWithSignedUrl = youtubeChannelsResponse
			? await Promise.all(
					youtubeChannelsResponse?.map(async (channel) => {
						try {
							const channelInfo = await getYoutubeChannelInfo(channel.credentials as Credentials);
							logger.info('Fetched YouTube channel info', {
								userId,
								channelId: channel.id
							});

							return {
								...channel,
								profile_picture_path: channelInfo?.thumbnail,
								min_video_duration: 3,
								max_video_duration: 60,
								max_video_size: 1024 * 1024 * 1024 * 256,
								error: channelInfo ? '' : 'Please reconnect your Youtube Channel'
							};
						} catch (error) {
							logger.error('Error fetching YouTube channel info', {
								userId,
								channelId: channel.id,
								error: error instanceof Error ? error.message : String(error)
							});
							return {
								...channel,
								profile_picture_path: null,
								min_video_duration: 3,
								max_video_duration: 60,
								max_video_size: 1024 * 1024 * 1024 * 256,
								error: 'Error fetching channel info'
							};
						}
					})
				)
			: [];

		logger.info('Processed YouTube channels', {
			userId,
			processedChannelCount: youtubeChannelsWithSignedUrl.length
		});

		await logger.flush();

		return {
			youtubeChannels: youtubeChannelsWithSignedUrl
		};
	} catch (error) {
		logger.error('Error fetching user connected social media accounts', {
			userId,
			error: error instanceof Error ? error.message : String(error)
		});
		await logger.flush();
		throw error;
	}
};
