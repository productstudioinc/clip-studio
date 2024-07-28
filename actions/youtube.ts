'use server';

import { db } from '@/db';
import { youtubeChannels, youtubePosts } from '@/db/schema';
import { parseS3Url } from '@/utils/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getAwsClient } from '@remotion/lambda/client';
import { randomBytes } from 'crypto';
import { and, DrizzleError, eq } from 'drizzle-orm';
import { Credentials } from 'google-auth-library';
import { google } from 'googleapis';
import { Logger } from 'next-axiom';
import { redirect } from 'next/navigation';
import { Readable } from 'stream';
import { z } from 'zod';
import { createServerAction, ZSAError } from 'zsa';
import { endingFunctionString, errorString, startingFunctionString } from '../utils/logging';
import youtubeAuthClient from '../utils/youtube';
import { getUser } from './auth/user';

export type YoutubeVideoStats = 'private' | 'public';

export const connectYoutubeAccount = async () => {
	const scopes = [
		'https://www.googleapis.com/auth/youtube.readonly',
		'https://www.googleapis.com/auth/youtube.upload'
	];

	const state = randomBytes(32).toString('hex');
	const authUrl = youtubeAuthClient.generateAuthUrl({
		access_type: 'offline',
		scope: scopes,
		include_granted_scopes: true,
		state: state,
		prompt: 'consent' // Forces consent screen to appear — necessary b/c google only issues refresh on initial auth
	});

	console.log(authUrl);

	redirect(authUrl);
};

export const postVideoToYoutube = createServerAction()
	.input(
		z.object({
			title: z.string(),
			videoUrl: z.string(),
			parentSocialMediaPostId: z.string(),
			youtubeChannelId: z.string(),
			isPrivate: z.boolean().default(false)
		})
	)
	.handler(async ({ input }) => {
		const { user } = await getUser();
		if (!user) {
			throw new ZSAError('NOT_AUTHORIZED', 'You are not authorized to perform this action.');
		}
		const { title, videoUrl, parentSocialMediaPostId, youtubeChannelId, isPrivate } = input;
		const videoStream = await getVideoStream(videoUrl);
		const youtubeAccount = await getYoutubeAccountForUser({
			userId: user.id,
			youtubeChannelId
		});
		youtubeAuthClient.setCredentials(youtubeAccount?.credentials as Credentials);
		try {
			const youtube = google.youtube('v3');
			const resp = await youtube.videos.insert({
				auth: youtubeAuthClient,
				part: ['snippet', 'status'],
				requestBody: {
					snippet: { title },
					status: { privacyStatus: isPrivate ? 'private' : 'public' }
				},
				media: {
					body: videoStream,
					mimeType: 'video/mp4'
				}
			});
			const videoId = resp?.data.id;
			console.log('video id', videoId);
			if (!videoId) {
				throw new ZSAError(
					'INTERNAL_SERVER_ERROR',
					"Sorry, we couldn't upload your video to YouTube. Please try again."
				);
			}
			await db.insert(youtubePosts).values({
				id: videoId,
				parentSocialMediaPostId: parentSocialMediaPostId,
				title,
				userId: user.id,
				youtubeChannelId: youtubeChannelId
			});
			console.log('youtube post id', videoId);
		} catch (error) {
			console.error('Error uploading to YouTube:', error);
			if (error instanceof DrizzleError) {
				throw new ZSAError('INTERNAL_SERVER_ERROR', error.message);
			} else {
				throw new ZSAError('INTERNAL_SERVER_ERROR', 'An error occurred while uploading the video.');
			}
		}
	});

const getYoutubeAccountForUser = async ({
	userId,
	youtubeChannelId
}: {
	userId: string;
	youtubeChannelId: string;
}) => {
	try {
		const response = await db
			.select()
			.from(youtubeChannels)
			.where(and(eq(youtubeChannels.userId, userId), eq(youtubeChannels.id, youtubeChannelId)));
		return response[0];
	} catch (error) {
		if (error instanceof DrizzleError) {
			throw new Error(error.message);
		}
	}
};

export const getYoutubeChannelInfo = async (token: Credentials) => {
	youtubeAuthClient.setCredentials(token);
	var service = google.youtube('v3');

	const response = await service.channels.list({
		auth: youtubeAuthClient,
		part: ['snippet', 'contentDetails', 'statistics'],
		mine: true
	});

	var channels = response?.data.items;
	if (!channels) {
		throw new Error('No channels found.');
	}
	if (channels.length == 0) {
		throw new Error('No channels found.');
	}
	const snippet = channels[0].snippet;
	if (!snippet) {
		throw new Error('No snippet found.');
	}
	const customUrl = snippet.customUrl;
	const accessToken = token.access_token;
	const channelId = channels[0].id;
	const thumbnail = snippet.thumbnails?.default?.url;
	return {
		customUrl,
		accessToken,
		channelId,
		thumbnail
	};
};

const getVideoStream = async (videoUrl: string): Promise<Readable> => {
	const { client } = getAwsClient({
		region: 'us-east-1',
		service: 's3'
	});
	const { bucketName, key } = parseS3Url(videoUrl);
	console.log('bucketName', bucketName);
	console.log('key', key);
	const getObjectCommand = new GetObjectCommand({
		Bucket: bucketName,
		Key: key
	});
	const data = await client.send(getObjectCommand);

	if (!data.Body) {
		throw new Error('Failed to get video stream from S3');
	}

	return data.Body as Readable;
};

export const refreshYoutubeAccessTokens = async () => {
	const logger = new Logger().with({
		function: 'refreshYoutubeAccessTokens'
	});

	try {
		logger.info(startingFunctionString);

		const channels = await db.select().from(youtubeChannels);

		if (!channels.length) {
			logger.error(errorString, {
				error: 'No data returned from youtube channels'
			});
			throw new Error('No YouTube channels found');
		}

		for (const channel of channels) {
			await refreshYoutubeAccessToken({
				credentials: channel.credentials as Credentials,
				id: channel.id
			});
		}

		logger.info(endingFunctionString, {
			numberOfAccounts: channels.length
		});
	} catch (error) {
		logger.error(errorString, {
			error: error instanceof Error ? error.message : JSON.stringify(error)
		});
		throw error;
	} finally {
		await logger.flush();
	}
};

const refreshYoutubeAccessToken = async ({
	credentials,
	id
}: {
	credentials: Credentials;
	id: string;
}) => {
	const logger = new Logger().with({
		function: 'refreshYoutubeAccessToken',
		id
	});

	try {
		logger.info(startingFunctionString);

		youtubeAuthClient.setCredentials(credentials);
		const { credentials: updatedCredentials } = await youtubeAuthClient.refreshAccessToken();

		await db
			.update(youtubeChannels)
			.set({
				credentials: updatedCredentials as Credentials,
				updatedAt: new Date()
			})
			.where(eq(youtubeChannels.id, id));

		logger.info(endingFunctionString);
	} catch (error) {
		logger.error(errorString, {
			error: error instanceof Error ? error.message : JSON.stringify(error)
		});
	} finally {
		await logger.flush();
	}
};
