# Tech Stack

## Mobile App — Flutter

| Concern | Choice |
|---------|--------|
| Language | Dart |
| State | Riverpod |
| HTTP | Dio |
| Navigation | go_router |
| UI | Material 3 + custom widgets |
| Chat UI | Custom (ListView-based) — WeChat-style 2-role group chat |
| Token storage | flutter_secure_storage |
| Push notifications | firebase_messaging (FCM + APNs) |
| Images | cached_network_image |
| WebSocket | Socket.io client (socket_io_client) |

## Backend API — Node.js

| Concern | Choice |
|---------|--------|
| Framework | Fastify (not Express — 2-3x faster, built-in TypeScript + schema validation) |
| ORM | Drizzle ORM (TypeScript-native, SQL-close syntax, full control) |
| Validation | Zod |
| WebSocket | Socket.io (in-memory adapter, single instance) |
| Email OTP | AWS SES |
| File uploads | fastify-multipart + Cloudflare R2 |
| DB migrations | Drizzle Kit |
| API docs | Fastify OpenAPI (auto-generated from Zod schemas) |

## Infrastructure

| Concern | Choice |
|---------|--------|
| API hosting | Railway (single Fastify instance for MVP) |
| Database | Neon PostgreSQL (free tier, managed, connection pooling built in) |
| Storage | Cloudflare R2 (S3-compatible, no egress fees) |
| Email | AWS SES |
| Monitoring | Sentry (app errors) |
| CI/CD | GitHub Actions → Railway |

## Development Tooling

| Concern | Choice |
|---------|--------|
| Language | TypeScript everywhere |
| Monorepo | pnpm workspaces |
| Local services | Host PostgreSQL |
| Testing — API | Vitest + Supertest |
| Testing — E2E mobile | Flutter integration tests |
| Linting | ESLint + Prettier + Husky |

## Admin Portal — Next.js

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 (App Router) |
| UI components | Ant Design 5 |
| Layout shell | `@ant-design/pro-layout` (sidebar + header + breadcrumb) |
| Data tables | Ant Design Table (built-in) |
| Forms | Ant Design Form + Zod |
| State | TanStack Query (same as mobile) |
| Auth | Session-based (email + password for admin staff, separate from client OTP flow) |
| Real-time | Socket.io client (observe live chats) |

Admin portal is web-only, desktop-first. Accessible at `https://admin.furnigo.com.au`.

Single admin role for MVP (one-man operation).

## Project Structure

All code lives under `src/`. The root level is reserved for docs, config, and non-code resources.

```
furnigo/
├── src/
│   ├── apps/
│   │   ├── mobile/                 — Flutter (iOS + Android, Dart)
│   │   │   └── lib/
│   │   │       ├── features/       — Feature modules (auth, chat, profile)
│   │   │       │   └── {feature}/
│   │   │       │       ├── screens/
│   │   │       │       ├── providers/
│   │   │       │       ├── services/
│   │   │       │       └── widgets/
│   │   │       ├── shared/         — Cross-feature models, services, widgets
│   │   │       ├── theme/          — Color palette, typography
│   │   │       └── config/         — Environment config
│   │   │
│   │   ├── api/                    — Fastify REST + Socket.io (TypeScript)
│   │   │   └── src/
│   │   │       ├── plugins/        — Fastify plugins (auth, socket, r2)
│   │   │       ├── routes/         — REST endpoints (mirrors API doc)
│   │   │       │   └── admin/      — Admin-only endpoints
│   │   │       ├── services/       — Business logic (otp, jwt, email, upload)
│   │   │       └── ws/             — WebSocket event handlers
│   │   │
│   │   └── admin/                  — Next.js admin portal (TypeScript)
│   │       ├── app/                — App Router pages
│   │       │   ├── login/
│   │       │   ├── users/
│   │       │   └── chats/
│   │       ├── components/
│   │       └── lib/
│   │
│   └── packages/                   — Shared JS/TS packages (pnpm workspaces)
│       ├── db/                     — Drizzle schema + migrations
│       ├── types/                  — Shared TypeScript types
│       └── config/                 — Shared env validation (Zod)
│
├── docs/                           — Design docs, API spec, schema
├── business-model/                 — Business strategy, go-to-market
├── pnpm-workspace.yaml
└── .github/workflows/
```

**Notes:**
- `src/apps/mobile/` is a standalone Flutter project (Dart), outside the pnpm workspace
- `src/apps/api/` and `src/apps/admin/` are pnpm workspace members sharing `src/packages/*`
- `src/packages/db/` is the single source of truth for Drizzle schema, shared by api and admin

## Key Decisions Log

- **Flutter over React Native** — Single codebase for iOS + Android with native performance; Dart's strong typing and hot reload improve dev speed for a solo developer
- **Fastify over Express** — Better performance for concurrent WebSocket + streaming connections
- **Drizzle over Prisma** — Schema is hand-designed; Drizzle's SQL-close syntax avoids Prisma magic
- **Railway over ECS Fargate** — Deploy in minutes, not days; scale to AWS when needed
- **Neon over RDS** — Free tier, managed, zero VPC config; same PostgreSQL
- **Cloudflare R2 over S3+CloudFront** — S3-compatible API, no egress fees, simpler and cheaper
- **pnpm workspaces without Turborepo** — Only 2 JS packages (api + admin); no need for a build orchestrator
