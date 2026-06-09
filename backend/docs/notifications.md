# Notification System — Design & API Reference

## Overview

Notifications are split across two collections to avoid duplicating content for bulk sends.

- **`notifications`** — stores the content once (title, message, type)
- **`notificationrecipients`** — stores per-user state (isRead, isDeletedByUser)

When an admin sends a notification to 1000 users: 1 document is written to `notifications`, and 1000 small documents are written to `notificationrecipients`. Title and message are never duplicated.

---

## Database Schema

### `notifications`
| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `title` | String | yes | |
| `message` | String | yes | |
| `type` | String | yes | enum: `info`, `success`, `warning`, `error`. Default: `info` |
| `createdBy` | ObjectId (User) | yes | Admin who sent it |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

### `notificationrecipients`
| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Used as the `:id` param in user-facing routes |
| `notificationId` | ObjectId (Notification) | yes | Ref to `notifications` |
| `recipient` | ObjectId (User) | yes | The receiving user |
| `isRead` | Boolean | — | Default: `false` |
| `isDeletedByUser` | Boolean | — | Default: `false`. Soft delete — admin retains visibility |
| `createdAt` | Date | auto | |

### Indexes (`notificationrecipients`)
```
{ recipient: 1, isDeletedByUser: 1 }   // inbox query
{ recipient: 1, isRead: 1 }            // unread count
{ notificationId: 1 }                  // cascade delete
```

---

## API Reference

All routes require `Authorization: Bearer <token>` header.

---

### Admin Routes — `/api/admin/...`
Require admin role.

#### POST `/api/admin/notifications` — Create & Send Notification

**Body:**
```json
{
  "title": "System Update",
  "message": "Scheduled maintenance tonight at 10 PM.",
  "type": "info",
  "recipientType": "all"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | |
| `message` | string | yes | |
| `type` | string | no | `info` \| `success` \| `warning` \| `error`. Default: `info` |
| `recipientType` | string | yes | `all` \| `selected` |
| `recipientIds` | string[] | if `selected` | Array of user `_id`s |

**Send to all users:**
```json
{
  "title": "Platform Maintenance",
  "message": "The platform will be down for 30 minutes tonight.",
  "type": "warning",
  "recipientType": "all"
}
```

**Send to selected users:**
```json
{
  "title": "Your order shipped",
  "message": "Your order #1234 has been dispatched.",
  "type": "success",
  "recipientType": "selected",
  "recipientIds": ["6a264ef5cec6de5bdfdbc8ba", "6a269452165c13bd2166a56a"]
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Notification sent to 2 user(s) successfully"
}
```

---

#### DELETE `/api/admin/notifications/:id` — Hard Delete

Permanently removes the notification and all recipient records.

**Response `200`:**
```json
{
  "success": true,
  "message": "Notification permanently deleted"
}
```

---

### User Routes — `/api/notifications/...`
Scoped to the authenticated user only.

#### GET `/api/notifications` — Get My Notifications

Returns all non-deleted notifications for the logged-in user, newest first.

**Response `200`:**
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "notifications": [
    {
      "_id": "6a27997be9a51a6abcc22b9a",
      "isRead": false,
      "isDeletedByUser": false,
      "createdAt": "2026-06-09T04:41:31.245Z",
      "notification": {
        "_id": "6a279900e9a51a6abcc22b90",
        "title": "System Update",
        "message": "Scheduled maintenance tonight at 10 PM.",
        "type": "info",
        "createdBy": "6a269cc48bea4faae04f9b34",
        "createdAt": "2026-06-09T04:41:31.000Z"
      }
    }
  ]
}
```

> Note: `:id` in all user routes refers to the `notificationrecipients._id`, not the `notifications._id`.

---

#### GET `/api/notifications/unread-count` — Unread Count

**Response `200`:**
```json
{
  "success": true,
  "unreadCount": 3
}
```

---

#### GET `/api/notifications/:id` — Get Single Notification

**Response `200`:**
```json
{
  "success": true,
  "message": "Notification fetched successfully",
  "notification": {
    "_id": "6a27997be9a51a6abcc22b9a",
    "isRead": false,
    "isDeletedByUser": false,
    "createdAt": "2026-06-09T04:41:31.245Z",
    "notification": {
      "_id": "6a279900e9a51a6abcc22b90",
      "title": "System Update",
      "message": "Scheduled maintenance tonight at 10 PM.",
      "type": "info"
    }
  }
}
```

---

#### PATCH `/api/notifications/:id/read` — Mark as Read

**Response `200`:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

#### DELETE `/api/notifications/:id` — Soft Delete (User)

Sets `isDeletedByUser: true`. The record stays in DB so the admin retains visibility.

**Response `200`:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```
