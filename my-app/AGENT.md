# 🤖 AGENT.md — Butler 接班简报（入口）

> **5 分钟入门**。这份文件刻意短（< 200 行），按需打开 `docs/*`。
> 写法参考 [Anthropic Claude Code 官方 best practice](https://code.claude.com/docs/en/best-practices)。

---

## 0. TL;DR

**Butler / 智能多模态学习管家** = **AI 驱动的 4 面板 Personal Learning OS**（Chat / Tasks / Calendar / Notes）。
用户和管家（AI）对话或丢 PDF，管家结构化为任务 / 日历 / 笔记并持续维护。
**不是 ChatGPT 克隆**。

---

## 1. 当前 Phase 与最新进度

- **Phase 2 完成 ✅**（PROGRESS 最新 [026]）
- UI 重构 5 stage 全部收尾（Stage A 顶 Tab → E 全局清理）
- **管家形象 + ConfirmCard 核实门控 + Mini Apps Drawer + 模型切换 + Stage C.2 字段扩展** 都已落地
- Phase 3（Tauri 桌面壳）/ Phase 4（Clerk + Neon 多租户）未启动

---

## 2. 必读（按顺序，越往下越按需）

| # | 文件 | 看什么 | 强制读 |
|---|---|---|---|
| 1 | [PROGRESS.md](PROGRESS.md) 第一条 | **当前最新进度**，下一步从这里推算 | ✅ IMPORTANT |
| 2 | [docs/architecture.md](docs/architecture.md) | 4 面板 / 代码地图 / 共享类型 / 关键技术决策 | ✅ IMPORTANT |
| 3 | [docs/workflow.md](docs/workflow.md) | Token 效率 / PM 对齐 / PROGRESS 规范 / UI baseline | ✅ IMPORTANT |
| 4 | [docs/setup.md](docs/setup.md) | 启动 / 测试 / 环境变量 / 模型切换 | 用到再读 |
| 5 | [docs/pitfalls.md](docs/pitfalls.md) | 已知陷阱（前任踩过的坑） | 报错再读 |
| 6 | [docs/plans/](docs/plans/) | UI 重构存档 / Live2D 动画方案 | 做对应任务时读 |

> 读完前 2 + 3 项（约 1500 行）就能开工；其他按需。

---

## 3. 接班第一件事

1. 跑 `pnpm dev`（cd `my-app/apps/web`）
2. 浏览器开 `http://localhost:3000`，点一遍 Chat / Tasks / Calendar / Notes + 右上 Apps 图标
3. 读 PROGRESS.md 最顶部一条
4. **问用户**："你想继续 [PROGRESS 最新进度的下一步]，还是别的方向？"
5. 用户答了再用 `TaskCreate` 拆 task list

**不要**：凭印象写代码 / 直接改 UI（已 baseline） / 让 AI 流任意多轮 tool / 推 git。

---

## 4. 不要回退的关键决策（一句话）

- **DeepSeek-V4 Flash 默认**，用户可在 InputPod 切换 V3.1 / Reasoner（[`docs/setup.md`](docs/setup.md#模型切换) 详）
- **客户端 unpdf + MiniLM 语义粗筛**（每张 PDF ~¥0.003）
- **Dexie v4**（IndexedDB）单用户持久化，Phase 3 切 Tauri SQLite，Phase 4 切 Neon
- **AI 写操作（create/update/delete）走 ConfirmCard 核实门控**，不直接落库（[`docs/architecture.md`](docs/architecture.md#待核实门控)）
- **管家固定在 Chat 主区左下**（漫画式），AI 消息用 `ButlerBubble`（无头像、墨绿描边）

---

## 5. 工作流约定（必须遵守）

> 详见 [docs/workflow.md](docs/workflow.md)，这里只列硬规则。

- **IMPORTANT**: ≥ 3 步任务 **必须** 用 `TaskCreate` 拆 task list
- **IMPORTANT**: 接到 "作为 PM" / "重新设计" / "不到预期" 信号 → 用 `AskUserQuestion` 先收敛 3-4 个关键决策，**禁止直接改代码**
- **IMPORTANT**: UI 改动前先问用户具体哪里不对（用户原话「UI 暂时算合格先处理实际功能」）
- **IMPORTANT**: 每组改动追加 `PROGRESS.md` 新条目（格式 `## [序号] YYYY-MM-DD — 标题`）
- **IMPORTANT**: 系统 prompt < 200 token；历史消息截断至最近 10 条；contextSummary 限 20 条 item
- **IMPORTANT**: 备份点用 git commit + tag（`backup-NNN-描述`）
- **YOU MUST**: 不要修改 git config / 不要 push / 不要 --no-verify

---

## 6. 代码地图速查（详见 [docs/architecture.md](docs/architecture.md)）

```
my-app/apps/web/src/
├── app/
│   ├── page.tsx              ← ★ 顶层状态机
│   ├── layout.tsx
│   ├── globals.css           ← 设计 token（墨绿）
│   └── api/
│       ├── chat/route.ts     ← 模型切换 + V4 Flash 流式 + 5 个 tool
│       └── extract-ddls/...  ← PDF DDL 提取
├── components/
│   ├── ChatCanvas.tsx        ← 漫画式主区 + 管家浮动
│   ├── ButlerCharacter.tsx   ← 3 姿势（standing/serving/pointout）+ Rive 预留
│   ├── ConfirmCard.tsx       ← AI 写操作核实卡
│   ├── TaskDetailDrawer.tsx  ← 右侧详情抽屉（替代 Modal）
│   ├── TasksPanel.tsx / CalendarPanel.tsx / NotesPanel.tsx
│   ├── MiniAppsDrawer.tsx    ← 右侧学习工具抽屉
│   ├── mini-apps/FocusTimer.tsx
│   └── layout/               ← TopBar + LeftRail + 4 Rail
└── lib/
    ├── types.ts              ← ★ 所有共享类型（DdlItem/ChatSession/...）
    ├── db.ts                 ← Dexie v4 schema
    ├── ai-models.ts          ← 模型注册表
    ├── ai-tools.ts           ← 5 个 AI tool 定义
    ├── tool-executor.ts      ← tool_call → PendingChange
    ├── pending.ts            ← 待核实模型
    ├── chat-client.ts        ← SSE 流 + 多轮 tool 循环
    ├── document-parser.ts    ← unpdf + 关键词过滤
    ├── semantic-filter.ts    ← MiniLM CDN 粗筛
    ├── blobs.ts / ics-export.ts / json-export.ts / mock-pipeline.ts
```

---

## 7. 已知陷阱（详见 [docs/pitfalls.md](docs/pitfalls.md)）

报错时按表查：
- transformers.js webpack 冲突 → CDN + `new Function` 隐藏 dynamic import
- unpdf 浏览器 mergePages 空 → 用 npm 而非 CDN
- Dexie 启动 hydration 竞态 → 用 `hydrated` 门控
- Next.js HMR 缓存 dynamic import → 重启 dev server
- Windows PowerShell 不支持 `&&` → 用 `;` 或 `if ($?) { B }`

---

*最后更新：2026-05-24 — 重写为分区结构 (PROGRESS [027])*
