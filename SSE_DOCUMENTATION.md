# NotifyHub — Server-Sent Events (SSE) Documentation

A beginner-friendly guide to how real-time notifications work in NotifyHub, from the moment an admin sends one to the moment it appears on a user's screen.

---

## SSE Flow — In Simple Words - Important - From here you will unserstand the flow of all files 

When a user logs in, `SSEProvider.tsx` checks their role. If the role is `user`, it renders the `SSEConnection` component, which triggers the `useSSE.ts` hook. This hook tries to open an SSE connection to the backend.

Because SSE requires an authorization token — and the browser's built-in `EventSource` cannot attach custom headers — a **Next.js proxy** sits in the middle. It reads the token from the session cookie and attaches it to the request before forwarding it to the backend.

On the backend, `sseRoutes.js` handles this incoming connection. It sets the necessary SSE headers, flushes the response, and registers the connection in `sseManager.js`. From this point, the connection is open and the server is ready to push events to this user.

---

Now, when an **admin sends a notification:**

1. `notificationController.js` saves the notification to the database and gets the list of recipients.
2. It calls `sseManager.sendToUser()` for each recipient.
3. `sseManager` looks up that user's open connection(s) and writes the event directly into the response stream.
4. The browser receives the event through `EventSource`.
5. The `useSSE.ts` hook catches the event and calls the appropriate action in `notificationStore`.
6. The store updates its state, and the UI re-renders — the notification appears instantly, with no page refresh.

---

> **Key point to remember:** `sseRoutes.js` only sets up the connection once. After that, it's `sseManager` that does all the heavy lifting of pushing events to users.

---

## Table of Contents

1. [What is SSE?](#1-what-is-sse)
2. [Architecture Overview](#2-architecture-overview)
3. [Server Side](#3-server-side)
   - [sseManager.js — The Connection Registry](#a-ssemanagerjs--the-connection-registry)
   - [sseRoutes.js — The SSE Endpoint](#b-sseroutesjs--the-sse-endpoint)
   - [notificationController.js — Triggering Events](#c-notificationcontrollerjs--triggering-events)
4. [Client Side](#4-client-side)
   - [Next.js Proxy — The Auth Bridge](#a-nextjs-proxy--the-auth-bridge)
   - [useSSE.ts — The Connection Hook](#b-usessetsthe-connection-hook)
   - [SSEProvider.tsx — The Gatekeeper](#c-sseprovidertsxthe-gatekeeper)
   - [notificationStore.ts — The State Manager](#d-notificationstorets--the-state-manager)
5. [SSE Event Reference](#5-sse-event-reference)
6. [Step-by-Step Scenarios](#6-step-by-step-scenarios)
   - [Scenario A: User receives a new notification](#scenario-a-user-receives-a-new-notification)
   - [Scenario B: User first connects to SSE](#scenario-b-user-first-connects-to-sse)
   - [Scenario C: User closes the tab (disconnect)](#scenario-c-user-closes-the-tab-disconnect)
7. [End-to-End Flow Diagram](#7-end-to-end-flow-diagram)
8. [Connection Lifecycle Diagram](#8-connection-lifecycle-diagram)

---

## 1. What is SSE?

**Server-Sent Events (SSE)** is a simple web technology that lets a server push data to a browser over a single, long-lived HTTP connection — without the browser needing to ask repeatedly.

Think of it like a radio broadcast:
- The browser tunes in once (opens the connection).
- The server sends updates whenever something happens.
- The browser listens and reacts.

Unlike WebSockets (two-way communication), SSE is **one-way: server → browser only**. That makes it simpler and perfect for notifications.

---

## 2. Architecture Overview

Here is how all the pieces fit together:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Client)                           │
│                                                                     │
│  DashboardLayout                                                    │
│       └── SSEProvider (role === 'user' only)                        │
│               └── SSEConnection                                     │
│                       └── useSSE() hook                             │
│                               └── new EventSource('/api/sse')       │
│                                           │                         │
│                               Zustand notificationStore             │
│                                           │                         │
│                               Navbar (count) + Notifications Page   │
└───────────────────────────────────────────┼─────────────────────────┘
                                            │  HTTP GET (SSE stream)
                                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (Proxy Layer)                     │
│                                                                     │
│  /app/api/sse/route.ts                                              │
│  - Reads HttpOnly cookie → extracts JWT accessToken                 │
│  - Forwards request to backend with Authorization header            │
│  - Pipes the stream back to the browser                             │
└───────────────────────────────────────────┬─────────────────────────┘
                                            │  HTTP GET + Bearer token
                                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXPRESS BACKEND (Node.js)                      │
│                                                                     │
│  authMiddleware (validates JWT) → sseRoutes.js                      │
│       └── GET /api/sse/connect                                      │
│               └── addClient(userId, res)  ──► sseManager.js         │
│                                                    │                │
│  notificationController.js                         │                │
│       └── createNotification()                     │                │
│       └── deleteNotification()       sendToUser() ─┘                │
│       └── adminDeleteNotification()       │                         │
│                                           │                         │
│                                      MongoDB                        │
└───────────────────────────────────────────────────────────────────--┘
```

**Data always flows in one direction:** Backend → Proxy → Browser

---

## 3. Server Side

### A. `sseManager.js` — The Connection Registry

**File:** `backend/utils/sseManager.js`

This is the heart of the SSE system. It maintains a live registry of every user currently connected.

**Internal data structure:**

```
clients = Map {
  "userId_abc" => Set { res1, res2 },   ← User has 2 tabs open
  "userId_xyz" => Set { res3 },         ← User has 1 tab open
}
```

Each entry maps a user ID to a **Set of response objects** — one per open browser tab. This means if you have the app open in 3 tabs, you'll receive events in all 3 simultaneously.

---

#### Function: `addClient(userId, res)`

**Purpose:** Register a new SSE connection when a user opens the stream.

**What it does step by step:**
1. Checks if the user already has an entry in the `clients` Map
2. If not, creates a new empty Set for them
3. Adds the Express `res` (response) object to the Set
4. Logs the new connection count
5. Returns a **cleanup function** — when called, it removes this specific `res` from the Set (used when the user disconnects)

```
Before: clients = {}
After:  clients = { "user123" => Set { res } }

Returns: () => { clients.get("user123").delete(res) }
```

---

#### Function: `sendToUser(userId, eventType, data)`

**Purpose:** Push a real-time event to all open tabs belonging to one user.

**What it does step by step:**
1. Looks up the user in the `clients` Map
2. If the user is not connected, does nothing (returns silently)
3. Constructs the SSE wire format string:
   ```
   event: notification:new\n
   data: {"title":"Hello","type":"info",...}\n
   \n
   ```
4. Loops through every `res` in the user's Set and writes that string
5. If a write fails (dead socket), the error is silently ignored — the close handler will clean it up

---

#### Function: `broadcastToUsers(userIds, eventType, data)`

**Purpose:** Send the same event to multiple users at once.

Simple loop — calls `sendToUser()` for each ID in the array. Used when an admin creates a notification targeting multiple users.

---

#### Heartbeat (auto-runs every 25 seconds)

**Purpose:** Keep idle connections alive.

Without this, network proxies and load balancers will automatically close connections that haven't sent data for a while (typically 30–60 seconds).

Every 25 seconds, the manager sends a special SSE "comment" to every connected client:
```
: ping\n\n
```

The browser ignores comments — it's purely for keeping the TCP connection alive. You'll see this as a silent activity in browser DevTools.

---

#### Function: `getTotal()`

**Purpose:** Count all currently active connections across all users.

Used only for logging/debugging. Returns the sum of all Set sizes across the Map.

---

### B. `sseRoutes.js` — The SSE Endpoint

**File:** `backend/routes/sseRoutes.js`

Exposes a single HTTP endpoint that browsers connect to.

**Endpoint:** `GET /api/sse/connect`
**Protected by:** `authMiddleware` (requires valid JWT Bearer token)

**What happens when a client hits this endpoint:**

**Step 1 — Set response headers**

These headers tell the browser and any proxies in between how to handle this response:

| Header | Value | Why |
|--------|-------|-----|
| `Content-Type` | `text/event-stream` | Signals this is an SSE stream, not a regular response |
| `Cache-Control` | `no-cache, no-transform` | Disables caching and proxy compression |
| `Connection` | `keep-alive` | Keeps the TCP connection open |
| `X-Accel-Buffering` | `no` | Disables nginx response buffering so events arrive immediately |

**Step 2 — Flush headers**

Sends the HTTP 200 OK + headers to the browser immediately, so it knows the stream is live and starts listening.

**Step 3 — Send `connected` event**

Immediately sends the first event:
```
event: connected
data: {"userId":"user123"}
```
The frontend uses this to confirm the stream is ready.

**Step 4 — Register with sseManager**

Calls `addClient(req.userId, res)` to store this connection. From this point, any call to `sendToUser(req.userId, ...)` will push data directly into this response stream.

**Step 5 — Install disconnect handler**

```javascript
req.on('close', cleanup)
```

When the browser closes the connection (tab close, navigation, network drop), Node.js fires the `close` event. The cleanup function removes this `res` from the manager's registry automatically.

---

### C. `notificationController.js` — Triggering Events

**File:** `backend/controller/notificationController.js`

This is where SSE events are actually triggered. After database operations complete, these functions call `sendToUser()` or `broadcastToUsers()` to push live updates.

---

#### `createNotification()` — route: `POST /api/admin/notifications`

**Who calls it:** Admin only (requires `adminMiddleware`)

**What it does:**
1. Saves the new notification to MongoDB
2. Determines which users should receive it (all users or selected ones)
3. Creates a `NotificationRecipient` record in the DB for each user
4. For each recipient, calls `sendToUser(userId, 'notification:new', payload)`

**SSE event pushed:**
```json
{
  "userNotificationId": "rec_abc123",
  "type": "info",
  "title": "System Update",
  "subtitle": "Maintenance at midnight",
  "status": "unread",
  "createdAt": "2026-06-15T10:00:00.000Z"
}
```

---

#### `deleteNotification()` — route: `DELETE /api/notifications/:id`

**Who calls it:** Regular user (deleting their own notification)

**What it does:**
1. Marks the notification as deleted for this user (`isDeletedByUser = true`)
2. Calls `sendToUser(userId, 'notification:deleted', { userNotificationId })`

**Why push an SSE event for deletion?** The user might have the app open in multiple tabs. Without SSE, deleting in Tab A would not remove it from Tab B until page refresh.

---

#### `adminDeleteNotification()` — route: `DELETE /api/admin/notifications`

**Who calls it:** Admin (bulk delete)

**What it does:**
1. Fetches all `NotificationRecipient` records affected by the deletion
2. Deletes the notification records from DB
3. For each affected user, calls `sendToUser(userId, 'notification:deleted', { userNotificationId })`

---

#### `adminDeleteUserNotification()` — route: `DELETE /api/admin/notifications/user`

**Who calls it:** Admin (delete one notification for one specific user)

**What it does:**
1. Deletes the specific `NotificationRecipient` record
2. Calls `sendToUser(targetUserId, 'notification:deleted', { userNotificationId })`

---

## 4. Client Side

### A. Next.js Proxy — The Auth Bridge

**File:** `frontend/app/api/sse/route.ts`

**The problem it solves:**

The browser's built-in `EventSource` API only supports GET requests with no custom headers. But our backend requires a `Authorization: Bearer <token>` header.

The auth token is stored in an **HttpOnly cookie** (for security) — meaning JavaScript in the browser cannot read it. Only server-side code can.

**How the proxy solves this:**

```
Browser EventSource('/api/sse')
        │
        │  GET /api/sse  (no auth header — browser can't add one)
        ▼
Next.js Server (proxy route)
        │  1. Reads the HttpOnly cookie
        │  2. Decodes the NextAuth JWT
        │  3. Extracts the accessToken
        │
        │  GET /api/sse/connect
        │  Authorization: Bearer <accessToken>   ← added here
        ▼
Express Backend
```

The proxy then pipes the streaming response directly back to the browser, so the browser sees a normal SSE stream as if it were talking directly to the backend.

---

### B. `useSSE.ts` — The Connection Hook

**File:** `frontend/app/hooks/useSSE.ts`

This React hook manages the entire SSE connection lifecycle for a logged-in user.

**What it does on mount:**

1. Pulls three actions from the Zustand notification store:
   - `prependNotification` — add a notification to the top of the list
   - `removeNotification` — remove a notification from the list
   - `invalidateAndRefetch` — emergency fallback: clear cache and re-fetch everything from the API

2. Opens `new EventSource('/api/sse')` — this triggers the proxy flow described above

3. Registers event listeners:

**`connected` event:**
```
Just logs "[SSE] connection established" to the console.
No UI change.
```

**`notification:new` event:**
```
1. Parse the JSON payload
2. Call prependNotification(item) → adds to top of list
3. Navbar notification count increments
4. If JSON is malformed → call invalidateAndRefetch() as fallback
```

**`notification:deleted` event:**
```
1. Parse { userNotificationId } from payload
2. Call removeNotification(id) → filters it out of the list
3. Notification disappears from all tabs
4. If JSON is malformed → call invalidateAndRefetch() as fallback
```

**Error / disconnect handling:**

```
EventSource readyState values:
  0 = CONNECTING  (browser is auto-retrying — hook ignores this)
  1 = OPEN        (stream is live)
  2 = CLOSED      (permanently closed — hook acts here)
```

When the stream closes (`readyState === 2`):
1. Closes the EventSource, clears the ref
2. Waits 5 seconds
3. Calls `connect()` again to re-establish the stream

**Cleanup on unmount:**
- Sets `active = false` to prevent orphaned reconnect attempts
- Clears the pending reconnect timeout
- Closes the EventSource connection

---

### C. `SSEProvider.tsx` — The Gatekeeper

**File:** `frontend/app/components/common/SSEProvider.tsx`

A thin wrapper component that decides **who gets an SSE connection**.

**Rule:** Only users with `role === 'user'` open an SSE stream.

- **Regular users:** `<SSEConnection />` is rendered → `useSSE()` runs → stream opens
- **Admins:** `null` is rendered → no stream, no hook, no connection
- **Not logged in:** `null`

**Why exclude admins?** Admins *send* notifications, they don't *receive* them. Opening a stream for them would be wasteful.

`SSEProvider` is mounted once inside `DashboardLayout`, which wraps all pages. This means the connection is established as soon as a user logs in and persists across page navigation.

---

### D. `notificationStore.ts` — The State Manager

**File:** `frontend/app/store/notificationStore.ts`

A Zustand store that holds all notification data and provides actions the SSE hook calls.

**State shape (simplified):**
```typescript
{
  notifications: UserNotification[],  // the user's notification list
  isUserLoading: boolean,
  // ...
}
```

**SSE-specific actions:**

#### `prependNotification(item)`

Called when `notification:new` arrives.

1. Takes the new notification object
2. Inserts it at the beginning of the `notifications` array
3. Updates the TTL cache with the new array

Result: The notification appears instantly at the top of the list without any network request.

---

#### `removeNotification(userNotificationId)`

Called when `notification:deleted` arrives.

1. Filters out the notification with the matching ID from the array
2. Updates the TTL cache with the filtered array

Result: The notification disappears instantly from all open tabs.

---

#### `invalidateAndRefetch()`

Called only when an SSE event arrives but JSON parsing fails.

1. Clears the TTL cache entry for user notifications
2. Calls `fetchUserNotifications(force: true)` to re-fetch from the API

This is a safety net — real-time updates are best-effort, and the server is always the source of truth.

---

#### TTL Cache

The store uses a 5-minute TTL (time-to-live) cache to avoid redundant API calls. When SSE updates the store directly (`prependNotification`, `removeNotification`), the cache is also updated in sync — so the next time the component checks the cache, it sees the correct data.

---

## 5. SSE Event Reference

| Event Name | Direction | Who sends it | Payload | What the client does |
|---|---|---|---|---|
| `connected` | server → client | SSE route on open | `{ userId }` | Logs confirmation (no UI change) |
| `notification:new` | server → client | `createNotification()` | Full `UserNotification` object | Prepends to list, updates count |
| `notification:deleted` | server → client | `deleteNotification()`, `adminDeleteNotification()`, `adminDeleteUserNotification()` | `{ userNotificationId }` | Removes from list |

**SSE wire format (what the raw text looks like):**

```
event: notification:new
data: {"userNotificationId":"abc","type":"info","title":"Hello","subtitle":"World","status":"unread","createdAt":"2026-06-15T10:00:00.000Z"}

```
> Note: There must be a blank line (`\n\n`) after `data:` to signal the end of one event.

---

## 6. Step-by-Step Scenarios

### Scenario A: User receives a new notification

```
Admin                Backend                  sseManager           Browser (User)
  │                     │                         │                      │
  │ POST /api/admin/     │                         │                      │
  │ notifications ──────►│                         │                      │
  │                     │ Save to MongoDB          │                      │
  │                     │ Get recipient list       │                      │
  │                     │                         │                      │
  │                     │ sendToUser(             │                      │
  │                     │   userId,               │                      │
  │                     │   'notification:new',   │                      │
  │                     │   data) ───────────────►│                      │
  │                     │                         │ Write SSE text       │
  │                     │                         │ into res ───────────►│
  │                     │                         │                      │ 'notification:new' event fires
  │                     │                         │                      │ useSSE handler runs
  │                     │                         │                      │ prependNotification(item)
  │                     │                         │                      │ Zustand state updates
  │                     │                         │                      │ UI re-renders
  │ ◄── HTTP 201 ───────│                         │                      │ Notification appears ✓
```

---

### Scenario B: User first connects to SSE

```
Browser                  Next.js Proxy              Express Backend
   │                          │                            │
   │ new EventSource           │                            │
   │ ('/api/sse') ────────────►│                            │
   │                          │ Read HttpOnly cookie       │
   │                          │ Decode NextAuth JWT        │
   │                          │ Extract accessToken        │
   │                          │                            │
   │                          │ GET /api/sse/connect       │
   │                          │ Authorization: Bearer ────►│
   │                          │                            │ authMiddleware
   │                          │                            │ validates JWT
   │                          │                            │ sets req.userId
   │                          │                            │
   │                          │                            │ Set SSE headers
   │                          │                            │ Flush headers
   │                          │ ◄── HTTP 200 (stream) ────│
   │ ◄── headers piped ───────│                            │
   │                          │                            │ Send 'connected' event
   │                          │                            │ addClient(userId, res)
   │ ◄── 'connected' event ───│◄──────────────────────────│
   │                          │                            │
   │ useSSE logs:             │                            │ Connection registered ✓
   │ "[SSE] established"      │                            │ Ready to receive events
```

---

### Scenario C: User closes the tab (disconnect)

```
Browser              Next.js Proxy        Express Backend      sseManager
   │                      │                     │                   │
   │ [Tab closed]         │                     │                   │
   │                      │                     │                   │
   │ TCP connection ───►closed                  │                   │
   │                      │                     │                   │
   │                      │ Upstream             │                   │
   │                      │ connection ─────►closed                 │
   │                      │                     │                   │
   │                      │                     │ req 'close' event │
   │                      │                     │ fires             │
   │                      │                     │                   │
   │                      │                     │ cleanup() ───────►│
   │                      │                     │                   │ clients.get(userId)
   │                      │                     │                   │   .delete(res)
   │                      │                     │                   │
   │                      │                     │                   │ Connection removed ✓
   │                      │                     │                   │ Total count decreases
```

---

## 7. End-to-End Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           NOTIFYHUB SSE FLOW                                 │
└──────────────────────────────────────────────────────────────────────────────┘

  USER BROWSER                 NEXT.JS                 EXPRESS             MONGODB
  ─────────────                ───────                 ───────             ───────

  [App loads]
       │
       ▼
  DashboardLayout
       │
       ▼
  SSEProvider
  (role=user?) ──No──► (nothing)
       │
      Yes
       │
       ▼
  useSSE hook
       │
       ▼
  EventSource('/api/sse') ──────────────► /app/api/sse/route.ts
                                                 │
                                           Read JWT cookie
                                           Extract token
                                                 │
                                                 ▼
                                          GET /api/sse/connect ──────────► authMiddleware
                                          Bearer: <token>                       │
                                                                          Validate JWT
                                                                                │
                                                                           sseRoutes.js
                                                                                │
                                                                    Set SSE headers
                                                                    Flush response
                                                                    Send 'connected'
                                                                    addClient(userId, res)
                                                                                │
                                                                    req.on('close', cleanup)

  [Connection is now LIVE — browser and server are linked by open HTTP stream]

  ════════════════════════════════════════════════════════════════════════

  LATER: Admin sends notification

  ADMIN BROWSER
       │
  POST /api/admin/notifications ───────────────────────────────────────► notificationController
                                                                               │
                                                                          Save notification ──► MongoDB
                                                                          Get recipients   ◄── MongoDB
                                                                               │
                                                                    for each recipient:
                                                                    sendToUser(userId,
                                                                      'notification:new',
                                                                      data)
                                                                               │
                                                                          sseManager
                                                                               │
                                                                    clients.get(userId)
                                                                      .forEach(res =>
                                                                        res.write(sseText))
                                                                               │
                                                            ◄──── SSE text written into stream

  USER BROWSER
       │
  EventSource fires ◄────────────────────────────────────────── (data arrives over open stream)
  'notification:new'
       │
  useSSE handler
       │
  JSON.parse(event.data)
       │
  prependNotification(item)
       │
  Zustand store updates
       │
  React re-renders
       │
  ✓ Notification visible on screen (no page refresh needed)
```

---

## 8. Connection Lifecycle Diagram

```
  User opens app
       │
       ▼
  ┌─────────────┐
  │ CONNECTING  │ ◄─── EventSource opened, waiting for server
  └──────┬──────┘
         │ Server sends headers + 'connected' event
         ▼
  ┌─────────────┐
  │    OPEN     │ ◄─── Stream is live
  │             │      Heartbeat ping every 25s keeps it alive
  │             │      Events arrive as they happen
  └──────┬──────┘
         │
     (something goes wrong: network blip, server restart, etc.)
         │
         ▼
  ┌─────────────┐
  │   CLOSED    │
  └──────┬──────┘
         │ useSSE error handler detects readyState === 2
         │ Waits 5 seconds
         ▼
  ┌─────────────┐
  │ RECONNECTING│ ◄─── connect() called again
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ CONNECTING  │ ◄─── Cycle repeats
  └─────────────┘

  (On tab close / unmount: active = false → reconnect blocked → clean shutdown)
```

---

*This document covers the SSE implementation as of the `develop` branch. For questions about individual API routes, refer to the route files in `backend/routes/` and the controller in `backend/controller/notificationController.js`.*
