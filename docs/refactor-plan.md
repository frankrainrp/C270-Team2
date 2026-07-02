# C270_FA 重构计划书

创建时间：2026-07-01

## 1. 目标

把当前 Butler 项目逐步重构成开发人员更熟悉的 `Express + Node + MongoDB` 架构，同时降低阅读成本和维护复杂度。

当前计划不直接修改原来的 `copy` 项目，而是在 `C270_FA` 文件夹中先建立独立的重构方案和最小后端框架。

## 2. 当前问题判断

当前项目的复杂度主要来自以下几点：

- Next.js 页面和 API route 同时承担前端、后端、AI 调用和数据处理职责。
- `page.tsx` 状态集中，文件过长，阅读成本高。
- 业务数据主要在浏览器 IndexedDB/Dexie，登录数据在 SQLite，另有 Postgres/Drizzle 包，数据层不统一。
- 任务、笔记、对话、AI 写操作之间耦合较深。
- 后端 API 不够像传统 Express 项目，团队成员不容易按常见 MVC/service 方式接手。

## 3. 目标架构

建议目标结构：

```text
apps/
  web/       # 保留现有 Next/React 前端，逐步改成调用后端 API
  api/       # 新 Express + Node + MongoDB 后端

api/src/
  app.ts
  server.ts
  config/
  db/
  middleware/
  models/
  routes/
  services/
  utils/
```

在 `C270_FA/apps/api` 中先实现 `api` 部分的基础框架。

## 4. 数据库方案

数据库统一采用 MongoDB。

第一阶段建议集合：

| Collection | 用途 |
| --- | --- |
| `users` | 用户账号 |
| `sessions` | 登录会话 |
| `tasks` | DDL、任务、日历共享数据 |
| `notes` | 学习笔记 |
| `chat_sessions` | 对话会话 |
| `chat_messages` | 对话消息 |
| `agent_logs` | agent 执行动作日志 |

本次基础框架先写：

- `tasks`
- `notes`
- `agent_logs`

后续再迁移 auth、chat、OCR、AI 提取等模块。

## 5. 代码风格规则

为了降低阅读成本，先采用非常直接的命名方式。

函数命名使用 PascalCase，例如：

- `AddTask`
- `GetTaskList`
- `GetTaskById`
- `UpdateTask`
- `DeleteTask`
- `AddNote`
- `RunAgentAction`

避免过早抽象。只有重复明显、能减少阅读量的地方才做复用，例如：

- `MakeOk`
- `MakeFail`
- `RunSafe`
- `ConnectMongo`

## 6. 第一阶段计划

第一阶段只建立最基础的 agent/API 框架。

完成内容：

- Express app 初始化。
- MongoDB 连接。
- Health check。
- Task model + task routes。
- Note model + note routes。
- Agent action route。
- 通用响应格式。
- 通用异步错误包装。
- 基础复杂度说明。

不做内容：

- 不接入原前端。
- 不迁移真实 IndexedDB 数据。
- 不重写 UI。
- 不改原项目 Docker/CI。
- 不声称这是最终可提交版本。

## 7. 第二阶段计划

第二阶段把原来前端里的任务和笔记从 Dexie 调用迁移到 API 调用。

步骤：

1. 在原前端新增 `task-api-client.ts` 和 `note-api-client.ts`。
2. 保留旧 Dexie 数据读取作为临时 fallback。
3. 增加导出/导入脚本，把本地任务和笔记导入 MongoDB。
4. 页面层只调用 client，不直接碰数据库。
5. 任务、笔记功能稳定后，删除旧 Dexie 表访问。

## 8. 第三阶段计划

第三阶段迁移 AI 和 agent 逻辑。

步骤：

1. 把 `/api/chat` 迁到 Express。
2. 把 pending change 和 confirm gate 变成后端可追踪模型。
3. 把 `create_item`、`update_item`、`create_note` 等 tool action 统一进入 `RunAgentAction`。
4. 所有写操作先进入草稿或待确认状态。
5. 用户确认后再写入 MongoDB。

## 9. 复杂度目标

目标不是让代码文件数量最少，而是让单个文件更短、更容易定位。

建议指标：

| 项目 | 目标 |
| --- | --- |
| 单个 route 文件 | 80 行以内 |
| 单个 service 文件 | 150 行以内 |
| 单个 model 文件 | 120 行以内 |
| 单个 React 页面文件 | 400 行以内 |
| 核心函数参数 | 1 到 3 个优先 |
| 函数命名 | 直接表达动作 |

## 10. 风险

- MongoDB 迁移会改变数据来源，需要处理旧 IndexedDB 数据迁移。
- 如果一次性重写前端和后端，风险会很高。
- Express 后端会增加一个服务进程，需要更新开发启动方式和部署方式。
- 如果当前项目仍用于 C270 交付，必须保留原始已验证版本和 DevOps 证据。

## 11. 验收标准

第一阶段验收：

- `apps/api` 可以安装依赖。
- 可以通过 `.env` 配置 MongoDB。
- `/api/health` 返回正常。
- `/api/tasks` 可以新增和读取任务。
- `/api/notes` 可以新增和读取笔记。
- `/api/agent/run` 可以执行最基础的 `AddTask`、`ListTasks`、`AddNote`、`ListNotes` 动作。
- 文件命名和函数命名直观，新人能按目录快速找到逻辑。
