# C270_FA

This repository is the refactored Butler/C270 project.

Default project repository: https://github.com/frankrainrp/C270-Team2

## Current Architecture

- `apps/api` - Express + Node backend with MongoDB/Mongoose.
- `apps/web` - Next/React frontend with no Next API route handlers.
- `env` - shareable environment templates only.
- `docs` - refactor plan, migration status, and team ownership documentation.
- `complexity` - complexity and readability notes.
- `scripts` - architecture guard tests, runtime smoke tests, and cleanup scripts.

The frontend calls backend functionality through `/express-api/*`. Next.js rewrites those requests to the Express API under `/api/*`.

## Startup Guide

Prerequisites:

- Node.js
- pnpm
- MongoDB running locally or reachable through `MONGO_URL`

Install dependencies:

```powershell
pnpm install
```

Create local environment files:

```powershell
Copy-Item .\env\api.env.example .\apps\api\.env
Copy-Item .\env\web.env.local.example .\apps\web\.env.local
```

Edit API secrets in:

```text
apps/api/.env
```

Required for AI chat:

```env
DEEPSEEK_API_KEY=your_key_here
```

Required for OCR:

```env
MISTRAL_API_KEY=your_key_here
```

Start both apps:

```powershell
pnpm dev
```

Or start them separately:

```powershell
pnpm dev:api
pnpm dev:web
```

Default local URLs:

- Web app: `http://localhost:3000`
- Express API health check: `http://localhost:4010/api/health`
- Frontend proxy health check: `http://localhost:3000/express-api/health`

Runtime env files are intentionally ignored by git:

- API: `apps/api/.env`
- Web: `apps/web/.env.local`

Never commit real API keys or local `.env` files.

## Verification

Run these checks before pushing:

```powershell
pnpm test
pnpm build:web
pnpm build:api
```

Full local verification:

```powershell
pnpm test:all
pnpm test:runtime
```

`pnpm test:runtime` requires MongoDB to be reachable.

## Core Data Ownership

The Express backend owns these core data areas:

- auth users and sessions
- tasks
- notes
- chat sessions and chat messages
- custom panels
- recurring tasks
- storage records for blobs, custom assets, and wallpapers
- AI helper routes for chat, OCR, research, panel generation, source generation, connector proxy, and DDL extraction

Browser `localStorage` remains only for UI preferences and lightweight client settings such as theme, language, model selection, onboarding state, and quota-demo counters.

## Team Ownership Summary

Detailed file ownership is maintained in `docs/team-maintenance-readme.md`.

| Role | Main Scope | Primary Code Areas |
| --- | --- | --- |
| AI Agent Processing Specialist | chat, tool calls, OCR, DDL extraction, agent flows | `apps/api/src/routes/*Chat*`, `apps/api/src/services/*Chat*`, `apps/api/src/services/*Agent*`, `apps/api/src/services/*Ocr*`, `apps/web/src/lib/chat-client.ts`, `apps/web/src/lib/tool-executor.ts` |
| Database And Data Organization Specialist | MongoDB models, persistence services, import/export contracts | `apps/api/src/db`, `apps/api/src/models`, `apps/api/src/services/*Service.ts`, `apps/web/src/lib/backend-api.ts`, `apps/web/src/lib/types.ts` |
| App Shell And UI System Specialist | shell layout, navigation, theme, i18n, responsive UI | `apps/web/src/app`, `apps/web/src/components/layout`, `apps/web/src/components/ChatCanvas.tsx`, `apps/web/src/components/InputPod.tsx`, `apps/web/src/lib/i18n.ts` |
| Learning Productivity Specialist | tasks, calendar, notes, daily overview, achievements, focus tools | `apps/web/src/components/TasksPanel.tsx`, `CalendarPanel.tsx`, `NotesPanel.tsx`, `AchievementsRoom.tsx`, `RecurringTasksManager.tsx`, matching task/note API routes |
| Panels, Connectors, And Visualization Specialist | custom panels, generated panels, connectors, charts, research | `apps/api/src/routes/*Panel*`, `apps/api/src/routes/*Connector*`, `apps/api/src/routes/*Research*`, `apps/web/src/components/CustomPanelView.tsx`, `apps/web/src/lib/panel-*` |
| Platform, Billing, And QA Specialist | env templates, scripts, middleware, health checks, billing, quota, verification | `env`, `scripts`, `apps/api/src/config`, `apps/api/src/middleware`, `apps/api/src/routes/HealthRoutes.ts`, `apps/web/src/lib/billing.ts`, `apps/web/src/lib/usage.ts` |

## Current UI Rule

The newest AI confirmation card is docked directly above the chat input. This behavior is implemented in `apps/web/src/components/ChatCanvas.tsx`.

