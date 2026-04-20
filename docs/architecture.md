# Architecture

## System Overview

```
┌─────────────────┐   ┌─────────────────┐
│  React Native    │   │  Next.js         │
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
              └───┬─────────┬───┘
                  │         │
                  ▼         ▼
    ┌─────────────────┐ ┌──────────────────────┐
    │ PostgreSQL (RDS) │ │  Agent Service        │
    │                  │ │  Gateway              │
    │ Redis            │ │  ┌──────────────────┐ │
    │ (ElastiCache)    │ │  │ Classifier       │ │
    │                  │ │  │ simple → local   │ │
    │                  │ │  │ complex → remote │ │
    │                  │ │  └──┬───────────┬───┘ │
    │                  │ │     │           │     │
    │                  │ │     ▼           ▼     │
    │                  │ │  LM Studio   Claude   │
    │                  │ │  (dev) /     API      │
    │                  │ │  Ollama               │
    │                  │ │  (prod)               │
    └──────────────────┘ └──────────────────────┘
```

## Components

### 1. React Native Mobile App
- **Purpose:** Client and agent-facing mobile application
- **Key features:**
  - Chat interface (WeChat-style group threads)
  - Product catalogue browsing
  - Order tracking
  - Push notifications
  - Image/voice message support
- **State management:** TanStack Query for server state, Zustand for local state
- **Navigation:** React Navigation v7

### 2. Next.js Admin Portal
- **Purpose:** Internal web dashboard for Furnigo staff
- **URL:** `https://admin.furnigo.com.au`
- **Key features:**
  - Product and manufacturer management (CRUD)
  - User management (clients + agents)
  - Live conversation monitoring and intervention
  - Order and shipment management
  - Invitation code generation
  - Promotions management
  - Analytics dashboard
- **Auth:** Email + password with session cookies (separate from client OTP flow)
- **Admin roles:** super_admin, operations, content, support

### 3. Fastify API Server
- **Purpose:** Core backend handling all business logic
- **Responsibilities:**
  - Token-based auth for mobile (OTP + long-lived tokens)
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

### 3. Agent Service Gateway
- **Purpose:** Routes AI requests to the appropriate LLM backend
- **Routing logic:**
  - Simple messages (greetings, FAQs, status queries) → Local LLM (cost saving)
  - Complex messages (recommendations, summaries, reasoning) → Claude API
- **Responsibilities:**
  - Message classification (simple vs complex)
  - Prompt construction with conversation context
  - Tool execution (order lookup, product search, etc.)
  - Response streaming back to client
  - Fallback: if local LLM fails, route to remote

### 4. PostgreSQL Database
- **Purpose:** Persistent storage for all application data
- **Key considerations:**
  - JSONB columns for flexible chat message content (text, images, cards)
  - Full-text search for product catalogue
  - Row-level security for multi-tenant data isolation

### 5. External Services
- **Claude API** — Complex AI reasoning (recommendations, summaries, multi-step tasks)
- **Local LLM (Ollama)** — Simple responses (greetings, FAQs, translations)
- **AWS S3** — Image and file storage
- **AWS SES / SNS** — Email and push notifications
- **Shipping API** — Integration with freight forwarders

## Deployment (AWS)

```
Production:
├── ECS Fargate — API Server containers
├── ECS Fargate — Agent Gateway containers (+ Ollama sidecar for local LLM)
├── RDS PostgreSQL — Managed database
├── ElastiCache Redis — Session store, WebSocket pub/sub, rate limiting
├── S3 — Static assets, uploaded images
├── CloudFront — CDN for assets
├── ALB — Load balancer with SSL termination
└── CloudWatch — Logging and monitoring

Development:
├── Docker Compose — All services locally
└── Local PostgreSQL + Ollama
```

## Data Flow: Chat Message

```
1. Client sends message via WebSocket
2. API Server receives, saves to DB
3. API Server broadcasts to all thread participants (other clients, agents)
4. API Server sends message to Agent Gateway
5. Agent Gateway classifies message complexity
6. Routes to Local LLM or Claude API
7. LLM generates response (may call tools: order lookup, product search, etc.)
8. Agent Gateway returns AI response to API Server
9. API Server saves AI response to DB
10. API Server broadcasts AI response via WebSocket to thread
```

## Data Flow: Human Agent Escalation

```
1. AI detects it cannot handle the request (low confidence, explicit "talk to human")
2. AI posts escalation message in thread: "Let me connect you with a specialist"
3. System notifies available human agents via push notification
4. Human agent joins thread, sees AI-generated conversation summary
5. Human agent responds directly in thread
6. AI remains in thread, assists with lookups and summaries as needed
```
