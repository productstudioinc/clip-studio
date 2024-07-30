import { endingFunctionString, errorString, startingFunctionString } from '@/utils/logging';
import { AxiomRequest, withAxiom } from 'next-axiom';
import { NextResponse } from 'next/server';
import { z, ZodType } from 'zod';

export type ApiResponse<Res> =
	| {
			type: 'error';
			message: string;
	  }
	| {
			type: 'success';
			data: Res;
	  };

export const executeApi = <Res, Req extends ZodType>(
	schema: Req,
	handler: (req: AxiomRequest, body: z.infer<Req>) => Promise<Res>
) =>
	withAxiom(async (req: AxiomRequest) => {
		const logger = req.log.with({
			path: req.nextUrl.pathname,
			method: req.method
		});

		logger.info(startingFunctionString);

		try {
			const payload = await req.json();
			const parsed = schema.parse(payload);
			logger.info('Payload parsed successfully', { schema: schema.description });

			const data = await handler(req, parsed);
			logger.info(endingFunctionString);

			return NextResponse.json({
				type: 'success',
				data: data
			});
		} catch (err) {
			logger.error(errorString, {
				error: err instanceof Error ? err.message : JSON.stringify(err)
			});

			return NextResponse.json(
				{
					type: 'error',
					message: err instanceof Error ? err.message : 'An unknown error occurred'
				},
				{ status: 500 }
			);
		}
	});
