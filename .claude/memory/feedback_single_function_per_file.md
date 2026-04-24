---
name: Single function per file in API
description: API server code should have one function per file, filename matching the function name
type: feedback
originSessionId: 79f82820-6991-4752-b677-1793bc07d5d8
---
In the API server code, split to one function per file and match the filename to the function name.

**Why:** User's code organization preference — easier to navigate and find functions by filename.

**How to apply:** When creating or refactoring API code (routes, services, etc.), each exported function gets its own file named after the function (e.g. `createOtp.ts` exports `createOtp()`).
