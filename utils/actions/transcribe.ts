'use server';

import { Transcription } from '@/stores/templatestore';
import { z } from 'zod';
import { createServerAction, ZSAError } from 'zsa';
import { getUser } from './user';

export const getTranscriptionId = createServerAction()
	.input(z.string().url())
	.output(z.string())
	.handler(async ({ input }) => {
		const { user } = await getUser();
		if (
			!user ||
			!['rkwarya@gmail.com', 'useclipstudio@gmail.com', 'hello@dillion.io'].includes(
				user.email as string
			)
		) {
			throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.');
		}
		const encodedUrl = encodeURIComponent(input);
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
		return result.call_id;
	});

export const getTranscription = createServerAction()
	.input(z.string())
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
					throw new ZSAError('OUTPUT_PARSE_ERROR', 'Invalid response returned from Whisper');
				}
			} else {
				throw new ZSAError('OUTPUT_PARSE_ERROR', 'Invalid response returned from Whisper');
			}
		}

		throw new ZSAError('INTERNAL_SERVER_ERROR', 'Unexpected response status');
	});
