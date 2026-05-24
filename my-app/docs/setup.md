# ⚙️ Setup

> 启动 / 测试 / 环境变量 / 模型切换 / 测试资源。

---

## 启动

```pwsh
# 启动 dev server
cd my-app/apps/web
pnpm dev               # http://localhost:3000

# TS 检查
pnpm exec tsc --noEmit

# 安装新依赖
pnpm add <pkg>
```

---

## 环境变量

`apps/web/.env.local`（不提交 git）：

```env
DEEPSEEK_API_KEY=sk-...                          # 必填
DEEPSEEK_MODEL=deepseek-v4-flash                 # 可省，默认就是 V4 Flash
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1    # 可省
```

模板：`apps/web/.env.local.example`

---

## 模型切换（PROGRESS [026]）

### 注册表（`lib/ai-models.ts`）

| Model ID | 显示名 | tier | 工具调用 | 说明 |
|---|---|---|---|---|
| `deepseek-v4-flash`（默认） | DeepSeek V4 Flash | low（绿） | ✅ | 最便宜，日常对话 |
| `deepseek-chat` | DeepSeek V3.1 | mid（黄） | ✅ | 复杂指令更好，贵 3-25× |
| `deepseek-reasoner` | DeepSeek Reasoner | high（红） | ❌ | 深度推理 CoT，慢且贵 |

### 用户切换

InputPod 底部 model badge 点击 → 弹出 280px 下拉，3 选 1。
localStorage 持久化（key: `butler.selectedModel`）。

### 服务端校验

`/api/chat` 收到 `body.model` 用 `isValidModelId()` 白名单校验，非法值降级 V4 Flash。
Reasoner 自动禁用 tools（`supportsTools=false`）。

---

## 测试资源

### 真实课件 PDF

`D:\User\asus\Desktop\Bulter\C245_Data_Analytics_Welcome.pdf`（用户本机）
- 23 页 / 1.4MB / 新加坡某专科课程 syllabus
- 含 CA1/CA2/Presentation/SDLC/FA 完整 assessment 表
- 实测：MiniLM 粗筛后 3138 字 → V4 Flash 提取 5 条 DDL → 总成本 ~¥0.003

### 浏览器自动化

`cp` 测试 PDF 到 `apps/web/public/test.pdf` 即可：

```js
const r = await fetch('/test.pdf');
const blob = await r.blob();
const file = new File([blob], 'test.pdf', { type: 'application/pdf' });
// 触发 InputPod.onAttach([file])
```

---

## Dexie 数据库

- 数据库名：`butler-db`
- 当前 schema：v4
- 表：`ddls` / `messages` / `blobs` / `sessions`
- 升级路径：v3 → v4 自动 `completed=true → status="done"`

### 清库（彻底重置）

浏览器 DevTools → Application → IndexedDB → `butler-db` → Delete。
或代码：

```js
indexedDB.deleteDatabase("butler-db"); location.reload();
```

---

## 备份点（git tags）

历史 backup tags：
- `backup-019-stage-a` — UI Stage A 完成
- `backup-021-comic-chat` — 漫画式对话完成
- `backup-024-mini-apps` — Mini Apps Drawer
- `backup-025-ui-redesign-done` — UI 重构 Stage E 收尾

恢复：`git reset --hard <tag>`

---

## Windows PowerShell 注意

- 不支持 `&&` → 用 `;` 或 `if ($?) { B }`
- 不要在 dev server tab 同时跑 tsc（cwd 冲突）
- Bash 工具的 cwd 在 Windows 下会丢 → 显式 `cd` 或用 PowerShell + `Set-Location`

---

*最后更新：2026-05-24*
