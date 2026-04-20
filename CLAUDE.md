# Furnigo

Furniture selling platform connecting Australian home buyers with Foshan (China) furniture manufacturers. Provides end-to-end service: AI-assisted product discovery, overseas trip arrangement, purchase guidance, shipping, customs clearance, and door-to-door delivery with setup.

## Tech Stack

- **Mobile:** React Native (Expo), NativeWind, TanStack Query, Zustand, Socket.io
- **Admin Portal:** Next.js 15 (App Router), Ant Design 5, @ant-design/pro-layout, @ant-design/charts
- **Backend:** Node.js / Fastify REST API + Socket.io WebSocket
- **Agent Gateway:** Hybrid LLM routing — LM Studio (dev) / Ollama (prod) for simple, Claude API for complex
- **ORM:** Drizzle ORM + Drizzle Kit migrations
- **Database:** PostgreSQL (RDS in prod)
- **Queue:** BullMQ + Redis (ElastiCache in prod)
- **Cloud:** AWS (ECS Fargate, RDS, ElastiCache, S3, SES)
- **Monorepo:** pnpm workspaces + Turborepo

## Key Docs

- [Requirements](docs/requirements.md) — Product scope, user stories, service flow
- [Architecture](docs/architecture.md) — System components, deployment, data flow
- [Entity Schema](docs/entity-schema.md) — Business entities, rules, relationships (**source of truth for data design**)
- [DB Schema](docs/db-schema.md) — SQL DDL tables, indexes (derived from entity-schema.md)
- [API Design](docs/api.md) — REST endpoints, request/response contracts
- [Agent Design](docs/agent-design.md) — AI assistant behavior, tools, prompt design, multi-role chat
- [Tech Stack](docs/tech-stack.md) — Full framework choices and decision rationale

## Conventions

- All API responses follow `{ success: boolean, data?: T, error?: string }` envelope
- Timestamps are ISO 8601 in UTC
- Currency amounts stored as integers in cents (AUD)
- Multi-language support: English (primary), Simplified Chinese
- Chat follows a WeChat-style group thread UX with three roles: client, assistant (AI), agent (human)

## Data Design Rule

**`entity-schema.md` is the single source of truth for all data design.**
When any entity, field, or business rule changes:
1. Update `docs/entity-schema.md` first
2. Then update `docs/db-schema.md` to reflect the SQL changes

Never modify `db-schema.md` directly without a corresponding change in `entity-schema.md`.
