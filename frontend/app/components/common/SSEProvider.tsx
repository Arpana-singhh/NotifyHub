'use client';

/**
 * SSEProvider
 *
 * A client component that opens the SSE connection for regular users.
 * It renders nothing visible — its only job is to call useSSE() so the
 * connection stays alive as long as the user is on any dashboard page.
 *
 * Why the role check?
 *   Admins SEND notifications; they don't receive them.
 *   We only open the stream for role === 'user' to avoid unnecessary connections.
 *
 * Usage: place <SSEProvider /> once inside DashboardLayout.
 *        Because DashboardLayout is a Server Component and this is a Client
 *        Component, Next.js handles the boundary correctly — the server renders
 *        nothing for this component and it only hydrates on the client.
 */

import { useSession } from 'next-auth/react';
import { useSSE } from '@/app/hooks/useSSE';

// Inner component — only rendered when we've confirmed the user is a regular user.
// Keeping the hook call inside a separate component means useSSE() is never called
// for admins or unauthenticated sessions.
function SSEConnection() {
    useSSE();
    return null;
}

export default function SSEProvider() {
    const { data: session } = useSession();

    // Only open the SSE stream for authenticated regular users
    if (session?.user?.role !== 'user') return null;

    return <SSEConnection />;
}
