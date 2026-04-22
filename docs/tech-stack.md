# Tech Stack

## Mobile App — Flutter

| Concern | Choice |
|---------|--------|
| Language | Dart |
| State | Riverpod |
| HTTP | Dio |
| Navigation | go_router |
| UI | Material 3 + custom widgets |
| Chat UI | Custom (ListView-based) — WeChat-style 3-role group chat |
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
| Email | AWS SES |
| File uploads | fastify-multipart + AWS S3 |
| DB migrations | Drizzle Kit |
| API docs | Fastify OpenAPI (auto-generated from Zod schemas) |

## Infrastructure (AWS)

| Concern | Choice |
|---------|--------|
| Containers | ECS Fargate |
| Container registry | ECR |
| Database | RDS PostgreSQL 16 |
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
| Local services | Docker Compose (PostgreSQL) |
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
| Real-time | Socket.io client (observe live chats) |

Admin portal is web-only, desktop-first. Accessible at `https://admin.furnigo.com.au`.

Admin roles:
- **Super admin** — full access
- **Operations** — users, orders, shipments, trips
- **Content** — products, manufacturers, promotions
- **Support** — chats, read-only users

## Monorepo Structure

```
furnigo/
├── apps/
│   ├── mobile/          — Flutter (iOS + Android)
│   ├── api/             — Fastify REST + Socket.io
│   └── admin/           — Next.js admin portal
├── packages/
│   ├── types/           — Shared TypeScript types
│   ├── db/              — Drizzle schema + migrations
│   └── config/          — Shared env validation (Zod)
├── docs/
├── docker-compose.yml
└── turbo.json
```

## Key Decisions Log

- **Flutter over React Native** — Single codebase for iOS + Android with native performance; Dart's strong typing and hot reload improve dev speed for a solo developer
- **Fastify over Express** — Better performance for concurrent WebSocket + streaming connections
- **Drizzle over Prisma** — Schema is hand-designed; Drizzle's SQL-close syntax avoids Prisma magic
