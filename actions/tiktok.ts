'use server';

import { getUser } from '@/actions/auth/user';
import { db } from '@/db';
import { tiktokAccounts } from '@/db/schema';
import { endingFunctionString, errorString, startingFunctionString } from '@/utils/logging';
import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { Logger } from 'next-axiom';
// import { db } from '@/db';
// import { tiktokAccounts } from '@/db/schema';
import { redirect } from 'next/navigation';

export const connectTiktokAccount = async () => {
	const { user } = await getUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_REDIRECT_URI) {
		throw new Error('TikTok credentials not configured');
	}

	const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');
	const scope = 'user.info.profile,user.info.stats,video.publish,video.upload';
	const code_challenge = createHash('sha256').update(generateRandomString(128)).digest('hex');

	const authUrlParams = new URLSearchParams({
		client_key: process.env.TIKTOK_CLIENT_KEY,
		scope: scope,
		response_type: 'code',
		redirect_uri: process.env.TIKTOK_REDIRECT_URI,
		state: state,
		code_challenge: code_challenge,
		code_challenge_method: 'S256'
	});

	const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${authUrlParams.toString()}`;

	redirect(authUrl);
};

const generateRandomString = (length: number) => {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

async function exchangeCodeForToken(code: string): Promise<string> {
	if (
		!process.env.TIKTOK_CLIENT_ID ||
		!process.env.TIKTOK_CLIENT_SECRET ||
		!process.env.TIKTOK_REDIRECT_URI
	) {
		throw new Error('TikTok credentials not configured');
	}

	const tokenUrl = 'https://open-api.tiktok.com/oauth/access_token/';
	const params = new URLSearchParams({
		client_key: process.env.TIKTOK_CLIENT_ID,
		client_secret: process.env.TIKTOK_CLIENT_SECRET,
		code: code,
		grant_type: 'authorization_code',
		redirect_uri: process.env.TIKTOK_REDIRECT_URI
	});

	try {
		const response = await fetch(`${tokenUrl}?${params.toString()}`, {
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		if (data.data && data.data.access_token) {
			return data.data.access_token;
		} else {
			throw new Error('Failed to retrieve access token from TikTok');
		}
	} catch (error) {
		console.error('Error exchanging code for token:', error);
		throw new Error('Failed to exchange code for token');
	}
}
async function getTiktokUserInfo(
	accessToken: string
): Promise<{ open_id: string; username: string }> {
	const userInfoUrl = 'https://open.tiktokapis.com/v2/user/info/';
	const fields = [
		'open_id',
		'union_id',
		'avatar_url',
		'avatar_url_100',
		'avatar_large_url',
		'display_name',
		'bio_description',
		'profile_deep_link',
		'is_verified',
		'follower_count',
		'following_count',
		'likes_count',
		'video_count'
	];

	try {
		const response = await fetch(userInfoUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		if (data.data && data.data.user) {
			return {
				open_id: data.data.user.open_id,
				username: data.data.user.display_name
			};
		} else {
			throw new Error('Failed to retrieve user info from TikTok');
		}
	} catch (error) {
		console.error('Error fetching TikTok user info:', error);
		throw new Error('Failed to fetch TikTok user info');
	}
}

export const refreshTikTokAccessTokens = async () => {
	const logger = new Logger().with({
		function: 'refreshTikTokAccessToken'
	});

	try {
		const response = await db.select().from(tiktokAccounts);
		logger.info(startingFunctionString);
		for (let i = 0; i < response.length; i++) {
			const { refreshToken, id } = response[i];
			await refreshTikTokAccessToken({ refreshToken: refreshToken, id });
			logger.info(endingFunctionString, {
				numberOfAccounts: response.length
			});
		}
	} catch (error) {
		logger.error(errorString, {
			error: error instanceof Error ? error.message : String(error)
		});
		await logger.flush();
		throw error;
	}
};

type TikTokRefreshTokenResponse = {
	access_token?: string;
	expires_in?: number;
	open_id?: string;
	refresh_expires_in?: number;
	refresh_token?: string;
	scope?: string;
	token_type?: string;
	error?: string;
	error_description?: string;
};

const refreshTikTokAccessToken = async ({
	refreshToken,
	id
}: {
	refreshToken: string;
	id: string;
}) => {
	const logger = new Logger().with({
		function: 'refreshTikTokAccessToken',
		refreshToken,
		id
	});
	logger.info(startingFunctionString);

	try {
		const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: `client_key=${process.env.TIKTOK_CLIENT_KEY}&client_secret=${process.env.TIKTOK_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refreshToken}`
		});

		const { error, error_description, refresh_token, access_token } =
			(await response.json()) as TikTokRefreshTokenResponse;

		if (error) {
			logger.error(errorString, { error, error_description });
			await logger.flush();
			throw Error(error);
		}

		await db
			.update(tiktokAccounts)
			.set({
				refreshToken: refresh_token,
				accessToken: access_token,
				updatedAt: new Date()
			})
			.where(eq(tiktokAccounts.id, id));

		logger.info(endingFunctionString);
	} catch (error) {
		logger.error(errorString, {
			error: error instanceof Error ? error.message : String(error)
		});
		await logger.flush();
		throw error;
	}

	await logger.flush();
};

type TikTokCreatorInfoErrorCode =
	| 'ok'
	| 'spam_risk_too_many_posts'
	| 'spam_risk_user_banned_from_posting'
	| 'reached_active_user_cap'
	| 'unaudited_client_can_only_post_to_private_accounts'
	| 'access_token_invalid'
	| 'scope_not_authorized'
	| 'rate_limit_exceeded'
	| 'internal_error';

type TikTokCreatorInfoResponse = {
	data: {
		creator_avatar_url: string;
		creator_username: string;
		creator_nickname: string;
		privacy_level_options: string[];
		comment_disabled: boolean;
		duet_disabled: boolean;
		stitch_disabled: boolean;
		max_video_post_duration_sec: number;
	};
	error: {
		code: TikTokCreatorInfoErrorCode;
		message: string;
		logid: string;
	};
};

export const fetchCreatorInfo = async (accessToken: string) => {
	const logger = new Logger().with({
		function: 'fetchCreatorInfo',
		accessToken
	});
	const response = await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json; charset=UTF-8'
		}
	});
	const { data, error } = (await response.json()) as TikTokCreatorInfoResponse;
	if (error.code !== 'ok') {
		logger.error(errorString, error);
		await logger.flush();
	}

	return { data, errorMessage: generateErrorMessage(error.code) };
};

const generateErrorMessage = (error: TikTokCreatorInfoErrorCode) => {
	switch (error) {
		case 'ok':
			return;
		case 'spam_risk_too_many_posts':
			return "You've posted too many times recently — please try again later";
		case 'spam_risk_user_banned_from_posting':
			return "You've been banned from posting — please contact TikTok support if you believe this is an error";
		case 'reached_active_user_cap':
			return "You've reached the maximum number of active posts — please try again later";
		case 'unaudited_client_can_only_post_to_private_accounts':
			return 'You can only post to private accounts — please try again later';
		case 'access_token_invalid':
			return 'Your access token is invalid — please reconnect your account and try again';
		case 'scope_not_authorized':
			return 'Your scope is not authorized — please reconnect your account and try again';
		case 'rate_limit_exceeded':
			return "You've posted too many times recently — please try again later";
		case 'internal_error':
			return 'It seems like TikTok is having some issues — please try again later';
	}
};
