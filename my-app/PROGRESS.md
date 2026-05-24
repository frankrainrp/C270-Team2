# 📋 项目进度记录 — 智能多模态学习管家

> 每一次有效改动都记录在此文件中，按时间倒序排列（最新在最上方）。  
> 格式：`## [序号] YYYY-MM-DD HH:mm — 改动标题`

---

## [028] 2026-05-24 — 多模态 OCR：图片 + 扫描件 PDF 全链路（Mistral）

> 用户决策：(a) 接 Mistral OCR（用户原话）；(b) 关心成本+希望未来可切换 → 做 provider 注册表；(c) PDF 路由用 unpdf < 50 字 → 扫描件 → OCR；(d) 图片 10MB warning / 50MB 硬拒。

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/lib/ocr/providers.ts` | 新建 | OCR provider 注册表：mistral（已实现）/ deepseek-vl（占位）/ tesseract（占位）；各自含价格、需要的 env、tier、desc |
| `apps/web/src/lib/ocr/index.ts` | 新建 | 客户端入口 `runOcr(file)`：调 `/api/ocr`；50MB 客户端硬拒；返回 `OcrResponse` discriminated union（ok=true/false + needsConfig 标志） |
| `apps/web/src/app/api/ocr/route.ts` | 新建 | 服务端路由（runtime nodejs）：读 `OCR_PROVIDER` env 白名单 → 校验 key → FormData(file) → base64 → 调 Mistral `/v1/ocr`（model `mistral-ocr-latest`）→ 拼接多页 markdown → 返回 `{ ok, text, pages, provider, ocrUsed }`；无 key 时返回 `needsConfig: true` 让前端友好提示 |
| `apps/web/src/lib/document-parser.ts` | 重写 | 加路由：文字 PDF → unpdf；**扫描 PDF（unpdf 输出 < 50 字）→ OCR**；image/\* → OCR；其他报错。新增 `ParseSource = "unpdf" \| "ocr-mistral" \| ...`；新增 `needsConfig?: boolean` 透传 |
| `apps/web/src/app/page.tsx` | 修改 | `runRealPipeline` step 1：> 10MB 加 warning；`parsed.source` 反映来源（"本地解析 (unpdf)" / "OCR (mistral)"）展示在 Pipeline detail；失败 + needsConfig → 提示用户配 MISTRAL_API_KEY |
| `apps/web/.env.local.example` | 修改 | 加 `MISTRAL_API_KEY` + `MISTRAL_BASE_URL` + `OCR_PROVIDER`；DEEPSEEK_MODEL 默认值同步为 `deepseek-v4-flash` |

### 🎯 路由策略表

| 上传文件类型 | 路由 | 成本 |
|---|---|---|
| 文字型 PDF | unpdf 本地 | **¥0**（免费快）|
| 扫描件 PDF（unpdf < 50 字） | Mistral OCR | ~$0.001/页 |
| jpg/png/webp/heic 等图片 | Mistral OCR | ~$0.001/张 |
| docx/ppt | 报错（待后续接入） | — |

### 🔧 OCR Provider 注册表

| Provider | 状态 | 价格 | 需要的 env |
|---|---|---|---|
| **Mistral OCR**（默认） | ✅ 已接入 | $0.001/页 (1000 页 $1) | `MISTRAL_API_KEY` |
| DeepSeek-VL | ⏳ 占位 | 复用现有 DEEPSEEK_API_KEY，按 token 算 | `DEEPSEEK_API_KEY` |
| Tesseract.js | ⏳ 占位 | 0 成本（10MB 模型一次下载） | — |

切换：环境变量 `OCR_PROVIDER=mistral`。后两个等用户需要时再实现（架构已留位）。

### ✅ 验证

- `tsc --noEmit` 通过（`EXIT=0`）
- TypeScript narrowing：discriminated union 用 `ok !== true` 显式比较（`!ocr.ok` 在某些 TS 版本下 awaited 后不 narrow，已踩坑修复）
- 50MB 硬拒在客户端 + 服务端双层校验
- 无 MISTRAL_API_KEY 时报错带 `needsConfig: true`，UI 提示用户去 console.mistral.ai 申请

### 🚦 后续可继续

- 测试真实扫描件 PDF + 手机拍照课件验证 OCR 质量
- 实现 DeepSeek-VL provider（复用 DEEPSEEK_API_KEY，无需新申请）
- 实现 Tesseract.js provider（0 key 完全本地）
- InputPod 加 OCR provider 切换 UI（类似模型切换）
- docx/ppt 解析（mammoth / pptxgen）

### 💾 备份

- commit `10902c1` + tag `backup-027-context-partition`（本次前）

---

## [027] 2026-05-24 — 上下文分区 + PNG trim 透明边 + Live2D 动画计划

> 用户三件事一起做：(1) 用 2026 业界成熟方案（[Anthropic 官方 best practice](https://code.claude.com/docs/en/best-practices) + Memory Bank 风格）把描述文档分区，避免后续 AI 接手 context 爆炸；(2) PNG trim 让管家变大；(3) 计划用 Live2D / Rive 给人物加动画（**P1 Rive 已选定**，等用户准备分层资产）。

### 📂 文档分区（核心）

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `my-app/AGENT.md` | **重写** | 从 250 行精简到 < 200 行入口；按 Anthropic best practice 加 `IMPORTANT` 标记；链接 docs/* 按需读 |
| `my-app/PROGRESS.md` | **截断** | 从 1129 行 → 287 行；只保留最近 5 条 ([022]-[026])；底部加归档链接 |
| `my-app/docs/architecture.md` | **新建** | 产品定位 + 完整代码地图 + 顶层 state + 数据模型 + 关键技术决策（旧 AGENT § 2,4,5 合并） |
| `my-app/docs/workflow.md` | **新建** | Token 效率 / PM 对齐 / PROGRESS 规范 / UI baseline / Git 规范 / 红线（旧 AGENT § 6） |
| `my-app/docs/setup.md` | **新建** | 启动 / 测试 / 环境变量 / 模型切换 / 测试 PDF / Dexie 清库 / PowerShell 注意（旧 AGENT § 8） |
| `my-app/docs/pitfalls.md` | **新建** | 已知陷阱按类别分（第三方库 / React / Windows / 浏览器 / UI / AI / Dexie）（旧 AGENT § 7） |
| `my-app/docs/plans/ui-redesign.md` | **移动** | 从 `my-app/UI-REDESIGN-PLAN.md` 迁过来，顶部加 ✅ 已存档标识 |
| `my-app/docs/plans/animation.md` | **新建** | Live2D / Rive / Lottie / CSS 4 方案对比 + 用户决策 + Rive 详细路径（资产清单 / Editor 操作 / 代码骨架） |
| `my-app/docs/progress/INDEX.md` | **新建** | 按主题速查跨月归档 + 归档规则 |
| `my-app/docs/progress/2026-05.md` | **新建** | [001]-[021] 完整内容归档（1129 行原文） |

### 🎨 PNG 资产优化

| 文件路径 | 操作 | 变化 |
|---|---|---|
| `apps/web/public/assets/butler-standing.png` | trim | 1254×1254 → **374×1094**（去 70% 左右空白），文件 207KB → **100KB** |
| `apps/web/public/assets/butler-serving.png` | trim | 1254×1254 → **683×1003**，285KB → **106KB** |
| `apps/web/public/assets/butler-pointout.png` | trim | 1254×1254 → **475×1067**，207KB → **104KB** |
| `apps/web/public/assets/logo.png` | trim | 1254×1254 → **613×775**，817KB → **140KB** |

算法：PowerShell + `.NET System.Drawing.LockBits` 扫描非透明像素边界 → crop + 8px padding。

### 📊 Token 效率收益

按 [Anthropic 2026 best practice](https://code.claude.com/docs/en/best-practices)（CLAUDE.md < 200 行）+ [Memory Bank 二层架构](https://mem0.ai/blog/state-of-ai-agent-memory-2026)（4× 更少 token，准确率 +18.7%）：

| 阶段 | 之前 | 现在 |
|---|---|---|
| 新接手 AI 必读量 | AGENT(250) + PROGRESS(1129) ≈ 25 KB | AGENT(180) + PROGRESS(290) + INDEX(70) ≈ **5.4 KB** |
| 减少 | — | **-78%** |
| 详细内容 | 必读 1 份 25KB | 按需开 docs/*（平均每个 5-8 KB） |

### 🎭 Live2D 动画方案（P1 Rive，已对齐）

用户决策路径：
- ❌ P0 CSS 微动画
- ✅ **P1 Rive**（资产准备阶段）
- ❌ P2 Live2D Cubism（Phase 3 后再考虑）

**待用户准备**：分层 SVG（或 PSD），含 head / eye_left / eye_right / mouth / body / arm_left / arm_right。详见 [docs/plans/animation.md](docs/plans/animation.md)。

**代码骨架已准备**：`@rive-app/react-canvas` 接入模板 + State Machine 接口设计 + fallback 策略。等资产到位 1.5-2h 接入。

### ✅ 验证

- AGENT.md = 187 行（目标 < 200 ✓）
- PROGRESS.md = 287 行（最近 5 条完整 + 归档链接）
- docs/ 目录结构清晰，按主题分区
- `tsc --noEmit` 不受影响（无代码改动）
- 4 张 PNG 文件总体积 1516KB → **450KB**（-70%）

### 🚦 后续

- 等用户给 Rive 分层资产 → 接入 ButlerRive
- 每月初把上月 PROGRESS 迁到 `docs/progress/YYYY-MM.md`
- AGENT.md 是 living document：每次 AI 接手前后用户/AI 都可以补 IMPORTANT 规则

### 💾 备份建议

下一步备份点建议 tag：`backup-027-context-partition`

---

## [026] 2026-05-22 — 模型切换 + Stage C.2（字段扩展 + 详情抽屉）

> 两件事一起做：(1) 用户能在 InputPod 切换 AI 模型；(2) Stage C.2 三件套：Dexie v4 加 status/tags/priority、TasksRail 可点击切换 view、TaskEditModal 改右侧详情抽屉。

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| **模型切换** | | |
| `apps/web/src/lib/ai-models.ts` | 新建 | 注册表 3 个候选：V4 Flash (low/默认/最便宜) / V3.1 (mid) / Reasoner (high/不支持 tool)；`AiModelMeta` 含 tier/desc/supportsTools；`MODEL_STORAGE_KEY` localStorage 持久化 |
| `apps/web/src/app/api/chat/route.ts` | 修改 | 接收 body.model 白名单校验 (`isValidModelId`)；非法值降级 V4 Flash；reasoner 类自动禁用 tools |
| `apps/web/src/lib/chat-client.ts` | 修改 | `StreamOptions.model` 透传到 fetch body |
| `apps/web/src/components/InputPod.tsx` | 修改 | model badge 改可点击下拉，弹出 280px 浮层列出 3 模型（含 desc/tier dot/⚠不支持工具警告）；点击切换 |
| `apps/web/src/components/ChatCanvas.tsx` | 修改 | 加 `selectedModel` / `onSelectModel` props 透传 InputPod |
| `apps/web/src/app/page.tsx` | 修改 | 新增 `selectedModel` state + `MODEL_STORAGE_KEY` localStorage 双向同步；`streamChat({ model: selectedModel })` |
| **Stage C.2** | | |
| `apps/web/src/lib/types.ts` | 修改 | 新增 `TaskStatus = "todo"\|"in_progress"\|"done"`、`TaskPriority = "low"\|"med"\|"high"`；`DdlItem` 加 optional `status / tags / priority`；`completed` 保留作兼容 |
| `apps/web/src/lib/db.ts` | 修改 | Dexie v3→v4：`ddls` 加 `status` 索引；upgrade hook 把存量数据 `completed=true → status="done"`、否则 `"todo"` |
| `apps/web/src/components/layout/TasksRail.tsx` | 重写 | 新增 `view / onSelectView` props；4 + 1 view（Active/In Progress/Upcoming/All/Completed）可点击切换；active 项墨绿底高亮 |
| `apps/web/src/components/TasksPanel.tsx` | 修改 | 接 `view` prop 按视图过滤；行内显示 priority 色条 / tags chip / 「进行中」状态徽章；header 标题改用 view 名 + 全局统计副标题；新增 ViewEmptyState |
| `apps/web/src/components/TaskDetailDrawer.tsx` | 新建 | 右侧 380px 滑入抽屉替代 TaskEditModal；含 status / priority `SegmentedRadio` + tags 逗号分隔输入 + 实时 chip 预览；保留所有原字段（任务名/日期/时间/权重/小组/说明/备注/附件） |
| `apps/web/src/components/TaskEditModal.tsx` | **删除** | 由 TaskDetailDrawer 取代 |
| `apps/web/src/app/page.tsx` | 修改 | import 切到 TaskDetailDrawer；handleSubmitEdit 把 `status="done"` 同步为 `completed=true`；新增 `taskView` state + `taskCounts.in_progress`；传给 TasksRail/TasksPanel |

### 🎯 模型切换体验

| 模型 | 简介 | tier | 工具 |
|---|---|---|---|
| **DeepSeek V4 Flash**（默认） | 最低成本，日常对话 | low（绿点） | ✅ |
| DeepSeek V3.1 | 复杂指令/长上下文更好，贵 3-25× | mid（黄点） | ✅ |
| DeepSeek Reasoner | 深度推理 (CoT)，最慢最贵 | high（红点） | ❌（自动禁用工具） |

切换后立即生效，下次发送自动用新模型；localStorage 跨刷新保留选择。

### 🎨 Tasks 新字段视觉

- **优先级**：行首 3px 宽色条（high=红 / med=黄 / low=蓝）
- **标签**：任务名右侧灰色 `#tag` chip 们
- **状态**：进行中显示黄色「进行中」徽章；完成显示删除线（保持原行为）
- **TaskDetailDrawer**：状态/优先级用 SegmentedRadio（3 选 1 分段按钮），tags 输入框下方实时显示 chip 预览

### ✅ 验证

- `tsc --noEmit` 通过（`EXIT=0`）
- 全部 Tab 切换 + view 切换 + 创建/编辑/删除 行为保留
- Dexie v4 升级幂等（旧数据自动补 status）

### 🚦 后续可继续

- AI tool_call 也支持设置 status/tags/priority（目前 AI 只设基础字段）
- 详情抽屉的标签输入加 autocomplete（从所有任务的现有 tags 推荐）
- 模型切换时的 cache hit miss 提示（DeepSeek 会因 system prompt 变化扣高价）
- 加更多 Mini Apps

### 💾 备份

- commit `fb9c4f9` + tag `backup-025-ui-redesign-done`（本次前）

---

## [025] 2026-05-22 — Stage E：Notes 占位重做 + 全局 legacy 清理（5 阶段 UI 重构收尾）

> UI-REDESIGN-PLAN.md 的最后一个 Stage。NotesPanel 视觉对齐墨绿（保留 Phase 3 解锁心智），同时**彻底清理玻璃态/紫色 legacy**：删除 4 个无引用文件、所有 InputPod / ProcessingPipeline 内的 GlassButton / DecoLayered、globals.css 里全部旧 class。

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/NotesPanel.tsx` | 重写 | 去 `DecoLayered`，纯白底 + 虚线边框 hero；紫色渐变图标 → 墨绿实色 + 墨绿浅底；Phase 3 解锁徽章改墨绿系；FeatureCard 改 token；标题缩到 22px |
| `apps/web/src/components/InputPod.tsx` | 修改 | 移除 `import GlassButton`；发送按钮改纯墨绿圆形按钮（hover 加深、disabled 灰）|
| `apps/web/src/components/ProcessingPipeline.tsx` | 重写 | 去 `DecoLayered` + AI Sparkles 头像；Pipeline 卡改白底墨绿描边；StepIcon 紫色 → 墨绿；成功色用 `var(--color-success)`；JumpBtn 改墨绿系 |
| `apps/web/src/components/Sidebar.tsx` | **删除** | 旧 68px 玻璃侧栏，已被 LeftRail 取代 |
| `apps/web/src/components/SessionListPanel.tsx` | **删除** | 旧 240px 滑入面板，已被 ChatRail 取代 |
| `apps/web/src/components/ui/GlassButton.tsx` | **删除** | 玻璃态按钮，最后一个引用（InputPod）已替换 |
| `apps/web/src/components/ui/DecoLayered.tsx` | **删除** | 三层装饰板，最后一个引用（ProcessingPipeline）已替换 |
| `apps/web/src/components/ui/` | 删除（空目录） | 整个 ui/ 目录已无文件 |
| `apps/web/src/app/globals.css` | 大幅精简 | 删除旧 token (`--color-brand` / `--grid-color` / `--radius-lg`)；删除全部旧 components 层 class：`.bg-grid` / `.glass-panel` / `.nav-tooltip` / `.nav-icon-btn` / `.quick-card` / `.send-btn` / `.deco-layered*` / `.glass-btn*` / `.fx-layer` / `.msg-toolbar` / `.ai-message`；只留 `.message-stream`（滚动条）+ `.selectable` |

### 🧹 清理统计

- 删除 4 个 legacy 文件（~600 行）
- 删除 globals.css 中 ~280 行旧 class 规则
- 全项目无紫色 / 玻璃 / 网格背景残留

### ✅ Stage A-E 全部完成（PROGRESS [017]-[025]）

| Stage | 状态 | 关键交付 |
|---|---|---|
| **A** 全局 layout + token | ✅ | TopBar / LeftRail / 墨绿调色板 |
| **B** Chat 漫画式 + 核实门控 | ✅ | 管家融入主区 / ButlerBubble / ConfirmCard / PendingBatch |
| **C.1** Tasks 视觉重做 | ✅ | 墨绿 Linear 风格列表 + TasksRail 计数 |
| **D** Calendar 月+日双视图 | ✅ | 月视图墨绿 + Day View 时间轴 + Upcoming/Tasks widgets |
| **E** Notes 占位 + 全局清理 | ✅ | NotesPanel 墨绿化 + 4 legacy 文件删除 + globals.css 精简 |
| (额外) Mini Apps Drawer | ✅ | 右侧学习工具抽屉 + Focus Timer |

### ✅ 验证

- `tsc --noEmit` 通过（`EXIT=0`）
- `grep -r "GlassButton\|DecoLayered\|SessionListPanel\|Sidebar"` 在 src/ 下无引用
- `grep -r "className.*bg-grid\|glass-\|deco-layered"` 在 src/ 下无引用
- 4 个 Tab + Mini Apps 抽屉 全部对齐墨绿设计语言

### 🚦 至此 UI 重构完成。后续可继续

- **C.2** Tasks 字段扩展（Dexie v3→v4：status/tags/priority）+ TaskEditModal 改右侧抽屉
- **Phase 3** Tauri 桌面壳启动 → Notes 真实化 + 原生通知 + filepath 一键打开
- **Phase 4** Clerk + Neon 多租户 → ICS 订阅 URL + 真实云后端
- 更多 Mini Apps（番茄记录 / 单词卡 / 公式速查...）

### 💾 备份

- commit `fb9c4f9` + tag `backup-024-mini-apps`（本次清理之前）

---

## [024] 2026-05-22 — 学习工具抽屉（Mini Apps Drawer）+ Focus Timer

> 用户决策：Focus Timer 不要放 Calendar Day View，而是做一个**全局右侧滑入抽屉**，作为「学习辅助小程序仓库」。后续可扩展更多小工具（番茄记录 / 单词卡 / 公式速查等）。

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/mini-apps/FocusTimer.tsx` | 新建 | 功能完整的专注计时器：mm:ss 倒计时 + 环形进度（SVG）+ 25/45/60 min 预设 + 自定义起停重置；倒计时完成 alert（Phase 3 接 Tauri Notification） |
| `apps/web/src/components/MiniAppsDrawer.tsx` | 新建 | 全局右侧滑入抽屉（320px，从 TopBar 下方开始）；可扩展的 `APPS` 注册表 + App 切换器（≥2 App 时显示）；当前仅含 FocusTimer，留好 ComingSoon 占位接口 |
| `apps/web/src/components/layout/TopBar.tsx` | 修改 | 新增 `LayoutGrid` 图标按钮（位于通知前），点击切换抽屉；接 `miniAppsOpen` / `onToggleMiniApps` props，open 时按钮 active（墨绿边框 + 浅墨绿底） |
| `apps/web/src/app/page.tsx` | 修改 | 新增 `miniAppsOpen` state；渲染 `<MiniAppsDrawer>` 在顶层（fixed，不影响主区布局）；传给 TopBar |
| `apps/web/src/components/CalendarPanel.tsx` | 修改 | 移除 Day View 右侧 Focus widget（仅保留 Upcoming Events + Tasks）；移除 `Target` import |

### 🎯 设计要点

- **抽屉浮在主区上**（不挤主内容），用户可以一边看 Calendar/Tasks 一边计时
- **不带遮罩**（pointer-events 不阻塞），点抽屉外部不会自动关，需手动 X
- **fixed 定位 top:56**（TopBar 高度），确保 TopBar 始终可点击切换
- **滑入动画**：`cubic-bezier(0.16, 1, 0.3, 1)` 0.25s，自然顺滑
- **App 状态在抽屉内 useState**（不在 page.tsx 顶层），关闭抽屉后再开会**保留 App 选择**但计时器会重新挂载（暂未做跨开关持久化，下次需要再优化）

### 🚦 后续扩展接口

```ts
// MiniAppsDrawer.tsx 里 APPS 数组扩展即可
const APPS: MiniApp[] = [
  { id: "focus",     name: "专注计时", icon: <Target />, Component: FocusTimer },
  { id: "pomodoro",  name: "番茄记录", icon: <Coffee />, Component: PomodoroLog },
  { id: "flashcard", name: "单词卡",   icon: <BookOpen />, Component: Flashcard },
  { id: "calculator",name: "计算器",   icon: <Calculator />, Component: Calc },
];
```

### ✅ 验证

- `tsc --noEmit` 通过（`EXIT=0`）
- Focus Timer 25/45/60 min 切换正常
- 倒计时环 stroke-dashoffset 平滑过渡
- 抽屉滑入/滑出无闪烁
- Calendar Day View 不再有 Focus widget

---

## [023] 2026-05-22 — Stage D：Calendar 月视图重做 + Day View 深度页

> 用户决策：Calendar 不做大改 — **默认入口保持月视图**（视觉对齐墨绿），**点空白日期才进入深度的 Day View**（时间轴 + 右侧 widgets）。

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/CalendarPanel.tsx` | 重写 | 顶层维护 `view: "month" \| "day"` + `selectedDate`；月视图视觉重做（去 DecoLayered/紫色，全部 token 化）；新增 `DayView` 子组件（返回按钮 + 24h 时间轴 6AM-11PM + 右侧 3 个 widgets：Upcoming Events / Tasks / Focus 计时环）；新增 `TimelinePill`、`WidgetCard`、`PrimaryBtn` 子组件 |

### 🎯 交互变化

| 操作 | 之前 | 现在 |
|---|---|---|
| 点空白日期格 | 直接弹「新建事件」modal | 进入 **Day View**（深度时间轴页） |
| 点事件 pill | 编辑 modal | 不变（编辑 modal） |
| 月视图右上 | 「今天」按钮 | 「今天」+ **「+ New Event」墨绿主按钮** |
| Day View 时间轴点空时段 | 无此功能 | 触发新建（带 `presetDate=当前选中日`） |
| Day View 返回 | 无 | 顶部 ← 按钮 |

### 🎨 Day View 布局

```
┌─ ← 返回 │ 2026 年 5 月 26 日 [今天]   + New Event ┐
├──────────────────────────────────┬─────────────┤
│ 6 AM ─────────                   │ UPCOMING     │
│ 7 AM ─────────                   │  CA1 06/26   │
│ 8 AM ──[09:00 课程会议 30%]──    │  Mtg 06/28   │
│ 9 AM ─                           │              │
│ ...                              │ TASKS        │
│ 11 PM ─                          │  ☐ Read Ch3  │
│ ─其他时段（早于6AM/晚于11PM）─    │              │
│  23:59 提交作业                  │ FOCUS        │
│                                  │   ╭─120 min─╮│
│                                  │   ╲ 待接入 ╱ │
└──────────────────────────────────┴─────────────┘
```

### 🎨 月视图视觉重做

| 维度 | 之前 | 现在 |
|---|---|---|
| 卡片 | DecoLayered 玻璃 | 白底 + 1px border + 圆角 10 |
| 周标题行 | 黑半透 2% 底 | `var(--color-surface)` |
| 格子边线 | 黑半透 5% | `var(--color-border-soft)` |
| 今日圆背景 | 紫色 + 紫阴影 | **墨绿圆**（无阴影） |
| Hover 格子 | 紫色 6% 底 | `var(--color-primary-soft)` 浅墨绿 |
| 事件 pill | 紫/绿/红色块 | 浅墨绿底 + 墨绿左边框（统一墨绿主色） |
| AddButton | 紫渐变 | 墨绿实色 `PrimaryBtn` |
| 空状态 | DecoLayered + 紫渐变按钮 | 虚线边框 + 墨绿按钮 |

### ✅ 验证

- `tsc --noEmit` 通过（`EXIT=0`）
- Day View 时间轴正确按 `dueTime` 落格
- 早于 6AM / 晚于 11PM 的事件落"其他时段"区
- 右侧 widgets 真实接入 `allDdls`（Upcoming 取未完成且 dueDate >= 今天 前 5；Tasks 取未完成前 5；Focus 静态 120 min UI）

### 🚦 后续可继续

- Focus Timer 接入真实计时（Phase 3 Tauri 通知后做）
- Week 视图（当前 day/month 两态，week 标 coming soon）
- Day View 时间轴拖拽创建 / 拖动改时间
- 月视图加迷你月历到 CalendarRail 左栏

---

## [022] 2026-05-22 — Stage C.1：TasksPanel 视觉重做（不动 schema）

> [UI-REDESIGN-PLAN.md](UI-REDESIGN-PLAN.md) Stage C 第一阶段：把 TasksPanel 从玻璃紫色切到墨绿设计语言。**不碰 Dexie schema**，保持现有 CRUD / 字段不变。字段扩展 (status/tags/priority) + 右侧详情抽屉留给 C.2。

### 📂 涉及文件

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/TasksPanel.tsx` | 重写 | 移除 `DecoLayered` 玻璃装饰板；全部紫色 (`#6366f1`) 切到墨绿 (`var(--color-primary)`) token；分组卡改白底 + 1px border + 圆角 10；行 hover 改 `var(--color-surface)` 浅灰；权重 badge / 附件 chip / 编辑删除按钮全部用 token；`height: 100vh` → `100%`（修嵌套高度 bug）；AddButton 从紫渐变改墨绿实色 `PrimaryBtn`；ToolbarBtn 改白底墨绿系；EmptyState 改虚线边框风格；header 标题从 28px "每日任务" 改 22px "Tasks" + 副标题精简 |
| `apps/web/src/components/layout/TasksRail.tsx` | 修改 | 新增 `counts: TaskCounts` prop（active / upcoming / all / completed）；4 个 view 旁加灰色数字 badge（只显示，C.2 接入切换逻辑） |
| `apps/web/src/app/page.tsx` | 修改 | 新增 `taskCounts` useMemo 派生；传给 `<TasksRail>` |

### 🎨 视觉对比

| 维度 | 之前 | 现在 |
|---|---|---|
| 主色 | 紫色 `#6366f1` | 墨绿 `#1B3D2F` |
| 卡片 | DecoLayered 三层玻璃板 | 白底 + 1px border + 圆角 10 |
| 行 hover | 紫色 4% 底 | 浅灰 surface 底 |
| 行间隙 | 黑半透明 5% 边 | `var(--color-border-soft)` |
| 标题 | 28px 中文 + 长副标题 | 22px "Tasks" + 精简计数 |
| 新建按钮 | 紫渐变 + 紫阴影 | 墨绿实色 |
| 工具按钮 | 玻璃白底 + 紫 hover | 白底细边 + 墨绿 hover |
| 来源 pill | 黑半透明 4% | 灰 surface + 细边 |
| 复选框完成色 | `#10b981` 绿 | `var(--color-success)` 墨绿系 |
| 空状态 | DecoLayered 大圆角 + 紫渐变按钮 | 虚线边框 + 墨绿实色按钮 |

### ✅ 验证

- `tsc --noEmit` 通过（`EXIT=0`）
- 所有 CRUD 行为保留：勾选完成 / 编辑 modal / 删除 confirm / 附件预览 / ICS / JSON 导出导入
- TasksRail 4 view 显示真实数字（Active / Upcoming / All / Completed）

### 🚦 后续（Stage C.2）

- Dexie v3 → v4：加 `status: "todo" \| "in_progress" \| "done"` + `tags?: string[]` + `priority?` 字段
- 把 view 列表做成可点击切换（active 当前 view）
- TaskEditModal 改成右侧详情抽屉（与设计稿一致）
- TasksRail 的 Tags 分组接入真实标签云

### 💾 备份

- commit `19fa711` + tag `backup-021-comic-chat` （C.1 之前的完整状态）

---

## 📦 历史归档

[001]-[021] 完整内容见 **[docs/progress/2026-05.md](docs/progress/2026-05.md)** （2026 年 5 月归档）

按月索引：[docs/progress/INDEX.md](docs/progress/INDEX.md)

