'use server';

import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { R2 } from '../r2';

export const generatePresignedUrl = async (
	contentType: string,
	contentLength: number
): Promise<{ presignedUrl: string; readUrl: string }> => {
	if (contentLength > 1024 * 1024 * 200) {
		throw new Error(`File may not be over 200MB. Yours is ${contentLength} bytes.`);
	}

	const key = crypto.randomUUID();

	const putCommand = new PutObjectCommand({
		Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
		Key: key,
		ContentLength: contentLength,
		ContentType: contentType
	});

	const presignedPutUrl = await getSignedUrl(R2, putCommand, {
		expiresIn: 1800
	});

	const getCommand = new GetObjectCommand({
		Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
		Key: key
	});

	const presignedGetUrl = await getSignedUrl(R2, getCommand, {
		expiresIn: 1800
	});

	return { presignedUrl: presignedPutUrl, readUrl: presignedGetUrl };
};
