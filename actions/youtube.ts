'use server';

import { db } from '@/db';
import { socialMediaPosts, userUsage, youtubeChannels, youtubePosts } from '@/db/schema';
import { parseS3Url } from '@/utils/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getAwsClient } from '@remotion/lambda/client';
import { randomBytes } from 'crypto';
import { and, eq, sql } from 'drizzle-orm';
import { Credentials } from 'google-auth-library';
import { google } from 'googleapis';
import { Logger } from 'next-axiom';
import { revalidatePath } from 'next/cache';
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
		const logger = new Logger().with({
			function: 'postVideoToYoutube',
			...input
		});
		logger.info(startingFunctionString);

		try {
			const { user } = await getUser();
			if (!user) {
				logger.error(errorString, {
					error: 'User not authorized'
				});
				throw new ZSAError('NOT_AUTHORIZED', 'You are not authorized to perform this action.');
			}

			const { title, videoUrl, parentSocialMediaPostId, youtubeChannelId, isPrivate } = input;

			let videoStream;
			try {
				videoStream = await getVideoStream(videoUrl);
			} catch (error) {
				logger.error('Failed to get video stream', { error });
				throw new ZSAError(
					'INPUT_PARSE_ERROR',
					'Unable to process the provided video. Please check the URL and try again.'
				);
			}

			let youtubeAccount;
			try {
				youtubeAccount = await getYoutubeAccountForUser({
					userId: user.id,
					youtubeChannelId
				});
				if (!youtubeAccount) {
					throw new Error('YouTube account not found');
				}
			} catch (error) {
				logger.error('Failed to get YouTube account', { error });
				throw new ZSAError(
					'INTERNAL_SERVER_ERROR',
					'Unable to access your YouTube account. Please reconnect your account and try again.'
				);
			}

			youtubeAuthClient.setCredentials(youtubeAccount.credentials as Credentials);

			let videoId;
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
				videoId = resp?.data.id;
				if (!videoId) {
					throw new Error('Video ID not returned from YouTube API');
				}
			} catch (error) {
				logger.error('Failed to upload video to YouTube', { error });
				throw new ZSAError(
					'INTERNAL_SERVER_ERROR',
					'Failed to upload the video to YouTube. Please try again later.'
				);
			}

			try {
				await db.insert(youtubePosts).values({
					id: videoId,
					parentSocialMediaPostId: parentSocialMediaPostId,
					title,
					userId: user.id,
					youtubeChannelId: youtubeChannelId
				});
			} catch (error) {
				logger.error('Failed to save YouTube post to database', { error });
				throw new ZSAError(
					'INTERNAL_SERVER_ERROR',
					'The video was uploaded but we encountered an error saving the details. Please contact support.'
				);
			}

			logger.info('Video successfully uploaded and saved', { videoId });
			return { success: true, videoId };
		} catch (error) {
			if (error instanceof ZSAError) {
				throw error;
			}
			logger.error('Unexpected error in postVideoToYoutube', { error });
			throw new ZSAError(
				'INTERNAL_SERVER_ERROR',
				'An unexpected error occurred. Please try again later.'
			);
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
		if (error instanceof Error) {
			throw new Error('Youtube account not found');
		}
	}
};

export const getYoutubeChannelInfo = async (token: Credentials) => {
	const logger = new Logger().with({
		function: 'getYoutubeChannelInfo',
		token
	});
	youtubeAuthClient.setCredentials(token);
	var service = google.youtube('v3');

	const response = await service.channels.list({
		auth: youtubeAuthClient,
		part: ['snippet', 'contentDetails', 'statistics'],
		mine: true
	});

	var channels = response?.data.items;
	if (!channels) {
		logger.error(errorString, {
			error: 'No response from YouTube API'
		});
		throw new Error('No channels found.');
	}
	if (channels.length == 0) {
		logger.error(errorString, {
			error: 'No channels found.'
		});
		throw new Error('No channels found.');
	}
	const snippet = channels[0].snippet;
	if (!snippet) {
		logger.error(errorString, {
			error: 'No snippet found.'
		});
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

export const deleteYoutubeChannel = createServerAction()
	.input(
		z.object({
			channelId: z.string()
		})
	)
	.handler(async ({ input }) => {
		const logger = new Logger().with({
			function: 'deleteYoutubeChannel',
			channelId: input.channelId
		});
		const { user } = await getUser();
		if (!user) {
			logger.error(errorString, {
				error: 'User not authorized'
			});
			await logger.flush();
			throw new ZSAError('NOT_AUTHORIZED', 'You are not authorized to perform this action.');
		}
		try {
			await db.transaction(async (tx) => {
				// Delete YouTube posts
				await tx
					.delete(youtubePosts)
					.where(
						and(
							eq(youtubePosts.userId, user.id),
							eq(youtubePosts.youtubeChannelId, input.channelId)
						)
					);

				// Delete social media posts
				await tx.delete(socialMediaPosts).where(eq(socialMediaPosts.userId, user.id));

				// Delete the YouTube channel
				await tx
					.delete(youtubeChannels)
					.where(and(eq(youtubeChannels.userId, user.id), eq(youtubeChannels.id, input.channelId)));

				// Increase the number of connected accounts
				await tx
					.update(userUsage)
					.set({
						connectedAccountsLeft: sql`connected_accounts_left + 1`
					})
					.where(eq(userUsage.userId, user.id));
			});
			revalidatePath('/account');
			await logger.flush();
		} catch (error) {
			if (error instanceof Error) {
				logger.error(errorString, error);
				await logger.flush();
				throw new ZSAError('INTERNAL_SERVER_ERROR', error.message);
			}
		}
	});

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
