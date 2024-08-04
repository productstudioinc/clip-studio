import { getUser } from '@/actions/auth/user';
import { DISK, RAM, REGION, SITE_NAME, TIMEOUT } from '@/config.mjs';
import { db } from '@/db';
import { userUsage } from '@/db/schema';
import { executeApi } from '@/helpers/api-response';
import { RenderRequest } from '@/types/schema';
import {
	AwsRegion,
	renderMediaOnLambda,
	RenderMediaOnLambdaOutput,
	speculateFunctionName
} from '@remotion/lambda/client';
import { eq, sql } from 'drizzle-orm';
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
		if (!user) {
			logger.error('Unauthorized access attempt');
			redirect('/login');
		}

		logger.info('User requested render', { email: user?.email });

		logger.info('Initiating renderMediaOnLambda', {
			composition: body.id,
			region: REGION,
			serveUrl: SITE_NAME
		});

		const secondsLeft = await db
			.select({ exportSecondsLeft: userUsage.exportSecondsLeft })
			.from(userUsage)
			.where(eq(userUsage.userId, user.id));

		if (secondsLeft[0].exportSecondsLeft < Math.floor(body.inputProps.durationInFrames / 30)) {
			logger.error('Not enough seconds left to render', { email: user?.email });
			await logger.flush();
			throw new Error("You don't have enough seconds left to render this video.");
		}

		await db
			.update(userUsage)
			.set({
				exportSecondsLeft: sql`export_seconds_left - ${Math.floor(body.inputProps.durationInFrames / 30)}`
			})
			.where(eq(userUsage.userId, user.id));

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
			logLevel: 'verbose',
			overwrite: true,
			outName: {
				key: `renders/${crypto.randomUUID()}.mp4`,
				bucketName: 'videogen-renders',
				s3OutputProvider: {
					endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
					accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
					secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!
				}
			},
			webhook: {
				url: 'https://clip.studio/api/render-webhook',
				secret: process.env.REMOTION_WEBHOOK_SECRET!,
				customData: {
					durationInFrames: body.inputProps.durationInFrames,
					userId: user.id,
					userEmail: user.email
				}
			}
		});

		logger.info('renderMediaOnLambda completed successfully', {
			renderId: result.renderId,
			bucketName: result.bucketName
		});

		await logger.flush();

		return result;
	}
);
