---
name: Prefer spreading syntax
description: Use object/array spreading instead of imperative mutation patterns
type: feedback
originSessionId: 79f82820-6991-4752-b677-1793bc07d5d8
---
Prefer object or array spreading syntax over imperative push/assign patterns.

**Why:** User's code style preference — cleaner, more declarative.

**How to apply:** Use `[...arr, item]` over `arr.push(item)`, and `{ ...obj, key: val }` over `Object.assign` or mutation. Applies to both TypeScript and Dart (`...` spread operator).
