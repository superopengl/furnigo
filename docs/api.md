# API Design

## Base URL

```
Production:  https://api.furnigo.com.au/v1
Development: http://localhost:9411/v1
```

## Response Envelope

All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}

{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Order not found" }
}
```

## Authentication

Stateless JWT auth for mobile app. Token contains user ID and expiry (12 months), signed with a server secret. No token storage on the backend — the server verifies the signature on each request. To block a user, set `is_active=false` on the users table.

Unified auth flow: enter email → verify OTP → if new user, account is created automatically.

Token in `Authorization: Bearer <jwt>` header.

```
POST   /auth/otp/send           — Send OTP to email
POST   /auth/otp/verify         — Verify OTP, login or create account, returns JWT
```

### POST /auth/otp/send

Send OTP to email. Works for both new and existing users.

```json
// Request
{
  "email": "john@example.com"
}

// Response
{
  "success": true,
  "data": {
    "otp_sent": true,
    "email": "john@example.com",
    "is_new_user": true,
    "expires_in": 300
  }
}
```

### POST /auth/otp/verify

Verify OTP. If existing user, logs in. If new user, creates account. Returns long-lived token.

```json
// Request
{
  "email": "john@example.com",
  "code": "482916"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "display_name": null,
      "role": "client"
    },
    "is_new_user": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2027-04-22T00:00:00Z"
  }
}
```

---

## Users

```
GET    /users/me               — Get current user profile
PUT    /users/me               — Update profile
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
POST   /chats/:id/participants   — Add participant (agent joins)
```

### POST /chats

```json
// Request
{
  "type": "inquiry",
  "title": "Looking for living room furniture"
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "inquiry",
    "title": "Looking for living room furniture",
    "participants": [
      { "user_id": "uuid", "role": "client" }
    ],
    "ai_enabled": true
  }
}
```

### PUT /chats/:id

Update a chat. Caller must be a participant.

```json
// Request
{
  "title": "New chat 2"
}

// Response
{
  "success": true,
  "data": {
    "title": "New chat 2",
    "updated_at": "2026-04-24T12:00:00Z"
  }
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

**Backward (default):** Messages ordered by `created_at DESC`, then reversed to chronological. `meta.cursor` points to the oldest returned message for fetching the next older batch.

**Forward (`after`):** Messages ordered by `created_at ASC`. `meta.cursor` points to the newest returned message for fetching the next newer batch.

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

```json
// Request
{
  "content_type": "text",
  "content": { "text": "I'm looking for a solid wood dining table" }
}

// Image message
{
  "content_type": "image",
  "content": { "url": "s3://...", "caption": "Something like this style" }
}

// Response — the saved message
{
  "success": true,
  "data": {
    "id": "uuid",
    "sender_id": "uuid",
    "sender_role": "client",
    "content_type": "text",
    "content": { "text": "I'm looking for a solid wood dining table" },
    "created_at": "2026-04-20T10:30:00Z"
  }
}
```

Note: The AI assistant response arrives via WebSocket, not in this HTTP response.

---

## Admin API

All admin endpoints require `Authorization: Bearer <jwt>` and an agent or admin role.
Base prefix: `/admin`

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
        { "userId": "uuid", "role": "client", "displayName": "John", "email": "john@example.com" }
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

Returns chat with participants and recent 50 messages. If the requesting admin is not yet a participant, they are automatically added with role "agent".

After joining, the admin can use existing chat endpoints to send messages (`POST /chats/:id/messages`) and load history (`GET /chats/:id/messages`).


---

## WebSocket Events

Connection: `wss://api.furnigo.com.au/v1/ws?token=<jwt>`

### Server → Client Events

```json
// New message in a chat
{ "event": "message:new", "data": { "chat_id": "uuid", "message": { ... } } }

// AI is typing indicator
{ "event": "assistant:typing", "data": { "chat_id": "uuid" } }

// Agent joined chat
{ "event": "participant:joined", "data": { "chat_id": "uuid", "user": { ... } } }

// Order status changed
{ "event": "order:updated", "data": { "order_id": "uuid", "status": "shipped" } }

// Shipment tracking update
{ "event": "shipment:updated", "data": { "shipment_id": "uuid", "status": "customs_cleared" } }
```

### Client → Server Events

```json
// Send typing indicator
{ "event": "typing", "data": { "chat_id": "uuid" } }

// Mark messages as read
{ "event": "read", "data": { "chat_id": "uuid", "message_id": "uuid" } }
```
