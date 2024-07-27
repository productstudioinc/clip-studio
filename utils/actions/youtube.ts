'use server';

import { db } from '@/db';
import { youtubeChannels, youtubePosts } from '@/db/schema';
import { randomBytes } from 'crypto';
import { and, DrizzleError, eq } from 'drizzle-orm';
import { Credentials } from 'google-auth-library';
import { google } from 'googleapis';
import { redirect } from 'next/navigation';
import youtubeAuthClient from '../youtube';

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

export const postVideoToYoutube = async ({
	title,
	videoUrl,
	userId,
	parentSocialMediaPostId,
	youtubeChannelId,
	isPrivate
}: {
	title: string;
	videoUrl: string;
	userId: string;
	parentSocialMediaPostId: string;
	youtubeChannelId: string;
	isPrivate: boolean;
}) => {
	const youtubeAccount = await getYoutubeAccountForUser({
		userId,
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
				body: videoUrl,
				mimeType: 'application/octet-stream'
			}
		});
		const videoId = resp?.data.id;
		if (!videoId) {
			return {
				error: "Sorry, we couldn't upload your video to YouTube. Please try again."
			};
		}
		await db.insert(youtubePosts).values({
			id: videoId,
			parentSocialMediaPostId: parentSocialMediaPostId,
			title,
			userId: userId,
			youtubeChannelId: youtubeChannelId
		});
	} catch (error: any) {
		// Handle API errors
		if (error.response && error.response.data) {
			const apiError = error.response.data.error;
		} else {
		}
		throw error;
	}
};

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
