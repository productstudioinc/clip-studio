import { DISK, RAM, REGION, TIMEOUT } from '@/config.mjs';
import { executeApi } from '@/helpers/api-response';
import { ProgressRequest, ProgressResponse } from '@/types/schema';
import { withAppRouterHighlight } from '@/utils/app-router-highlight.config';
import { AwsRegion, getRenderProgress, speculateFunctionName } from '@remotion/lambda/client';

export const POST = withAppRouterHighlight(
	executeApi<ProgressResponse, typeof ProgressRequest>(ProgressRequest, async (_req, body) => {
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
			return {
				type: 'error',
				message: renderProgress.errors[0].message
			};
		}

		if (renderProgress.done) {
			return {
				type: 'done',
				url: renderProgress.outputFile as string,
				size: renderProgress.outputSizeInBytes as number
			};
		}

		return {
			type: 'progress',
			progress: Math.max(0.03, renderProgress.overallProgress)
		};
	})
);
