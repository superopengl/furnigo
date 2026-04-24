# Architecture

## System Overview

```
┌─────────────────┐   ┌─────────────────┐
│  Flutter         │   │  Next.js         │
│  Mobile App      │   │  Admin Portal    │
│  (iOS/Android)   │   │  (Web)           │
└────────┬────────┘   └────────┬────────┘
         │ HTTPS / WebSocket            │ HTTPS / WebSocket
         └──────────────┬───────────────┘
                        ▼
              ┌─────────────────┐
              │  Fastify API     │
              │  - REST API      │
              │  - Socket.io     │
              │  - Token auth    │
              └───┬─────────────┘
                  │
                  ▼
    ┌──────────────────┐
    │ PostgreSQL (Neon) │
    └──────────────────┘
```

## Components

### 1. Flutter Mobile App
- **Purpose:** Client and agent-facing mobile application
- **Key features:**
  - Chat interface (WeChat-style group chats)
  - Push notifications
  - Image/voice message support
- **State management:** Riverpod
- **Navigation:** go_router
- **Local caching:** Chat messages are cached in SQLite (sqflite). Messages are immutable — on chat open, cached messages load instantly from disk, then only new messages are fetched from the API using a forward cursor (`after` param). WebSocket messages are also persisted to the cache. Cache is cleared on logout.

### 2. Next.js Admin Portal
- **Purpose:** Internal web dashboard for Furnigo staff
- **URL:** `https://admin.furnigo.com.au`
- **Key features:**
  - Chat list with participant details and last message preview
  - Live chat messaging via right-side drawer (real-time via Socket.io)
  - File/image/video upload in chat
  - Mobile responsive layout
- **Auth:** Same OTP flow as mobile app, restricted to agent/admin roles. JWT token stored in localStorage.
- **Style:** ChatGPT-inspired floating glass design with Furnigo color palette

### 3. Fastify API Server
- **Purpose:** Core backend handling all business logic
- **Responsibilities:**
  - Stateless JWT auth for mobile and admin (OTP + JWT, no backend token storage)
  - REST API for CRUD operations
  - Socket.io server for real-time chat
  - File upload handling (images, documents)
  - Push notification dispatch
- **Key middleware:**
  - Auth middleware (JWT verification)
  - Role-based access control (client vs agent)
  - Rate limiting
  - Request validation (Zod)

### 4. PostgreSQL Database (Neon)
- **Purpose:** Persistent storage for all application data
- **Key considerations:**
  - JSONB columns for flexible chat message content (text, images, cards)
  - Managed by Neon — free tier, connection pooling built in

### 5. External Services
- **Cloudflare R2** — Image and file storage (S3-compatible, no egress fees)
- **AWS SES** — Email (OTP, notifications)

## Deployment

```
Production:
├── Railway — Fastify API server
├── Neon — Managed PostgreSQL
├── Cloudflare R2 — File storage
├── AWS SES — Email
└── Sentry — Error monitoring

Development:
├── Host PostgreSQL (localhost:5432, schema: furnigo)
└── Local Fastify dev server
```

## Data Flow: Chat Message

```
1. Client sends message via WebSocket
2. API Server receives, saves to DB
3. API Server broadcasts to all chat participants (other clients, agents)
```

## Data Flow: Human Agent Escalation

```
1. Client requests human assistance in chat
2. System notifies available human agents via push notification
3. Human agent joins chat
4. Human agent responds directly in chat
```
