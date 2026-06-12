/**
 * SSE Connection Manager
 *
 * Keeps track of all open SSE connections, grouped by userId.
 * When a user has multiple tabs open, each tab gets its own connection —
 * so we use a Set<res> per user instead of a single res.
 *
 * Other parts of the app (controllers) call sendToUser() or broadcastToUsers()
 * to push an event to connected clients without knowing HTTP internals.
 */

// Map<userId: string, Set<Express Response objects>>
const clients = new Map();

/**
 * Register a new SSE connection for a user.
 * Called when a user's browser opens GET /api/sse/connect.
 * Returns a cleanup function — call it when the connection closes.
 */
export function addClient(userId, res) {
    const id = userId.toString();

    if (!clients.has(id)) clients.set(id, new Set());
    clients.get(id).add(res);

    console.log(`[SSE] connected — userId: ${id} | open connections: ${getTotal()}`);

    // Return a cleanup function for the 'close' event listener
    return function cleanup() {
        const set = clients.get(id);
        if (!set) return;
        set.delete(res);
        if (set.size === 0) clients.delete(id); // remove user entry when last tab closes
        console.log(`[SSE] disconnected — userId: ${id} | open connections: ${getTotal()}`);
    };
}

/**
 * Push a named SSE event to ALL open connections for a single user.
 * If the user is not connected, this is a no-op.
 *
 * eventType — the SSE "event:" field, e.g. 'notification:new'
 * data      — any value; it will be JSON-stringified into the "data:" field
 */
export function sendToUser(userId, eventType, data) {
    const set = clients.get(userId.toString());
    if (!set || set.size === 0) return; // user not connected — skip

    // SSE wire format: each field on its own line, blank line terminates the event
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const res of set) {
        try {
            res.write(payload);
        } catch {
            // Socket died between our check and the write.
            // The 'close' event handler will remove it from the set momentarily.
        }
    }
}

/**
 * Push a named SSE event to a LIST of users at once.
 * Used after createNotification to notify every recipient simultaneously.
 */
export function broadcastToUsers(userIds, eventType, data) {
    for (const id of userIds) {
        sendToUser(id, eventType, data);
    }
}

/**
 * Heartbeat — every 25 seconds write an SSE comment to every open connection.
 * SSE comments (lines starting with ": ") are completely ignored by the browser.
 * Purpose: prevent proxies and load balancers from closing idle connections.
 */
setInterval(() => {
    for (const [, set] of clients) {
        for (const res of set) {
            try {
                res.write(': ping\n\n');
            } catch { /* dead socket — will be cleaned up on close event */ }
        }
    }
}, 25_000);

// Helper: count total open connections across all users
function getTotal() {
    let n = 0;
    for (const [, set] of clients) n += set.size;
    return n;
}
