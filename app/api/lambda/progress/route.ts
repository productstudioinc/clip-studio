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
			renderId: body.id
		});

		if (renderProgress.fatalErrorEncountered) {
			logger.error('Fatal error encountered in render progress', {
				error: renderProgress.errors[0].message,
				renderId: body.id
			});
			return {
				type: 'error',
				message: renderProgress.errors[0].message
			};
		}

		if (renderProgress.done) {
			logger.info('Render completed successfully', {
				renderId: body.id,
				outputFile: renderProgress.outputFile,
				outputSize: renderProgress.outputSizeInBytes
			});
			return {
				type: 'done',
				url: renderProgress.outputFile as string,
				size: renderProgress.outputSizeInBytes as number
			};
		}

		logger.info('Render in progress', {
			renderId: body.id,
			progress: Math.max(0.03, renderProgress.overallProgress)
		});
		return {
			type: 'progress',
			progress: Math.max(0.03, renderProgress.overallProgress)
		};
	}
);
