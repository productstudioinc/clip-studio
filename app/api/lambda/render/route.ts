import { DISK, RAM, REGION, SITE_NAME, TIMEOUT } from '@/config.mjs';
import { executeApi } from '@/helpers/api-response';
import { RenderRequest } from '@/types/schema';
import { getUser } from '@/utils/actions/user';
import {
	AwsRegion,
	renderMediaOnLambda,
	RenderMediaOnLambdaOutput,
	speculateFunctionName
} from '@remotion/lambda/client';
import { redirect } from 'next/navigation';

export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
	RenderRequest,
	async (_req, body) => {
		if (!process.env.AWS_ACCESS_KEY_ID && !process.env.REMOTION_AWS_ACCESS_KEY_ID) {
			throw new TypeError(
				'Set up Remotion Lambda to render videos. See the README.md for how to do so.'
			);
		}
		if (!process.env.AWS_SECRET_ACCESS_KEY && !process.env.REMOTION_AWS_SECRET_ACCESS_KEY) {
			throw new TypeError(
				'The environment variable REMOTION_AWS_SECRET_ACCESS_KEY is missing. Add it to your .env file.'
			);
		}

		const { user } = await getUser();
		// temporary fix to prevent unauthorized access
		if (
			!user ||
			!['rkwarya@gmail.com', 'useclipstudio@gmail.com', 'hello@dillion.io'].includes(
				user.email as string
			)
		) {
			redirect('/login');
		}

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
			logLevel: 'verbose'
		});

		return result;
	}
);
