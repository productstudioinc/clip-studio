'use server';

import { getUser } from '@/actions/auth/user';
import { createHash } from 'crypto';
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
	const scope = 'user.info.basic,video.list,video.upload';
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
