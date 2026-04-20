# API Design

## Base URL

```
Production:  https://api.furnigo.com.au/v1
Development: http://localhost:3000/v1
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

Token-based auth for mobile app. Long-lived tokens (12 months) stored on device.
Registration requires an invitation code. Sign in via OTP sent to email or phone.

Token in `Authorization: Bearer <token>` header.

```
POST   /auth/register           — Validate invitation code + send OTP
POST   /auth/register/verify    — Verify OTP + create account, returns token
POST   /auth/login              — Send OTP to email or phone
POST   /auth/login/verify       — Verify OTP, returns token
POST   /auth/logout             — Revoke current token
GET    /auth/sessions           — List active sessions/devices
DELETE /auth/sessions/:id       — Revoke a specific session
```

### POST /auth/register

Step 1: Validate invitation code and send OTP.

```json
// Request
{
  "invitation_code": "FURN-2026-ABC",
  "identifier": "+61412345678",
  "identifier_type": "phone",
  "display_name": "John Smith"
}

// Also accepts email:
{
  "invitation_code": "FURN-2026-ABC",
  "identifier": "john@example.com",
  "identifier_type": "email",
  "display_name": "John Smith"
}

// Response
{
  "success": true,
  "data": {
    "otp_sent": true,
    "identifier": "+61412345678",
    "expires_in": 300
  }
}

// Error — invalid invitation code
{
  "success": false,
  "error": { "code": "INVALID_INVITATION", "message": "Invitation code is invalid or expired" }
}
```

### POST /auth/register/verify

Step 2: Verify OTP, create account, return long-lived token.

```json
// Request
{
  "identifier": "+61412345678",
  "identifier_type": "phone",
  "code": "482916",
  "device_name": "iPhone 15 Pro",
  "device_id": "unique-device-id"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+61412345678",
      "display_name": "John Smith",
      "role": "client"
    },
    "token": "furn_tk_...",
    "expires_at": "2027-04-20T00:00:00Z"
  }
}
```

### POST /auth/login

Send OTP to a registered email or phone.

```json
// Request
{
  "identifier": "+61412345678",
  "identifier_type": "phone"
}

// Response
{
  "success": true,
  "data": {
    "otp_sent": true,
    "expires_in": 300
  }
}
```

### POST /auth/login/verify

Verify OTP, return long-lived token.

```json
// Request
{
  "identifier": "+61412345678",
  "identifier_type": "phone",
  "code": "482916",
  "device_name": "iPhone 15 Pro",
  "device_id": "unique-device-id"
}

// Response
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "phone": "+61412345678", "display_name": "John Smith", "role": "client" },
    "token": "furn_tk_...",
    "expires_at": "2027-04-20T00:00:00Z"
  }
}
```

### GET /auth/sessions

List all active sessions for the current user.

```json
{
  "success": true,
  "data": {
    "sessions": [
      { "id": "uuid", "device_name": "iPhone 15 Pro", "last_used_at": "2026-04-20T10:00:00Z", "current": true },
      { "id": "uuid", "device_name": "iPad Air", "last_used_at": "2026-04-18T08:00:00Z", "current": false }
    ]
  }
}
```

---

## Users

```
GET    /users/me               — Get current user profile
PUT    /users/me               — Update profile
GET    /users/agents           — List available agents (admin)
```

---

## Products

```
GET    /products               — List products (paginated, filterable)
GET    /products/:id           — Get product detail
GET    /products/search        — Full-text search
GET    /products/categories    — List categories
GET    /products/recommendations — AI-powered recommendations
```

### GET /products

```
Query params:
  ?category=living_room
  &style=modern
  &min_price=50000      (AUD cents)
  &max_price=200000
  &manufacturer_id=uuid
  &sort=price_asc|price_desc|newest|popular
  &page=1
  &limit=20
```

### GET /products/recommendations

```json
// Request query
?description=modern+dining+table+for+6+people&budget=200000

// Response
{
  "success": true,
  "data": {
    "products": [ ... ],
    "reasoning": "Based on your preference for modern style and 6-person seating..."
  }
}
```

---

## Conversations

```
GET    /conversations                    — List user's conversations
POST   /conversations                    — Create new conversation
GET    /conversations/:id                — Get conversation with recent messages
GET    /conversations/:id/messages       — Get messages (paginated, cursor-based)
POST   /conversations/:id/messages       — Send a message
GET    /conversations/:id/summary        — Get AI-generated summary
POST   /conversations/:id/participants   — Add participant (agent joins)
DELETE /conversations/:id/participants/:userId — Remove participant
PUT    /conversations/:id/read           — Mark as read
```

### POST /conversations

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

### POST /conversations/:id/messages

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

### GET /conversations/:id/summary

```json
{
  "success": true,
  "data": {
    "summary": "Client is looking for a modern solid wood dining table for 6 people, budget around $2000 AUD. Prefers oak or walnut. Agent recommended 3 options from Manufacturer X. Client is interested in visiting the factory in July.",
    "message_count": 47,
    "generated_at": "2026-04-20T10:30:00Z"
  }
}
```

---

## Wishlist

```
GET    /conversations/:id/wishlist          — List wishlist items for a conversation
POST   /conversations/:id/wishlist          — Add a wishlist item
PUT    /conversations/:id/wishlist/:itemId  — Update item (name, notes, price, quantity, status)
DELETE /conversations/:id/wishlist/:itemId  — Remove item (sets status to removed)
GET    /conversations/:id/wishlist/summary  — AI-generated summary with cost estimates
```

### POST /conversations/:id/wishlist

```json
// Request
{
  "name": "Grey linen sofa",
  "notes": "Seen at Factory A, 3-seater, light grey fabric",
  "photo_urls": ["https://cdn.furnigo.com.au/uploads/uuid.jpg"],
  "price_cny": 3800,
  "quantity": 1
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Grey linen sofa",
    "notes": "Seen at Factory A, 3-seater, light grey fabric",
    "photo_urls": ["https://cdn.furnigo.com.au/uploads/uuid.jpg"],
    "price_cny": 3800,
    "price_aud_estimate": 87000,
    "quantity": 1,
    "status": "considering"
  }
}
```

### GET /conversations/:id/wishlist/summary

```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "uuid", "name": "Grey linen sofa", "quantity": 1, "price_aud_estimate": 87000, "status": "considering" },
      { "id": "uuid", "name": "Oak dining table", "quantity": 1, "price_aud_estimate": 120000, "status": "decided" },
      { "id": "uuid", "name": "Bedside tables", "quantity": 2, "price_aud_estimate": 35000, "status": "considering" }
    ],
    "subtotal_aud_estimate": 277000,
    "shipping_estimate_aud": 85000,
    "total_estimate_aud": 362000,
    "item_count": 4,
    "ai_narrative": "You have 4 items on your wishlist. Based on the prices discussed, the estimated total including shipping to Melbourne is around $3,620 AUD. The oak dining table is already confirmed. Let me know if you'd like to adjust quantities or remove anything."
  }
}
```

---

## Orders

```
GET    /orders                 — List user's orders
POST   /orders                 — Create order (from cart or conversation)
GET    /orders/:id             — Get order detail
PUT    /orders/:id             — Update order
PUT    /orders/:id/status      — Update order status (agent only)
```

### POST /orders

```json
// Request
{
  "conversation_id": "uuid",
  "items": [
    { "product_id": "uuid", "quantity": 1, "notes": "Dark walnut finish" },
    { "product_id": "uuid", "quantity": 4 }
  ],
  "delivery_address": {
    "street": "123 Example St",
    "suburb": "Richmond",
    "state": "VIC",
    "postcode": "3121",
    "country": "AU"
  }
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "draft",
    "items": [ ... ],
    "subtotal": 350000,
    "shipping_cost": 80000,
    "customs_duty": 17500,
    "delivery_cost": 15000,
    "setup_cost": 10000,
    "total": 472500
  }
}
```

---

## Shipments

```
GET    /orders/:id/shipments   — Get shipments for an order
GET    /shipments/:id          — Get shipment detail with tracking
GET    /shipments/:id/tracking — Get tracking events timeline
PUT    /shipments/:id/status   — Update shipment status (agent only)
```

### GET /shipments/:id/tracking

```json
{
  "success": true,
  "data": {
    "shipment_id": "uuid",
    "tracking_number": "FURN-2026-001234",
    "current_status": "in_transit_sea",
    "events": [
      { "status": "container_loaded", "location": "Foshan, CN", "at": "2026-04-10T08:00:00Z" },
      { "status": "in_transit_sea", "location": "South China Sea", "at": "2026-04-12T14:00:00Z" }
    ],
    "estimated_delivery": "2026-05-15"
  }
}
```

---

## Promotions

```
GET    /promotions             — List active promotions
GET    /promotions/for-me      — Personalized promotions (AI-selected)
```

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
GET    /admin/users/:id            — Get user detail + conversation history
PUT    /admin/users/:id            — Update user (role, status)
DELETE /admin/users/:id            — Deactivate user
GET    /admin/users/:id/sessions   — View active tokens/sessions
DELETE /admin/users/:id/sessions   — Revoke all sessions (force logout)
```

### Invitation Codes
```
GET    /admin/invitation-codes     — List all codes with usage stats
POST   /admin/invitation-codes     — Generate new code(s)
DELETE /admin/invitation-codes/:id — Deactivate a code
```

### Products & Manufacturers
```
GET    /admin/products             — List all products
POST   /admin/products             — Create product
PUT    /admin/products/:id         — Update product
DELETE /admin/products/:id         — Delete product
POST   /admin/products/:id/images  — Upload product images

GET    /admin/manufacturers        — List manufacturers
POST   /admin/manufacturers        — Create manufacturer
PUT    /admin/manufacturers/:id    — Update manufacturer
```

### Conversations
```
GET    /admin/conversations        — List all conversations (filterable by status, date)
GET    /admin/conversations/:id    — View full conversation thread
POST   /admin/conversations/:id/messages — Admin sends a message
PUT    /admin/conversations/:id    — Update conversation (toggle AI, close thread)
```

### Orders
```
GET    /admin/orders               — List all orders (filterable by status, date, client)
GET    /admin/orders/:id           — Order detail
PUT    /admin/orders/:id/status    — Update order status
GET    /admin/orders/export        — Export orders as CSV
```

### Shipments
```
GET    /admin/shipments            — List all shipments
PUT    /admin/shipments/:id        — Update shipment + tracking events
```

### Promotions
```
GET    /admin/promotions           — List promotions
POST   /admin/promotions           — Create promotion
PUT    /admin/promotions/:id       — Update promotion
DELETE /admin/promotions/:id       — Delete promotion
```

### Analytics
```
GET    /admin/analytics/overview   — Key metrics (revenue, orders, active users)
GET    /admin/analytics/orders     — Order trends over time
GET    /admin/analytics/ai-cost    — LLM usage and cost breakdown
```

---

## WebSocket Events

Connection: `wss://api.furnigo.com.au/v1/ws?token=<jwt>`

### Server → Client Events

```json
// New message in a conversation
{ "event": "message:new", "data": { "conversation_id": "uuid", "message": { ... } } }

// AI is typing indicator
{ "event": "assistant:typing", "data": { "conversation_id": "uuid" } }

// Agent joined conversation
{ "event": "participant:joined", "data": { "conversation_id": "uuid", "user": { ... } } }

// Order status changed
{ "event": "order:updated", "data": { "order_id": "uuid", "status": "shipped" } }

// Shipment tracking update
{ "event": "shipment:updated", "data": { "shipment_id": "uuid", "status": "customs_cleared" } }
```

### Client → Server Events

```json
// Send typing indicator
{ "event": "typing", "data": { "conversation_id": "uuid" } }

// Mark messages as read
{ "event": "read", "data": { "conversation_id": "uuid", "message_id": "uuid" } }
```
