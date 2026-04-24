---
name: Script naming convention
description: Use start: prefix for local dev scripts, prod: prefix for production-specific tasks
type: feedback
originSessionId: 79f82820-6991-4752-b677-1793bc07d5d8
---
Local dev scripts use `start:` prefix (e.g. `start:api`, `start:admin`, `start:mobile`). Production-specific scripts use a `prod:` prefix.

**Why:** User preference for clear naming convention.

**How to apply:** When adding pnpm scripts, use `start:` prefix for dev tasks and `prod:` prefix for production tasks.
