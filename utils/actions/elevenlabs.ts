'use server';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ElevenLabsClient } from 'elevenlabs';
import z from 'zod';
import { createServerAction, ZSAError } from 'zsa';
import { R2 } from '../r2';
import { getUser } from './user';

const elevenLabsClient = new ElevenLabsClient({
	apiKey: process.env.ELEVEN_LABS_API_KEY!
});

export const getVoices = async () => {
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
		const { user } = await getUser();
		if (!user) {
			throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.');
		}
		const fullText = `${input.title}\n\n${input.text}`;
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

		const normalizedText = input.text.toLowerCase();
		const normalizedCharacters = audio.normalized_alignment.characters.map((char) =>
			char.toLowerCase()
		);

		const titleEndIndex = normalizedCharacters.findIndex(
			(char, index) =>
				char === normalizedText[0] &&
				normalizedCharacters.slice(index, index + normalizedText.length).join('') === normalizedText
		);

		const titleEnd =
			titleEndIndex > 0
				? audio.normalized_alignment.character_end_times_seconds[titleEndIndex - 1]
				: 0;

		return {
			signedUrl,
			endTimestamp: audio.normalized_alignment.character_end_times_seconds.slice(-1)[0],
			voiceoverObject: audio.normalized_alignment,
			titleEnd
		};
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
