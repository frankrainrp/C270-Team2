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

### Frontend Page Breakdown

`apps/web/src/app/page.tsx` is the page composition shell. It should wire global state, refs, panels, and chat flow together, while feature-specific behavior should live in owned components, hooks, or library modules.

| Responsibility | Owner Role | Primary Paths |
| --- | --- | --- |
| Page composition, layout wiring, modal/panel placement, global UI state | App Shell And UI System Specialist | `apps/web/src/app/page.tsx`, `apps/web/src/components/layout/*`, `apps/web/src/components/{ChatCanvas,InputPod,MiniAppsDrawer,PreferencesPanel,Toast}.tsx` |
| AI pending review batches for generated tasks, notes, panels, accept/reject/drop behavior | AI Agent Processing Specialist | `apps/web/src/hooks/usePendingBatches.ts`, `apps/web/src/lib/pending.ts`, `apps/web/src/lib/tool-executor.ts`, `apps/web/src/components/ConfirmCard.tsx` |
| Recurring task creation and materializing daily task instances | Learning Productivity Specialist | `apps/web/src/hooks/useRecurringTasks.ts`, `apps/web/src/lib/recurring.ts`, `apps/web/src/components/RecurringTasksManager.tsx` |
| Task, calendar, note, daily overview, and study-tool surfaces | Learning Productivity Specialist | `apps/web/src/components/{TasksPanel,CalendarPanel,NotesPanel,NotesPreview,DailyBrief,TodayHero}.tsx`, `apps/web/src/components/mini-apps/*` |
| Backend data contracts and browser data adapters | Database And Data Organization Specialist | `apps/api/src/{db,models,routes,services}`, `apps/web/src/lib/{backend-api,types,json-export,ics-import,ics-export,blobs,storage-client,custom-panels}.ts` |
| Custom panels, connectors, research, generated sources, visualization modules | Panels, Connectors, And Visualization Specialist | `apps/api/src/routes/{Connector,CustomPanel,GeneratePanel,GenerateSource,Research}Routes.ts`, `apps/web/src/components/{CustomPanelView,DataSourceBuilder,GeneratedPanelView}.tsx`, `apps/web/src/components/panel-modules/*` |
| Project config, env templates, guards, billing/quota UI, verification scripts | Platform, Billing, And QA Specialist | root workspace files, `env`, `scripts`, `docs`, `complexity`, `apps/web/src/lib/{api-guard,billing,credits,usage,wallpaper}.ts` |

| Role | Managed Files / Areas |
| --- | --- |
| AI Agent Processing Specialist | `apps/api/src/routes/{Agent,Chat,ExtractDdl,Ocr}Routes.ts`, `apps/api/src/services/{Agent,AgentLog,Ai,Chat,ChatToolDefinitions,ExtractDdl,Ocr}*.ts`, `apps/api/src/models/AgentLogModel.ts`, `apps/web/src/hooks/usePendingBatches.ts`, `apps/web/src/lib/{ai-models,ai-tools,chat-client,tool-executor,document-parser,semantic-filter,pending}.ts`, `apps/web/src/lib/ocr/*`, `apps/web/src/components/{ProcessingPipeline,ConfirmCard}.tsx` |
| Database And Data Organization Specialist | `apps/api/src/db`, `apps/api/src/models`, `AuthService.ts`, `ChatHistoryService.ts`, `GenericDataService.ts`, `NoteService.ts`, `TaskService.ts`, `AuthRoutes.ts`, `StorageRoutes.ts`, `TaskRoutes.ts`, `NoteRoutes.ts`, `apps/web/src/lib/{backend-api,types,json-export,ics-import,ics-export,blobs,storage-client,custom-panels,recurring}.ts` |
| App Shell And UI System Specialist | `apps/web/src/app`, `apps/web/src/components/layout`, `apps/web/src/components/ui`, `apps/web/src/components/{AuthGate,ChatCanvas,InputPod,KeyboardShortcutsHelp,MiniAppsDrawer,OnboardingTour,PreferencesPanel,Toast,WallpaperLayer,EmptyIllustrations}.tsx`, `apps/web/src/lib/{i18n,layout-prefs,theme,use-is-mobile}.ts` |
| Learning Productivity Specialist | `apps/web/src/hooks/useRecurringTasks.ts`, `apps/web/src/components/{TasksPanel,CalendarPanel,NotesPanel,NotesPreview,AchievementsRoom,RecurringTasksManager,TaskDetailDrawer,DailyBrief,TodayHero}.tsx`, `apps/web/src/components/mini-apps/*`, `apps/web/src/lib/{demo-data,mock-pipeline,recurring,streak}.ts`, task/note/recurring routes, services, and models |
| Panels, Connectors, And Visualization Specialist | `apps/api/src/routes/{Connector,CustomPanel,GeneratePanel,GenerateSource,Research}Routes.ts`, `apps/api/src/services/{Connector,GeneratePanel,GenerateSource,Research}Service.ts`, `apps/web/src/components/{CustomPanelView,DataSourceBuilder,GeneratedPanelView}.tsx`, `apps/web/src/components/panel-modules/*`, `apps/web/src/lib/{connector-client,panel-data,panel-generator,panel-local,panel-schema,research-assembler,research-client}.ts` |
| Platform, Billing, And QA Specialist | root package/workspace files, `env`, `scripts`, `docs`, `complexity`, `apps/api/src/{app,server}.ts`, `apps/api/src/config`, `apps/api/src/middleware`, `apps/api/src/routes/HealthRoutes.ts`, `apps/api/src/utils`, `apps/web/src/components/{AttachmentPreview,BillingPanel,CheckoutModal,PricingModal,QuotaWallModal}.tsx`, `apps/web/src/lib/{api-guard,billing,credits,sound,usage,wallpaper}.ts` |

## Current UI Rule

The newest AI confirmation card is docked directly above the chat input. This behavior is implemented in `apps/web/src/components/ChatCanvas.tsx`.
