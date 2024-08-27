'use server';

import { db } from '@/db';
import { userUsage } from '@/db/schema';
import { errorString, startingFunctionString } from '@/utils/logging';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq, sql } from 'drizzle-orm';
import { ElevenLabsClient } from 'elevenlabs';
import { Logger } from 'next-axiom';
import z from 'zod';
import { createServerAction, ZSAError } from 'zsa';
import { R2 } from '../utils/r2';
import { getUser } from './auth/user';

const logger = new Logger({
	source: 'actions/elevenlabs'
});

const elevenLabsClient = new ElevenLabsClient({
	apiKey: process.env.ELEVEN_LABS_API_KEY!
});

export const getVoices = async () => {
	try {
		const voices = await elevenLabsClient.voices.getAll();
		const filteredVoices = voices.voices.slice(0, 10).map((voice) => ({
			voice_id: voice.voice_id,
			name: voice.name,
			description: voice.description,
			samples: voice.samples,
			labels: voice.labels,
			preview_url: voice.preview_url
		}));
		return filteredVoices;
	} catch (error) {
		logger.error('Error fetching voices from ElevenLabs', {
			error: error instanceof Error ? error.message : String(error)
		});
		await logger.flush();
		throw error;
	}
};

export const generateAudioAndTimestamps = createServerAction()
	.input(
		z.object({
			title: z.string(),
			text: z.string(),
			voiceId: z.string()
		})
	)
	.handler(async ({ input }) => {
		const logger = new Logger().with({
			function: 'generateAudioAndTimestamps',
			...input
		});
		logger.info(startingFunctionString);

		const { user } = await getUser();
		if (!user) {
			logger.error(errorString, { error: 'User not authorized' });
			await logger.flush();
			throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.');
		}

		const fullText = `${input.title} <break time="0.7s" /> ${input.text}`;
		const characterCount = fullText.length;

		try {
			const userUsageRecord = await db
				.select({ voiceoverCharactersLeft: userUsage.voiceoverCharactersLeft })
				.from(userUsage)
				.where(eq(userUsage.userId, user.id));

			if (userUsageRecord.length === 0) {
				logger.error(errorString, { error: 'User does not have a subscription' });
				await logger.flush();
				throw new ZSAError(
					'INTERNAL_SERVER_ERROR',
					'You need an active subscription to use this feature.'
				);
			}

			if (userUsageRecord[0].voiceoverCharactersLeft < characterCount) {
				logger.error(errorString, { error: 'Insufficient voiceover characters' });
				await logger.flush();
				throw new ZSAError(
					'INSUFFICIENT_CREDITS',
					`You don't have enough characters left to generate this voiceover.`
				);
			}

			// Deduct the characters
			await db
				.update(userUsage)
				.set({
					voiceoverCharactersLeft: sql`${userUsage.voiceoverCharactersLeft} - ${characterCount}`
				})
				.where(eq(userUsage.userId, user.id));

			const audio = (await elevenLabsClient.textToSpeech.convertWithTimstamps(input.voiceId, {
				text: fullText
			})) as AudioResponse;

			const audioBuffer = Buffer.from(audio.audio_base64, 'base64');
			const s3Key = `voiceovers/${input.voiceId}/${crypto.randomUUID()}.mp3`;

			const putObjectCommand = new PutObjectCommand({
				Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
				Key: s3Key,
				Body: audioBuffer,
				ContentType: 'audio/mpeg'
			});

			await R2.send(putObjectCommand);

			const getObjectCommand = new GetObjectCommand({
				Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
				Key: s3Key
			});

			const signedUrl = await getSignedUrl(R2, getObjectCommand, {
				expiresIn: 3600
			});

			const normalizedTitle = input.title.toLowerCase();
			const normalizedCharacters = audio.normalized_alignment.characters.map((char) =>
				char.toLowerCase()
			);

			let titleEndIndex = -1;
			for (let i = 0; i <= normalizedCharacters.length - normalizedTitle.length; i++) {
				if (
					normalizedCharacters.slice(i, i + normalizedTitle.length).join('') === normalizedTitle
				) {
					titleEndIndex = i + normalizedTitle.length - 1;
					break;
				}
			}

			const titleEnd =
				titleEndIndex >= 0
					? audio.normalized_alignment.character_end_times_seconds[titleEndIndex]
					: 0;

			logger.info('Voiceover generated successfully', {
				signedUrl,
				endTimestamp: audio.normalized_alignment.character_end_times_seconds.slice(-1)[0],
				voiceoverObject: audio.normalized_alignment,
				titleEnd
			});
			await logger.flush();
			return {
				signedUrl,
				endTimestamp: audio.normalized_alignment.character_end_times_seconds.slice(-1)[0],
				voiceoverObject: audio.normalized_alignment,
				titleEnd
			};
		} catch (error) {
			// If an error occurred, refund the characters
			await db
				.update(userUsage)
				.set({
					voiceoverCharactersLeft: sql`${userUsage.voiceoverCharactersLeft} + ${characterCount}`
				})
				.where(eq(userUsage.userId, user.id));

			logger.error(errorString, { error });

			// rethrow zsa errors if they bubble up
			if (error instanceof ZSAError) {
				throw error;
			}

			throw new ZSAError(
				'INTERNAL_SERVER_ERROR',
				'An error occurred while generating the voiceover.'
			);
		}
	});

export type ElevenlabsVoice = Awaited<ReturnType<typeof getVoices>>[number];

type AudioResponse = {
	audio_base64: string;
	alignment: Alignment;
	normalized_alignment: Alignment;
};

type Alignment = {
	characters: string[];
	character_start_times_seconds: number[];
	character_end_times_seconds: number[];
};
