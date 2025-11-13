const FALLBACK_CONTENT_TYPE = 'application/octet-stream';

export default {
	async fetch(request) {
		const origin = request.headers.get('Origin') || '*';

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: buildCorsHeaders(origin)
			});
		}

		const requestUrl = new URL(request.url);
		const target = requestUrl.searchParams.get('url');
		if (!target) {
			return new Response('Missing url parameter', {
				status: 400,
				headers: buildCorsHeaders(origin)
			});
		}

		let parsedTarget;
		try {
			parsedTarget = new URL(target);
		} catch (err) {
			return new Response('Invalid url parameter', {
				status: 400,
				headers: buildCorsHeaders(origin)
			});
		}

		const upstreamResponse = await fetch(parsedTarget.href, {
			method: 'GET',
			headers: {
				'User-Agent': 'Cloudflare-Worker-Proxy'
			},
			redirect: 'follow'
		});

		if (!upstreamResponse.ok) {
			return new Response(`Upstream error: ${upstreamResponse.status}`, {
				status: upstreamResponse.status,
				headers: buildCorsHeaders(origin)
			});
		}

		const body = await upstreamResponse.arrayBuffer();
		const headers = buildCorsHeaders(origin);
		headers['Content-Type'] = upstreamResponse.headers.get('Content-Type') || FALLBACK_CONTENT_TYPE;
		if (upstreamResponse.headers.get('Content-Disposition')) {
			headers['Content-Disposition'] = upstreamResponse.headers.get('Content-Disposition');
		}

		return new Response(body, {
			status: 200,
			headers
		});
	}
};

function buildCorsHeaders(origin) {
	return {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': 'GET,OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type,Authorization',
		'Access-Control-Allow-Credentials': 'false',
		'Vary': 'Origin'
	};
}
