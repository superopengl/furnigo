# Database Schema

## ER Diagram

```
invitation_codes ─< users ─┬─< conversations_participants >─┬─ conversations ─< messages
                           │                                  │
                           ├─< orders ─< order_items          │
                           │     │                            │
                           │     └─< shipments                │
                           │                                  │
                           └─< auth_tokens                    │
                                                              │
products ─< product_images                                    │
    │                                                         │
    └─ manufacturers                                          │
```

## Tables

### invitation_codes
Invitation codes required for client registration. Distributed by agents or admins.

```sql
CREATE TABLE invitation_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) UNIQUE NOT NULL,
    created_by      UUID REFERENCES users(id),
    used_by         UUID REFERENCES users(id),
    max_uses        INTEGER NOT NULL DEFAULT 1,
    use_count       INTEGER NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitation_codes_code ON invitation_codes (code);
```

### users
Core user table for both clients and human agents. No password — authentication is via OTP sent to email or phone.

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('client', 'agent', 'admin')),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      VARCHAR(500),
    locale          VARCHAR(10) DEFAULT 'en-AU',
    invitation_code_id UUID REFERENCES invitation_codes(id),
    is_active       BOOLEAN DEFAULT true,
    -- Metadata
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- At least one of email or phone must be present
    CONSTRAINT users_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
```

### auth_tokens
Long-lived tokens for mobile app sessions (12 months). One active token per device.

```sql
CREATE TABLE auth_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,
    device_name     VARCHAR(100),
    device_id       VARCHAR(255),
    expires_at      TIMESTAMPTZ NOT NULL,
    last_used_at    TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_tokens_user ON auth_tokens (user_id);
CREATE INDEX idx_auth_tokens_hash ON auth_tokens (token_hash);
```

### otp_codes
Temporary OTP codes for login and registration verification.

```sql
CREATE TABLE otp_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier      VARCHAR(255) NOT NULL,
    identifier_type VARCHAR(10) NOT NULL CHECK (identifier_type IN ('email', 'phone')),
    code            VARCHAR(6) NOT NULL,
    purpose         VARCHAR(20) NOT NULL CHECK (purpose IN ('register', 'login')),
    attempts        INTEGER NOT NULL DEFAULT 0,
    max_attempts    INTEGER NOT NULL DEFAULT 5,
    expires_at      TIMESTAMPTZ NOT NULL,
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_codes_lookup ON otp_codes (identifier, purpose, created_at DESC);

### conversations
A chat thread. Each order/inquiry gets its own conversation.

```sql
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255),
    order_id        UUID REFERENCES orders(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### conversation_participants
Maps users to conversations (group chat membership).

```sql
CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('client', 'agent', 'observer')),
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_read_at    TIMESTAMPTZ,
    is_muted        BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (conversation_id, user_id)
);
```

### messages
Individual messages in a conversation. Supports text, images, system cards.

```sql
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id       UUID REFERENCES users(id),
    sender_role     VARCHAR(20) NOT NULL CHECK (sender_role IN ('client', 'assistant', 'agent', 'system')),
    -- Content
    content_type    VARCHAR(20) NOT NULL CHECK (content_type IN ('text', 'image', 'voice', 'product_card', 'order_card', 'summary', 'system')),
    content         JSONB NOT NULL,
    -- AI metadata (only for assistant messages)
    ai_model        VARCHAR(50),
    ai_tokens_used  INTEGER,
    ai_cost_cents   INTEGER,
    -- Metadata
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_deleted      BOOLEAN DEFAULT false
);

-- message.content JSONB examples:
-- Text:         {"text": "Hello, I'm looking for a dining table"}
-- Image:        {"url": "s3://...", "caption": "This style", "thumbnail_url": "s3://..."}
-- Product card: {"product_id": "uuid", "name": "Oak Dining Table", "price": 150000, "image_url": "..."}
-- Order card:   {"order_id": "uuid", "status": "shipped", "eta": "2026-05-15"}
-- Summary:      {"text": "Summary of 47 messages: Client is looking for...", "message_count": 47}
```

### products
Furniture products from Foshan manufacturers.

```sql
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
    name            VARCHAR(255) NOT NULL,
    name_zh         VARCHAR(255),
    description     TEXT,
    description_zh  TEXT,
    -- Pricing (in AUD cents)
    factory_price   INTEGER NOT NULL,
    retail_price    INTEGER NOT NULL,
    -- Attributes
    material        VARCHAR(100),
    dimensions      JSONB,
    weight_kg       NUMERIC(8,2),
    color           VARCHAR(50),
    -- Search
    tags            TEXT[],
    search_vector   TSVECTOR,
    -- Status
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_search ON products USING GIN (search_vector);
CREATE INDEX idx_products_tags ON products USING GIN (tags);
```

### product_images

```sql
CREATE TABLE product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    sort_order  INTEGER DEFAULT 0,
    is_primary  BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### manufacturers
Foshan furniture manufacturers/factories.

```sql
CREATE TABLE manufacturers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    name_zh         VARCHAR(255),
    address         TEXT,
    address_zh      TEXT,
    district        VARCHAR(100),
    contact_phone   VARCHAR(20),
    contact_wechat  VARCHAR(100),
    specialties     TEXT[],
    rating          NUMERIC(2,1),
    is_verified     BOOLEAN DEFAULT false,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### orders

```sql
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES users(id),
    agent_id        UUID REFERENCES users(id),
    -- Status
    status          VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'confirmed', 'paid', 'in_production',
        'quality_check', 'ready_to_ship', 'shipped',
        'customs_clearance', 'in_transit_au', 'delivered',
        'setup_complete', 'cancelled', 'refunded'
    )),
    -- Financials (AUD cents)
    subtotal        INTEGER NOT NULL DEFAULT 0,
    shipping_cost   INTEGER NOT NULL DEFAULT 0,
    customs_duty    INTEGER NOT NULL DEFAULT 0,
    delivery_cost   INTEGER NOT NULL DEFAULT 0,
    setup_cost      INTEGER NOT NULL DEFAULT 0,
    total           INTEGER NOT NULL DEFAULT 0,
    -- Addresses
    delivery_address    JSONB,
    -- Dates
    estimated_delivery  DATE,
    actual_delivery     DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### order_items

```sql
CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL DEFAULT 1,
    unit_price  INTEGER NOT NULL,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### shipments
Tracks shipping from Foshan to client's door.

```sql
CREATE TABLE shipments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'container_loaded', 'in_transit_sea',
        'arrived_au_port', 'customs_processing', 'customs_cleared',
        'in_transit_local', 'out_for_delivery', 'delivered'
    )),
    tracking_number VARCHAR(100),
    carrier         VARCHAR(100),
    container_id    VARCHAR(50),
    -- Key dates
    shipped_at      TIMESTAMPTZ,
    port_arrival_at TIMESTAMPTZ,
    customs_cleared_at TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    -- Details
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### promotions

```sql
CREATE TABLE promotions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    discount_type   VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
    discount_value  INTEGER,
    conditions      JSONB,
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Indexes

```sql
-- Chat performance
CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages (sender_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants (user_id);

-- Order lookups
CREATE INDEX idx_orders_client ON orders (client_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_shipments_order ON shipments (order_id);
CREATE INDEX idx_shipments_tracking ON shipments (tracking_number);

```
