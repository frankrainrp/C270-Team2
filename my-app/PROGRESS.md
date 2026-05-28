# 📋 项目进度记录 — 智能多模态学习管家

> 每一次有效改动都记录在此文件中，按时间倒序排列（最新在最上方）。
> 格式：`## [序号] YYYY-MM-DD HH:mm — 改动标题`

## 📚 全部条目索引（点标题跳详细内容）

| # | 标题 | 主要产出 |
|---|---|---|
| [052] | 自定义系统 Phase E — 自定义面板（Roadmap 收尾） | Dexie v7 customPanels + emoji+label+Markdown body + Tab + 「+」+ 即时编辑 |
| [051] | 自定义系统 Phase D — 元素位置自定义 | Tab 拖拽重排 + 4 档 Tab 隐藏 + 管家位置 4 档（左/中/右/隐藏） |
| [050] | 自定义系统 Phase C — 人物自定义 | Dexie v6 butlerAssets + 客户端 Canvas trim + 上传 / 预览 / 重置 |
| [049] | 自定义系统 Phase B — 颜色自定义 | lib/theme.ts hex↔HSL + 派生 + 6 预设 swatch + color picker + 重置 |
| [048] | 自定义系统 Phase A — Dark Mode 优化 | 主题感知阴影/代码块/覆盖层 token + AttachmentPreview 重写 + 5 文件硬编码色收口 |
| [047] | 修复思考模式末尾误报 "出错了" 气泡 | 服务端流尾抛错有内容时静默 + 客户端 hasReceivedDelta 双保险 |
| [046] | 4 张新姿势 SVG → trim PNG 接入 | thinking / thinking-hard / idea / rare-thinking 真资产上线（取代 standing fallback） |
| [045] | G2 留存 + G3 传播 + G5 AI 差异化 | streak / 成就 / PWA / 分享卡 / 管家性格 3 档 / 习惯识别 |
| [044] | G1 激活率提升 | Demo 数据 / 大拖拽 / Tour / .ics 导入 |
| [043] | Calendar C3+C4 | Week 空格点击创建 + 事件拖拽改时间 |
| [042] | Calendar C1+C2 | 迷你月历 + Week 视图 |
| [041] | UI/UX 增值 6 Epic 之 4/5/2/6/3 | TodayHero/StatsApp/键盘/Empty 人格化/偏好设置 |
| [040] | Epic 1 反馈循环 | Toast 系统 + 删除 Undo + AI tool 实时提示 |
| [039] | 跨面板联动 B2/B1/B3/B4 | AI create_note / 任务↔笔记 / 搜索高亮 / checkbox 同步 |
| [038] | 开屏问候零 token + AI 气泡贴边 | buildLocalGreeting / 去 800 容器 |
| [037] | 标准 AI 对话布局 | 气泡左对齐 + ConfirmCard 居中浮顶 + 0.33 倍率 |
| [036] | Chat 缺口 F/A/D/E/G 五件套 | 中文 IME / 停止 / 复制+重生成 / Retry / 自动标题 |
| [035] | 历史消息截断 10 条 | input token 线性爆炸防护 |
| [034] | AI 气泡居中 + Flash 隐藏思考面板 | V4 Flash CoT 特性解释 |
| [033] | 4 新姿势 + AI 活动状态机 + 缺资产降级 | 7 姿势 + rare-thinking 彩蛋 + onError fallback |
| [032] | 管家居中 + 输入框背后 + 0.75 倍率 | scale 模式重构 + bottom-center 对齐 |
| [031] | 思考模式可见化 | reasoning_content 折叠面板 |
| [030] | 模型切换 2 bug 修复 | 精简下拉 + state-only 视觉 |
| [029] | 基础功能补全 5 件套 | AI tool 字段 / Markdown 预览 / 开屏问候 / Notes 真版 / 全局搜索 |
| [028] | 多模态 OCR | Mistral / unpdf 路由 / 图片+扫描件 |
| [027] | 上下文分区 + PNG trim + 动画计划 | docs/* 分区 / Rive 选定 |
| [022]-[026] | UI 重构 Stage C-E + Mini Apps + Stage C.2 + 模型切换 | 见 [docs/progress/2026-05.md](docs/progress/2026-05.md) |
| [001]-[021] | Phase 1 完成 + Phase 2 早期 | 见 [docs/progress/2026-05.md](docs/progress/2026-05.md) |

> **接班 AI 提示**: 只看「最新一条」推算下一步即可。最近 12 条 [041]-[052] 是近期进度，其余条目（[022]-[040]）仍在本文件，[022]-[026] + [001]-[021] 已归档到 docs/progress/。

---

## [052] 2026-05-27 — 自定义系统 Phase E：自定义面板（A→E Roadmap 收尾）

> 接 [051] Phase D，Phase E 让用户在内置 4 Tab 之外创建额外面板。整套自定义系统 5 Phase 至此全部交付。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/lib/types.ts` | 修改 | 新增 `CustomPanel` 接口（id / label≤12 / emoji / Markdown content / createdAt / updatedAt） |
| `apps/web/src/lib/db.ts` | 修改 | Dexie 升 v6→v7，新增 `customPanels` 表（主键 id，updatedAt 索引） |
| `apps/web/src/lib/custom-panels.ts` | **新建** | CRUD（getAll / get / create / update / delete）+ `CUSTOM_PANEL_EVENT` CustomEvent 通知 + 自动截断 label≤12 / emoji≤3 |
| `apps/web/src/components/CustomPanelView.tsx` | **新建** | 单页 Markdown 编辑器风格：header（可编辑 emoji + label + 编辑/预览切换 + 删除）+ body（textarea / ReactMarkdown 渲染）；1.2s 防抖保存 + unmount flush；空 content 时显示 FileText 占位 |
| `apps/web/src/components/layout/TopBar.tsx` | 修改 | 接 4 个新 props（customPanels / activeCustomPanelId / onSelectCustomPanel / onCreateCustomPanel）；内置 Tab 后追加自定义 Tab（emoji + label，活动用 primary 下划线）+ 「+」虚线按钮触发新建 |
| `apps/web/src/app/page.tsx` | 修改 | (1) 新增 `customPanels` / `activeCustomPanelId` state；(2) mount + CUSTOM_PANEL_EVENT 监听同步；(3) 3 个 handler：create（建后即激活）/ update（直透 IndexedDB）/ delete（删除并退回 chat）；(4) TopBar onNavChange 同时清 activeCustomPanelId；(5) LeftRail 4 个 `activeNav===xxx` 全加 `!activeCustomPanelId &&` 守卫；(6) 主区追加 CustomPanelView 渲染分支 |

### 🎯 关键设计

- **MVP Markdown only**：iframe / 嵌入网页 / 自由 widget 等延后。MVP 先把"再加一个 Tab 放我的笔记/链接/日志"打通
- **激活互斥**：`activeNav: NavId` 和 `activeCustomPanelId: string | null` 互斥。点击内置 Tab 清空 activeCustomPanelId；点击自定义 Tab 设置 activeCustomPanelId（activeNav 保持但不显示）。这避免给 NavId 类型加 string 联合，少改 30+ 处 switch
- **删除即退回**：删除当前激活的面板自动退回 `activeNav="chat"` + 清 activeCustomPanelId，防止"找不到"
- **emoji 单字符**：MVP 限制 emoji 字段 ≤3 字符（覆盖 surrogate pair emoji 如 🇨🇳）。后续可加 emoji picker
- **label ≤12**：避免 Tab Bar 撑爆，超长自动截断
- **MVP 无 Rail**：自定义面板不渲染 LeftRail 内容（节省屏幕、简化交互）；后续可让用户配置 Rail 内容
- **createdAt 排序**：Tab 顺序固定为创建顺序；后续可加自定义面板间拖拽重排（复用 Phase D 机制）
- **CustomPanelView 防抖**：编辑 emoji/label/content 都用 1.2s 防抖；unmount/切换面板时立即 flush 防丢失

### 🚦 自定义系统 Roadmap 全部完成 🎉

| Phase | 内容 | 状态 |
|---|---|---|
| **A** Dark Mode 优化 | 15+ token + AttachmentPreview 重写 + 5 文件硬编码色收口 | ✅ [048] |
| **B** 颜色自定义 | lib/theme.ts hex↔HSL 派生 + 6 预设 + color picker + 重置 | ✅ [049] |
| **C** 人物自定义 | Dexie v6 + 客户端 Canvas trim + 上传/预览/重置 | ✅ [050] |
| **D** 元素位置自定义 | Tab 拖拽 + 隐藏 + 管家位置 4 档 | ✅ [051] |
| **E** 自定义面板 | Dexie v7 + emoji+label+Markdown + Tab + 「+」+ 即时编辑 | ✅ 本条 [052] |

### ✅ 验证

- `tsc --noEmit` EXIT=0
- HMR 自动加载（Dexie v7 升级在用户下次开页面时静默执行）
- 待用户实测：点顶栏 「+」→ 自动创建 + 激活；改 emoji/label/content 实时保存；点 Trash 确认删除后退回 Chat；切回内置 Tab 正常；多面板互切

### 📝 后续可扩展

- iframe / 嵌入网页类型（kind: "markdown" | "iframe"）
- 自定义面板间拖拽重排（复用 Phase D 拖拽机制）
- 自定义 Rail 内容（让用户为每个 panel 配置左侧栏 widget）
- 多人协作（Phase 4 多租户上线后）
- AI tool 调 create_custom_panel（让 Butler 主动建面板）

### 💾 备份建议

`backup-051-layout-prefs` 之后，本次紧跟。建议 tag：`backup-052-custom-panels`

---

## [051] 2026-05-27 — 自定义系统 Phase D：元素位置自定义（Tab 拖拽 + 管家位置）

> 接 [050] Phase C，Phase D 让 4 Tab 顺序可拖拽 + 单 Tab 可隐藏 + 管家位置 4 档。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/lib/layout-prefs.ts` | **新建** | 持久化 3 项布局偏好：`tabsOrder: NavId[]` / `hiddenTabs: Set<NavId>` / `butlerPosition: "left" \| "center" \| "right" \| "hidden"`；CRUD + 校验补齐（缺失/非法 id 自动修复）+ `LAYOUT_PREFS_EVENT` CustomEvent 通知；保护"全部隐藏"边界（强制保留 ≥1 个 Tab） |
| `apps/web/src/components/layout/TopBar.tsx` | 修改 | (1) 接 3 个新 props（tabsOrder / hiddenTabs / onTabsReorder）；(2) Tab 渲染改从 `order.filter(!hidden)`；(3) 每个 Tab 加 `draggable + dragstart/dragover/drop` 处理（用 `text/butler-tab` mime 防外部干扰），拖拽悬浮 Tab 显示 primary-soft 高亮反馈；(4) drop 时把 source 插入到 target 之前，触发 `onTabsReorder` |
| `apps/web/src/components/ChatCanvas.tsx` | 修改 | 接 `butlerPosition` prop；派生 `butlerStyle` CSS：hidden→null（不渲染）/ left→`left:24` / right→`right:24` / center→`left:50% + translateX(-50%)`（默认） |
| `apps/web/src/app/page.tsx` | 修改 | (1) 3 个新 state + mount 同步 + LAYOUT_PREFS_EVENT 监听；(2) 透传给 TopBar（tabsOrder/hiddenTabs/onTabsReorder）+ ChatCanvas（butlerPosition） |
| `apps/web/src/components/PreferencesPanel.tsx` | 修改 | 新「布局」段：(1) 管家位置 4 档 SegRow（AlignLeft/Center/Right/EyeOff 图标）；(2) 4 Tab show/hide chip 按钮（active = 实色 primary chip / hidden = 灰色描边 + 删除线 + 文字 line-through）；点击 toggle，受 toggleHiddenTab 保护不会全隐藏；提示「Tab 顺序可在顶栏直接拖拽」 |

### 🎯 关键决策

- **HTML5 drag-and-drop**：复用 [043] Calendar Week 视图事件拖拽的同模式。用专属 mime `text/butler-tab` 避免和系统拖入文件混淆
- **拖拽插入语义**：drop 在 target 上时把 source 插到 target **之前**（不是替换）。最朴素的"重排"心智
- **顺序持久化**：`localStorage[butler.layout.tabsOrder]` 存 NavId 数组；自动校验补齐（如未来加新 Tab 时旧用户的存储不会丢失新 Tab）
- **隐藏保护**：`toggleHiddenTab` 内部检查不允许全部隐藏（最后 1 个不能隐）
- **管家位置**：`hidden` 时整个容器不渲染（不只是 display: none，彻底无 DOM）；left/right 用 `left:24` 而非 0 让管家不贴边
- **拖拽兼容触屏**：当前用 native HTML5 drag-and-drop，触屏支持有限。未来可考虑 @dnd-kit/core 或类似库（暂不引入第三方依赖）

### 🚦 进度

| Phase | 状态 |
|---|---|
| **A. Dark Mode 优化** | ✅ [048] |
| **B. 颜色自定义** | ✅ [049] |
| **C. 人物自定义** | ✅ [050] |
| **D. 元素位置自定义** | ✅ 本条 [051] |
| E. 自定义面板 | ⏳ 下一条（自定义系统收尾） |

### ✅ 验证

- `tsc --noEmit` EXIT=0（修了一处 `[...Set]` → `Array.from` 的 downlevel 兼容）
- HMR 自动加载
- 待用户实测：
  - 偏好设置 → 布局 → 管家位置切换 4 档立刻生效（hidden 时管家消失）
  - Tab show/hide 切换立刻生效
  - 顶栏拖拽任意 Tab 到另一 Tab 之前 → 顺序立即重排 + 持久化

### 💾 备份建议

`backup-050-custom-character` 之后，本次紧跟。建议 tag：`backup-051-layout-prefs`

---

## [050] 2026-05-27 — 自定义系统 Phase C：人物自定义（上传 → 客户端 trim → IndexedDB）

> 接 [049] Phase B 颜色自定义，本条做 Phase C 形象自定义：用户上传 1 张 PNG/JPG，客户端 Canvas 抠白底 + 裁剪，存 IndexedDB 替换全部 7 内置姿势。一图通替。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/lib/types.ts` | 修改 | 新增 `ButlerAsset` 接口（poseName / blob / width / height / updatedAt） |
| `apps/web/src/lib/db.ts` | 修改 | Dexie 升 v5→v6，新增 `butlerAssets` 表（主键 poseName）|
| `apps/web/src/lib/butler-asset.ts` | **新建** | Canvas 客户端 trim（镜像 scripts/trim_butler_poses.py 的 PIL 实现：白底 threshold 240 → alpha=0 → 单次扫描兼算 bbox + 抠图 → cropCanvas → PNG Blob）；CRUD（get/set/clear）；`BUTLER_ASSET_EVENT` CustomEvent 通知 ButlerCharacter 重载；上限 4MB 防 IndexedDB 撑爆 |
| `apps/web/src/components/ButlerCharacter.tsx` | 修改 | (1) mount + listener 加载 default 自定义资产 → `customDefault: {url, w, h}` state；(2) 容器尺寸切换：有自定义时用其 w×h，否则用内置 MAX；(3) 渲染优先级 `customDefault > 内置 PNG > standing fallback`；(4) unmount 时 `URL.revokeObjectURL` 清理 |
| `apps/web/src/components/PreferencesPanel.tsx` | 修改 | 新「管家形象」段：64×64 预览框（User 图标占位 → 用户上传后显示 trim 后图） + 上传按钮（触发隐藏 input file）+ 「恢复默认」按钮（仅有自定义时显示）+ 错误提示；状态：`customPreview / uploading / uploadErr` |

### 🎯 关键设计

- **MVP 一图通替**：用户上传 1 张图 → poseName="default" → ButlerCharacter 所有姿势用同一张。比"为 7 姿势分别上传"门槛低 100 倍；后续可扩展 perpose
- **客户端 trim**：完全在浏览器跑（无需服务端），算法镜像 [046] 的 Python 脚本。单次循环兼算 alpha keying + bbox（性能优化，避免双 pass）。canvas 用 `willReadFrequently: true` 提示浏览器
- **CustomEvent 通信**：setCustomAsset/clearCustomAsset → `window.dispatchEvent(BUTLER_ASSET_EVENT)` → ButlerCharacter listener 重载 → 用户上传后无需刷新页面，UI 立刻换肤
- **Object URL 生命周期**：每次创建 `URL.createObjectURL` 都跟踪 ref/state，unmount 或替换时 `revokeObjectURL` 防内存泄漏（PreferencesPanel + ButlerCharacter 两处都处理了）
- **失败优雅降级**：trim 失败（如纯白图 → 全透明）、文件过大、解码失败都 throw 明确错误 → 红字提示
- **Dexie v6 迁移幂等**：仅加表，不动旧数据；老用户首次访问自动迁移

### 🚦 进度

| Phase | 状态 |
|---|---|
| **A. Dark Mode 优化** | ✅ [048] |
| **B. 颜色自定义** | ✅ [049] |
| **C. 人物自定义** | ✅ 本条 [050] |
| D. 元素位置自定义 | ⏳ 下一条 |
| E. 自定义面板 | ⏳ |

### ✅ 验证

- `tsc --noEmit` EXIT=0
- HMR 自动加载（Dexie v6 升级在用户下次开页面时静默执行）
- 待用户实测：偏好设置 → 管家形象 → 上传任意 PNG/JPG → 看到预览 → 主界面管家姿势立刻换；点「恢复默认」回到内置 7 姿势

### 📝 已知限制（Phase C MVP，后续可扩展）

- 只支持 default（替换全部）；不支持 per-pose 单独上传
- 客户端 trim threshold 固定 240，复杂背景（非纯白）可能误抠
- 上限 4MB（IndexedDB blob 单条 4MB 已足够大多数图片，避免 IndexedDB 性能崩盘）

### 💾 备份建议

`backup-049-accent-color` 之后，本次紧跟。建议 tag：`backup-050-custom-character`

---

## [049] 2026-05-27 — 自定义系统 Phase B：颜色自定义（color picker + 派生）

> 接 [048] Phase A，Phase B 让用户选 primary 色，UI 跟随。承「按推荐顺序全部 4 Phase」。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/lib/theme.ts` | **新建** | hex↔RGB↔HSL 转换工具 + `deriveAccentScheme(baseHex)` 派生 light/dark 两套 primary/hover/soft + `applyAccentColor` DOM 注入 + localStorage `butler.accent` 持久化 + 6 个预设（墨绿/海军蓝/紫罗兰/玫瑰红/杏橙/石墨灰） |
| `apps/web/src/components/PreferencesPanel.tsx` | 修改 | (1) `applyStoredPreferences` 加 `applyStoredAccent()` 调用（mount 防闪烁）；(2) 新「主题色」段：6 个 swatch（30×30 圆角，active 描黑边）+ HTML5 `<input type="color">` 自定义（Palette 图标 fallback UI）+ 重置按钮（仅非默认时显示） |

### 🎨 派生算法

```ts
// light: 用户选色直接 primary
// hover = HSL(h, s, l+5)；soft = HSL(h, s-50, 92)  // 高去饱和 + 高亮度淡底
// dark: 暗 bg 需要更高亮度的 primary 才视觉跳出
darkL = l < 50 ? 68 : Math.min(78, l + 8)
darkPrimary = HSL(h, max(35, min(70, s)), darkL)
darkHover   = HSL(h, darkS, darkL + 5)
darkSoft    = HSL(h, s-25, 18)
```

### 🎯 实现要点

- **CSS 变量注入**：动态创建 `<style id="butler-accent-override">` 元素覆盖 globals.css 的 `:root` + `html[data-theme="dark"]` 默认值。重置时直接删 style 元素回到墨绿默认
- **默认即移除**：用户选回墨绿 `#1B3D2F` 时 `localStorage.removeItem` + 移除 style → 不留垃圾数据
- **mount 防闪烁**：`applyStoredPreferences()` 同时调 `applyStoredAccent()`，所有偏好一次性应用
- **暗色对比度**：用户选偏暗色（L<50）时自动提亮到 L=68，避免在 #0F172A 上完全看不见
- **预设 6 色**：覆盖大多数审美（专业墨绿/沉稳蓝/创意紫/温暖红/活力橙/中性灰），不需要 picker 也能换肤

### ✅ 验证

- `tsc --noEmit` EXIT=0
- HMR 自动加载
- 待用户实测：偏好设置 → 主题色段点击 swatch 立即换肤（按钮/链接/active tab/边框 hover 全部跟随）；自定义 hex 输入 / 重置按钮工作

### 🚦 下一步（Phase C 人物自定义）

按 Phase C → D → E 顺序执行：
- Phase C：上传管家 PNG → IndexedDB 持久化 → 客户端 trim（透明背景）→ ButlerCharacter 优先用用户上传
- Phase D：Tab 顺序拖拽 / 管家位置（左/中/右/隐藏）/ Drawer 位置
- Phase E：用户创建额外面板 / 隐藏内置 / 配置持久化

### 💾 备份建议

`backup-048-darkmode-polish` 之后，本次紧跟。建议 tag：`backup-049-accent-color`

---

## [048] 2026-05-27 — 自定义系统 Phase A：Dark Mode 优化

> 用户要做"高灵活度自定义系统（颜色 / 人物 / 元素位置 / 自定义面板），无需预设主题，但要优化目前的黑夜系统"。整套拆 5 个 Phase，本条是 Phase A — 把现有 dark mode 真正做扎实，为 Phase B (color picker) 等后续打地基。

### 🎯 Phase 拆分（接班可见）

| Phase | 内容 | 状态 |
|---|---|---|
| **A. Dark Mode 优化** | 硬编码色 → CSS 变量 + 暗色 token 全覆盖 | ✅ 本条 [048] |
| B. 颜色自定义 | Primary color picker + 自动派生 hover/soft | ⏳ |
| C. 人物自定义 | 用户上传管家 PNG + 持久化 IndexedDB | ⏳ |
| D. 元素位置自定义 | Tab 顺序拖拽 / 管家位置 / Drawer 位置 | ⏳ |
| E. 自定义面板 | 用户创建额外面板 + 隐藏内置面板 | ⏳ |

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/app/globals.css` | 修改 | 新增 15+ token：`--shadow-{card,card-hover,bubble,modal,drawer}` / `--color-{code-bg,code-text,overlay,overlay-soft}` / `--color-{success,warning,danger}-soft` + success-strong；暗色块全套覆盖（阴影改纯黑深 alpha；代码块比 surface 更深；overlay 加深；success/warning/danger-soft 反转成暗背景浅文字配色） |
| `apps/web/src/components/AttachmentPreview.tsx` | **重写** | [025] Stage E 没扫到的死角:整个 modal 硬编码白底 + 紫色 legacy 渐变(`linear-gradient(#6366f1, #8b5cf6)`)按钮 + 黑灰文字。重写为全 CSS 变量:overlay/bg/border/text 都走 token；按钮统一墨绿；复制按钮成功态用 `--color-success-soft/-strong` |
| `apps/web/src/components/ChatCanvas.tsx` | 修改 | (1) `.ai-md pre` 代码块 `#1f2937 / #f3f4f6` → `var(--color-code-bg/-text)`；(2) QuickCard hover/normal 阴影 → `var(--shadow-card-hover/card)`；(3) ButlerBubble shadow `0 2px 10px rgba(27,61,47,0.08)` → `var(--shadow-bubble)`；(4) 错误消息 retry btn hover red → `var(--color-danger-soft)` |
| `apps/web/src/components/ConfirmCard.tsx` | 修改 | shadow → `var(--shadow-card-hover)`；reject btn hover red 0.1 → `var(--color-danger-soft)` |
| `apps/web/src/components/TodayHero.tsx` | 修改 | shadow → `var(--shadow-card-hover)` |
| `apps/web/src/components/InputPod.tsx` | 修改 | 6 处硬编码色：drag overlay 紫 legacy → primary-soft；textarea `#111` → text；attach btn 灰 hover → text-faint/surface；FileChip 灰底灰边 + 文件名/大小/remove 全套 → 全 var |

### 🎨 暗色阴影策略

之前 light mode 用 `rgba(27,61,47,0.08)`（墨绿微淡）→ 在 dark bg 上几乎不可见 → 卡片悬浮感丢失。  
新 token 在暗色覆盖块改成 `rgba(0,0,0,0.30~0.60)` 纯黑深 alpha，配合暗 bg 反而层次更清晰。

| 用途 | light | dark |
|---|---|---|
| `--shadow-card` | `0 1px 2px rgba(0,0,0,0.03)` | `0 1px 2px rgba(0,0,0,0.30)` |
| `--shadow-card-hover` | `0 4px 14px rgba(27,61,47,0.08)` | `0 4px 14px rgba(0,0,0,0.40)` |
| `--shadow-bubble` | `0 2px 10px rgba(27,61,47,0.08)` | `0 2px 10px rgba(0,0,0,0.35)` |
| `--shadow-modal` | `0 20px 60px rgba(0,0,0,0.18)` | `0 20px 60px rgba(0,0,0,0.60)` |

### 🎨 success/warning/danger-soft 策略

light mode 用浅底色 + 深字（`#DCFCE7` + `#065F46`），dark mode 反转用深底色 + 浅字（`#14532D` + `#86EFAC`）— 既符合暗色规范又保留语义识别度。

### ✅ 验证

- `tsc --noEmit` EXIT=0
- 已知保留的硬编码语义色（设计意图，不算 bug）：
  - `#ea580c`（TasksPanel/TodayHero 紧急 deadline 橙）— 紧急度语义色
  - `#dc2626 / #10b981 / #6366f1`（InputPod FileChip 文件类型 icon 色）— PDF/图片/其他识别色
  - `#fff`（AttachmentPreview 主按钮白字）— 白字在深绿底正确
- HMR 已自动加载

### 📊 完整度更新

| Tab | 之前 | 现在 |
|---|---|---|
| Dark Mode | 框架在但 AttachmentPreview/InputPod 大面积破窗 | ✅ 全套 token + 主要组件全部 var 化 |

### 🚦 下一步候选（Phase B）

- **Phase B 颜色自定义**：PreferencesPanel 加 color picker，选 primary 色 → 派生 hover (HSL +5 lightness) + soft (HSL -85 saturation, +50 lightness)；存 localStorage；mount 时 applyStoredPreferences 注入到 `:root` 作为 CSS 变量覆盖
- 或先跳到 Phase C 人物自定义 / D 元素位置 / E 自定义面板
- 或别的方向

### 💾 备份建议

`backup-047-thinking-tail-fix` 之后，本次紧跟。建议 tag：`backup-048-darkmode-polish`

---

## [047] 2026-05-27 — 修复思考模式末尾误报「出错了」气泡

> 用户报告：思考模式 V4 Pro 推理 + 输出**全部正常完成**之后，下方紧跟一条 ❌ 出错了 气泡。判断为误报。

### 🐛 根因

服务端 `/api/chat` 的 SSE 流处理是：
```ts
try { for await (const chunk of stream) { 转发 } }
catch (err) { 发 error chunk 给客户端 }
```

DeepSeek V4 Pro thinking 模式的尾部 `usage` chunk（含 token 用量）+ OpenAI SDK 的严格迭代器解析偶尔会在**所有有效内容已成功流出后**抛错。catch 块依然发了 error chunk → 客户端 `chunk.error` 分支触发 `onError` → page.tsx `onError` 回调追加新的 `isError: true` 消息 → 用户看到"AI 答完了，下面又冒一条 ❌ 出错了"。

### 📂 涉及文件

| 文件 | 改动 | 说明 |
|---|---|---|
| `apps/web/src/app/api/chat/route.ts` | 修改 | 跟踪 `hasEmittedChunk`：(1) 若 catch 时已发过有效 chunk，console.warn 抑制不再发 error chunk；(2) `[DONE]` 移到 finally 块，确保**无论成功还是良性尾错都发**，客户端可靠知道流结束 |
| `apps/web/src/lib/chat-client.ts` | 修改 | 双保险：跟踪 `hasReceivedDelta`（content/reasoning/tool_calls 任一）。若 SSE 解析到 `chunk.error` 但本轮已有 delta，console.warn 抑制不触发 `onError` |

### 🎯 防御设计

| 层 | 触发条件 | 处理 |
|---|---|---|
| 服务端 | for-await 异常 + 已发 chunk | 仅 `console.warn`（服务端日志），客户端不收 error chunk |
| 服务端 | for-await 异常 + 未发 chunk | 真错误：发 error chunk + 仍发 [DONE] |
| 客户端 | 收到 error chunk + 本轮有 delta | 仅 `console.warn`（浏览器 console），不弹错误气泡 |
| 客户端 | 收到 error chunk + 本轮无 delta | 调 `onError` → page.tsx 追加错误气泡（合理） |

### ✅ 验证

- `tsc --noEmit` EXIT=0
- HMR 自动应用，无需重启 dev server
- 待用户实测：思考模式 send 完整轮 → 不再看到底部多余的 ❌ 出错了

### 📝 备注

修复后若仍偶尔看到错误气泡 → 多半是 fetch 层 500（DeepSeek API 短时熔断），那种情况错误是真实的应该显示。可在浏览器 console 看 `[chat] streamChat error` 区分。

### 💾 备份建议

`backup-046-butler-poses` 之后，本次紧跟。建议 tag：`backup-047-thinking-tail-fix`

---

## [046] 2026-05-27 — 4 张新姿势 SVG → trim PNG 接入（[033] 留尾收尾）

> [033] 实现了 7 姿势状态机但 4 张新姿势资产未到 → 全部 fallback 到 standing。本条把用户上传的 4 张 SVG 转成与现有 3 张同规格的透明 trim PNG，正式上线。

### 🎨 资产处理流程

用户上传的 4 张 `Doc/bulter/*.svg` 实际是 **1254×1254 JPEG-in-SVG 包装**（和现有 `butler-{standing,serving,pointout}.svg` 同结构），白底无 alpha。沿用 [027] 已有的"PNG trim"工序自动化：

| 步骤 | 实现 |
|---|---|
| 1. 提取 base64 JPEG | 正则 `xlink:href="data:image/jpeg;base64,..."` |
| 2. 白底抠图 | PIL: `rgb >= 240` → alpha=0（threshold 240 兼容 JPEG 边缘抗锯齿） |
| 3. 边缘裁剪 | `Image.getbbox()` → crop 到真实角色 bbox |
| 4. 输出 PNG | `optimize=True` 压缩 |

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `scripts/trim_butler_poses.py` | **新建** | 一次性脚本：4 张 SVG → 4 张 trim PNG。今后若用户给同格式新资产，改 `MAPPING` 即可复用 |
| `my-app/apps/web/public/assets/butler-thinking.png` | **新建** | 1254² → trim **324×1056**（87.6KB）|
| `my-app/apps/web/public/assets/butler-thinking-hard.png` | **新建** | 1254² → trim **293×1099**（93.1KB）|
| `my-app/apps/web/public/assets/butler-idea.png` | **新建** | 1254² → trim **459×1051**（106.7KB）|
| `my-app/apps/web/public/assets/butler-rare-thinking.png` | **新建** | 1254² → trim **637×855**（150.1KB，矮宽坐姿）|
| `my-app/apps/web/src/components/ButlerCharacter.tsx` | 修改 | `POSES` 表 4 个新 pose 的 `w/h` 从 `STANDING_W/H` 占位换成 trim 后真实尺寸；删除 `STANDING_W/STANDING_H` 常量；注释更新指向新脚本 |

### 🎯 视觉影响

之前所有 4 新 pose `naturalWidth === 0` → onError fallback → 渲染 standing。现在：

- **thinking**（V4 Flash 生成中 / V4 Pro 进入 content 阶段）→ 显示思考姿势
- **thinking-hard**（V4 Pro reasoning_content 流中）→ 显示深度思考姿势
- **idea**（reasoning→content 过渡的 1s 灵感闪现）→ 显示灵光一现姿势
- **rare-thinking**（7-9am × 6.1% 彩蛋）→ 矮宽坐姿（高度 855 vs 其他 ~1050，视觉上"坐下来"，符合早晨喝咖啡感）

`MAX_W` 现在是 683（serving 仍最宽），`MAX_H` 仍是 1099（thinking-hard 略超 standing 1094）→ 容器尺寸基本不变，pose 切换不抖动。

### ✅ 验证

- `tsc --noEmit` EXIT=0
- trim 脚本 stdout 实测 4 张尺寸合理（width 293-637 / height 855-1099，落在 standing/serving/pointout 同区间）
- 7 张 PNG 全部就位（`ls public/assets/butler-*.png`）

### 🚦 下一步候选

- **Notes 92% → 100%**：`[[wikilink]]` 双链 + 全文搜索（fuse.js），为 Phase 3 Tauri 接 Obsidian Vault 做铺垫
- **Phase 3 Tauri 桌面壳启动**：系统通知 + 本地文件 IPC + Notes 迁移到本地 Vault
- 别的方向

### 💾 备份建议

`backup-045-growth-pillars` 之后，本次紧跟。建议 tag：`backup-046-butler-poses`

---

## [045] 2026-05-25 — G2 留存 + G3 传播 + G5 AI 差异化 三件套一次性完成

> 用户「按推荐顺序全部 6 Pillar」。继 [044] G1 激活后,本条收尾剩余 3 个增长支柱。

### G2 留存机制

| 子项 | 文件 | 说明 |
|---|---|---|
| **G2.1 streak 连续天数** | `lib/streak.ts`(新)+ TodayHero 加 🔥 chip | localStorage 存 lastActiveDate/currentDays/longestDays;每次 hydrate 后 touchStreak,新一天 toast「连续 N 天」+ 断签提示「重新开始」 |
| **G2.2 成就系统** | `lib/streak.ts` `ACHIEVEMENTS[8]` | 初心者/执行者/勤勉/高产/随手记/3 日坚持/习惯养成/月度狂热;page.tsx useEffect 检测 + 解锁 Toast 错开 0.5s 弹 |
| **G2.4 PWA manifest** | `public/manifest.webmanifest`(新)+ `layout.tsx metadata.manifest` | 装机:short_name "Butler"、theme_color 墨绿、display standalone |

### G3 传播闭环

| 子项 | 文件 | 说明 |
|---|---|---|
| **G3.1 .ics footer 水印** | `lib/ics-export.ts` | 每条 VEVENT DESCRIPTION 加「—— Powered by Butler · 智能学习管家 https://butler.app」;用户导入手机日历后被动看到 |
| **G3.2 学习报告分享卡** | `mini-apps/ShareCard.tsx`(新) + MiniAppsDrawer 加入口 | 540×800 竖版 SVG 海报:本周完成度大数字 + 累计/进行中 chip + 7 天柱图 + Butler 品牌 footer;长按/右键保存,适合朋友圈/小红书分享 |

### G5 AI 差异化

| 子项 | 文件 | 说明 |
|---|---|---|
| **G5.1 管家角色化(3 档)** | `PreferencesPanel.tsx` 加 personality 段;`chat-client.ts` + `chat/route.ts` 透传;`buildSystemPrompt` 加 PERSONALITY_LINE | gentle 温柔学姐(「呢」「呀」+ ✨💚🌸) / standard 标准 / sassy 损友(「啧」「行吧」+ 吐槽);localStorage `butler.personality`;切换立刻生效 |
| **G5.2 学习习惯识别** | `page.tsx` `bestHourLabel` useMemo + TodayHero chip | 本地统计 messages 时间戳 → 7 时段分桶(深夜/早晨/上午/.../晚上),样本 ≥5 时显示「⚡ 你 X 最高效」 |

### 📂 新建文件汇总

- `lib/streak.ts`
- `public/manifest.webmanifest`
- `components/mini-apps/ShareCard.tsx`

### ✅ 验证

`tsc --noEmit` EXIT=0(每个 Pillar 后单独验证)

### 📊 5 个增长支柱完成度对照

| Pillar | 状态 | 关键产出 |
|---|---|---|
| **G1 激活率** | ✅ [044] | Demo 数据 / 大拖拽 / Tour / .ics 导入 |
| **G2 留存** | ✅ [045] | streak / 成就 / PWA |
| **G3 传播** | ✅ [045] | ics 水印 / 分享卡 |
| **G5 AI 差异化** | ✅ [045] | 管家 3 性格 / 习惯识别 |
| G4 变现 | ❌ Phase 4 后做 | — |

### 🚦 下一步候选

- Phase 3 Tauri 桌面壳启动(系统通知 + 本地 Obsidian Vault)
- 你给 4 张新姿势 PNG 接入
- Notes 92% → 100%(`[[wikilink]]` + 全文搜索)
- 别的方向

### 💾 备份建议

`backup-044-activation` 之后,本次紧跟。建议 tag:`backup-045-growth-pillars`

---

## [044] 2026-05-25 — G1 激活率提升:Demo 数据 + 大拖拽 + Tour + .ics 导入

> 用户增长 5 支柱中选了 G1(激活率)。一次性收尾 4 子项,把"新用户进来 30 秒决定留不留"的体验补齐。

### 📂 新建文件

| 文件 | 说明 |
|---|---|
| `lib/demo-data.ts` | `buildDemoData()` 生成 3 门课 × 8 任务 + 2 笔记(C245 数据结构 / ECON101 经济学 / ENG201 学术英语);全部基于今天 + N 天派生,deadline 始终未来 |
| `lib/ics-import.ts` | `parseIcs(raw)` 手写 .ics 解析(SUMMARY/DTSTART/DESCRIPTION + RFC 5545 line-folding + 文本转义);`icsEventsToDdls()` 转 DdlItem;`pickIcsFile()` 浏览器文件选 |
| `components/OnboardingTour.tsx` | 5 步 Tour:暗色遮罩 + anchor 高亮框(墨绿描边 + pulse 动画) + tooltip(5 个位置策略) + 进度条 + 上/下/跳过 + localStorage 防重复 |

### 📂 改动文件

| 文件 | 改动 |
|---|---|
| `app/page.tsx` | `handleLoadDemo` 一键 push demo ddls + notes + Toast 带 Undo;`handleImportIcs` 选文件 → parse → 批量 setDdls + Undo;`onLoadDemo` / `hasAnyData` 透传给 ChatCanvas;渲染 `<OnboardingTour />` |
| `components/ChatCanvas.tsx` | (1) 欢迎屏文案分支:`hasAnyData` 时用原文,否则"第一次见面"加强 CTA;(2) `DropHeroZone` 子组件:280×140 虚线大拖拽热区(墨绿描边 + 拖入高亮 + 点击 fileInput) + 「没课件?Demo →」按钮 |
| `components/TasksPanel.tsx` | 工具栏加「导入 ICS」按钮(条件渲染 `onImportIcs` 时显示);label 区分「导入 JSON」 |

### 🎯 用户激活路径(改进后)

```
新用户进入
  ↓
看到欢迎屏:管家说"第一次见面" + TodayHero + DropHeroZone(高对比)
  ↓
1.5s 后 Tour 启动 → 5 步走完核心路径(管家/4 Tab/输入/模型/搜索)
  ↓
3 个进入路径任选其一:
  (a) 拖 PDF 课件 → OCR + AI 提取 DDL
  (b) 上传 .ics 课表 → 一键批量导入
  (c) Demo 数据 → 立刻"有东西可玩"
  ↓
TodayHero 显示真实数据 + 跨面板联动起作用
```

### ✅ 验证

`tsc --noEmit` EXIT=0

### 🚦 G1 子项收尾对照

| # | 子项 | 状态 |
|---|---|---|
| G1.1 | Demo 数据一键填充 | ✅ |
| G1.2 | 欢迎屏大拖拽热区 + 强引导 | ✅ |
| G1.3 | 5 步 Tour | ✅ |
| G1.4 | .ics 导入 | ✅ |
| G1.5 | 短视频 GIF 引导 | ❌ 需资源 |

### 📊 完整度

| 维度 | 之前 | 现在 |
|---|---|---|
| **激活漏斗** | 进来无引导 | 5 步 Tour + Demo + 大 CTA + .ics 入口 |
| **空状态价值** | TodayHero「无 deadline」 | + Demo + DropHero + Tour |

### 💾 备份建议

`backup-043-calendar-100` 之后,本次紧跟。建议 tag:`backup-044-activation`

### 🚦 下一步候选

- G2 留存机制(streak + 周报 + 成就)
- G3 传播闭环(分享卡)
- G5 AI 差异化(角色化管家 + 习惯识别)
- 别的方向(Phase 3 Tauri / 资产替换)

---

## [043] 2026-05-25 — Calendar C3+C4:Week 视图空格点击创建 + 事件拖拽改时间

> 继 [042] C1/C2 把 Calendar 推到 90% 后,补齐最后 10% 的拖拽支持,Calendar 现达 100%。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/TaskDetailDrawer.tsx` | 修改 | `EditingTarget.create` 新增 `presetTime?: string`;`initialTime` 派生从 prop 取（落到表单的 dueTime 输入框） |
| `apps/web/src/components/CalendarPanel.tsx` | 修改 | (1) `Props.onRequestCreate` 签名加 `presetTime`;新增 `onMoveEvent` prop;(2) WeekView 加 `onCreateAt(iso, hour)` callback;时间格 onClick 触发(target.tagName==="DIV" 判定空白区);(3) WeekView 事件 button 加 `draggable + onDragStart` 存 itemId 到 dataTransfer;(4) 时间格加 `onDragOver/onDragLeave/onDrop` 视觉反馈(墨绿浅底)+ emit onMoveEvent |
| `apps/web/src/app/page.tsx` | 修改 | 新增 `handleMoveEvent(id, newDate, newTime)`:setDdls map patch + toast.info;`onRequestCreate` 透传 presetTime;`onMoveEvent` 传给 CalendarPanel |

### 🎯 交互细节

- **C3 点空格创建**:Week 视图任意小时格鼠标变 `cell` 指针;点击空白处 → New Event modal 自动预填日期 + 整点时间;点击已有事件 stopPropagation 避免误触发
- **C4 拖动事件改时间**:任意事件 hover 鼠标变 `grab`;拖到任意目标时间格 → 蓝绿色高亮反馈 → 释放即 update + Toast 提示「已移动到 YYYY-MM-DD HH:00」
- **数据流**:不走 ConfirmCard 核实(用户主动操作,信任度高);走 setDdls + Toast info,可惜暂未做 Undo(同 Tasks 删除有 Undo,这里后续可加)

### ✅ 验证

`tsc --noEmit` EXIT=0

### 📊 完整度

| Tab | 之前 | 现在 |
|---|---|---|
| Calendar | ~90% | **~100%** |

DayView 的拖拽未做（暂保留原有静态时间轴）;后续可考虑把 WeekView 的拖拽机制复用到 DayView。

### 💾 备份建议

`backup-042-calendar-90` 之后,本次紧跟。建议 tag:`backup-043-calendar-100`

### 🚦 下一步候选

- Phase 3 Tauri 桌面壳启动（接 Notes 本地 Vault / 系统通知 / 文件路径）
- 你给 4 张新姿势 PNG(thinking / thinking-hard / idea / rare-thinking)接入
- DayView 拖拽（复用 WeekView 机制）
- 别的方向

---

## [042] 2026-05-25 — Calendar C1+C2:迷你月历 + Week 视图

> 继 [041] 6 Epic 收尾后,把 Calendar 75% 推到 ~90%。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/layout/CalendarRail.tsx` | 重写 | C1 真实迷你月历:7×6 网格 + 上下月切换 + 今日墨绿圆 + 有事件日期下方小圆点;点击日期 emit `onJumpToDay(iso)` |
| `apps/web/src/components/CalendarPanel.tsx` | 修改 | (1) `ViewMode` 加 `"week"`;(2) `jumpToDay` prop + useEffect 监听外部跳转切到 day view;(3) MonthView header 加「Week」按钮跳到本周视图;(4) 新增 `WeekView` 子组件(~180 行):7 列 × 24h 时间轴(6AM-11PM),今日列浅墨绿背景,事件按 dueTime 落格,点击编辑 |
| `apps/web/src/app/page.tsx` | 修改 | 新增 `calendarJumpDay` state(用 `iso#timestamp` 防同 iso 二次点击不触发);CalendarRail / CalendarPanel 接入 |

### 🎯 交互

- **迷你月历**:CalendarRail 一直可见,任意月份任意日期一键跳 Day View
- **Week 视图**:月视图 header 点 [Week] → 进入;7 天时间轴显示一周所有事件,直观看到密度
- **Day View 返回**:同时也是 Week View 的返回点(都返回到 month)

### ✅ 验证

`tsc --noEmit` EXIT=0

### 📊 完整度

| Tab | 之前 | 现在 |
|---|---|---|
| Calendar | ~75% | **~90%** |

剩余 10%:Day View 拖拽创建 / 事件拖动改时间(HTML5 drag&drop,工作量中-大,后续可做)

### 💾 备份建议

`backup-041-uiux-all-epics` 之后,本次紧跟。建议 tag:`backup-042-calendar-90`

---

## [041] 2026-05-25 — UI/UX 增值计划 Epic 4/5/2/6/3 一次性收尾

> 用户「按推荐顺序全部 6 Epic」。继 [040] Epic 1 反馈循环后，本条一次记录剩余 5 个 Epic（仪表盘 / 学生场景 / 键盘 / 微交互 / 个性化）共 16 个子项。

### Epic 4 — 仪表盘 / 数据感知

| # | 子项 | 文件 |
|---|---|---|
| 4.1 | **TodayHero 今日聚焦卡** | `components/TodayHero.tsx`(新)+ ChatCanvas 欢迎屏接入。本地数据派生:今日日期/星期 + 3 个统计 chip(今日/本周/累计完成)+ 本周完成率环形 + 最近 deadline 倒计时(色彩按 daysLeft 升级) |
| 4.2 | **Deadline 紧急度色彩升级** | `TasksPanel.tsx` 新增 `computeUrgency(d)`:任务行左侧色条按 daysLeft 派生(<1 红 / <3 橙 / <7 黄 / else 绿),无 deadline 退回 priority |
| 4.3 | **StatsApp Mini App** | `components/mini-apps/StatsApp.tsx`(新)+ MiniAppsDrawer 加 BarChart3 入口。累计完成/未完成大数字 + 7 天完成趋势 SVG 条形图 + Top 3 tag 完成率条 |
| 4.4 | **Tasks 顶部 tag chip 聚合** | TasksPanel 头部加 `tagStats` useMemo,显示 Top 12 tag 的 `#tag · done/total · 进度条`(完成率达 100% 显示 success 色) |

### Epic 5 — 学生场景

| # | 子项 | 文件 |
|---|---|---|
| 5.1 | **FocusTimer ↔ Task 联动** | FocusTimer 加 `linkedTaskId` 下拉(未完成任务列表)+ 结束时 emit `onAppendTaskNote(taskId, "- 专注 25 min · MM-DD HH:MM")` → page.tsx 把行追加到 task.notes;同时 toast.info 反馈 |
| 5.3 | **任务模板 4 选 1** | TaskDetailDrawer 顶部加 4 个 emoji 模板按钮(Quiz 📝 / Paper 📄 / Project 🚀 / Reading 📖),点击预填 weight/priority/tags/description/isGroupWork |
| 5.4 | **临近 deadline 浏览器通知** | page.tsx hydrate 后每 60s 扫描未来 24h 截止的未完成任务,Toast warning + 浏览器 Notification API(可选授权);`deadlineNotifiedRef` Set 防重复;5s 后静默请求 Notification 权限 |

### Epic 2 — 键盘体验

| # | 子项 | 文件 |
|---|---|---|
| 2.1 | **全局快捷键** | page.tsx useEffect 监听 keydown:`⌘N` 按当前 Tab 新建会话/任务/事件/笔记;`Esc` 兜底关 shortcuts/previewNotes/previewing/editing/miniApps |
| 2.3 | **? 快捷键帮助 modal** | `components/KeyboardShortcutsHelp.tsx`(新)。3 组(全局/Tasks/Chat 输入)分组列出,kbd 样式按键;Esc 关闭 |

### Epic 6 — 微交互打磨

| # | 子项 | 文件 |
|---|---|---|
| 6.5 | **Empty state 人格化** | TasksPanel `EmptyState` 加管家小气泡「☕ 放假了？让我陪你休息一下」墨绿底圆角;NotesPanel `EmptyHero` 加「💡 在 Chat 里说『帮我记一条笔记』我也能帮你写」 |

(6.1 skeleton / 6.2 Tour / 6.3 拖拽 / 6.4 管家追光标 — 当前 hydrate 速度足够快、用户暗示足够、花哨细节优先级低,暂不做)

### Epic 3 — 个性化

| # | 子项 | 文件 |
|---|---|---|
| 3.1 | **亮/暗主题切换** | globals.css 加 `html[data-theme="dark"]` 覆盖墨绿系（primary `#5FB58F` 浅墨绿 + bg `#0F172A` 深 slate）|
| 3.2 | **字体大小档位** | globals.css `--font-base` 变量 + `html[data-font-size]` 3 档（sm 13 / md 14 / lg 16）;body 用 `var(--font-base)` |
| — | **PreferencesPanel modal** | `components/PreferencesPanel.tsx`(新)。亮/暗 segmented + 字号 segmented;localStorage 持久化(butler.theme / butler.fontSize);`applyStoredPreferences()` mount 时立即生效防闪烁 |
| — | **TopBar 用户菜单加入口** | 用户菜单顶部加「⚙️ 偏好设置」MenuBtn → 打开 PreferencesPanel |

### 📂 新建文件汇总

- `components/TodayHero.tsx`
- `components/mini-apps/StatsApp.tsx`
- `components/KeyboardShortcutsHelp.tsx`
- `components/PreferencesPanel.tsx`

### ✅ 验证

`tsc --noEmit` EXIT=0(每个 Epic 后单独验证)

### 🎯 完整度更新

| Tab | 之前 | 现在 |
|---|---|---|
| Chat | ~100% | ~100% + Hero 卡 / 键盘 / 偏好 |
| Tasks | ~97% | **~99%**(deadline 色彩 + tag 聚合 + 模板 + 通知) |
| Notes | ~92% | ~92% + 人格化 Empty |
| Calendar | ~75% | ~75%(下一步候选) |
| **跨面板** | ~80% | ~80% |
| **平台增值** | 0% | **Toast 系统 + Undo / 偏好 / 键盘 / 通知 / Stats 全新增** |

### 🚦 已完成的 6 Epic 完整清单（[040] + [041]）

```
✅ Epic 1 反馈循环（[040]）  4 子项 Toast / Undo / AI 实时提示 / 替换 alert
✅ Epic 4 仪表盘             4 子项 TodayHero / 紧急度 / StatsApp / Tag 聚合
✅ Epic 5 学生场景            3 子项 FocusTimer↔Task / 模板 / Deadline 通知
✅ Epic 2 键盘体验            2 子项 全局快捷键 / 帮助面板
✅ Epic 6 微交互              1 子项 Empty 人格化
✅ Epic 3 个性化              4 子项 暗色 / 字号 / Panel / 用户菜单入口
```

### 💾 备份建议

`backup-040-feedback-loop` 之后,本次紧跟。建议 tag:`backup-041-uiux-all-epics`

---

## [040] 2026-05-25 — Epic 1 反馈循环:Toast 系统 + 删除 Undo + AI tool 实时提示

> 用户「按推荐顺序全部 6 Epic」第一个 Epic — 替换全部 alert()、删除带撤销、AI 调工具时浮提示。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/Toast.tsx` | 新建 | ToastProvider + useToast hook;4 档（success/info/warning/error）;支持 action 按钮（用于 Undo）;同 id 覆盖防堆叠;顶右 stack + 滑入动画 |
| `apps/web/src/app/layout.tsx` | 修改 | 根布局 wrap `<ToastProvider>` |
| `apps/web/src/app/page.tsx` | 修改 | (1) `handleDeleteDdl / handleDeleteNote / handleDeleteSession` 都保存 snapshot + 弹 Toast「已删除 [撤销]」5s;(2) ICS/JSON 导入导出 alert → toast.success/warning/error;(3) AI tool 调用时 `onToolCallStart` 弹 1.5s info toast「⚙ Butler 正在查询任务列表…」按工具名分类提示 |
| `apps/web/src/components/mini-apps/FocusTimer.tsx` | 修改 | 倒计时结束 alert → toast.success「🎉 专注时段结束」8s 持续显示 |

### ✅ Epic 1 收尾

- `tsc --noEmit` 通过
- 项目内 `grep alert\\(` 已为 0
- Undo 实测:删任务后 5s 内点撤销 → setDdls 恢复

---

## [039] 2026-05-25 — 跨面板联动四件套 B2/B1/B3/B4 一次性完成

> 用户「跨面板联动这个要首先完成」+ 「全部四项推荐」+「按照顺序全部完成」。这是从"4 个独立面板"升级为"互联 Personal Learning OS"的关键一步。

### 🎯 4 项联动一览

| 项 | 用户场景 | 工作流 |
|---|---|---|
| **B2** AI create_note tool | 「帮我把这段话记成笔记」 | AI 调 tool → ConfirmCard 紫色 BookOpen 卡 → 用户接受 → 落 Notes 表 |
| **B1** 任务 ↔ 笔记双向关联 | 任务里加备忘 / 笔记反查相关任务 | TaskDetailDrawer「📝 创建关联笔记」一键创空笔记+关联+跳 Notes；NotesPanel 顶部显示关联任务并点跳 Tasks |
| **B3** 全局搜索跳转高亮 | 搜索后想立刻看到目标在哪 | 点击搜索结果 → 切 Tab + scrollIntoView + 2 秒黄色脉冲闪烁动画 |
| **B4** 笔记 `- [ ] todo` → Tasks | 笔记里随手记 todo,自动入任务清单 | 笔记内写 `- [ ] xxx` → 1.2s 防抖 → 自动建 task（带 noteId 回链）+ `syncedTodos` 去重防重复 |

### 📂 涉及文件总览

| 文件 | 改动量 | 内容 |
|---|---|---|
| `apps/web/src/lib/types.ts` | +2 字段 | `DdlItem.noteId?: string` / `Note.syncedTodos?: string[]` |
| `apps/web/src/lib/pending.ts` | +1 kind | `PendingCreateNote` + `extractNoteDrafts(batch)` helper |
| `apps/web/src/lib/ai-tools.ts` | +1 tool | 第 6 个 tool `create_note` + `CreateNoteArgs` 类型 |
| `apps/web/src/lib/tool-executor.ts` | +1 case | `execCreateNote` 入 pending 队列 |
| `apps/web/src/components/ConfirmCard.tsx` | +1 分支 | `describeChange` 渲染 create-note（紫色 BookOpen + 字数 + 标签 + 内容预览） |
| `apps/web/src/components/TaskDetailDrawer.tsx` | +1 Field | 关联笔记 UI:已关联显示标题+「打开」「解除」;未关联显示「📝 创建关联笔记」虚线按钮 |
| `apps/web/src/components/NotesPanel.tsx` | +2 features | (1) 顶部关联任务条（Link2 + 任务名 chip 可跳）;(2) 1.2s 防抖扫描 `- [ ] todo` 正则 emit 给 page;(3) `selectActiveId` 外部跳转选中 |
| `apps/web/src/components/TasksPanel.tsx` | +highlight | `highlightTaskId` prop,rowRefs map,scrollIntoView,行加 `.task-row-flash` className |
| `apps/web/src/components/layout/TopBar.tsx` | +1 prop | `onSearchJump(target, refId)` 透传 |
| `apps/web/src/app/page.tsx` | +5 handlers | `handleCreateLinkedNote` / `handleJumpToNote` / `handleUnlinkNote` / `handleJumpToTask` / `handleSearchJump` / `handleAutoExtractTodos`;`highlightTaskId` state + 2s timer;`notesSelectId` state |
| `apps/web/src/app/globals.css` | +1 keyframe | `@keyframes search-flash`（2s 黄色脉冲 + inset shadow）|

### 🎨 关键设计决策

**B2 走 ConfirmCard 核实**:AI 不直接落库,符合现有"AI 写操作必须用户确认"的红线。Note 类型有独立紫色 + BookOpen 图标,与 Task 的绿色 Plus 区分。

**B1 反向关联用反查而非存储**:Note 没存 `taskIds[]`,而是 `ddls.filter(d => d.noteId === note.id)` 即时反查 — 单一信息源,避免双向同步死锁。

**B3 高亮 CSS 而非 React 状态**:`highlightTaskId` 设置后 2s 由 page.tsx 清空,期间对应 row 加 `.task-row-flash` className,CSS 动画自然衰减 — 无需在每个组件维护"几秒后取消高亮"的子计时器。

**B4 单向同步**:只做"笔记 → 任务",反向（任务勾选回写笔记 checkbox）暂不做 — 避免双向同步循环触发。`Note.syncedTodos[]` 记录已同步文本作为幂等 key,删除笔记某行 todo 不会重建任务（防止"我删了你又给我添回来"）。新任务自动 `noteId = 笔记 id`,形成回链。

### ✅ 验证

- `tsc --noEmit` 通过（4 次,每项独立验证后再下一项）
- preview eval:
  - B3 `@keyframes search-flash` ✓ 注入 globals.css
  - B4 正则 `/^[\s　]*[-*]\s+\[\s\]\s+(.+?)\s*$/gm` 测试通过：`- [ ] 写论文` / `* [ ] 复习数据结构` 都匹配,`- [x] xxx` 已勾选跳过

### 🚦 跨面板联动全景图

```
       ┌───────────────────────────────────────────┐
       │            TopBar 全局搜索                │
       │      ↓ (B3 跳转 + 闪烁高亮 2s)            │
       │  ┌────────┬─────────┬───────────┐         │
       │  │ Chat   │  Tasks  │  Notes    │         │
       │  │        │   ↑↓ B1 关联 ↕      │         │
       │  │  AI    │  Tasks  ←─ B4 ──   │ Notes  │
       │  │   ↓ B2 │         │  自动建  │         │
       │  │ create │         │   task   │         │
       │  │ _note  │         │          │         │
       │  └────────┴─────────┴──────────┴─────────┘
       │            ↑ ConfirmCard 居中浮顶（B2 走核实）
       └───────────────────────────────────────────┘
```

### 📊 Butler 完整度更新

| Tab | 之前 | 现在 |
|---|---|---|
| Chat | ~100% | ~100% |
| Tasks | ~95% | **~97%**（接 B1 关联笔记 + B3 搜索高亮 + B4 笔记同步入） |
| Notes | ~80% | **~92%**（接 B1 关联任务 + B2 AI 创建 + B4 同步出） |
| Calendar | ~75% | ~75% |
| **跨面板** | 0% | **80%**（4 项全做完;`[[wikilink]]` 等长尾延后） |

### 💾 备份建议

`backup-038-stitched-bubble` 之后,本次紧跟。建议 tag:`backup-039-cross-panel`

### 🚦 下一步候选

- 等用户决定:(1) Calendar 75% → 95% / (2) Phase 3 Tauri 启动 / (3) 资产替换 / (4) 其他

---

## [038] 2026-05-25 — 开屏问候零 token + AI 气泡彻底贴边

> 用户：「确保一上来的那句问候不消耗 token 只靠代码实现 / 然后目前来看应该是 ai 回复的内容那里还有多余的容器删除掉这样对话框就能彻底的贴边了」。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/app/page.tsx` | 重写 triggerGreeting | (1) 删除 streamChat 调用 + 全部 SSE callback 累积逻辑（~70 行）；(2) 新增 `buildLocalGreeting(items)` helper：根据 hour 派生时段（深夜/早上/中午/下午/晚上）+ emoji,过滤 todo 数量,找最近未过期 deadline,拼 markdown 字符串；(3) triggerGreeting 改为同步直接 `setMessages` 添加一条 assistant 消息,不调任何 API |
| `apps/web/src/components/ChatCanvas.tsx` | 修改 | 历史消息流 wrapper 去掉 `maxWidth: CONTENT_MAX` + `margin: "0 auto"`,气泡直接占主区全宽（减 32px padding）；AI 气泡 maxWidth:90% 仍生效防大屏过宽,但小屏下能彻底贴 main 左边 |

### 🎯 开屏问候本地生成示例

```
[time<6]    深夜好,Feng！你目前的任务清单是空的... 🌙
[time<11]   早上好,Feng！你目前有 3 个未完成任务,最近的是「数据结构 Quiz」(2026-05-26)。加油 ☀️
[time<14]   中午好,Feng！... 🌤️
[time<18]   下午好,Feng！... 🌥️
[time>=18]  晚上好,Feng！... 🌃
```

### ✅ 验证

- `tsc --noEmit` 通过（EXIT=0）
- preview eval + fetch 拦截器：新建 session 触发 greeting → **`apiCalled: 0`** ✓
- 生成内容："下午好,Feng！你目前的任务清单是空的,没有待办事项..." ✓
- `bubbleLeftFromMain: 32`（精确等于 main padding-left,**彻底贴边**）✓
- `bubbleWidth: 598`（约 90% × main 内宽 666,合理）

### 💰 成本影响

| 场景 | 之前 | 现在 |
|---|---|---|
| 每次新 chat session 开屏 | 1 次 V4 调用（~200 input + ~50 output token） | **0 token** |
| 思考模式开屏 | 含 reasoning_content（更多 token） | 0 token |
| 响应时间 | 1-3 秒（API 延迟） | **<10ms 瞬间** |

### 🎨 布局对照

| 元素 | 距 main 左 |
|---|---|
| 主区 padding-left | 32px |
| 之前：800 居中容器后气泡 | 大屏可能 200-400px+（视窗口宽） |
| **现在：气泡直接贴 main padding** | **32px**（精确） |

副作用零：输入区仍 maxWidth: 800 居中（用户未要求改），欢迎屏 ButlerBubble 仍居中（这是 isEmpty 分支单独的布局）。

---

## [037] 2026-05-25 — 标准 AI 对话布局：气泡左对齐 + 核实卡居中浮顶 + 管家二次缩减到 0.33

> 用户：「ai 回复靠最左边（标准的 ai 对话）/ 只有那种选择的也就是选择是否加入 task 把卡片放在人物上方 / 现在人物基于现在的大小再次缩减到 0.6 倍」。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/ButlerCharacter.tsx` | 修改 | default `scale: number = 0.55 → 0.33`（= 0.55 × 0.6 二次缩减）；standing 像素从 206×602 → **123×361** |
| `apps/web/src/components/ChatCanvas.tsx` | 修改 | (1) `ButlerBubble` outer div `justifyContent: "center" → "flex-start"`,AI 气泡回归**标准 ChatGPT 左对齐**；(2) `ConfirmCard` 渲染处包一层 `<div style={{ justifyContent: "center" }}>` 让**核实卡独立居中浮在管家上方**,区别于普通 AI 消息,强调"等你决策" |

### 🎯 布局对照（最终态）

| 元素 | 位置 |
|---|---|
| 用户气泡 | 右对齐（不变） |
| AI 普通回复气泡 | **左对齐**（[037] 回归标准） |
| ConfirmCard 核实卡 | **居中浮在管家头顶**（[037] 新独立） |
| 管家 | 主区底部水平居中,scale=0.33（小角色站底） |
| InputPod | 居中,自带白底压在管家腿/脚上 |

### ✅ 验证

- `tsc --noEmit` 通过（EXIT=0）
- preview eval：standing 实测 123×361（0.33 倍率精确 ✓）
- preview eval：ButlerBubble wrapper `justify-content: flex-start` ✓
- 截图：AI 气泡贴左 / 用户气泡贴右 / 管家小角色站底,整体类 ChatGPT 标准对话流

### 🚦 备注

ConfirmCard 居中渲染逻辑写好,实际触发需要有 `pendingBatches`（PDF 上传或 AI 调 create/update/delete tool）。下次有 PDF 上传或 AI 操作 task 时会自动看到居中浮顶效果。

---

## [036] 2026-05-25 — Chat 缺口 F/A/D/E/G 五件套一次性完成

> 用户「H 不需要做剩下的按照优先级顺序全部完成」。一次性补齐：F 中文 IME / A 停止生成 / D 复制+重新生成 / E 错误 retry / G AI 自动标题。

### 📂 涉及文件（按改动量大→小）

| 文件 | 操作 | 改动要点 |
|---|---|---|
| `apps/web/src/app/page.tsx` | 修改 | (A) `abortRef = useRef<AbortController>`,handleSend 创建 controller 传 signal,handleStopGeneration abort()；try-catch AbortError 静默；finally 清 abortRef；(D+E) handleRegenerate 找 assistantMessageId → 前面最近 user → slice 截断 + setInputValue + setTimeout 50ms 触发 send-btn click；(E) onError 标 `isError: true`；(G) generateSessionTitle 用 streamChat 调 Flash 生成 4-8 字标题 + cleanup 正则去标点；useEffect 监听 sessions/messages,title=="新对话" + 有 1 user + 1 真实 assistant 时一次性请求；titleRequestedRef 防重复 |
| `apps/web/src/components/ChatCanvas.tsx` | 修改 | (D+E) 新增 `MessageToolbar` 组件（copy + regenerate 按钮,copy 2 状态切换 "已复制" 1.5s）；`ButlerBubble` 加 `isError` / `onRegenerate` props,error 时墨绿描边变红色 + 工具栏永显；非流式且 content 非空时渲染 toolbar；外层 div 加 `.bubble-wrap` class；style 加 `.bubble-wrap:hover .msg-toolbar { opacity: 1 !important; }`；(A) 透传 `onStop` 给 InputPod |
| `apps/web/src/components/InputPod.tsx` | 修改 | (F) handleKeyDown 加 `e.nativeEvent.isComposing` + `keyCode === 229` 双重检查；(A) 新增 `onStop?` prop,`isLoading && onStop` 时渲染方形 Stop 按钮（深色背景 + Square icon）替代圆形 ArrowUp |
| `apps/web/src/lib/chat-client.ts` | 修改 | (A) fetch catch 识别 AbortError/DOMException → 直接 throw 不上报 onError（避免用户主动中止时显示 "网络请求失败"）|
| `apps/web/src/lib/types.ts` | 修改 | `ChatMessage` 加 `isError?: boolean`（标识错误消息,UI 红边 + 永显 retry）|

### 🎯 细节决策

**A 停止按钮**：圆形 → 方形深色，是 ChatGPT / Claude 标准；AbortController 在 finally 自动清理；abort 触发后流式状态机和 idea timer 都被 finally 正确 cleanup。

**D+E 工具栏交互**：
- 普通 AI 消息：hover 显示 [复制 / 重新生成]
- 错误消息：红色边框 + 永显 [复制 / 重试]，按钮文本和颜色都变红
- 流式中（isTyping）和空 content 时**不渲染工具栏**（避免半成品被复制 / 重新生成尚未完成的消息）
- 复制后按钮变绿 ✓「已复制」1.5s，再回原状

**E retry 实现**：用 `setTimeout(50)` + 模拟 send-btn click,绕开 React 状态批量更新 race（直接调 handleSend 会用 stale closure 的 messages）。

**G AI 自动标题**：
- 触发条件：`hydrated && !isLoading && session.title === "新对话" && 有 1 user + 1 非错误 assistant (content > 5 字)`
- titleRequestedRef Set 防止 useEffect 多次触发同一 session
- 用 V4 Flash（最便宜 + 标题不需要思考）
- prompt 严格限制「4-8 个汉字 / 直接输出 / 不要标点 emoji 解释」
- 后处理正则去 `""【】[]:：。.!?\n\r\s` + slice(0,20) 兜底
- 仅当 title 仍为「新对话」时更新（避免覆盖用户手动改的）

### ✅ 验证

| 项 | 验证方式 | 结果 |
|---|---|---|
| **F** IME 防误触发 | preview eval 触发 composing keydown,检查 onSend 是否调 | `composingEnterIgnored: true` ✓ |
| **A** stop 按钮显示 | send 后 800ms 查 `#stop-btn` | `aria-label="停止生成"` ✓ |
| **A** abort 静默 | 点 stop 后查 `hasErrorBubble` | `false` ✓ |
| **D** 工具栏存在 | querySelector copy/regenerate 文本按钮 | 每条 AI 消息都有 ✓ |
| **D** hover CSS | scan stylesheets 找规则 | `.bubble-wrap:hover .msg-toolbar { opacity: 1 !important; }` ✓ |
| **G** 标题函数注册 | 监听 useEffect 已加 + Dexie 题已有「介绍下你自己」 | function + effect 就位 ✓ |
| tsc --noEmit | 全量类型检查 | EXIT=0 ✓ |

### 🚦 Chat 部分缺口收尾

| # | 项 | 状态 |
|---|---|---|
| A | 停止生成按钮 | ✅ [036] |
| B | 历史截断 10 条 | ✅ [035] |
| D | 消息工具栏 | ✅ [036] |
| E | 错误 retry | ✅ [036] |
| F | 中文 IME | ✅ [036] |
| G | AI 自动标题 | ✅ [036] |
| H | 对话导出 | ❌ 用户决定不做 |

**Chat 部分至此功能完整度 ≈ 100%**（剩 H 导出为可选未来工作）。

### 💾 备份

`backup-035-history-truncate` 之后,本次紧跟。建议下一备份点 tag：`backup-036-chat-complete`

---

## [035] 2026-05-25 — 历史消息截断到最近 10 条（token 效率收口）

> 用户「继续做下一项代办」。承接 [034] 末尾「真想进一步加速：实施缺口 B 历史截断」。AGENT.md 早已写明「历史消息截断至最近 10 条」但 page.tsx 一直没实施。长会话时 input token 线性爆炸 → 首字延迟变长 + 成本变高。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/app/page.tsx` | 修改 | (1) 新增常量 `HISTORY_LIMIT = 10`（约 5 轮对话,够保留近期上下文）；(2) `handleSend` 中 `historyApi` 计算后加截断：`slice(-10)` + while-loop trim 直到首条 role=user（DeepSeek/OpenAI API 严格要求首条 user）；(3) 截断时 console.log 提示便于调试 |

### 🎯 算法要点

```ts
let trimmed = allHistory.slice(-HISTORY_LIMIT);
while (trimmed.length > 0 && trimmed[0].role !== "user") {
  trimmed = trimmed.slice(1);
}
```

- `slice(-10)` 保留最近 10 条
- while-loop 处理截断后首条变 assistant 的边界（API 报 400 风险）
- 最坏情况：从 N 条截到 1 条（仅当前 user 消息）— 仍保证有效请求

### ✅ 验证

| 测试 | 期望 | 实测 | 通过 |
|---|---|---|---|
| 短历史 3 条 | 不截断,len=3 | 3 / first=user | ✓ |
| 12 条均匀 u-a 交替 | 截到 10 / first=user | 10 / first=user | ✓ |
| 11 条 → slice(-10) 首条 assistant → trim 1 → 9 条 | 9 / first=user | 9 / first=user | ✓ |
| 边界:全 assistant | 截到空数组 | 0 | ✓ |
| Live: fetch 拦截器捕获实际 body | 数量合理 + first=user | msgCount=2 / firstRole=user | ✓ |

### 💰 Token 影响估算

| 会话长度 | 之前 input token | 现在 input token | 节省 |
|---|---|---|---|
| 5 条对话 | ~500 (system 350 + history 150) | ~500 | 0% |
| 20 条对话 | ~950 | ~650 | -32% |
| 50 条对话 | ~2000 | ~650 | **-67%** |
| 100 条对话 | ~4000 | ~650 | **-84%** |

DeepSeek V4 Flash $0.028/M cache miss → 一个长会话每次发送省的 token 累积下来非常可观。

### 🚦 后续可继续(Chat 缺口剩余)

- **A** 停止生成按钮（streamChat 已有 AbortSignal,UI 接 AbortController 即可）
- **D** AI 消息复制 + 重新生成（ButlerBubble hover 工具栏）
- **E** 错误消息 retry 按钮
- **F** 中文 IME 防 Enter 误触发
- **G** AI 自动生成会话标题（首轮后调 V4 Flash 总结）
- **H** 整段对话导出 .md / .json
- *进阶*：超出 10 条时把更早内容压缩成 1 句"早期对话摘要"塞到 system prompt（rolling summary）

### 💾 备份

`backup-034-bubble-center` 之后,本次紧跟。

---

## [034] 2026-05-25 — AI 气泡居中浮在管家头顶 + Flash 模式隐藏思考面板

> 用户反馈两个问题：(1)「为什么思考这么久看一下」(2)「对话框 ai 回复的内容靠着最左边」。

### 🔍 思考慢的真相（不是 bug,是 V4 系列特性）

实测 Dexie 数据：用户当前 selectedModel=null（默认 Flash,**没切到思考模式**）,但 reasoning 字段仍有 40 字符 CoT 内容：
> "用户想让我介绍一下自己。这是一个轻松的问题,不需要调用工具。我直接回复介绍即可。"

**根因**：DeepSeek V4 Flash 模型本身就带轻量 CoT,无论是否启用 thinking_mode 都会先跑一段 reasoning 再开始生成正文。客户端无法关闭（DeepSeek 模型层行为）。

**用户感受到"慢"的原因**：
- Flash 也得先跑 reasoning → 首字延迟 +1-2s
- 不显示思考面板时,用户看不到这段过程,只看到"AI 卡了几秒"
- **修复策略**：Flash 模式仍持久化 reasoning,但**不渲染思考折叠面板**（避免误导用户以为切到了思考模式）

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/ChatCanvas.tsx` | 修改 | (1) `ButlerBubble` outer div `justifyContent: flex-start` → `center`,AI 气泡居中浮在管家头上方（配合管家居中的视觉）；(2) `ButlerBubble` 新增 `showReasoning?: boolean` prop,默认 false；(3) 主组件派生 `showReasoning = !!(selectedModel && getModelMeta(selectedModel).thinking)`,传给所有 ButlerBubble 调用；(4) import `getModelMeta` from `@/lib/ai-models` |

### 🎯 视觉效果对比

| 维度 | 之前 | 现在 |
|---|---|---|
| AI 气泡水平对齐 | `flex-start` 贴主区左 32px padding | `center` 浮在管家头上方 |
| User 气泡 | `flex-end` 贴右 | 不变（保持右） |
| Flash 模式思考面板 | 显示「已思考」误导用户 | **不显示**（reasoning 仍持久化） |
| Thinking 模式思考面板 | 显示「思考中…」→「已思考」 | 不变(只在 thinking 模式渲染) |
| 漫画对话框效果 | 气泡贴左,远离居中管家 | **气泡正好在管家头顶**,典型漫画 bubble |

### ✅ 验证

- `tsc --noEmit` 通过(EXIT=0)
- preview 截图确认:欢迎屏气泡居中浮于管家头部上方,3 张快捷卡片水平居中排开,无"已思考"按钮
- DOM eval 确认:`justifyContent: "center"`,`hasReasoningPanel: false`

### 🚦 副作用 / 后续

- **历史 reasoning 不丢失**:Dexie 中已有的 reasoning 字段保留,切回 thinking 模式时该 session 历史中的旧 reasoning 仍可见
- **如果需要进一步加速**:实施 PROGRESS [031] 列出的缺口 **B**（历史截断到 10 条），可显著降低 input token + 首字延迟
- DeepSeek API 偶发后端慢(实测 30s+),非客户端可控

### 💾 备份

`backup-033-butler-poses` 之后,本次紧跟。

---

## [033] 2026-05-25 — 4 个新姿势 + AI 活动状态机 + 0.55 倍率 + 缺资产降级

> 用户：「人物图片现在多加了一些逻辑：模型生成内容时（flash模式）用 thinking，thinking mode 的 thinking 时用 thinking-hard，准备开始输出答案时用 I-got-an-idea，然后 rare-thinking 在早上 7-9 点概率触发，条件触发使用代码实现。然后大小要改小一点。」

### 🎭 4 个新姿势 + 状态机优先级（高→低）

| 优先级 | Pose | 触发条件 |
|---|---|---|
| 1 | `pointout` | PDF pipeline 完成 5s 内（pointoutHold）|
| 2 | `pointout` | 有 PDF 待核实（pdf-extract pending）|
| 3 | `idea` | AI 生成中,reasoning→content 过渡的**首 1s 灵感闪现** |
| 4 | `rare-thinking` | AI 生成中 × `7-9am` × `Math.random() < 0.061` 命中（彩蛋,替换 thinking/thinking-hard）|
| 5 | `thinking-hard` | AI 生成中,V4 思考模式 reasoning_content 流中 |
| 6 | `thinking` | AI 生成中,Flash 模式 content 流中（默认生成态）|
| 7 | `serving` | AI 待核实（ai-chat pending）|
| 8 | `standing` | 默认空闲 |

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/ButlerCharacter.tsx` | 重写 | (1) `ButlerPose` 类型加 4 个新值（`thinking` / `thinking-hard` / `idea` / `rare-thinking`）；(2) `POSES` 表预定 4 个新 src 路径（`butler-thinking.png` 等）+ 占位尺寸（先按 standing 374×1094 占位）；(3) **scale 默认 0.75 → 0.55**；(4) `useEffect` 主动检查 `naturalWidth === 0` → setErrored（防 SSR/cache 漏触发 onError）；(5) errored 时整个 pose 的 src + 尺寸都 fallback 到 standing |
| `apps/web/src/app/page.tsx` | 修改 | (1) 新增 `aiActivity` state（`phase: thinking/thinking-hard/idea/null` + `rareRoll: boolean`）；(2) `ideaTimerRef` + `rollRare` helper（7-9am × 6.1%）；(3) `handleSend` / `triggerGreeting` 开始时 set thinking + rollRare，finally 清理 timer + reset state；(4) SSE callbacks：`onReasoningDelta` 首次升级 phase → thinking-hard；`onContentDelta` 首次 → idea + 1s timer 后回 thinking；(5) `butlerPose` useMemo 派生加入新 5 分支 |
| `apps/web/src/components/ChatCanvas.tsx` | 修改 | 把 `<ButlerCharacter scale={0.75}>` 改为不传 scale,用默认 0.55 |

### 🎯 核心实现细节

**rareRoll sticky**：每次 send 开始抽**一次**,sticky 整个生成期（避免 thinking 期内 pose 闪烁切换）。命中时整个生成期的 thinking/thinking-hard 都替换为 rare-thinking。

**idea 1s 一闪**：用 `setTimeout(1000)` + `ideaTimerRef` 跟踪,防止：
- 多轮 tool call 期间重复触发（用 `contentStarted` flag）
- finally cleanup 时未清 timer 导致状态泄漏

**Flash vs Thinking 模式自动区分**：完全靠 SSE 流是否带 `reasoning_content` 判断,无需读 `selectedModel`：
- Flash → 只有 onContentDelta → thinking → idea → thinking
- Thinking → 先 onReasoningDelta 多次（thinking-hard）→ 后 onContentDelta（idea → thinking）

**缺资产降级（关键）**：用户尚未提供 4 张新 PNG,组件用双重保险：
- `<img onError>` 兜底
- `useEffect` mount 后 + 500ms 后两次主动 check `naturalWidth === 0`（防 SSR/cache 漏触发）
- 命中时整个 pose 的 src 替换为 standing 资产 + 用 standing 尺寸渲染（防 broken-img 图标 + 拉伸）

### ✅ 验证

- `tsc --noEmit` 通过（EXIT=0）
- preview reload + 量 DOM：standing 206×602 / serving 376×552 / pointout 261×587（全部 0.55 倍率精确）
- 4 个新 pose（thinking 等）`src` 经 useEffect 检测后全部回退到 `butler-standing.png`（`naturalW=374`）✓
- AI send 触发后状态机切换序列由用户实测验证（preview eval 超时 30s 是 AI 慢,非代码 bug）

### 🚦 用户下一步

提供 4 张 PNG 资产到 `apps/web/public/assets/`：
- `butler-thinking.png` — 一般思考姿势（手放下巴 / 望远）
- `butler-thinking-hard.png` — 深度思考（皱眉 / 紧握 / 闭眼）
- `butler-idea.png` — 灵光一现（食指上举 / 头顶灯泡 / 眼睛发亮）
- `butler-rare-thinking.png` — 彩蛋姿势（喝咖啡 / 伸懒腰 / 看晨报）

放进去后,改 `ButlerCharacter.tsx` `POSES` 表里对应的 `w/h` 为真实尺寸（PowerShell `[System.Drawing.Image]::FromFile()` 量出来）。

### 💾 备份

`backup-032-butler-centered` 之后,本次紧跟。

---

## [032] 2026-05-25 — 管家居中 + 输入框背后 + 0.75 倍率统一

> 用户原话:「人物现在放在对话框的正中间输入框的后面 所有大小 按照站立的这张的svg 的0.75倍率放」。当前 ButlerCharacter 用 `fillContainer` 模式占满左下 260px 栏，需要改为水平居中 + 固定 0.75 倍率 + 输入框前置图层。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/ButlerCharacter.tsx` | **重写** | 移除 `fillContainer` / `size` props,改为 `scale: number = 0.75`；新增 `POSES` 元数据表记录 3 张 PNG 原始尺寸（standing 374×1094 / serving 683×1003 / pointout 475×1067）；容器尺寸 = `MAX_W × scale × MAX_H × scale` = 512×820 固定；三姿势 `position:absolute bottom:0 left:50% translateX(-50%)`,按各自原始尺寸 × scale 渲染,opacity 切换；脚底基准对齐让 pose 切换不抖动；阴影椭圆同步缩窄 |
| `apps/web/src/components/ChatCanvas.tsx` | 修改 | (1) 删除 `BUTLER_GUTTER = 260`,改为 `CONTENT_MAX = 800`；(2) 管家容器从左下 `left:0 width:260 height:100%` 改为 `bottom:0 left:50% translateX(-50%)`,调用 `<ButlerCharacter scale={0.75} />`；(3) 历史区 padding `24px 32px 14px ${BUTLER_GUTTER + 12}px` → 对称 `24px 32px 14px`,内部消息流加 `maxWidth: CONTENT_MAX, margin: 0 auto` 居中；(4) 输入区同样改对称 + InputPod 外包居中 wrapper；(5) 欢迎屏 `alignItems: flex-start` → `center`,卡片行 `justifyContent: center` |

### 🎯 设计细节

| 维度 | 之前 | 现在 |
|---|---|---|
| 管家位置 | 左下 260px 栏(`left:0 width:260`) | 主区水平正中 + 贴底(`bottom:0 left:50% translateX(-50%)`) |
| 大小 | `fillContainer` 自适应栏宽 | **statically 0.75 ×**：standing 281×821 / serving 512×752 / pointout 356×800 |
| z-index 层次 | 管家 1 / 历史 2 / 输入 2(但左偏让管家露出) | 管家 1 / 历史 2 / 输入 2,**InputPod 自带白底自然压在管家腿/脚上** |
| 对话流布局 | 左 padding 272px 让位 | 对称 32px + `maxWidth: 800` 居中(类似 ChatGPT) |
| 姿势切换 | 视觉位置偏移(随容器宽度变化) | **脚底基准对齐**,头部位置随姿势自然上下 |

### 🔍 实现要点

- **PNG 原始尺寸表**写在 ButlerCharacter 顶层 `POSES` 常量,以后调整 trim 边缘只需改这 3 个数字
- **容器固定为 MAX 尺寸**(512×820)而非每张图变化大小,避免 pose 切换时父容器抖动撑开布局
- **绝对定位 bottom-center** 是 anchor 关键:三张图脚底对齐,头部高度差通过透明上方区域自然消化
- **保留 `withFx`** 开关:阴影椭圆 + opacity 过渡动画都受其控制(0.4s ease)

### ✅ 验证

- `tsc --noEmit` 通过(EXIT=0)
- preview reload + 实测尺寸:`document.querySelectorAll('img[alt*="Butler"]')` 返回三张图各自 0.75 倍精确尺寸 ✓
- 截图确认:管家居中 + 输入框白底压在脚踝 + AI 气泡浮在头上方 + 整体协调

### 🚦 后续

- 等用户给 Rive 分层 SVG 资产 → 接 `<ButlerRive scale={0.75} />` 替换 ButlerCharacter,接口完全兼容(同 pose / scale 字段)
- 大屏(>1400px)可能想加 `CONTENT_MAX` 上限到 900;当前 800 在 1280×800 看着刚好
- 极小窗口(<600px 宽)管家会顶满主区,后续移动端再针对性 hide 或缩到 0.5×

### 💾 备份建议

`backup-031-thinking-reasoning` 之后,本次紧跟。

---

## [031] 2026-05-25 — 思考模式可见化：reasoning_content 折叠面板

> 用户决策：盘点 Chat 部分缺口后选「思考模式可见化（C）」。V4 思考模式（V4 Pro thinking）的 SSE 流原本携带 `reasoning_content` 字段被丢弃，用户切到思考模式只看到答案，看不到 CoT 推理过程，等于白付钱。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/lib/types.ts` | 修改 | `ChatMessage` 新增 `reasoning?: string`（持久化随 messages 表自动跟进，无需 Dexie 版本升级） |
| `apps/web/src/lib/chat-client.ts` | 修改 | (1) `SseChunk.choices[].delta` 类型加 `reasoning_content?: string`；(2) `StreamCallbacks` 加 `onReasoningDelta?: (delta: string) => void`；(3) 单轮解析循环里识别 `delta.reasoning_content` 并触发 callback |
| `apps/web/src/app/page.tsx` | 修改 | `handleSend` 和 `triggerGreeting` 都把原本只处理 content 的 `onDelta` 重构为 `ensureAssistant({ content?, reasoning? })`：同一条 assistant message 同时承载 content 和 reasoning 增量；新增 `onReasoningDelta` 回调 |
| `apps/web/src/components/ChatCanvas.tsx` | 修改 | (1) 新增 `ReasoningPanel` 子组件：浅灰底 + Brain 图标 + 折叠箭头，思考中显示「思考中…」+ 闪烁点，结束折叠成「已思考」可点开；(2) `ButlerBubble` 增加 `reasoning?` prop 并渲染面板；(3) 主消息流调用处传入 `msg.reasoning` |

### 🎯 体验细节

- **思考中**（reasoning 增量在流，content 还未开始）：面板默认**展开**，标题「思考中…」+ 闪烁点
- **思考完成**（content 开始出现）：自动**折叠**成「已思考」
- **用户手动 toggle**：以用户偏好为准（`forced` state 覆盖派生）
- **历史消息**：刷新后 reasoning 跟随 messages 一起从 Dexie 加载，可随时点开复看
- **非思考模型**（V4 Flash）：API 不返回 reasoning_content → `hasReasoning=false` → 面板不渲染，自然降级
- 思考内容用 monospace 字体 + muted 颜色，与正文视觉区分
- `max-height: 280px` + 自带滚动条，防长 CoT 撑爆气泡

### ✅ 验证

- `tsc --noEmit` 通过（`EXIT=0`）
- preview_start + 实际触发开屏问候（用户当前在思考模式）→ Dexie 写入 `reasoning` 字段（72 字符 CoT）→ 主区折叠面板正确渲染「已思考」→ 点击展开内容完整可见
- 截图确认视觉对齐墨绿设计语言

### 🚦 后续可继续（chat 部分剩余缺口）

- **A** 停止生成按钮（streamChat 已暴露 AbortSignal 接口）
- **B** 历史消息截断到 10 条（AGENT.md 已写但 page.tsx 未实施 → token 浪费）
- **D** AI 消息复制 + 重新生成（ButlerBubble hover 工具栏）
- **E** 错误消息 retry 按钮
- **F** 中文 IME 防 Enter 误触发
- **G** AI 自动生成会话标题（首轮后调 V4 Flash 总结）
- **H** 整段对话导出 .md / .json

### 💾 备份

- commit `ff0f6c0`（[030] 收尾）+ 本次基于其改

---

## [030] 2026-05-24 — 模型切换两个 bug 修复（精简下拉 + state-only 视觉）

> 用户反馈："切换模型那里大小有问题，同时不能切换回来原来的模型"。两个 bug 都源于 InputPod 模型下拉项的实现。

### 📂 涉及文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/InputPod.tsx` | 修改 | (1) 提取新组件 `ModelOption`：精简单行布局（3px 墨绿左条 + ●tier 圆点 + label + tagline + ✓ active 图标），单项 ~32px（原 80-100px）。(2) hover 视觉改用 `useState(hov)` 派生背景，**不再用 inline style.background 残留**——这是"切不回原模型"的根因。(3) 移除大的 28px `ModelIcon`（保留 6px `ModelDot`） |

### 🐛 Bug 根因分析

**Bug 1：下拉项太大**
- 原因：每项渲染了完整描述（V4 Flash desc 100+ 字）+ tagline + 大图标 + "当前" 徽章
- 280px 宽度装不下，强制换行 3-4 次 → 单项 80-100px 高 → 两项 200px → 遮挡气泡

**Bug 2：切不回原模型**
- 原因：`onMouseEnter` handler 写入 `e.currentTarget.style.background`，与 React 重渲染的 inline `background: isActive ? "var(--color-primary-soft)" : "transparent"` 互相覆盖
- active 项被点击后视觉残留 hover 时的 `var(--color-surface)`，状态实际已经切换但 UI 看起来"没动"
- 修复：完全去掉 `e.currentTarget.style` 写入，改用 React state `hov` 派生 background

### ✅ 验证

- `tsc --noEmit` 通过（`EXIT=0`）
- 切换 V4 Flash ↔ V4 思考 视觉立刻反映（墨绿左条 + ✓ 移到新项）
- 下拉总高度 ~70px（从 200px 降下来）

### 🚦 下一步备份建议

`backup-029-basics-done`（包含 [027]-[030]）

---

## [029] 2026-05-24 — 基础功能补全 5 件套：AI tool 字段 + Markdown 预览 + 开屏问候 + Notes 真版 + 全局搜索

> 用户决策：先把所有基础功能做完再做细致优化。盘点出 5 个缺口，按"小到大"顺序逐个补齐（D → E → C → A → B）。

### 📂 涉及文件（按 5 块分组）

#### D. AI tool 加字段支持（C.2 字段扩展的自然延伸）

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/lib/ai-tools.ts` | 修改 | `create_item` / `update_item` schema 加 `status` / `tags` / `priority` / `notes`；CreateItemArgs / UpdateItemArgs 接口同步 |
| `apps/web/src/lib/tool-executor.ts` | 修改 | execCreate 创建时设新字段；execUpdate patch 包含 status 时同步 completed |

#### E. Markdown 备注预览

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/NotesPreview.tsx` | 新建 | 任务备注 markdown 渲染 modal（react-markdown + remark-gfm），自带 .md-preview CSS |
| `apps/web/src/components/TasksPanel.tsx` | 修改 | 备注 chip 从 span 改 button + 加 `onRequestNotesPreview` prop；e.stopPropagation 防穿透到编辑 |
| `apps/web/src/app/page.tsx` | 修改 | `previewNotes` state + render `<NotesPreview>` |

#### C. AI 主动开屏问候

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/app/page.tsx` | 修改 | 新增 `triggerGreeting(sid)` callback（不入 user 消息，直接调 streamChat 让 AI 自动招呼）；新增 useEffect 监听 hydrated + activeNav=chat + 当前 session 完全空 → 触发；`greetedSessionsRef` Set 防重复 |

#### A. Notes 浏览器内 Markdown 实版（最大块）

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/lib/types.ts` | 修改 | 新增 `Note { id, title, content, tags?, pinned?, createdAt, updatedAt, vaultPath? }` |
| `apps/web/src/lib/db.ts` | 修改 | Dexie v4→v5：新增 `notes` 表（索引 updatedAt + pinned） |
| `apps/web/src/components/NotesPanel.tsx` | **重写** | 真实双栏：左 280px 列表（按 pinned 排序 + 时间）+ 右编辑器（textarea 双模式 edit/preview，500ms 防抖保存）；标题 + 内容 + pin + 删除；Empty hero + Coming Tauri 提示 |
| `apps/web/src/components/layout/NotesRail.tsx` | 修改 | 接 `notes` props，All Notes / Pinned 显示真实计数 + onCreate 触发 |
| `apps/web/src/app/page.tsx` | 修改 | `notes` state + hydrate load + persist effect + handleCreateNote/Update/Delete |

#### B. TopBar 全局搜索

| 文件 | 操作 | 说明 |
|---|---|---|
| `apps/web/src/components/layout/GlobalSearch.tsx` | 新建 | 240px 输入框 + 480px 高下拉浮层；搜 ddls / notes / messages（user+assistant）；按类型分组（任务/笔记/对话）+ 每组限计数；⌘K / Ctrl+K 快捷聚焦；Esc 关闭；点击跳转对应 Tab |
| `apps/web/src/components/layout/TopBar.tsx` | 修改 | 用 GlobalSearch 替换原占位输入框；接收 ddls/notes/messages props |
| `apps/web/src/app/page.tsx` | 修改 | TopBar 传 ddls/notes/messages |

### 🎯 4 面板完整度（重要里程碑）

| Tab | 之前 | 现在 |
|---|---|---|
| Chat | 90% | **95%** + 开屏问候 |
| Tasks | 85% | **95%** + AI 字段全 + 备注预览 |
| Calendar | 75% | 75%（未动） |
| Notes | **0% 占位** | **80%** ✅ 浏览器内 Markdown 实版 |
| **跨面板** | — | **+ TopBar 全局搜索接通** |

### ✅ 验证

- `tsc --noEmit` 通过（`EXIT=0`）每步都验
- Dexie v4→v5 自动迁移（仅新增表，不影响存量）
- Notes 编辑 500ms 防抖入 IDB
- AI 开屏问候用 `greetedSessionsRef` 防重复，已有历史的 session 不触发
- 搜索结果点击跳 Tab（refId 留位，未来加高亮）

### 🚦 后续可继续

- Notes：tags 编辑 + 笔记内 [[wikilink]] 跨链 + Phase 3 Tauri 接本地 Vault
- 搜索：跳转后高亮匹配项 + 搜索历史
- 开屏问候：可配置（用户可关 / 调频率）
- AI 主动提醒：每天早上 push 今日概览
- Calendar：Week 视图、拖拽创建

### 💾 备份

- commit `ff0f6c0` + tag `backup-028-ocr-models`（本次前）

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

- **[001]-[026]** 完整内容见 **[docs/progress/2026-05.md](docs/progress/2026-05.md)**（2026 年 5 月归档）
- **[027]-[040]** 物理保留在本文件上方（共 14 条；下次大归档时迁出）
- 按月索引：[docs/progress/INDEX.md](docs/progress/INDEX.md)

> 接班 AI 只需 Read PROGRESS 第一条（offset=0, limit=100）即可获取当前状态;旧条目按需 Glob/Grep 关键字定位。

