# API Design

## Base URL

```
Production:  https://api.furnigo.com.au/api
Development: http://localhost:9411/api
```

## Response Envelope

All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "limit": 50, "cursor": "..." }
}

{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Order not found" }
}
```

## Authentication

Stateless JWT auth for mobile and admin. Token contains user ID and role, signed with a server secret. Tokens expire after **12 hours**. No token storage on the backend — the server verifies the signature on each request. To block a user, set `isActive=false` on the user table.

Unified auth flow: enter email → verify OTP → if new user, account is created automatically.

Token in `Authorization: Bearer <jwt>` header.

**Token refresh:** Clients automatically call `POST /auth/token/refresh` when a 401 is received. The server accepts expired tokens within a **7-day grace window**, verifies the user is still active, and issues a fresh token. Tokens expired beyond 7 days require re-authentication via OTP.

```
POST   /auth/otp/send           — Send OTP to email
POST   /auth/otp/verify         — Verify OTP, login or create account, returns JWT
GET    /auth/token/verify       — Check if current token is valid, returns user profile
POST   /auth/token/refresh      — Refresh an expired token (within 7-day grace window)
```

### POST /auth/otp/send

Send OTP to email. Works for both new and existing users. Creates the user record (inactive) if it doesn't exist.

```json
// Request
{
  "email": "john@example.com"
}

// Response
{
  "success": true,
  "data": {
    "otp_id": "uuid",
    "expires_in": 300
  }
}
```

### POST /auth/otp/verify

Verify OTP. If existing user, logs in. If new user, activates account. Returns short-lived token (12h).

```json
// Request
{
  "otp_id": "uuid",
  "code": "482916"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "displayName": null,
      "role": "client"
    },
    "is_new_user": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2027-04-22T00:00:00Z"
  }
}

// Invalid OTP — 400
{
  "success": false,
  "error": { "code": "INVALID_OTP", "message": "Invalid or expired OTP" }
}
```

### GET /auth/token/verify

Check if the current JWT is valid and the user is active. Returns the user profile on success.

```
Authorization: Bearer <jwt>
```

```json
// Success — 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john@example.com",
    "displayName": "John",
    "role": "client"
  }
}

// Invalid/expired token — 401
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Invalid or expired token" }
}
```

### POST /auth/token/refresh

Refresh an expired JWT. The expired token must still be within the 7-day grace window. The server verifies the user is still active before issuing a new token.

```
Authorization: Bearer <expired-jwt>
```

```json
// Success — 200
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2026-04-25T12:00:00Z"
  }
}

// Token expired beyond grace window — 401
{
  "success": false,
  "error": { "code": "TOKEN_EXPIRED", "message": "Token expired beyond refresh window. Please log in again." }
}

// User deactivated — 403
{
  "success": false,
  "error": { "code": "USER_DEACTIVATED", "message": "Your account has been deactivated" }
}
```

---

## Users

```
GET    /users/me               — Get current user profile
PUT    /users/me               — Update profile
```

### GET /users/me

Returns the current authenticated user's profile.

```json
// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john@example.com",
    "displayName": "John",
    "avatarUrl": null,
    "locale": "en",
    "role": "client",
    "isActive": true,
    "createdAt": "2026-04-20T10:00:00Z",
    "updatedAt": "2026-04-24T12:00:00Z"
  }
}
```

### PUT /users/me

Update the current user's profile. All fields are optional.

```json
// Request
{
  "displayName": "John Doe",
  "avatarUrl": "https://cdn.example.com/avatar.jpg",
  "locale": "zh"
}

// Response
{
  "success": true,
  "data": { /* updated user object */ }
}
```

---

## Chats

```
GET    /chats                    — List user's chats
POST   /chats                    — Create new chat
PUT    /chats/:id                — Update chat (e.g. title)
GET    /chats/:id                — Get chat with recent messages
GET    /chats/:id/messages       — Get messages (cursor-based, supports forward/backward)
POST   /chats/:id/messages       — Send a message
```

### GET /chats

List chats the current user participates in, sorted by most recently updated.

```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Living room furniture",
      "createdAt": "2026-04-20T10:00:00Z",
      "updatedAt": "2026-04-24T12:00:00Z",
      "role": "client"
    }
  ]
}
```

### POST /chats

Create a new chat. The caller is automatically added as a "client" participant.

```json
// Request
{
  "title": "Looking for living room furniture"
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Looking for living room furniture",
    "createdAt": "2026-04-20T10:00:00Z",
    "updatedAt": "2026-04-20T10:00:00Z",
    "participants": [
      { "userId": "uuid", "role": "client" }
    ]
  }
}
```

### PUT /chats/:id

Update a chat. Caller must be a participant.

```json
// Request
{
  "title": "New chat title"
}

// Response
{
  "success": true,
  "data": {
    "title": "New chat title",
    "updatedAt": "2026-04-24T12:00:00Z"
  }
}
```

### GET /chats/:id

Get chat with participants and the most recent 50 messages. Caller must be a participant.

```json
// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Living room furniture",
    "participants": [
      { "userId": "uuid", "role": "client" }
    ],
    "messages": [ /* up to 50 messages, chronological order */ ]
  }
}

// Not a participant — 403
{
  "success": false,
  "error": { "code": "FORBIDDEN", "message": "Not a participant of this chat" }
}
```

### GET /chats/:id/messages

Cursor-based pagination with two modes:

| Param | Type | Description |
|-------|------|-------------|
| `cursor` | ISO 8601 timestamp | Backward cursor — returns messages older than this timestamp (for loading history) |
| `after` | ISO 8601 timestamp | Forward cursor — returns messages newer than this timestamp (for syncing new messages) |
| `limit` | number | Max messages to return (default 50, max 100) |

`cursor` and `after` are mutually exclusive. If `after` is provided, it takes precedence.

**Backward (default):** Messages ordered by `createdAt DESC`, then reversed to chronological. `meta.cursor` points to the oldest returned message for fetching the next older batch.

**Forward (`after`):** Messages ordered by `createdAt ASC`. `meta.cursor` points to the newest returned message for fetching the next newer batch.

```json
// Response
{
  "success": true,
  "data": [ /* messages in chronological order */ ],
  "meta": { "limit": 50, "cursor": "2026-04-20T10:30:00.000Z" }
}
```

The mobile client caches messages locally in SQLite. On chat open, it loads cached messages instantly, then calls `GET /chats/:id/messages?after=<lastCachedTimestamp>` to fetch only new messages since the last sync.

### POST /chats/:id/messages

Send a message. Caller must be a participant. Sender role is auto-detected from the participant record. The message is broadcast to the chat room via WebSocket `message:new` event.

```json
// Request
{
  "contentType": "text",
  "content": { "text": "I'm looking for a solid wood dining table" }
}

// Image message
{
  "contentType": "image",
  "content": { "url": "https://cdn.example.com/photo.jpg" }
}

// Attachment message
{
  "contentType": "attachment",
  "content": { "url": "https://cdn.example.com/doc.pdf", "name": "invoice.pdf" }
}
```

Supported `contentType` values: `text`, `image`, `attachment`, `video`, `tool`

Optional `label` field for categorising messages:

```json
{
  "contentType": "text",
  "content": { "text": "Your payment has been received" },
  "label": ["payment"]
}
```

Supported labels: `order`, `action_required`, `payment`, `shipment`, `delivery`

```json
// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "chatId": "uuid",
    "senderId": "uuid",
    "senderRole": "client",
    "contentType": "text",
    "content": { "text": "I'm looking for a solid wood dining table" },
    "label": null,
    "createdAt": "2026-04-20T10:30:00Z",
    "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

---

## Uploads

```
POST   /uploads                — Upload a file (image, video, or PDF)
```

### POST /uploads

Upload a file attachment. Requires authentication. Accepts multipart form data with a single `file` field. Only images (`image/*`), videos (`video/*`), and PDFs (`application/pdf`) are allowed. Max file size: 10 MB.

MIME type is auto-detected from the uploaded file. The returned `url` is a full blob URL constructed from `FURNIGO_BLOB_BASE_URL`.

```
Content-Type: multipart/form-data
Authorization: Bearer <jwt>
```

```json
// Response
{
  "success": true,
  "data": {
    "url": "http://localhost:9411/api/dev/blob/550e8400-e29b-41d4-a716-446655440000",
    "name": "photo.jpg",
    "size": 245760,
    "contentType": "image/jpeg"
  }
}

// Invalid file type — 400
{
  "success": false,
  "error": { "code": "BAD_REQUEST", "message": "Only images, videos, and PDFs are allowed" }
}
```

---

## Admin API

All admin endpoints require `Authorization: Bearer <jwt>` and an agent or admin role.

Auth uses the same OTP flow as the mobile app (`/auth/otp/send` + `/auth/otp/verify`). The admin portal rejects client-role users on the frontend after OTP verification.

### Chats

```
GET    /admin/chats        — List all chats with participants and last message
GET    /admin/chats/:id    — Get chat detail (auto-joins admin as agent participant)
```

#### GET /admin/chats

Returns all chats with enriched participant info and last message preview.

```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Living room furniture",
      "createdAt": "2026-04-20T10:00:00Z",
      "updatedAt": "2026-04-24T12:00:00Z",
      "participants": [
        { "userId": "uuid", "role": "client", "joinedAt": "2026-04-20T10:00:00Z", "displayName": "John", "email": "john@example.com" }
      ],
      "lastMessage": {
        "id": "uuid",
        "contentType": "text",
        "content": { "text": "I'm looking for a dining table" },
        "senderRole": "client",
        "createdAt": "2026-04-24T12:00:00Z"
      }
    }
  ]
}
```

#### GET /admin/chats/:id

Returns chat with participants and recent 50 messages. If the requesting admin is not yet a participant, they are automatically added with role "agent" and a `participant:joined` WebSocket event is emitted.

After joining, the admin can use existing chat endpoints to send messages (`POST /chats/:id/messages`) and load history (`GET /chats/:id/messages`).

---

## Dev-only APIs

These endpoints are only available when `NODE_ENV=development`.

```
GET    /dev/blob/:fileId       — Serve an uploaded file by fileId
```

### GET /dev/blob/:fileId

Serves a locally stored file from the `devUploadAttachments/` directory at the project root. In production, files are served directly from cloud storage (e.g. Cloudflare R2) via `FURNIGO_BLOB_BASE_URL`. No authentication required.

```json
// 200 — returns raw file with auto-detected Content-Type header

// Not found — 404
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "File not found" }
}
```

---

## Utility Endpoints

```
GET    /healthcheck            — Returns "OK"
GET    /info                   — Returns registered routes and WebSocket info
```

### GET /info

```json
{
  "success": true,
  "data": {
    "routes": [
      { "method": "GET", "path": "/api/chats" },
      { "method": "POST", "path": "/api/chats" }
    ],
    "websocket": { "path": "/ws", "protocol": "socket.io" }
  }
}
```

---

## WebSocket Events

Protocol: Socket.IO at path `/ws`

Authentication: JWT token passed in the handshake `auth` object:

```js
io("http://localhost:9411", {
  path: "/ws",
  auth: { token: "<jwt>" },
});
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `chatId: string` | Join a chat room to receive real-time events |
| `leave` | `chatId: string` | Leave a chat room |
| `typing` | `{ chatId: string }` | Broadcast typing indicator to other users in the room |

### Server → Client Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `message:new` | `{ chatId: string, message: Message }` | A new message is sent via `POST /chats/:id/messages` |
| `typing` | `{ chatId: string, userId: string }` | Another user in the room is typing |
| `participant:joined` | `{ chatId: string, user: { userId, role, displayName?, email? } }` | An admin/agent joins a chat via `GET /admin/chats/:id` |
