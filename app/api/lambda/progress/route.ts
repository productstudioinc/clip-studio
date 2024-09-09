import { DISK, RAM, REGION, TIMEOUT } from '@/config.mjs';
import { executeApi } from '@/helpers/api-response';
import { ProgressRequest, ProgressResponse } from '@/types/schema';
import { AwsRegion, getRenderProgress, speculateFunctionName } from '@remotion/lambda/client';
import { AxiomRequest } from 'next-axiom';

export const POST = executeApi<ProgressResponse, typeof ProgressRequest>(
	ProgressRequest,
	async (req: AxiomRequest, body) => {
		const logger = req.log;
		logger.info('Initiating getRenderProgress', {
			bucketName: body.bucketName,
			renderId: body.id,
			region: REGION
		});
		const renderProgress = await getRenderProgress({
			bucketName: body.bucketName,
			functionName: speculateFunctionName({
				diskSizeInMb: DISK,
				memorySizeInMb: RAM,
				timeoutInSeconds: TIMEOUT
			}),
			region: REGION as AwsRegion,
			renderId: body.id,
			s3OutputProvider: {
				endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
				accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
				secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!
			}
		});
		if (renderProgress.fatalErrorEncountered) {
			logger.error('Fatal error encountered in render progress', {
				error: renderProgress.errors[0].message,
				renderId: body.id
			});
			await logger.flush();
			return {
				type: 'error',
				message: renderProgress.errors[0].message
			};
		}
		if (renderProgress.done) {
			let outputFile = renderProgress.outputFile as string;
			// Replace the URL prefix
			outputFile = outputFile.replace(
				'https://s3.us-east-1.amazonaws.com/videogen-renders',
				'https://renders.clip.studio'
			);
			logger.info('Render completed successfully', {
				renderId: body.id,
				outputFile: outputFile,
				outputSize: renderProgress.outputSizeInBytes
			});
			return {
				type: 'done',
				url: outputFile,
				size: renderProgress.outputSizeInBytes as number
			};
		}
		logger.info('Render in progress', {
			renderId: body.id,
			progress: Math.max(0.03, renderProgress.overallProgress)
		});
		await logger.flush();
		return {
			type: 'progress',
			progress: Math.max(0.03, renderProgress.overallProgress)
		};
	}
);
