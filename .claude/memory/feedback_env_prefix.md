---
name: FURNIGO_ env var prefix
description: All environment variables in this project must use the FURNIGO_ prefix
type: feedback
originSessionId: 79f82820-6991-4752-b677-1793bc07d5d8
---
All environment variables must be prefixed with `FURNIGO_` (e.g. `FURNIGO_API_BASE_URL`, not `API_BASE_URL`).

**Why:** Project convention for namespacing — already enforced in the backend config and now in the mobile app.

**How to apply:** When adding or referencing any env var across all packages (api, admin, mobile, config), always use the `FURNIGO_` prefix.
