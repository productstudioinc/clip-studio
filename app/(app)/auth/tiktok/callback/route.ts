export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);

	console.log('tiktok callback route');
	console.log(searchParams);
}
