// Backend Proxy — /api/backend/[...path]
// All browser API calls hit this route instead of the real backend directly.
// This keeps the bearer token invisible to browser JavaScript — it lives only
// inside the HttpOnly session cookie and is read here on the server side.
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Real backend URL — server-only env var, never exposed to the browser.
const BACKEND = process.env.API_BASE_URL!;

async function proxy(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
    const path = (await params).path.join('/');

    // Read the NextAuth JWT from the HttpOnly cookie server-side.
    // getToken() decodes the cookie without any network call — it just
    // verifies the HMAC signature using NEXTAUTH_SECRET and returns the payload.
    // The accessToken inside is the bearer token issued by the Express backend.
    const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const apiToken = jwt?.accessToken as string | undefined;

    // Build the upstream URL preserving any query string from the original request.
    const { search } = new URL(req.url);
    const upstreamUrl = `${BACKEND}/${path}${search}`;

    // Copy browser request headers to the upstream request, but strip:
    //   cookie       — stays on our domain, must never be forwarded
    //   authorization — we replace it with our own Bearer token below
    //   host          — must match the upstream host, not the browser's
    //   content-length / transfer-encoding — managed by fetch internally
    const forwardHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (!['cookie', 'authorization', 'host', 'content-length', 'transfer-encoding'].includes(lower)) {
            forwardHeaders[key] = value;
        }
    });

    // Attach the bearer token as Authorization header so the Express backend
    // can authenticate the request. If no session exists (public endpoints like
    // register/login), this header is simply omitted and the backend handles it.
    if (apiToken) {
        forwardHeaders['Authorization'] = `Bearer ${apiToken}`;
    }

    const hasBody = !['GET', 'HEAD'].includes(req.method);

    const upstream = await fetch(upstreamUrl, {
        method: req.method,
        headers: forwardHeaders,
        body: hasBody ? req.body : undefined,
        // @ts-expect-error duplex is required in Node.js 18+ for streaming bodies
        duplex: 'half',
        redirect: 'manual',
    });

    // Forward upstream response headers back to the browser, but strip
    // set-cookie so backend cookies never land on our domain.
    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'set-cookie') {
            responseHeaders.set(key, value);
        }
    });

    return new NextResponse(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
    });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
