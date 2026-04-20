# Tech Stack

## Mobile App — React Native (Expo)

| Concern | Choice |
|---------|--------|
| Setup | Expo managed workflow + EAS Build |
| Navigation | React Navigation v7 |
| State | Zustand (UI state) + TanStack Query (server state) |
| UI | NativeWind (Tailwind for RN) |
| Chat UI | Custom (FlatList-based) — WeChat-style 3-role group chat |
| Token storage | Expo SecureStore |
| Push notifications | Expo Notifications (FCM + APNs) |
| Images | Expo Image |
| WebSocket | Socket.io client |

## Backend API — Node.js

| Concern | Choice |
|---------|--------|
| Framework | Fastify (not Express — 2-3x faster, built-in TypeScript + schema validation) |
| ORM | Drizzle ORM (TypeScript-native, SQL-close syntax, full control) |
| Validation | Zod |
| WebSocket | Socket.io (rooms built in, Redis adapter for scale) |
| Background jobs | BullMQ + Redis |
| SMS OTP | Twilio Verify |
| Email | AWS SES |
| File uploads | fastify-multipart + AWS S3 |
| DB migrations | Drizzle Kit |
| API docs | Fastify OpenAPI (auto-generated from Zod schemas) |

## Agent Service Gateway — Node.js

| Concern | Choice |
|---------|--------|
| Local LLM (dev) | LM Studio — GUI desktop app, OpenAI-compatible API at localhost:1234 |
| Local LLM (prod) | Ollama in Docker container — same OpenAI-compatible API |
| Remote LLM | Anthropic Claude API — `claude-haiku-4-5` for borderline, `claude-sonnet-4-6` for complex |
| Framework | Direct API calls — no LangChain (use case is well-scoped, 7 tools) |
| Streaming | Server-Sent Events (SSE) |
| LLM client | `openai` npm package (works with both LM Studio and Ollama via baseURL override) |

### LLM environment config
```
Development: LOCAL_LLM_URL=http://localhost:1234/v1  (LM Studio)
Production:  LOCAL_LLM_URL=http://ollama:11434/v1    (Ollama container)
```

If local LLM is unavailable in prod, gateway falls back to Claude API.

## Infrastructure (AWS)

| Concern | Choice |
|---------|--------|
| Containers | ECS Fargate |
| Container registry | ECR |
| Database | RDS PostgreSQL 16 |
| Cache / Queue | ElastiCache Redis 7 |
| Storage | S3 + CloudFront |
| Secrets | AWS Secrets Manager |
| Email | AWS SES |
| Monitoring | CloudWatch (infra) + Sentry (app errors) |
| CI/CD | GitHub Actions → ECR → ECS |

## Development Tooling

| Concern | Choice |
|---------|--------|
| Language | TypeScript everywhere |
| Monorepo | pnpm workspaces + Turborepo |
| Local services | Docker Compose (PostgreSQL + Redis + Ollama) |
| Testing — API | Vitest + Supertest |
| Testing — E2E mobile | Detox |
| Linting | ESLint + Prettier + Husky |

## Admin Portal — Next.js

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 (App Router) |
| UI components | Ant Design 5 |
| Layout shell | `@ant-design/pro-layout` (sidebar + header + breadcrumb) |
| Charts / stats | `@ant-design/charts` |
| Data tables | Ant Design Table (built-in) |
| Forms | Ant Design Form + Zod |
| State | TanStack Query (same as mobile) |
| Auth | Session-based (email + password for admin staff, separate from client OTP flow) |
| Real-time | Socket.io client (observe live conversations) |

Admin portal is web-only, desktop-first. Accessible at `https://admin.furnigo.com.au`.

Admin roles:
- **Super admin** — full access
- **Operations** — users, orders, shipments, trips
- **Content** — products, manufacturers, promotions
- **Support** — conversations, read-only users

## Monorepo Structure

```
furnigo/
├── apps/
│   ├── mobile/          — React Native (Expo)
│   ├── api/             — Fastify REST + Socket.io
│   ├── agent-gateway/   — LLM routing service
│   └── admin/           — Next.js admin portal
├── packages/
│   ├── types/           — Shared TypeScript types
│   ├── db/              — Drizzle schema + migrations
│   └── config/          — Shared env validation (Zod)
├── docs/
├── docker-compose.yml
└── turbo.json
```

## Payment Services

| Concern | Choice |
|---------|--------|
| Client payments (AUD) | Stripe — card payments, BPAY, PayID, bank transfer |
| Supplier payouts (AUD → CNY) | Airwallex — AU-founded, built for AU-Asia cross-border |

**Flow:**
```
Client pays in AUD  →  Stripe  →  Furnigo AUD account
                                         ↓
                          Airwallex (AUD → CNY)
                                         ↓
                          Foshan supplier paid in CNY
```

## Key Decisions Log

- **Fastify over Express** — Better performance for concurrent WebSocket + streaming connections
- **Drizzle over Prisma** — Schema is hand-designed; Drizzle's SQL-close syntax avoids Prisma magic
- **No LangChain** — Agent has 7 well-defined tools; direct Claude API calls are simpler to debug
- **LM Studio (dev) / Ollama (prod)** — Both expose OpenAI-compatible API, same gateway code works for both
- **Stripe for client payments, Airwallex for supplier payouts** — Stripe handles AUD collection; Airwallex handles AUD→CNY cross-border to Foshan suppliers
- **BullMQ from day one** — OTP expiry, async AI responses, push notifications all need a queue
