---
name: Two environments only
description: Project uses exactly two environments — dev and prod. No staging or other envs.
type: project
originSessionId: 79f82820-6991-4752-b677-1793bc07d5d8
---
Only two environments: **dev** and **prod**.

**Why:** Keeps infrastructure simple for an early-stage project.

**How to apply:** When configuring env vars, deployment, CI/CD, or any environment-specific logic, only account for dev and prod. No staging, QA, or other intermediate environments.
