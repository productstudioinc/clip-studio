'use server';

import { getUser } from '@/actions/auth/user';
import { db } from '@/db';
import { userUsage } from '@/db/schema';
import { TranscriptionSchema } from '@/stores/templatestore';
import { CREDIT_CONVERSIONS } from '@/utils/constants';
import { eq, sql } from 'drizzle-orm';
import { Logger } from 'next-axiom';
import { z } from 'zod';
import { createServerAction, ZSAError } from 'zsa';

const logger = new Logger({
	source: 'actions/transcribe'
});

export const getTranscriptionId = createServerAction()
	.input(z.string().url())
	.handler(async ({ input }) => {
		const { user } = await getUser();
		if (!user) {
			logger.error('Unauthorized access attempt', { action: 'getTranscriptionId' });
			await logger.flush();
			throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.');
		}

		const encodedUrl = encodeURIComponent(input);

		try {
			const videoLength = await fetch(
				`${process.env.WHISPER_MODAL_URL}/getLength?video_url=${encodedUrl}`,
				{
					method: 'GET'
				}
			);

			if (videoLength.status === 500) {
				const text = await videoLength.json();
				logger.error('Error getting video length', { error: text, videoUrl: input });
				await logger.flush();
				throw new ZSAError('INTERNAL_SERVER_ERROR', text);
			}

			const { duration } = await videoLength.json();
			const requiredCredits = Math.ceil(duration / CREDIT_CONVERSIONS.TRANSCRIBE_SECONDS);

			await db.transaction(async (tx) => {
				const userUsageRecord = await tx
					.select({ creditsLeft: userUsage.creditsLeft })
					.from(userUsage)
					.where(eq(userUsage.userId, user.id));

				if (!userUsageRecord[0]?.creditsLeft) {
					logger.error('User usage record not found', { userId: user.id });
					await logger.flush();
					throw new ZSAError('INTERNAL_SERVER_ERROR', 'User usage record not found');
				}

				if (userUsageRecord[0].creditsLeft < requiredCredits) {
					logger.error('Insufficient credits', {
						userId: user.id,
						requiredCredits,
						availableCredits: userUsageRecord[0].creditsLeft
					});
					await logger.flush();
					throw new ZSAError(
						'INSUFFICIENT_CREDITS',
						"You don't have enough credits to transcribe this video."
					);
				}

				await tx
					.update(userUsage)
					.set({
						creditsLeft: sql`credits_left - ${requiredCredits}`
					})
					.where(eq(userUsage.userId, user.id));
			});

			const response = await fetch(
				`${process.env.WHISPER_MODAL_URL}/transcribe?video_url=${encodedUrl}`,
				{
					method: 'POST'
				}
			);

			if (response.status === 500) {
				const text = await response.text();
				logger.error('Error initiating transcription', { error: text, videoUrl: input });
				await logger.flush();
				throw new ZSAError('INTERNAL_SERVER_ERROR', text);
			}

			const result = await response.json();
			return {
				callId: result.call_id,
				duration: duration
			};
		} catch (error) {
			logger.error('Unexpected error in getTranscriptionId', {
				error: error instanceof Error ? error.message : String(error),
				videoUrl: input
			});
			await logger.flush();
			throw error;
		}
	});

export const getTranscription = createServerAction()
	.input(z.object({ callId: z.string(), duration: z.number() }))
	.output(
		z.object({
			status: z.enum(['done', 'processing']),
			data: TranscriptionSchema.optional()
		})
	)
	.handler(async ({ input }) => {
		const requiredCredits = Math.ceil(input.duration / CREDIT_CONVERSIONS.TRANSCRIBE_SECONDS);
		const { user } = await getUser();

		if (!user) {
			throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.');
		}

		try {
			const response = await fetch(
				`${process.env.WHISPER_MODAL_URL}/call_id?call_id=${input.callId}`,
				{
					method: 'GET'
				}
			);

			if (response.status === 202) {
				return { status: 'processing' };
			}

			if (response.status === 200) {
				const rawData = await response.text();
				let data;
				try {
					data = JSON.parse(rawData);
				} catch (parseError) {
					await refundCredits(user.id, requiredCredits);
					logger.error('Failed to parse response as JSON', { callId: input.callId, rawData });
					await logger.flush();
					throw new ZSAError('OUTPUT_PARSE_ERROR', 'Invalid JSON response from Whisper');
				}

				const result = TranscriptionSchema.safeParse(data);
				if (result.success) {
					logger.info('Transcription fetched successfully', { result });
					return {
						status: 'done',
						data: result.data
					};
				} else {
					await refundCredits(user.id, requiredCredits);
					logger.error('Invalid response from Whisper', { callId: input.callId, data });
					await logger.flush();
					throw new ZSAError('OUTPUT_PARSE_ERROR', 'Invalid response returned from Whisper');
				}
			}

			await refundCredits(user.id, requiredCredits);
			logger.error('Unexpected response status from Whisper', {
				callId: input.callId,
				status: response.status
			});
			await logger.flush();
			throw new ZSAError('INTERNAL_SERVER_ERROR', 'Unexpected response status');
		} catch (error) {
			await refundCredits(user.id, requiredCredits);
			logger.error('Unexpected error in getTranscription', {
				error: error instanceof Error ? error.message : String(error),
				callId: input.callId
			});
			await logger.flush();
			throw error;
		}
	});

async function refundCredits(userId: string, credits: number) {
	try {
		await db
			.update(userUsage)
			.set({ creditsLeft: sql`credits_left + ${credits}` })
			.where(eq(userUsage.userId, userId));
	} catch (error) {
		logger.error('Failed to refund credits', { userId, credits, error });
		await logger.flush();
	}
}
