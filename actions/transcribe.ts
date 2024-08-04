'use server';

import { db } from '@/db';
import { userUsage } from '@/db/schema';
import { Transcription } from '@/stores/templatestore';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createServerAction, ZSAError } from 'zsa';
import { getUser } from './auth/user';

export const getTranscriptionId = createServerAction()
	.input(z.string().url())
	.handler(async ({ input }) => {
		const { user } = await getUser();
		if (!user) {
			throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.');
		}
		const encodedUrl = encodeURIComponent(input);
		const videoLength = await fetch(
			`${process.env.WHISPER_MODAL_URL}/getLength?video_url=${encodedUrl}`,
			{
				method: 'GET'
			}
		);
		if (videoLength.status === 500) {
			const text = await videoLength.json();
			throw new ZSAError('INTERNAL_SERVER_ERROR', text);
		}
		const { duration } = await videoLength.json();
		await db.transaction(async (tx) => {
			const userUsageRecord = await tx
				.select({ transcriptionSecondsLeft: userUsage.transcriptionSecondsLeft })
				.from(userUsage)
				.where(eq(userUsage.userId, user.id));
			if (userUsageRecord[0].transcriptionSecondsLeft < duration) {
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
			throw new ZSAError('INTERNAL_SERVER_ERROR', text);
		}
		const result = await response.json();
		return {
			callId: result.call_id,
			duration: duration
		};
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
		const response = await fetch(`${process.env.WHISPER_MODAL_URL}/call_id?call_id=${input}`, {
			method: 'GET'
		});

		if (response.status === 500) {
			await db
				.update(userUsage)
				.set({ transcriptionSecondsLeft: sql`transcription_seconds_left + ${input.duration}` });
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
					await db
						.update(userUsage)
						.set({ transcriptionSecondsLeft: sql`transcription_seconds_left + ${input.duration}` });
					throw new ZSAError('OUTPUT_PARSE_ERROR', 'Invalid response returned from Whisper');
				}
			} else {
				await db
					.update(userUsage)
					.set({ transcriptionSecondsLeft: sql`transcription_seconds_left + ${input.duration}` });
				throw new ZSAError('OUTPUT_PARSE_ERROR', 'Invalid response returned from Whisper');
			}
		}

		await db
			.update(userUsage)
			.set({ transcriptionSecondsLeft: sql`transcription_seconds_left + ${input.duration}` });
		throw new ZSAError('INTERNAL_SERVER_ERROR', 'Unexpected response status');
	});
