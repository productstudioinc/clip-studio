import { getUser } from '@/actions/auth/user';
import { DISK, RAM, REGION, SITE_NAME, TIMEOUT } from '@/config.mjs';
import { executeApi } from '@/helpers/api-response';
import { RenderRequest } from '@/types/schema';
import {
	AwsRegion,
	renderMediaOnLambda,
	RenderMediaOnLambdaOutput,
	speculateFunctionName
} from '@remotion/lambda/client';
import { AxiomRequest } from 'next-axiom';
import { redirect } from 'next/navigation';

export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
	RenderRequest,
	async (req: AxiomRequest, body) => {
		const logger = req.log;

		if (!process.env.AWS_ACCESS_KEY_ID && !process.env.REMOTION_AWS_ACCESS_KEY_ID) {
			logger.error('Missing AWS access key');
			throw new TypeError(
				'Set up Remotion Lambda to render videos. See the README.md for how to do so.'
			);
		}
		if (!process.env.AWS_SECRET_ACCESS_KEY && !process.env.REMOTION_AWS_SECRET_ACCESS_KEY) {
			logger.error('Missing AWS secret access key');
			throw new TypeError(
				'The environment variable REMOTION_AWS_SECRET_ACCESS_KEY is missing. Add it to your .env file.'
			);
		}

		const { user } = await getUser();
		logger.info('User requested render', { email: user?.email });

		// temporary fix to prevent unauthorized access
		if (
			!user ||
			![
				'rkwarya@gmail.com',
				'useclipstudio@gmail.com',
				'hello@dillion.io',
				'vermadillion@gmail.com'
			].includes(user.email as string)
		) {
			logger.warn('Unauthorized access attempt', { email: user?.email });
			redirect('/login');
		}

		logger.info('Initiating renderMediaOnLambda', {
			composition: body.id,
			region: REGION,
			serveUrl: SITE_NAME
		});

		const result = await renderMediaOnLambda({
			codec: 'h264',
			functionName: speculateFunctionName({
				diskSizeInMb: DISK,
				memorySizeInMb: RAM,
				timeoutInSeconds: TIMEOUT
			}),
			region: REGION as AwsRegion,
			serveUrl: SITE_NAME,
			composition: body.id,
			inputProps: body.inputProps,
			downloadBehavior: {
				type: 'download',
				fileName: 'video.mp4'
			},
			logLevel: 'verbose',
			webhook: {
				url: 'https://clip.studio/api/render-webhook',
				secret: process.env.REMOTION_WEBHOOK_SECRET!
			}
		});

		logger.info('renderMediaOnLambda completed successfully', {
			renderId: result.renderId,
			bucketName: result.bucketName
		});

		return result;
	}
);
