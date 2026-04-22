# Furnigo

Furniture selling platform connecting Australian home buyers with Foshan (China) furniture manufacturers. Provides end-to-end service: overseas trip arrangement, purchase guidance, shipping, customs clearance, and door-to-door delivery with setup.

## Tech Stack

- **Mobile:** Flutter (Dart), Riverpod, Dio, go_router, Material 3, Socket.io
- **Admin Portal:** Next.js 15 (App Router), Ant Design 5, @ant-design/pro-layout, @ant-design/charts
- **Backend:** Node.js / Fastify REST API + Socket.io WebSocket
- **ORM:** Drizzle ORM + Drizzle Kit migrations
- **Database:** PostgreSQL (RDS in prod)
- **Cloud:** AWS (ECS Fargate, RDS, S3, SES)
- **Monorepo:** pnpm workspaces + Turborepo

## Key Docs

- [Requirements](docs/requirements.md) — Product scope, user stories, service flow
- [Architecture](docs/architecture.md) — System components, deployment, data flow
- [Entity Schema](docs/entity-schema.md) — Business entities, rules, relationships (**source of truth for data design**)
- [DB Schema](docs/db-schema.md) — SQL DDL tables, indexes (derived from entity-schema.md)
- [API Design](docs/api.md) — REST endpoints, request/response contracts
- [Tech Stack](docs/tech-stack.md) — Full framework choices and decision rationale
- [Color Palette](docs/color-palette.md) — UX design color tokens

## Conventions

- All database table and view names are **singular** (e.g. `user`, `order_item`, not `users`, `order_items`)
- Use `TEXT` over `VARCHAR` unless the column has an obvious fixed-length constraint (e.g. OTP code, locale). Length validation is handled at the application layer (Zod).
- All API responses follow `{ success: boolean, data?: T, error?: string }` envelope
- Timestamps are ISO 8601 in UTC
- Currency amounts stored as integers in cents (AUD)
- Multi-language support: English (primary), Simplified Chinese
- Chat follows a WeChat-style group chat UX with two roles: client and agent (human)

## Data Design Rule

**`entity-schema.md` is the single source of truth for all data design.**
When any entity, field, or business rule changes:
1. Update `docs/entity-schema.md` first
2. Then update `docs/db-schema.md` to reflect the SQL changes

Never modify `db-schema.md` directly without a corresponding change in `entity-schema.md`.
