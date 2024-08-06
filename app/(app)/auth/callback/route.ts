import { createClient } from '@/supabase/server';
import { AxiomRequest, withAxiom } from 'next-axiom';
import { NextResponse } from 'next/server';

export const GET = withAxiom(async (request: AxiomRequest) => {
	const logger = request.log.with({
		path: '/auth/callback',
		method: 'GET'
	});

	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get('code');
	const next = searchParams.get('next') ?? '/';

	logger.info('Auth callback initiated', { next });

	if (code) {
		const supabase = createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			logger.info('Successfully exchanged code for session');
			return NextResponse.redirect(`${origin}${next}`);
		} else {
			logger.error('Failed to exchange code for session', { error: error.message });
		}
	} else {
		logger.warn('No code provided in auth callback');
	}

	logger.info('Redirecting to auth error page');
	return NextResponse.redirect(`${origin}/auth/auth-code-error`);
});
