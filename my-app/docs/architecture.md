# 🏗️ Architecture

> Butler 的产品定位 + 4 面板信息架构 + 完整代码地图 + 核心数据模型 + 关键技术决策。

---

## 1. 产品定位

### 4 个面板

```
┌─[56px TopBar: Logo + Tab + 搜索 + 用户]──────────────────┐
├─[200px LeftRail]┬──────[Main Canvas]──────────────────────┤
│  随 Tab 切内容  │  ┌─────────────────────────────────────┐ │
│                  │  │ ChatCanvas（漫画式管家在左下浮动）   │ │
│  + New Xxx 主btn │  │ TasksPanel（Linear 风格 + view 切换）│ │
│  Views/Tags 等    │  │ CalendarPanel（月视图 + Day View 双视图）│ │
│  小 widget 可选   │  │ NotesPanel（Phase 3 占位）           │ │
└──────────────────┴───────────────────────────────────────┘
                              │
                  + 右上图标 → MiniAppsDrawer（学习工具仓库，含 Focus Timer）
                  + 编辑任务 → TaskDetailDrawer（右侧 380px 抽屉）
```

### 核心心智

> "AI 是创造者，三个面板（任务/日历/笔记）是用户实际居住的产物。"

任何 UI / 信息架构决策围绕这个心智展开。对话框不是终态，是手段。

### 目标用户优先级

学生 B2C 优先 → 高校机构 B2B 推迟（用户原话）。

---

## 2. 完整代码地图

```
my-app/
├── AGENT.md                ← 入口简报
├── PROGRESS.md             ← 最近 5 条
├── docs/                   ← 详细文档（本文件、workflow / setup / pitfalls / plans）
│   ├── architecture.md     ← (this file)
│   ├── workflow.md
│   ├── setup.md
│   ├── pitfalls.md
│   ├── plans/
│   │   ├── ui-redesign.md  ← UI 重构存档
│   │   └── animation.md    ← Live2D/Rive 计划
│   └── progress/
│       ├── INDEX.md
│       └── 2026-05.md
├── apps/web/
│   ├── .env.local          ← DEEPSEEK_API_KEY（不提交）
│   ├── next.config.js      ← webpack alias（transformers.js 特殊处理）
│   ├── public/assets/      ← 4 张人物 PNG（已 trim 透明边）
│   └── src/
│       ├── app/
│       │   ├── layout.tsx           ← Inter 字体，Clerk 解耦
│       │   ├── page.tsx             ← ★ 顶层状态机（详见 §3）
│       │   ├── globals.css          ← 设计 token（墨绿）+ .message-stream 滚动条
│       │   └── api/
│       │       ├── chat/route.ts          ← V4 Flash 流 + 5 个 tool + 模型白名单
│       │       └── extract-ddls/route.ts  ← V4 Flash tool_choice 强制提取
│       ├── components/
│       │   ├── ChatCanvas.tsx             ← ★ 漫画式：左下大管家浮动 + 历史区 + InputPod
│       │   ├── ButlerCharacter.tsx        ← 3 姿势 PNG 叠层 + fillContainer 模式
│       │   ├── ConfirmCard.tsx            ← AI 写操作核实卡（聊天流嵌入）
│       │   ├── ProcessingPipeline.tsx     ← PDF 4 步可视化（白底墨绿卡）
│       │   ├── InputPod.tsx               ← 嵌入式输入舱 + 模型下拉 + 拖拽上传
│       │   ├── TasksPanel.tsx             ← ★ Linear 风格列表 + view 过滤
│       │   ├── TaskDetailDrawer.tsx       ← ★ 右侧 380px 编辑抽屉（含 status/tags/priority）
│       │   ├── CalendarPanel.tsx          ← ★ 月视图 + DayView 时间轴（点日期进入）
│       │   ├── NotesPanel.tsx             ⏳ Phase 3 占位
│       │   ├── AttachmentPreview.tsx      ← URL/路径/Blob 3 类预览
│       │   ├── MiniAppsDrawer.tsx         ← 右侧学习工具抽屉
│       │   ├── mini-apps/
│       │   │   └── FocusTimer.tsx         ← 番茄钟（环形进度 + 25/45/60 preset）
│       │   └── layout/
│       │       ├── TopBar.tsx             ← 56px 顶 Bar（含 Apps 按钮 + 用户菜单）
│       │       ├── LeftRail.tsx           ← 200px 容器 + RailPrimaryBtn/Item/GroupTitle
│       │       ├── ChatRail.tsx           ← + New Chat + Recent Chats（取代旧 SessionListPanel）
│       │       ├── TasksRail.tsx          ← Views 5 个可切换 + 真实计数
│       │       ├── CalendarRail.tsx       ← 迷你月历占位 + Calendars 分类
│       │       └── NotesRail.tsx          ← Phase 3 占位
│       └── lib/
│           ├── types.ts                   ← ★ DdlItem / ChatMessage / ChatSession / TaskStatus / TaskPriority
│           ├── db.ts                      ← Dexie v4：ddls/messages/blobs/sessions
│           ├── ai-models.ts               ← 模型注册表（V4 Flash/V3.1/Reasoner）
│           ├── ai-tools.ts                ← 5 个 tool schema
│           ├── tool-executor.ts           ← create/update/delete → addPending；toggle/list 直接执行
│           ├── pending.ts                 ← PendingChange + PendingBatch + applyBatch
│           ├── chat-client.ts             ← SSE 解析 + 多轮 tool 循环
│           ├── document-parser.ts         ← unpdf PDF→text + 关键词过滤
│           ├── semantic-filter.ts         ← MiniLM CDN 语义粗筛
│           ├── blobs.ts                   ← Dexie blobs 表 CRUD
│           ├── ics-export.ts              ← RFC 5545 .ics
│           ├── json-export.ts             ← JSON 全量备份
│           └── mock-pipeline.ts           ← 4 步流元数据
└── packages/                              ← Monorepo（Phase 4 真接入）
    ├── ai-core/                           ← Zod schemas（与 lib/types.ts 对齐）
    ├── database/                          ← Drizzle + getDbForTenant 多租户
    └── workflows/                         ← Inngest 工作流
```

---

## 3. 顶层状态机（page.tsx）

`page.tsx` 是单一信源，所有 state 在这里。子组件纯渲染 + emit 事件。

### 主要 state

| State | 类型 | 说明 |
|---|---|---|
| `activeNav` | `NavId` (`chat`/`tasks`/`calendar`/`notes`) | 当前 Tab |
| `messages` | `ChatMessage[]` | 全 session 共池，按 `sessionId` 过滤渲染 |
| `sessions` | `ChatSession[]` | 多会话元数据 |
| `activeSessionId` | `string \| null` | 当前会话 |
| `ddls` | `DdlItem[]` | 全局任务/日历共享数据（不绑 session） |
| `pendingBatches` | `Record<string, PendingBatch>` | AI 写操作待核实队列 |
| `pipelines` | `Record<string, ProcessingPipeline>` | PDF 4 步流 |
| `selectedModel` | `AiModelId` | 当前 AI 模型（localStorage 持久化） |
| `taskView` | `TaskViewId` | Tasks 当前视图（active/upcoming/...）|
| `butlerPose` | useMemo | 派生自 isLoading + pendingBatches + pointoutHold |
| `editing` | `EditingTarget \| null` | TaskDetailDrawer 当前编辑目标 |
| `miniAppsOpen` | `boolean` | 学习工具抽屉 |

### 持久化

- `ddls` / `messages` / `sessions` → Dexie v4（自动迁移 v3）
- `selectedModel` → localStorage（`butler.selectedModel`）
- `pendingBatches` / `pipelines` / `miniAppsOpen` → **不持久化**（重启清）

---

## 4. 核心数据模型

### `DdlItem`（任务 = 日历共享）

```ts
interface DdlItem {
  id: string;
  taskName: string;
  weight: number | null;             // 学术权重 0-100，非学术 null
  dueDate: string;                   // YYYY-MM-DD 或 "" = "待定"
  dueTime: string;                   // HH:MM
  description: string;
  isGroupWork: boolean;
  source: string;                    // "AI 创建" / "手动添加" / 课件文件名
  completed: boolean;                // 保留兼容；新逻辑用 status
  notes?: string;
  attachments?: DdlAttachment[];     // URL / filepath / blob 3 类
  // v4 新字段
  status?: TaskStatus;               // "todo" | "in_progress" | "done"
  tags?: string[];
  priority?: TaskPriority;           // "low" | "med" | "high"
}
```

### 待核实门控

```ts
interface PendingBatch {
  id: string;
  sessionId: string;
  changes: PendingChange[];          // PendingCreate | PendingUpdate | PendingDelete
  origin: "ai-chat" | "pdf-extract";
  intro: string;                     // 给 ConfirmCard 顶部显示
  status: "pending" | "accepted" | "rejected";
}
```

流程：AI tool_call → `tool-executor.ts addPending(change)` → `page.tsx setPendingBatches` →
`ChatCanvas` 渲染 `ConfirmCard` → 用户点接受 → `applyBatch()` → `setDdls()`。

---

## 5. 关键技术决策（不要回退）

| 决策 | 原因 | 文件 |
|---|---|---|
| DeepSeek-V4 Flash 默认 + 用户可切换 | V4 Flash 比 V3 便宜 3-25 倍 | `lib/ai-models.ts` |
| 客户端 unpdf | 隐私 + 0 API 费 | `lib/document-parser.ts` |
| MiniLM via CDN + `new Function("u","return import(u)")` | 绕开 transformers.js webpack 冲突 | `lib/semantic-filter.ts` |
| Dexie v4 + IndexedDB | 个人 MVP 0 部署 0 月费 | `lib/db.ts` |
| Phase 3 走 Tauri 而非 Electron | 体积小一个数量级 + 用户明确选 | — |
| 关键词过滤 + 语义粗筛双层 | 砍 60-80% input token | `lib/document-parser.ts` + `semantic-filter.ts` |
| AI 不准瞎猜 | dueDate → 空串"待定"；weight → null | `app/api/extract-ddls/route.ts` |
| AI 写操作走 ConfirmCard | 用户必须核实才落库 | `lib/tool-executor.ts` + `ConfirmCard.tsx` |
| 管家 PNG 抠白底（方案 C） | mix-blend-mode 不够干净 | `apps/web/public/assets/butler-*.png` |
| 设计语言：墨绿 + 平面 | 与 Linear/Notion 对齐，去玻璃化 | `app/globals.css` |

---

## 6. AI Tool 调用矩阵

| Tool | 走 ConfirmCard | 直接执行 | 用途 |
|---|---|---|---|
| `create_item` | ✅ | | 新建任务/事件（草稿入 pending） |
| `update_item` | ✅ | | 修改（patch 入 pending） |
| `delete_item` | ✅ | | 删除（快照入 pending） |
| `toggle_complete` | | ✅ | 高频低风险，直接改 completed |
| `list_items` | | ✅（只读） | AI 查询当前 ddls |

Reasoner 模型不支持工具，自动跳过（见 `app/api/chat/route.ts`）。

---

*最后更新：2026-05-24*
