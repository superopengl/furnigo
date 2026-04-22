# Database Schema

## ER Diagram

```
user ─┬─< chat_participant >─┬─ chat ─< message
      │                               │
      │                               │
```

## Tables

### user
Core user table for both clients and human agents. No password — authentication is via OTP sent to email.

```sql
CREATE TABLE "user" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('client', 'agent', 'admin')),
    email           TEXT UNIQUE NOT NULL,
    display_name    TEXT,
    avatar_url      TEXT,
    locale          VARCHAR(10) DEFAULT 'en-AU',
    is_active       BOOLEAN DEFAULT true,
    -- Metadata
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### otp_code
Temporary OTP codes for login and registration verification.

```sql
CREATE TABLE otp_code (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL,
    code            VARCHAR(6) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_code_lookup ON otp_code (email, created_at DESC);
```

### chat
A chat chat. Each order/inquiry gets its own chat.

```sql
CREATE TABLE chat (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### chat_participant
Maps users to chats (group chat membership).

```sql
CREATE TABLE chat_participant (
    chat_id UUID NOT NULL REFERENCES chat(id),
    user_id         UUID NOT NULL REFERENCES "user"(id),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('client', 'agent')),
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_read_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (chat_id, user_id)
);
```

### message
Individual messages in a chat. Supports text, images, system cards.

```sql
CREATE TABLE message (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chat(id),
    sender_id       UUID REFERENCES "user"(id),
    sender_role     VARCHAR(20) NOT NULL CHECK (sender_role IN ('client', 'agent', 'system')),
    -- Content
    content_type    VARCHAR(20) NOT NULL CHECK (content_type IN ('text', 'image', 'attachment', 'video', 'tool')),
    content         JSONB NOT NULL,
    label           TEXT[],
    -- Metadata
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- message.content JSONB examples:
-- Text:         {"text": "Hello, I'm looking for a dining table"}
-- Image:        {"url": "s3://...", "thumbnail_url": "s3://...", "caption": "This style"}
-- Attachment:   {"url": "s3://...", "filename": "quote.pdf", "size_bytes": 204800, "mime_type": "application/pdf"}
-- Video:        {"url": "s3://...", "thumbnail_url": "s3://...", "duration_seconds": 30}
-- Tool:         {"tool": "order_status", "data": {"order_id": "uuid", "status": "shipped"}}
```

## Indexes

```sql
-- Chat performance
CREATE INDEX idx_message_chat ON message (chat_id, created_at);
CREATE INDEX idx_message_sender ON message (sender_id);
CREATE INDEX idx_chat_participant_user ON chat_participant (user_id);

```
