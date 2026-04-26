---
name: API and WS URL conventions
description: FURNIGO_BASE_URL points to the base URL, FURNIGO_API_PATH points to /api path, FURNIGO_WS_URL points to /ws path — update all three if endpoints change

`FURNIGO_BASE_URL` + `FURNIGO_API_PATH` points to the API service's `/api` prefix (e.g. `http://localhost:9411/api`).
`FURNIGO_WS_URL` points to the `/ws` path (e.g. `http://localhost:9411/ws`).

**Why:** These URLs are the single entry points consumed by the mobile app and potentially other clients. They must stay in sync with the backend route prefixes.

**How to apply:** If API route prefixes or WebSocket path change in the backend (e.g. `app.ts` or `ws/handlers.ts`), update the corresponding default values in `.env.development`, `.env.production`, `.env.example`, and `src/apps/mobile/lib/config/env.dart`.
