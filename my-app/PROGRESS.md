# 📋 项目进度记录 — 智能多模态学习管家

> 每一次有效改动都记录在此文件中，按时间倒序排列（最新在最上方）。  
> 格式：`## [序号] YYYY-MM-DD HH:mm — 改动标题`

---

## [001] 2026-05-21 12:18 — 初始化 Monorepo 项目骨架

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `my-app/package.json` | 新建 | Monorepo 根包配置，定义 pnpm workspaces 脚本入口 |
| `my-app/pnpm-workspace.yaml` | 新建 | 声明 `apps/*` 与 `packages/*` 为工作区成员 |
| `my-app/turbo.json` | 新建 | Turborepo 构建流水线，定义 `build`、`dev`、`lint` 任务依赖关系 |
| `my-app/tsconfig.json` | 新建 | 全局 TypeScript 根配置，开启严格模式与 `noUncheckedIndexedAccess` |

### 📝 改动描述

根据 `structure.txt` 所定义的技术栈（pnpm workspaces + Turborepo），从零搭建 Monorepo 工程基座。

- 在根目录建立 `package.json`，配置 `turbo run build/dev/lint` 等统一入口脚本。
- 创建 `pnpm-workspace.yaml`，将 `apps/` 与 `packages/` 纳入 pnpm 工作区，实现跨包 `workspace:*` 依赖引用。
- 创建 `turbo.json`，配置任务拓扑依赖（`dependsOn: ["^build"]`），确保下游包在上游包构建完成后才启动。
- 建立全局共享 `tsconfig.json`，以 `ES2022` 为目标，启用最严格的 TypeScript 校验规则。

---

## [002] 2026-05-21 12:19 — 创建前端 Next.js App (`apps/web`)

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `apps/web/package.json` | 新建 | Next.js 14 + Clerk + TailwindCSS 完整依赖声明 |
| `apps/web/next.config.ts` | 新建 | Next.js 配置，启用 Server Components 外部包支持 |
| `apps/web/tailwind.config.ts` | 新建 | TailwindCSS 内容扫描路径配置 |
| `apps/web/src/app/layout.tsx` | 新建 | 根布局，挂载 `<ClerkProvider>`，设置页面 Metadata |
| `apps/web/src/app/page.tsx` | 新建 | 首页，包含 Clerk `auth()` 守卫，未登录自动跳转 `/sign-in` |
| `apps/web/src/app/globals.css` | 新建 | 全局 CSS，注入 Tailwind 指令与 CSS 变量（品牌色 `--color-brand`） |

### 📝 改动描述

搭建 B2C 用户侧的 Next.js 14（App Router）前端应用。

- `package.json` 声明对内部包（`@smart-hub/ai-core`、`@smart-hub/database`、`@smart-hub/workflows`）的 `workspace:*` 依赖，实现 Monorepo 内部类型共享。
- `layout.tsx` 在全局根布局中挂载 Clerk Provider，确保所有子页面均可通过 `auth()` 或 `useUser()` 获取登录态，无需重复初始化。
- `page.tsx` 实现服务端鉴权守卫（`auth()` 返回 `userId`），未登录用户在服务端直接 `redirect`，避免闪烁。
- `globals.css` 定义品牌主色 CSS 变量，为后续组件提供统一主题基础。

---

## [003] 2026-05-21 12:19 — 创建 AI 核心层 (`packages/ai-core`)

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `packages/ai-core/package.json` | 新建 | 包配置，依赖 OpenAI SDK 与 Zod |
| `packages/ai-core/src/prompts/extract-ddl.ts` | 新建 | DDL 提取 Prompt 模块（Git 版本化资产） |
| `packages/ai-core/src/schemas/ddl-schema.ts` | 新建 | Zod 强类型契约：`DdlItemSchema` 与 `DdlExtractionResultSchema` |
| `packages/ai-core/src/index.ts` | 新建 | 包公开 API 统一出口（Barrel Export） |

### 📝 改动描述

严格遵照"Prompt 纯代码化"原则，将所有大模型交互资产定义为受版本控制的 TypeScript 模块。

- `extract-ddl.ts`：`buildExtractDdlPrompt(documentMarkdown)` 函数接收 OCR 后的 Markdown 文本，返回标准 `ChatCompletionMessageParam[]` 数组，包含系统 Prompt（注入当前时间）与用户消息。Prompt 禁止内联在业务代码中，必须通过此模块引用。
- `ddl-schema.ts`：定义 `DdlItemSchema`（单条 DDL，含 `title`、`deadline` ISO 8601、`course`、`description?`）与 `DdlExtractionResultSchema`（批量结果数组 + `confidence` 置信度）。所有 AI 输出在进入业务流前必须经过 `.parse()` 校验，校验失败立即抛出，触发 Inngest 自动重试。
- `index.ts`：统一导出所有公开 API 与类型，外部包通过 `@smart-hub/ai-core` 导入，无需了解内部目录结构。

---

## [004] 2026-05-21 12:19 — 创建数据库层 (`packages/database`)

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `packages/database/package.json` | 新建 | 包配置，依赖 Drizzle ORM 与 postgres.js 驱动 |
| `packages/database/src/schema.ts` | 新建 | Drizzle 表定义：`ddl_tasks`、`upload_logs` |
| `packages/database/src/client.ts` | 新建 | 动态连接池路由核心：`getDbForTenant(tenantId)` |
| `packages/database/src/index.ts` | 新建 | 包公开 API 统一出口 |

### 📝 改动描述

实现高校级多租户架构的数据库层，每所高校拥有完全隔离的独立物理 PostgreSQL 数据库。

- `schema.ts`：定义两张核心表。`ddl_tasks` 存储 AI 提取的截止日期任务，包含 `userId`（Clerk）、`deadline`（带时区 Timestamp）、`calendarEventId`（日历写入后回填，体现只写不读设计）、`confidence`（AI 置信度）。`upload_logs` 记录上传事件的元数据，原始文件经 S3 TTL 物理删除后，此日志仍永久保留，用于审计。
- `client.ts`：`getDbForTenant(tenantId)` 通过动态读取环境变量 `DATABASE_URL_<TENANT_ID>` 获取对应数据库连接串，创建 postgres.js 连接池（max 10 connections）并初始化 Drizzle 实例。使用 `Map` 缓存已创建的连接，避免热路径重复建连。若环境变量缺失，抛出明确错误信息，禁止回退至共享数据库。
- 架构原则：**禁止跨库查询**，`getDbForTenant` 是唯一合法的数据库访问入口。

---

## [005] 2026-05-21 12:20 — 创建异步工作流层 (`packages/workflows`)

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `packages/workflows/package.json` | 新建 | 包配置，依赖 Inngest SDK |
| `packages/workflows/src/inngest-client.ts` | 新建 | Inngest 客户端单例 |
| `packages/workflows/src/process-document.ts` | 新建 | 文档处理主流水线（4 个 Step） |
| `packages/workflows/src/index.ts` | 新建 | 包公开 API 统一出口 |

### 📝 改动描述

实现核心事件驱动的 Serverless 异步工作流，监听 `document/uploaded` 事件并驱动完整处理链路。

- `inngest-client.ts`：创建全局 Inngest 单例（`id: "smart-learning-hub"`），所有工作流函数共享此实例，避免重复初始化。
- `process-document.ts`：`processDocumentWorkflow` 包含 4 个原子 Step：
  1. **`ocr-document`**：从 S3 临时 URL 下载文件，调用开源 OCR 服务转换为 Markdown（当前为 Placeholder，待接入 Marker/Tesseract）。
  2. **`extract-ddl`**：调用 `buildExtractDdlPrompt()` 构建消息，发送至 DeepSeek/OpenAI，响应经 `DdlExtractionResultSchema.parse()` 强类型校验，校验失败自动触发 Inngest 重试。
  3. **`push-to-calendar`**：遍历提取结果，调用 Google/Outlook Calendar API（**仅 write scope**，实现零信任隔离，绝不读取用户现有日历数据）。
  4. **`persist-to-db`**：通过 `getDbForTenant(tenantId)` 路由至正确租户库，批量写入 `ddl_tasks` 与 `upload_logs`。
- 每个 Step 独立原子化，Inngest 在任意 Step 失败时自动重试该 Step 而非整个函数，实现细粒度容错。

---

*最后更新：2026-05-21 12:20*
