# 复杂度预估

## 当前重构目标

当前目标是先建立一个能读懂、能扩展的基础框架，不追求一次性迁移全部功能。

## 预估复杂度

| 模块 | 当前预估复杂度 | 原因 |
| --- | --- | --- |
| Express app 初始化 | 低 | 固定结构，代码少 |
| MongoDB 连接 | 低 | 单文件连接函数 |
| Task CRUD | 中低 | 字段较多，但逻辑直接 |
| Note CRUD | 低 | 字段少，逻辑直接 |
| Agent action 分发 | 中 | 后续会扩展更多动作 |
| Auth 迁移 | 中 | 涉及密码、cookie、session |
| Chat/AI 迁移 | 高 | 涉及流式响应、tool call、错误恢复 |
| 前端状态拆分 | 高 | `page.tsx` 状态集中，需要渐进拆 |

## 降低复杂度的方法

- 每个 route 只负责接收请求和返回响应。
- 每个 service 只负责一个业务对象。
- Mongo model 只写字段和索引，不放业务逻辑。
- 通用响应统一走 `MakeOk` 和 `MakeFail`。
- 异步错误统一走 `RunSafe`。
- agent 动作先用简单 switch，等动作多了再拆 action map。

## 命名约定

使用直观函数名：

- `AddTask`
- `GetTaskList`
- `AddNote`
- `RunAgentAction`
- `SaveAgentLog`

不使用难懂缩写，不把简单逻辑包装成复杂类。

