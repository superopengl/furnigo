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
GET    /chats/:id/messages       — Get messages (paginated, cursor-based)
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
    "id": "uuid",
    "title": "New chat 2",
    "created_at": "2026-04-20T10:00:00Z",
    "updated_at": "2026-04-24T12:00:00Z"
  }
}
```

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

All admin endpoints require `Authorization: Bearer <admin-session-token>` and an admin role.
Base prefix: `/admin`

### Auth (Admin)
```
POST   /admin/auth/login           — Email + password login
POST   /admin/auth/logout          — End session
```

### Users
```
GET    /admin/users                — List all users (filterable by role, status)
GET    /admin/users/:id            — Get user detail + chat history
PUT    /admin/users/:id            — Update user (role, status)
```

### Chats
```
GET    /admin/chats        — List all chats (filterable by status, date)
GET    /admin/chats/:id    — View full chat chat
POST   /admin/chats/:id/messages — Admin sends a message
```


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
