# Entity Schema

> **Source of truth for all data design.**
> When this file changes, `db-schema.md` must be updated to reflect it.
> See `CLAUDE.md` for the update rule.

---

## Common Fields

Every entity has these computed fields. They are system-managed and not set by application code.

| Field | Type | Rules |
|-------|------|-------|
| created_at | timestamp | set on insert; never modified |
| updated_at | timestamp | set on insert; auto-updated on every modification |

These fields are omitted from individual entity tables below for brevity.

---

## User

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| role | enum | `client`, `agent`, `admin` |
| email | string | unique; optional if phone provided |
| phone | string | unique; optional if email provided |
| display_name | string | required |
| avatar_url | string | optional |
| locale | string | default `en-AU` |
| invitation_code_id | UUID | required for clients; null for agents/admins |
| is_active | boolean | default true; soft deactivation for all roles |

### Business Rules
- At least one of `email` or `phone` must be present
- `invitation_code_id` is required for role=`client`, null for `agent` and `admin`
- A user cannot change their own role
- Deactivation is soft — set `is_active=false`, never hard delete

---

## InvitationCode

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| code | string | unique, uppercase alphanumeric |
| created_by | UUID | references User (admin or agent) |
| used_by | UUID | references User; null until used |
| max_uses | integer | default 1; admin can set higher for bulk onboarding |
| use_count | integer | increments on each successful registration |
| expires_at | timestamp | optional; null means no expiry |
| is_active | boolean | admin can deactivate at any time |

### Business Rules
- A code is valid only if: `is_active=true` AND `use_count < max_uses` AND (`expires_at` is null OR `expires_at` > now)
- `use_count` increments atomically on successful registration
- A deactivated code cannot be reactivated (create a new one instead)

---

## AuthToken

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| user_id | UUID | references User |
| token_hash | string | SHA-256 hash of the raw token |
| device_name | string | optional, user-friendly label |
| device_id | string | optional, unique per device |
| expires_at | timestamp | 12 months from creation |
| last_used_at | timestamp | updated on each authenticated request |
| revoked_at | timestamp | null until revoked |

### Business Rules
- Raw token is never stored — only the hash
- A token is valid only if: `revoked_at` is null AND `expires_at` > now
- Multiple active tokens per user are allowed (multi-device)
- Logging out revokes only the current device's token
- Admins can revoke all tokens for a user (force logout)

---

## OtpCode

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| identifier | string | email or phone number |
| identifier_type | enum | `email`, `phone` |
| code | string | 6-digit numeric |
| purpose | enum | `register`, `login` |
| attempts | integer | increments on each failed verification |
| max_attempts | integer | default 5 |
| expires_at | timestamp | 5 minutes from creation |
| verified_at | timestamp | null until successfully verified |

### Business Rules
- Only one active (unverified, unexpired) OTP per identifier+purpose at a time
- Creating a new OTP invalidates any previous one for the same identifier+purpose
- After `max_attempts` failed verifications, the OTP is invalidated
- A verified OTP cannot be used again
- OTP codes older than 24 hours should be purged (background job)

---

## Conversation

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| title | string | optional; auto-generated from first message if not set |
| order_id | UUID | optional; links to Order |

### Business Rules
- A conversation must always have at least one `client` participant

---

## ConversationParticipant

### Fields
| Field | Type | Rules |
|-------|------|-------|
| conversation_id | UUID | references Conversation |
| user_id | UUID | references User |
| role | enum | `client`, `agent`, `observer` |
| joined_at | timestamp | when user joined the thread |
| last_read_at | timestamp | for unread count calculation |
| is_muted | boolean | default false |

### Business Rules
- A user can only appear once per conversation
- The creating client is automatically added as `client` role on conversation creation
- Human agents join with role `agent`; admins monitoring join as `observer`
- Observers can read but not send messages
- A conversation must always have at least one `client` participant

---

## Message

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| conversation_id | UUID | references Conversation |
| sender_id | UUID | references User; null for system messages |
| sender_role | enum | `client`, `assistant`, `agent`, `system` |
| content_type | enum | `text`, `image`, `voice`, `product_card`, `order_card`, `payment_link`, `summary`, `system` |
| content | JSONB | shape depends on content_type (see below) |
| ai_model | string | only set when sender_role=`assistant` |
| ai_tokens_used | integer | only set when sender_role=`assistant` |
| ai_cost_cents | integer | cost in AUD cents; only set when sender_role=`assistant` |
| is_deleted | boolean | soft delete; content replaced with tombstone |

### Content shapes by type
```
text:         { text: string }
image:        { url: string, thumbnail_url: string, caption?: string }
voice:        { url: string, duration_seconds: number }
product_card: { product_id: string, name: string, price: number, image_url: string }
order_card:   { order_id: string, status: string, eta?: string }
payment_link: { order_id: string, amount: number, url: string, expires_at: string }
summary:      { text: string, message_count: number }
system:       { text: string, event: string }
```

### Business Rules
- Messages cannot be edited, only soft-deleted
- Soft-deleted messages show a tombstone ("This message was deleted")
- Only the sender or an admin can delete a message
- `assistant` role messages are always sent by the AI, never by a human
- `system` role messages are generated by the server (e.g. "Agent joined the conversation")
- AI cost tracking is required on every `assistant` message

---

## Product

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| manufacturer_id | UUID | references Manufacturer |
| name | string | required; English |
| name_zh | string | optional; Simplified Chinese |
| description | text | optional |
| description_zh | text | optional |
| factory_price | integer | AUD cents; what Furnigo pays |
| retail_price | integer | AUD cents; what client pays |
| material | string | optional |
| dimensions | JSONB | `{ width, depth, height, unit }` |
| weight_kg | decimal | optional |
| color | string | optional |
| tags | string[] | categories and keywords for search and filtering (e.g. `living_room`, `dining`, `modern`, `oak`) |
| is_active | boolean | default true; inactive products hidden from clients |

### Business Rules
- `retail_price` must be >= `factory_price`
- A product must have at least one image to be visible to clients
- Deactivated products remain on existing orders but cannot be added to new ones
- `tags` must have at least one entry
- Full-text search covers `name`, `name_zh`, `description`, `tags`

---

## Manufacturer

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| name | string | required; English |
| name_zh | string | optional; Simplified Chinese |
| address | text | optional |
| address_zh | text | optional |
| district | string | Foshan district (e.g. `Lecong`, `Longjiang`) |
| contact_phone | string | optional |
| contact_wechat | string | optional |
| specialties | string[] | product categories they specialise in |
| rating | decimal | 1.0–5.0; set by admin |
| is_verified | boolean | Furnigo has vetted this manufacturer |
| is_active | boolean | inactive manufacturers hidden from clients |

### Business Rules
- A manufacturer must be `is_verified=true` before their products appear to clients
- Deactivating a manufacturer deactivates all their products

---

## Order

### Status Lifecycle
```
draft → confirmed → paid → in_production → quality_check
      → ready_to_ship → shipped → customs_clearance
      → in_transit_au → delivered → setup_complete
```
Terminal states: `cancelled`, `refunded` (reachable from any non-terminal status)

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| client_id | UUID | references User (role=client) |
| agent_id | UUID | references User (role=agent); optional |
| status | enum | see lifecycle above |
| subtotal | integer | AUD cents; sum of item prices |
| shipping_cost | integer | AUD cents |
| customs_duty | integer | AUD cents |
| delivery_cost | integer | AUD cents |
| setup_cost | integer | AUD cents |
| total | integer | AUD cents; must equal sum of all cost fields |
| delivery_address | JSONB | `{ street, suburb, state, postcode, country }` |
| estimated_delivery | date | optional |
| actual_delivery | date | set when status=`delivered` |

### Business Rules
- Status moves forward only; never backward
- Only an agent (human) or admin can advance status past `confirmed`
- `delivery_address` is required before status can move past `confirmed`
- `total` must always equal `subtotal + shipping_cost + customs_duty + delivery_cost + setup_cost`
- An order must have at least one OrderItem
- Cancellation is allowed until `shipped`; refund is allowed after `shipped`

---

## OrderItem

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| order_id | UUID | references Order |
| product_id | UUID | references Product |
| quantity | integer | minimum 1 |
| unit_price | integer | AUD cents; snapshot of price at time of order |
| notes | string | optional; e.g. custom finish or size notes |

### Business Rules
- `unit_price` is snapshotted at order creation — changes to the product price do not affect existing orders
- Items cannot be added or removed once order status is past `confirmed`

---

## Shipment

### Status Lifecycle
```
pending → container_loaded → in_transit_sea → arrived_au_port
        → customs_processing → customs_cleared → in_transit_local
        → out_for_delivery → delivered
```

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| order_id | UUID | references Order |
| status | enum | see lifecycle above |
| tracking_number | string | optional; assigned by freight carrier |
| carrier | string | optional |
| container_id | string | optional |
| shipped_at | timestamp | when container departed Foshan |
| port_arrival_at | timestamp | when arrived at AU port |
| customs_cleared_at | timestamp | when customs cleared |
| delivered_at | timestamp | when delivered to client |

### Business Rules
- One order can have at most one shipment
- Shipment status moves independently from Order status but triggers Order status updates:
  - `container_loaded` → Order moves to `shipped`
  - `customs_cleared` → Order moves to `customs_clearance` → `in_transit_au`
  - `delivered` → Order moves to `delivered`

---

## Promotion

### Fields
| Field | Type | Rules |
|-------|------|-------|
| id | UUID | system-generated |
| title | string | required |
| description | text | optional |
| discount_type | enum | `percentage`, `fixed_amount`, `free_shipping` |
| discount_value | integer | percentage (0–100) or AUD cents |
| conditions | JSONB | optional targeting rules (e.g. category, min order) |
| starts_at | timestamp | required |
| ends_at | timestamp | required; must be after starts_at |
| is_active | boolean | admin can deactivate early |

### Business Rules
- `discount_value` for `percentage` type must be between 1 and 100
- `ends_at` must be after `starts_at`
- A promotion is live only if: `is_active=true` AND now is between `starts_at` and `ends_at`
- Deactivated promotions are not shown to clients or suggested by the AI
