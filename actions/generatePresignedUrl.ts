'use server';

import { getUser } from '@/actions/auth/user';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from 'next-axiom';
import { z } from 'zod';
import { createServerAction, ZSAError } from 'zsa';
import { R2 } from '../utils/r2';

const logger = new Logger({
	source: 'actions/generatePresignedUrl'
});

export const generatePresignedUrl = createServerAction()
	.input(
		z.object({
			contentType: z.string(),
			contentLength: z.number()
		})
	)
	.handler(async ({ input }) => {
		const { user } = await getUser();
		if (!user) {
			logger.error('User not authenticated');
			await logger.flush();
			throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.');
		}

		if (input.contentLength > 1024 * 1024 * 200) {
			logger.error('Payload too large', {
				email: user.email,
				contentLength: input.contentLength
			});
			await logger.flush();
			throw new ZSAError(
				'PAYLOAD_TOO_LARGE',
				`File may not be over 200MB. Yours is ${input.contentLength} bytes.`
			);
		}

		const key = crypto.randomUUID();

		try {
			const putCommand = new PutObjectCommand({
				Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
				Key: key,
				ContentLength: input.contentLength,
				ContentType: input.contentType
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
		} catch (error) {
			logger.error('Error generating presigned URL', {
				email: user.email,
				error: error instanceof Error ? error.message : String(error)
			});
			await logger.flush();
			throw new ZSAError(
				'INTERNAL_SERVER_ERROR',
				'An error occurred while generating the presigned URL.'
			);
		}
	});
