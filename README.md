# C270_FA

This folder is an isolated refactor workspace for the Butler/C270 project.
It does not modify the original `copy` project.

Default project repository: https://github.com/frankrainrp/C270-Team2

## Current Architecture

- `apps/api` - Express + Node + MongoDB/Mongoose backend.
- `apps/web` - Next/React frontend with no Next API route handlers.
- `env` - environment templates only; real local env files stay inside each app.
- `docs` - refactor plan and migration status.
- `complexity` - complexity and readability notes.

The frontend talks to the backend through `/express-api/*`, which is proxied by Next to the Express `/api/*` routes.

Team file ownership is documented in `docs/team-maintenance-readme.md`.

## Core Data Ownership

The transformed backend now owns these core data areas:

- auth users and sessions
- tasks
- notes
- chat sessions and chat messages
- custom panels
- recurring tasks
- storage records for blobs, custom assets, and wallpapers
- AI helper routes such as chat, OCR, research, panel generation, source generation, connector proxy, and DDL extraction

Browser `localStorage` remains only for UI preferences and lightweight client settings such as theme, language, model selection, onboarding, and quota-demo counters.

## Commands

```bash
pnpm install
copy env\api.env.example apps\api\.env
copy env\web.env.local.example apps\web\.env.local
pnpm dev:api
pnpm dev:web
pnpm test
pnpm build
```

Use `pnpm test:all` before considering the refactor complete.

MongoDB must be running for real API runtime verification.

Runtime env files are intentionally ignored by git:

- API: `apps/api/.env`
- Web: `apps/web/.env.local`
