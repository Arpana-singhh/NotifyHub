/**
 * SSE Proxy — /api/sse
 *
 * The browser cannot open an EventSource directly to the backend because:
 *   - EventSource only supports GET requests with no custom headers
 *   - Our auth token lives in an HttpOnly cookie that browser JS cannot read
 *
 * This Next.js Route Handler solves both problems:
 *   1. It runs on the server, so it can read the NextAuth session cookie
 *   2. It injects the Bearer token when calling the backend SSE endpoint
 *   3. It pipes the backend stream straight back to the browser
 *
 * Flow:
 *   Browser EventSource('/api/sse')
 *     → this handler reads session → fetches backend /api/sse/connect with token
 *       → pipes the stream back → browser receives events in real time
 */

import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// 'nodejs' runtime is required — Edge runtime does not support long-lived streams
export const runtime = 'nodejs';
// Never cache this route — every request must open a fresh live stream
export const dynamic = 'force-dynamic';

// Direct backend URL — only available server-side, never sent to the browser
const BACKEND = process.env.API_BASE_URL!;

export async function GET(req: NextRequest): Promise<Response> {

    // ── 1. Read the NextAuth session token (same pattern as the main proxy) ──
    // getToken() decodes the HttpOnly cookie using NEXTAUTH_SECRET — no network call
    const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const accessToken = jwt?.accessToken as string | undefined;

    if (!accessToken) {
        return new Response('Unauthorized', { status: 401 });
    }

    // ── 2. Open an SSE connection to the backend with the Bearer token ────
    // BACKEND = http://localhost:5000/api, so append only /sse/connect (no extra /api)
    const upstream = await fetch(`${BACKEND}/sse/connect`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
        },
    });

    if (!upstream.ok || !upstream.body) {
        return new Response('Could not connect to event stream', { status: upstream.status });
    }

    // ── 3. Pipe the backend stream straight to the browser ────────────────
    // upstream.body is a Web Streams ReadableStream.
    // Next.js 16 on the Node.js runtime streams it without buffering,
    // so every event written by the backend arrives at the browser immediately.
    return new Response(upstream.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // disable nginx buffering
        },
    });
}
