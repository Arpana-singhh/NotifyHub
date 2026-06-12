# Real-Time Notifications via Server-Sent Events (SSE)

## Context

All CRUD operations (send notification, delete, block user) currently require a manual page refresh for users to see changes. The UI already references "SSE instant delivery" but no implementation exists. The goal is to push updates to connected users immediately when an admin performs an action.

**Why SSE over WebSockets:** Communication is purely server → client (admin pushes, user receives). SSE is purpose-built for this, requires no library on the backend, uses the native browser `EventSource` API, and auto-reconnects. WebSockets add bidirectional complexity that this app doesn't need.

---

## Architecture & Data Flow

```
Admin POST /admin/notifications
  → createNotification saves to MongoDB
    → sseManager.broadcastToUsers(userIds, 'notification:new', payload)
      → res.write() on each open SSE connection for those users
        → Browser EventSource('/api/sse') receives the event
          → useSSE hook dispatches to Zustand store
            → notificationStore.prependNotification(item) → UI updates instantly
```

All traffic stays through the existing Next.js proxy. The browser cannot read the NextAuth HttpOnly cookie, so a Next.js API route (`/app/api/sse/route.ts`) reads the session server-side, injects the Bearer token, and pipes the backend SSE stream to the browser.

---

## Files to Create or Modify

### Backend (4 files)

| File | Action |
|------|--------|
| `backend/utils/sseManager.js` | **NEW** — in-memory `Map<userId, Set<res>>`, `addClient()`, `sendToUser()`, `broadcastToUsers()`, 25s heartbeat comment |
| `backend/routes/sseRoutes.js` | **NEW** — `GET /connect` protected by `authMiddleware`, sets SSE headers, calls `addClient`, cleans up on `req.close` |
| `backend/server.js` | **MODIFY** — import `sseRoutes`, add `app.use('/api/sse', sseRoutes)` |
| `backend/controller/notificationController.js` | **MODIFY** — import `broadcastToUsers` / `sendToUser`, call after `insertMany` in `createNotification`, and after deletes |

### Frontend (5 files)

| File | Action |
|------|--------|
| `frontend/app/api/sse/route.ts` | **NEW** — Next.js Route Handler; reads NextAuth session, fetches backend SSE with Bearer token, pipes `ReadableStream` to browser |
| `frontend/app/hooks/useSSE.ts` | **NEW** — `EventSource('/api/sse')`, named listeners for `notification:new` and `notification:deleted`, 5s manual reconnect on `CLOSED` state |
| `frontend/app/store/notificationStore.ts` | **MODIFY** — add `prependNotification(item)`, `removeNotification(id)`, `invalidateAndRefetch()` |
| `frontend/app/components/common/SSEProvider.tsx` | **NEW** — `'use client'` component, calls `useSSE()`, renders `null`; only mounts for `role === 'user'` |
| `frontend/app/components/layout/DashboardLayout.tsx` | **MODIFY** — add `<SSEProvider />` (it's a client leaf inside a server layout — idiomatic App Router pattern) |

---

## Key Implementation Details

### sseManager.js
- `Map<userId, Set<res>>` — supports multiple browser tabs per user
- Heartbeat: `res.write(': ping\n\n')` every 25s (SSE comment, browser ignores it, keeps proxies alive)
- `try/catch` on every `res.write()` — dead socket won't crash the interval

### sseRoutes.js SSE headers
```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no   ← disables nginx buffering
```
Call `res.flushHeaders()` immediately so the stream opens before first data.

### Next.js SSE proxy (`/app/api/sse/route.ts`)
```ts
export const runtime = 'nodejs';   // required for streaming
export const dynamic = 'force-dynamic';

const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
const upstream = await fetch(`${BACKEND}/api/sse/connect`, {
  headers: { Authorization: `Bearer ${jwt.accessToken}`, Accept: 'text/event-stream' }
});
return new Response(upstream.body, { headers: { 'Content-Type': 'text/event-stream', ... } });
```
Pipes `upstream.body` (Web Streams `ReadableStream`) directly — no buffering.

### notificationStore.ts additions
```ts
prependNotification(item) — unshift to list, update TTL cache
removeNotification(id)    — filter list by userNotificationId, update cache
invalidateAndRefetch()    — bust cache, call fetchUserNotifications(true)
```
Cache is updated on every SSE mutation so cache-hits within 5 min still reflect live state.

### SSE Event Types

| Event | Data |
|-------|------|
| `connected` | `{ userId }` — on open, for debugging |
| `notification:new` | `{ type, title, subtitle, status: 'unread', createdAt }` |
| `notification:deleted` | `{ userNotificationId, notificationId }` |
| `: ping` | SSE comment — no listener needed |

### createNotification broadcast
After `insertMany(records)`, collect `targetUserIds` (already computed in the controller) and call:
```js
broadcastToUsers(targetUserIds, 'notification:new', { type, title, subtitle: message, status: 'unread', createdAt });
```

### adminDeleteNotification broadcast
Query `NotificationRecipient` records **before** deleting, then call `sendToUser` per affected user.

---

## Verification

1. Start backend → open two browser tabs logged in as different users
2. Log in as admin in a third tab → send a notification to "All users"
3. User tabs should show the new notification instantly without refresh
4. Admin deletes the notification → user tabs remove it instantly
5. Close one user tab → confirm SSE Map cleans up (check server logs)
6. Kill and restart backend → confirm `EventSource` auto-reconnects within ~5s
