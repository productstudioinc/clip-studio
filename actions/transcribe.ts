'use server';

import { getUser } from '@/actions/auth/user';
import { db } from '@/db';
import { userUsage } from '@/db/schema';
import { Transcription } from '@/stores/templatestore';
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

			await db.transaction(async (tx) => {
				const userUsageRecord = await tx
					.select({ transcriptionSecondsLeft: userUsage.transcriptionSecondsLeft })
					.from(userUsage)
					.where(eq(userUsage.userId, user.id));

				if (userUsageRecord[0].transcriptionSecondsLeft < duration) {
					logger.error('Insufficient transcription seconds', {
						userId: user.id,
						requiredSeconds: duration,
						availableSeconds: userUsageRecord[0].transcriptionSecondsLeft
					});
					await logger.flush();
					throw new ZSAError(
						'INSUFFICIENT_CREDITS',
						"You don't have enough seconds left to transcribe this video."
					);
				}

				await tx
					.update(userUsage)
					.set({
						transcriptionSecondsLeft: sql`transcription_seconds_left - ${duration}`
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
			data: Transcription.optional()
		})
	)
	.handler(async ({ input }) => {
		try {
			const response = await fetch(
				`${process.env.WHISPER_MODAL_URL}/call_id?call_id=${input.callId}`,
				{
					method: 'GET'
				}
			);

			if (response.status === 500) {
				await db
					.update(userUsage)
					.set({ transcriptionSecondsLeft: sql`transcription_seconds_left + ${input.duration}` });
				logger.error('Error fetching transcription', { callId: input.callId });
				await logger.flush();
				throw new ZSAError('INTERNAL_SERVER_ERROR', 'ID not found');
			}

			if (response.status === 202) {
				return {
					status: 'processing'
				};
			}

			if (response.status === 200) {
				const data = await response.json();
				if (Array.isArray(data) && data.length === 2) {
					const [transcriptionData, _number] = data;
					const result = Transcription.safeParse(transcriptionData);
					if (result.success) {
						return {
							status: 'done',
							data: result.data
						};
					} else {
						await db.update(userUsage).set({
							transcriptionSecondsLeft: sql`transcription_seconds_left + ${input.duration}`
						});
						logger.error('Invalid response from Whisper', { callId: input.callId });
						await logger.flush();
						throw new ZSAError('OUTPUT_PARSE_ERROR', 'Invalid response returned from Whisper');
					}
				} else {
					await db
						.update(userUsage)
						.set({ transcriptionSecondsLeft: sql`transcription_seconds_left + ${input.duration}` });
					logger.error('Unexpected response format from Whisper', { callId: input.callId });
					await logger.flush();
					throw new ZSAError('OUTPUT_PARSE_ERROR', 'Invalid response returned from Whisper');
				}
			}

			await db
				.update(userUsage)
				.set({ transcriptionSecondsLeft: sql`transcription_seconds_left + ${input.duration}` });
			logger.error('Unexpected response status from Whisper', {
				callId: input.callId,
				status: response.status
			});
			await logger.flush();
			throw new ZSAError('INTERNAL_SERVER_ERROR', 'Unexpected response status');
		} catch (error) {
			logger.error('Unexpected error in getTranscription', {
				error: error instanceof Error ? error.message : String(error),
				callId: input.callId
			});
			await logger.flush();
			throw error;
		}
	});
