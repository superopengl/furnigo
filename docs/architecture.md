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
    ┌─────────────────┐
    │ PostgreSQL (RDS) │
    └──────────────────┘
```

## Components

### 1. Flutter Mobile App
- **Purpose:** Client and agent-facing mobile application
- **Key features:**
  - Chat interface (WeChat-style group chats)
  - Order tracking
  - Push notifications
  - Image/voice message support
- **State management:** Riverpod
- **Navigation:** go_router

### 2. Next.js Admin Portal
- **Purpose:** Internal web dashboard for Furnigo staff
- **URL:** `https://admin.furnigo.com.au`
- **Key features:**
  - User management (clients + agents)
  - Live chat monitoring and intervention
  - Order and shipment management
- **Auth:** Email + password with session cookies (separate from client OTP flow)

### 3. Fastify API Server
- **Purpose:** Core backend handling all business logic
- **Responsibilities:**
  - Stateless JWT auth for mobile (OTP + JWT, no backend token storage)
  - Session-based auth for admin portal
  - REST API for CRUD operations
  - Socket.io server for real-time chat
  - File upload handling (images, documents)
  - Push notification dispatch
- **Key middleware:**
  - Auth middleware (JWT verification)
  - Role-based access control (client vs agent)
  - Rate limiting
  - Request validation (Zod)

### 4. PostgreSQL Database
- **Purpose:** Persistent storage for all application data
- **Key considerations:**
  - JSONB columns for flexible chat message content (text, images, cards)
  - Row-level security for multi-tenant data isolation

### 5. External Services
- **AWS S3** — Image and file storage
- **AWS SES** — Email (OTP, notifications)

## Deployment (AWS)

```
Production:
├── ECS Fargate — API Server containers
├── RDS PostgreSQL — Managed database
├── S3 — Static assets, uploaded images
├── CloudFront — CDN for assets
├── ALB — Load balancer with SSL termination
└── CloudWatch — Logging and monitoring

Development:
├── Docker Compose — All services locally
└── Local PostgreSQL
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
