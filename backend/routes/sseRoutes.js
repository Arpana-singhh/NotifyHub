/**
 * SSE Routes
 *
 * Exposes a single endpoint:
 *   GET /api/sse/connect
 *
 * The browser opens this endpoint once when the user logs in.
 * The connection stays open indefinitely and the server pushes events
 * through it whenever something relevant happens (new notification, delete, etc.)
 */

import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addClient } from '../utils/sseManager.js';

const router = express.Router();

// GET /api/sse/connect — open an SSE stream for the authenticated user
router.get('/connect', authMiddleware, (req, res) => {

    // ── 1. Set SSE response headers ──────────────────────────────────────
    // text/event-stream  → tells the browser this is an SSE stream
    // no-cache           → don't buffer; deliver every chunk immediately
    // no-transform       → don't let any proxy modify the stream bytes
    // keep-alive         → keep the TCP connection open (don't close after first response)
    // X-Accel-Buffering  → disables nginx's response buffer so events aren't held back
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Flush headers immediately — this sends the HTTP 200 + headers to the browser
    // so it knows the stream has opened before we send any events
    res.flushHeaders();

    // ── 2. Send a one-time "connected" confirmation event ────────────────
    // The browser's useSSE hook listens for this to confirm the stream is live
    res.write(`event: connected\ndata: ${JSON.stringify({ userId: req.userId })}\n\n`);

    // ── 3. Register this response object with the SSE manager ────────────
    // From this point on, any call to sendToUser(req.userId, ...) will write
    // directly into this response, which the browser receives in real time
    const cleanup = addClient(req.userId, res);

    // ── 4. Clean up when the browser closes the connection ───────────────
    // This fires when the user navigates away, closes the tab, or loses network
    req.on('close', cleanup);
});

export default router;
