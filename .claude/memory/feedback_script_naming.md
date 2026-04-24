---
name: Script naming convention
description: No dev: prefix for local dev scripts; use prod: prefix for production-specific tasks
type: feedback
originSessionId: 79f82820-6991-4752-b677-1793bc07d5d8
---
Local dev scripts have no prefix (e.g. `api`, `admin`, `mobile`). Production-specific scripts use a `prod:` prefix.

**Why:** User preference — dev is the default context, so it shouldn't need a prefix.

**How to apply:** When adding pnpm scripts, use plain names for dev tasks and `prod:` prefix for production tasks.
