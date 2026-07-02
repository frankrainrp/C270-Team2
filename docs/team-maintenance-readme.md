# C270_FA Team Maintenance README

Default repository: https://github.com/frankrainrp/C270-Team2

This README maps the refactored Express + Node + MongoDB project into six maintenance areas. Use it to assign files, review ownership, and keep future changes from spreading across unrelated modules.

## 1. AI Agent Processing Specialist

Scope: chat, tool calls, OCR, DDL extraction, AI workflows, agent logs.

Primary files:

- `apps/api/src/services/ChatService.ts`
- `apps/api/src/services/ChatToolDefinitions.ts`
- `apps/api/src/services/AgentService.ts`
- `apps/api/src/services/AgentLogService.ts`
- `apps/api/src/routes/AgentRoutes.ts`
- `apps/api/src/routes/ChatRoutes.ts`
- `apps/api/src/routes/ExtractRoutes.ts`
- `apps/api/src/routes/OcrRoutes.ts`
- `apps/api/src/services/ExtractService.ts`
- `apps/api/src/services/OcrService.ts`
- `apps/web/src/lib/chat-client.ts`
- `apps/web/src/lib/ai-tools.ts`
- `apps/web/src/lib/tool-executor.ts`
- `apps/web/src/lib/document-parser.ts`
- `apps/web/src/lib/ocr/*`

## 2. Database And Data Organization Specialist

Scope: MongoDB models, local client data model compatibility, import/export, period data, persistence contracts.

Primary files:

- `apps/api/src/db/MongoConnection.ts`
- `apps/api/src/models/*`
- `apps/api/src/services/AuthService.ts`
- `apps/api/src/services/TaskService.ts`
- `apps/api/src/services/NoteService.ts`
- `apps/api/src/services/ChatHistoryService.ts`
- `apps/api/src/services/CustomPanelService.ts`
- `apps/api/src/services/RecurringTaskService.ts`
- `apps/api/src/routes/AuthRoutes.ts`
- `apps/api/src/routes/TaskRoutes.ts`
- `apps/api/src/routes/NoteRoutes.ts`
- `apps/api/src/routes/ChatHistoryRoutes.ts`
- `apps/web/src/lib/backend-api.ts`
- `apps/web/src/lib/types.ts`
- `apps/web/src/lib/json-export.ts`
- `apps/web/src/lib/ics-import.ts`
- `apps/web/src/lib/ics-export.ts`
- `apps/web/src/lib/recurring.ts`

## 3. App Shell And UI System Specialist

Scope: page shell, theme, i18n, navigation, responsive layout, global styles.

Primary files:

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/components/layout/*`
- `apps/web/src/components/PreferencesPanel.tsx`
- `apps/web/src/components/KeyboardShortcutsHelp.tsx`
- `apps/web/src/components/AuthGate.tsx`
- `apps/web/src/components/Toast.tsx`
- `apps/web/src/components/MobileTabBar.tsx`
- `apps/web/src/lib/i18n.ts`
- `apps/web/src/lib/theme.ts`
- `apps/web/src/lib/layout-prefs.ts`
- `apps/web/src/lib/use-is-mobile.ts`

## 4. Learning Productivity Specialist

Scope: tasks, calendar, notes, daily overview, achievements, focus tools.

Primary files:

- `apps/web/src/components/TasksPanel.tsx`
- `apps/web/src/components/TaskDetailDrawer.tsx`
- `apps/web/src/components/TaskEditModal.tsx`
- `apps/web/src/components/CalendarPanel.tsx`
- `apps/web/src/components/NotesPanel.tsx`
- `apps/web/src/components/NotesPreview.tsx`
- `apps/web/src/components/DailyBrief.tsx`
- `apps/web/src/components/AchievementsRoom.tsx`
- `apps/web/src/components/FocusTimer.tsx`
- `apps/web/src/components/RecurringTasksManager.tsx`
- `apps/web/src/lib/streak.ts`
- `apps/web/src/lib/demo-data.ts`
- `apps/web/src/lib/mock-pipeline.ts`
- `apps/api/src/routes/TaskRoutes.ts`
- `apps/api/src/routes/NoteRoutes.ts`
- `apps/api/src/routes/RecurringTaskRoutes.ts`

## 5. Panels, Connectors, And Visualization Specialist

Scope: AI-generated panels, data sources, charts, connectors, research.

Primary files:

- `apps/web/src/components/CustomPanelView.tsx`
- `apps/web/src/components/GeneratedPanelView.tsx`
- `apps/web/src/components/DataSourceBuilder.tsx`
- `apps/web/src/components/PanelModules.tsx`
- `apps/web/src/lib/panel-schema.ts`
- `apps/web/src/lib/panel-data.ts`
- `apps/web/src/lib/panel-local.ts`
- `apps/web/src/lib/custom-panels.ts`
- `apps/api/src/routes/CustomPanelRoutes.ts`
- `apps/api/src/routes/ConnectorRoutes.ts`
- `apps/api/src/routes/GeneratePanelRoutes.ts`
- `apps/api/src/routes/GenerateSourceRoutes.ts`
- `apps/api/src/routes/ResearchRoutes.ts`
- `apps/api/src/services/ConnectorService.ts`
- `apps/api/src/services/GeneratePanelService.ts`
- `apps/api/src/services/GenerateSourceService.ts`
- `apps/api/src/services/ResearchService.ts`

## 6. Platform, Billing, And QA Specialist

Scope: preferences, billing simulation, quota, upload preview, safety guards, scripts, verification.

Primary files:

- `apps/web/src/components/BillingPanel.tsx`
- `apps/web/src/components/PricingModal.tsx`
- `apps/web/src/components/CheckoutModal.tsx`
- `apps/web/src/components/AttachmentPreview.tsx`
- `apps/web/src/components/WallpaperLayer.tsx`
- `apps/web/src/lib/usage.ts`
- `apps/web/src/lib/sound.ts`
- `apps/web/src/lib/wallpaper.ts`
- `apps/api/src/config/Env.ts`
- `apps/api/src/middleware/ErrorHandler.ts`
- `apps/api/src/middleware/ValidateRequest.ts`
- `apps/api/src/routes/HealthRoutes.ts`
- `scripts/refactor-guard.test.mjs`
- `scripts/runtime-smoke.mjs`
- `scripts/CleanGenerated.mjs`
- `docs/refactor-plan.md`
- `docs/migration-status.md`

## Maintenance Rule

When a change touches more than two areas, open with a short design note first. Keep Express API ownership in `apps/api`, keep browser UI ownership in `apps/web`, and keep data persistence contracts documented in tests or migration status.
