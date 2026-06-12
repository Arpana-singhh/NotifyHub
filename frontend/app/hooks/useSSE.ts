'use client';

/**
 * useSSE — real-time notification hook
 *
 * Opens an EventSource connection to /api/sse (our Next.js proxy).
 * Listens for named events and updates the Zustand notification store directly,
 * so the UI reflects changes instantly without any page refresh or polling.
 *
 * Events handled:
 *   connected          — server confirmed the stream is open (debug only)
 *   notification:new   — admin sent a notification → prepend it to the list
 *   notification:deleted — a notification was removed → filter it from the list
 */

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import type { UserNotification } from '../components/common/UserNotificationListing';

export function useSSE() {
    // Read store actions once — these are stable references from Zustand
    const { prependNotification, removeNotification, invalidateAndRefetch } =
        useNotificationStore();

    // Keep the EventSource instance in a ref so we can close it on unmount
    const esRef = useRef<EventSource | null>(null);
    // Keep the reconnect timer in a ref so we can cancel it on unmount
    const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Guard flag — prevents reconnect attempts after the component has unmounted
        let active = true;

        function connect() {
            if (!active) return;

            // Open the SSE stream through our Next.js proxy route.
            // The proxy reads the NextAuth cookie, injects the Bearer token,
            // and pipes the backend stream to the browser.
            const es = new EventSource('/api/sse');
            esRef.current = es;

            // ── Event: connection confirmed ──────────────────────────────
            es.addEventListener('connected', () => {
                console.log('[SSE] connection established');
            });

            // ── Event: new notification from admin ───────────────────────
            // The payload matches the UserNotification shape so we can prepend
            // it directly to the store list without fetching from the server.
            es.addEventListener('notification:new', (e: MessageEvent) => {
                try {
                    const item = JSON.parse(e.data) as UserNotification;
                    prependNotification(item);
                } catch {
                    // Malformed payload — fall back to a full server refetch
                    invalidateAndRefetch();
                }
            });

            // ── Event: notification deleted (by user or admin) ───────────
            // Remove the item from the store list immediately.
            es.addEventListener('notification:deleted', (e: MessageEvent) => {
                try {
                    const { userNotificationId } = JSON.parse(e.data) as {
                        userNotificationId: string;
                    };
                    removeNotification(userNotificationId);
                } catch {
                    invalidateAndRefetch();
                }
            });

            // ── Error handling ───────────────────────────────────────────
            // readyState CONNECTING (0): browser is already auto-retrying — do nothing
            // readyState CLOSED (2):     server shut down cleanly — we retry manually
            es.onerror = () => {
                if (es.readyState === EventSource.CLOSED) {
                    es.close();
                    esRef.current = null;
                    if (active) {
                        console.log('[SSE] stream closed — reconnecting in 5s...');
                        reconnectRef.current = setTimeout(connect, 5_000);
                    }
                }
            };
        }

        connect();

        // Cleanup when the component unmounts (e.g. user logs out)
        return () => {
            active = false;
            if (reconnectRef.current) clearTimeout(reconnectRef.current);
            esRef.current?.close();
            esRef.current = null;
        };
    }, []); // run once on mount — EventSource manages its own lifecycle
}
