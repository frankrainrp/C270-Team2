# 🤖 AGENT.md — 接班简报

> 这份文件是给**下一个接手的 AI agent**看的项目入门简报。
> 你的目标是：在 5 分钟内理解产品定位 / 当前进度 / 工作约定，避免重复踩前任踩过的坑。

---

## 0. TL;DR（一句话）

**Butler / 智能多模态学习管家** 是一个 **AI 驱动的 4 面板 Personal Learning OS**——用户和 AI 对话或丢 PDF，AI 把内容**结构化**为任务 / 日历 / 笔记并持续维护。**不是 ChatGPT 克隆**。

---

## 1. 必读文件（按顺序）

| 顺序 | 路径 | 看什么 |
|---|---|---|
| 1 | `my-app/PROGRESS.md` | **权威进度日志**，按时间倒序。最新条目就是当前状态 |
| 2 | `~/.claude/projects/D--User-asus-Desktop-Bulter/memory/MEMORY.md` | 9 条关键决策记忆，每条都点开看 |
| 3 | `creating bg_content/framework.txt` | 项目最初的架构蓝图（6 维度全景） |
| 4 | `creating bg_content/chat_UI.txt` | UI 视觉规范（玻璃态、网格背景、三层装饰板） |
| 5 | `my-app/apps/web/src/app/page.tsx` | 顶层状态编排，所有功能在这里串起来 |
| 6 | `my-app/apps/web/src/lib/types.ts` | 核心类型（DdlItem / DdlAttachment / NavId）一次性看完 |

读完前 2 项就能开工，剩下按需。

---

## 2. 产品定位

### 4 个面板（左侧栏导航）

```
┌─[68px Sidebar]─┬──────────────[Main Canvas]───────────┐
│  Logo (Butler) │                                       │
│  + 新建对话    │  根据 activeNav 切换 4 个面板：       │
│                │  ┌─────────────────────────────────┐ │
│  💬 AI 对话    │  │ ChatCanvas + InputPod           │ │
│  ☑ 每日任务    │  │ TasksPanel  (含 CRUD + ICS/JSON) │ │
│  📅 日历       │  │ CalendarPanel (月视图 + CRUD)   │ │
│  📝 笔记       │  │ NotesPanel (Phase 3 占位)       │ │
│                │  └─────────────────────────────────┘ │
│  ⚙ 设置        │                                       │
│  👤 用户       │  (TaskEditModal & AttachmentPreview  │
└────────────────┴   作为浮层渲染在主区上方)              ┘
```

### 核心心智
> "AI 是创造者，三个面板（任务/日历/笔记）是用户实际居住的产物。"

**任何 UI / 信息架构决策都应围绕这个心智展开。**对话框不是终态，是手段。

### 目标用户优先级
学生 B2C 优先 → 高校机构 B2B 推迟（用户原话）。

---

## 3. 当前进度（截至 2026-05-22）

### Phase 2 已完成 ✅
- 4 面板架构 + 路由切换
- AI 对话（DeepSeek-V4 Flash，流式 + 5 工具 tool calling：create/update/delete/toggle/list_item）
- PDF 上传 → 客户端 unpdf 解析 → MiniLM 语义粗筛 → V4 Flash 提取 DDL → 落 Tasks/Calendar
- TasksPanel/CalendarPanel 完整 CRUD（modal、行内编辑、删除）
- Dexie (IndexedDB) 持久化（v2 schema，含 blobs 表）
- 备注 + 3 类附件（URL / filepath / blob）+ 附件预览 modal
- AI 质量护栏（未知字段→空字符串/null，禁止瞎猜兜底）
- ICS 日历订阅文件导出
- JSON 全量导出/导入

### Phase 3 未启动 ⏳（**Tauri 桌面壳**触发）
- NotesPanel 真实实现（Obsidian 风格 + 本地 Vault 读写）
- filepath 附件一键"打开所在文件夹"
- 原生通知取代 ICS 订阅
- 本地文件系统级权限

### Phase 4 未启动 ⏳（**云后端**触发）
- `/api/chat` 接 DeepSeek V4 Flash（**已经做了**——其实这一步在 Phase 2 提前接了）
- 真实 Inngest 工作流（OCR/写 Google Cal/落 DB）
- 多租户 Postgres 分库（用 Neon）
- Clerk 鉴权重新接入（layout.tsx 当前已解耦）

---

## 4. 代码地图

```
my-app/
├── PROGRESS.md           ← 进度日志（每次有效改动都追加）
├── AGENT.md              ← 你正在看的文件
├── apps/web/
│   ├── .env.local        ← DEEPSEEK_API_KEY（用户已填，别上传 git）
│   ├── next.config.js    ← 含 webpack alias，注意 transformers.js 的特殊处理
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           ← 根布局（Inter 字体，Clerk 已解耦）
│   │   │   ├── page.tsx             ← ★ 顶层状态机
│   │   │   ├── globals.css          ← 设计 token + 网格背景 + tooltip
│   │   │   └── api/
│   │   │       ├── chat/route.ts          ← V4 Flash 流式 + 5 个工具
│   │   │       └── extract-ddls/route.ts  ← V4 Flash 强制 tool_call 提取
│   │   ├── components/
│   │   │   ├── Sidebar.tsx                ← 4 项导航 + Logo + 用户头像
│   │   │   ├── ChatCanvas.tsx             ← 消息流 + Markdown + Pipeline 消息
│   │   │   ├── InputPod.tsx               ← 输入舱（拖拽上传 + 文件 chip）
│   │   │   ├── ProcessingPipeline.tsx     ← 4 步 Stepper 可视化
│   │   │   ├── TasksPanel.tsx             ★ 任务面板（CRUD + 附件 chip）
│   │   │   ├── CalendarPanel.tsx          ★ 月视图（点格建事件）
│   │   │   ├── NotesPanel.tsx             ⏳ 占位（待 Tauri）
│   │   │   ├── TaskEditModal.tsx          ← 任务编辑 modal（含附件编辑器）
│   │   │   ├── AttachmentPreview.tsx      ← URL/路径/Blob 三类预览
│   │   │   └── ui/
│   │   │       ├── DecoLayered.tsx        ← 三层装饰板（来自 chat_UI.txt 规范）
│   │   │       └── GlassButton.tsx        ← 玻璃态按钮（来自 chat_UI.txt）
│   │   └── lib/
│   │       ├── types.ts                   ★ 所有共享类型
│   │       ├── db.ts                      ← Dexie 单例 + schema v2
│   │       ├── blobs.ts                   ← Blob 表 CRUD
│   │       ├── chat-client.ts             ← SSE 解析 + tool 循环（客户端）
│   │       ├── ai-tools.ts                ← 5 个 tool schema 定义
│   │       ├── tool-executor.ts           ← AI tool_call → setDdls 实现
│   │       ├── document-parser.ts         ← unpdf PDF→text + 关键词过滤
│   │       ├── semantic-filter.ts         ← MiniLM CDN 语义粗筛（new Function 绕过 webpack）
│   │       ├── ics-export.ts              ← .ics 日历文件生成
│   │       ├── json-export.ts             ← JSON 全量导入/导出
│   │       └── mock-pipeline.ts           ← 4 步流的 step 元数据 + 步骤耗时
└── packages/                ← Monorepo（Phase 4 才会真接上）
    ├── ai-core/             ← Zod schemas（与 lib/types.ts 字段对齐）
    ├── database/            ← Drizzle schema + getDbForTenant（多租户）
    └── workflows/           ← Inngest 工作流定义
```

---

## 5. 关键技术决策（不要回退）

| 决策 | 原因 |
|---|---|
| **DeepSeek-V4 Flash**（`deepseek-v4-flash`） | 比 V3 便宜 3-25 倍。`deepseek-chat` 将弃用。详见 `memory/project_deepseek_v4_flash.md` |
| **客户端 unpdf** | 隐私好、0 API 费、文件不出浏览器 |
| **MiniLM-L6-v2 via CDN + `new Function("u","return import(u)")`** | 解决 transformers.js npm 包与 webpack onnxruntime-node 冲突 |
| **Dexie v2 + blobs 表** | 个人 MVP 0 部署 0 月费。Phase 3 切 Tauri SQLite，Phase 4 切 Neon |
| **Phase 3 走 Tauri**（不是 Electron） | 体积小一个数量级，用户明确选择"读写本地 Obsidian Vault" |
| **关键词过滤 + 语义粗筛 双层** | 砍 60-80% input token，C245 PDF 实测从 ¥0.008 降至 ¥0.003/份 |
| **AI 不准瞎猜** | dueDate 未明确 → 传空串 `""` 显示「待定」；weight 未明确 → `null`。禁止学期末兜底 |

---

## 6. 工作流约定（必须遵守）

### A. Token 效率（用户预算敏感，反复强调）
- 系统 prompt 精简到 200 token 以内
- 历史消息截断（仅发最近 ~10 条）
- contextSummary 限 20 条 item
- 测试阶段一次跑 2-3 场景，不要为了"覆盖所有 case"消耗大量 token
- 保持 system prompt 稳定让 DeepSeek cache hit 命中（输入价 1/25）
- 详见 `memory/feedback_token_efficiency.md`

### B. PM 对齐优先
- 接到"作为 PM" / "重新设计" / "不到预期" 信号 → **绝对不要直接改代码**
- 先用 `AskUserQuestion` 收敛 3-4 个关键决策（痛点 / 信息架构 / 目标用户 / 近期交付物）
- 遇到技术红旗（如"读写本地 Vault" 在 Web 做不到）立刻拉旗 + 给选项，让用户拍板
- 详见 `memory/feedback_pm_alignment_first.md`

### C. PROGRESS.md 是真相
- 每次完成一组改动（≥ 创建/重写多个组件级别）→ **必须**追加新条目到 PROGRESS.md 顶部
- 格式：`## [序号] YYYY-MM-DD — 标题` + 涉及文件表 + 改动描述
- 详见 `memory/reference_progress_log.md`

### D. UI 已 baseline 合格
- **不要主动重做视觉**。用户原话「UI 暂时算合格先处理实际功能」
- 改 UI 前先问用户具体哪里不对
- 详见 `memory/feedback_ui_acceptable_baseline.md`

### E. 用 TaskCreate / TaskUpdate 跟踪进度
- ≥ 3 步的任务 **必须** 拆 task list
- 开始一个 task → in_progress；完成 → completed
- 让用户实时看到进度，避免反复确认

---

## 7. 已知陷阱（前任踩过的坑）

| 陷阱 | 解决方案 |
|---|---|
| `@huggingface/transformers` npm 包 webpack 打包失败 | 用 CDN + `new Function("u","return import(u)")` 隐藏 dynamic import（`semantic-filter.ts`） |
| unpdf 浏览器 `mergePages: true` 在 +esm CDN 版本会返回空（仅 npm 版本 OK） | `document-parser.ts` 使用 npm import，**不要**改成 CDN |
| 关键词过滤后 PDF 文本只剩 1 大段（无换行），semantic 算分被稀释 | semantic-filter 自己再做激进 split：`[.!?。！？；;]\s+\|\n+\|\s{2,}\|•\s+`，少于 5 段时启用 180 字滑窗 |
| React 18 StrictMode 让 console.log 双触发，看起来"tool 调了 6 次"，实际只 1 次 | 这是 dev only，生产无影响。`setDdls` 内部按 id 去重 |
| Dexie 启动 load 时 hydration 与首次 setState 竞态会清空 IDB | 用 `hydrated` 状态门控（见 `page.tsx`），首次 IDB load 完才允许 sync |
| `preview_click` 不一定触发 React onClick（React 合成事件特殊） | 改用 `document.querySelector(sel).click()` via `preview_eval` |
| `preview_fill` 设置 controlled input 不触发 React onChange | 用原生 setter + `dispatchEvent('input')` |
| Next.js dev HMR 缓存 dynamic import 模块 → 修改不生效 | 必要时 `Get-Process node \| Stop-Process` + 重启 dev server |
| Windows PowerShell `&&` 不支持 | 用 `;` 或 `if ($?) { B }` |
| Bash 工具在 Windows 下 cwd 会丢失 | PowerShell 工具用 `Set-Location` 显式设置 |

---

## 8. 启动 + 测试

```pwsh
# 启动 dev server
cd my-app/apps/web
pnpm dev               # 跑在 http://localhost:3000

# TS 检查
pnpm exec tsc --noEmit

# 安装新依赖
pnpm add <pkg>
```

环境变量（`apps/web/.env.local`）：
```
DEEPSEEK_API_KEY=sk-...      # 用户已填
DEEPSEEK_MODEL=deepseek-v4-flash  # 可省，默认就是这个
```

**测试 PDF**：`D:\User\asus\Desktop\Bulter\C245_Data_Analytics_Welcome.pdf`（用户本机已有，23 页/1.4MB 真实 syllabus）。
浏览器自动化测试时把它 cp 到 `apps/web/public/test.pdf` 即可 `fetch('/test.pdf')`。

---

## 9. 下一步候选（按推荐优先级）

| 优先 | 任务 | 工作量 | 价值 |
|---|---|---|---|
| 🟢 | **Sidebar 多会话管理** | ~2-3h | 现在所有对话挤同一 session，"新对话"按钮只切 tab 没真清空 |
| 🟢 | **ICS 订阅端点**（`/api/ics/[userId]/feed.ics`） | ~1h | 现有 ICS 是手动下载文件；做成 URL 订阅后手机日历自动每日拉取，无需重新导入 |
| 🟡 | **Tauri 桌面壳启动** | 1-2 天 | 解锁 filepath 一键打开、本地 Vault 直读、原生通知。**整个 Phase 3 序章** |
| 🟡 | **AI 主动提示**（"今天有 5 项待办"等） | ~2h | 用户登录/打开 App 时 AI 自动用 contextSummary 生成问候+概览 |
| 🟠 | **Markdown 备注预览** | ~30min | TasksPanel 行点击 chip 时弹长备注的 markdown 渲染 |
| 🔴 | **多模态扫描件 OCR**（Mistral OCR） | 0.5-1 day | 当前 unpdf 仅支持文字型 PDF；扫描件 / 手机拍的课件读不了 |
| 🔴 | **Clerk 鉴权 + Neon 多租户** | 2-3 day | Phase 4 启动，准备上云 |

---

## 10. 接班时该做的第一件事

1. 读 `PROGRESS.md` 第一条（最新进度）
2. 跑一次 `pnpm dev` 在浏览器里点一遍 4 个面板，体感一下
3. 问用户："你想继续 [PROGRESS 最新进度的下一步]，还是别的方向？"
4. 用户答了再用 `TaskCreate` 拆 task 开干

**不要**：
- 不要凭印象写代码（DeepSeek 版本/价格随时变化，先 WebSearch）
- 不要"顺便"改 UI（用户说 UI 合格了）
- 不要让 AI 流任意调多轮工具（费 token）
- 不要直接合并 PR / 推送 git（用户没要求就别做）

---

*最后更新：2026-05-22*
