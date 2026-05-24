// ============================================================
// lib/ai-tools.ts — DeepSeek tool calling 工具定义
// 设计原则：tasks 与 calendar 共享同一数据模型 (DdlItem)，
// AI 通过 5 个工具完成对全局 ddls 列表的 CRUD + 查询
// ============================================================

import type { DdlItem } from "./types";

// OpenAI / DeepSeek tool 定义格式
export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export const TOOLS: ToolDefinition[] = [
  // ---- 1. 创建任务/事件 ----
  {
    type: "function",
    function: {
      name: "create_item",
      description:
        "为用户创建一个新的任务或日历事件。无论是「明天开会」「下周交作业」「期末考试」都用这个工具。" +
        "若用户没说具体时间，dueTime 默认 23:59。若用户没说权重（学术作业才有的概念），weight 传 null。",
      parameters: {
        type: "object",
        properties: {
          taskName: {
            type: "string",
            description: "任务/事件名称，例如「数据结构 Quiz」「与导师的开会」「Final Exam」",
          },
          dueDate: {
            type: "string",
            description: "ISO 8601 日期 YYYY-MM-DD。务必根据系统 prompt 提供的「当前日期」推算出绝对日期",
          },
          dueTime: {
            type: "string",
            description: "HH:MM (24h)，例如 09:00 / 14:30 / 23:59。未指定时填 23:59",
          },
          weight: {
            type: ["number", "null"],
            description: "学术作业的成绩权重百分比 0-100，非学术事件填 null",
          },
          description: {
            type: "string",
            description: "对该事项的简短补充说明，例如「Submit via Blackboard」「带笔记本」",
          },
          isGroupWork: {
            type: "boolean",
            description: "是否为小组协作事项",
          },
        },
        required: ["taskName", "dueDate"],
      },
    },
  },

  // ---- 2. 更新任务/事件 ----
  {
    type: "function",
    function: {
      name: "update_item",
      description:
        "修改一个已存在的任务/事件。优先用 itemId 精确定位；只有当 itemId 未知时才用 taskNameFuzzy 模糊匹配。" +
        "未提供的字段保持原值不变。",
      parameters: {
        type: "object",
        properties: {
          itemId: {
            type: "string",
            description: "目标 item 的精确 ID（通过 list_items 拿到）",
          },
          taskNameFuzzy: {
            type: "string",
            description: "找不到 itemId 时用任务名称模糊匹配（包含即可），例如「Quiz 2」",
          },
          taskName: { type: "string", description: "新名称（可选）" },
          dueDate: { type: "string", description: "新日期 YYYY-MM-DD（可选）" },
          dueTime: { type: "string", description: "新时间 HH:MM（可选）" },
          weight: { type: ["number", "null"], description: "新权重（可选）" },
          description: { type: "string", description: "新描述（可选）" },
          isGroupWork: { type: "boolean", description: "是否小组作业（可选）" },
        },
      },
    },
  },

  // ---- 3. 删除任务/事件 ----
  {
    type: "function",
    function: {
      name: "delete_item",
      description: "删除一个任务/事件。优先用 itemId，否则 taskNameFuzzy。删除前请向用户确认。",
      parameters: {
        type: "object",
        properties: {
          itemId: { type: "string", description: "目标 item 的精确 ID" },
          taskNameFuzzy: { type: "string", description: "找不到 itemId 时用名称模糊匹配" },
        },
      },
    },
  },

  // ---- 4. 切换完成状态 ----
  {
    type: "function",
    function: {
      name: "toggle_complete",
      description: "勾选一项任务为完成（或取消完成）。",
      parameters: {
        type: "object",
        properties: {
          itemId: { type: "string", description: "目标 item 的精确 ID" },
          taskNameFuzzy: { type: "string", description: "找不到 itemId 时用名称模糊匹配" },
          completed: {
            type: "boolean",
            description: "true=标记完成；false=取消完成；不传则切换当前状态",
          },
        },
      },
    },
  },

  // ---- 5. 查询任务列表 ----
  {
    type: "function",
    function: {
      name: "list_items",
      description:
        "查询用户当前的所有任务/事件，返回结构化数据。" +
        "在执行 update/delete 前若不知道 itemId，应先调用此工具。" +
        "也可用于回答「我本周有什么任务」这类查询。",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "string",
            enum: ["all", "today", "thisWeek", "later", "completed", "active"],
            description: "过滤器：all=全部；active=未完成；其他按时间窗口或状态",
          },
        },
      },
    },
  },
];

// ============================================================
// Tool 执行结果类型
// ============================================================
export type ToolResult =
  | { ok: true; message: string; data?: unknown }
  | { ok: false; message: string };

// ============================================================
// 工具执行参数类型（与 schema 对应）
// ============================================================
export interface CreateItemArgs {
  taskName: string;
  dueDate: string;
  dueTime?: string;
  weight?: number | null;
  description?: string;
  isGroupWork?: boolean;
}

export interface UpdateItemArgs {
  itemId?: string;
  taskNameFuzzy?: string;
  taskName?: string;
  dueDate?: string;
  dueTime?: string;
  weight?: number | null;
  description?: string;
  isGroupWork?: boolean;
}

export interface DeleteItemArgs {
  itemId?: string;
  taskNameFuzzy?: string;
}

export interface ToggleCompleteArgs {
  itemId?: string;
  taskNameFuzzy?: string;
  completed?: boolean;
}

export interface ListItemsArgs {
  filter?: "all" | "today" | "thisWeek" | "later" | "completed" | "active";
}

// 工具名 → 参数类型 的联合（供执行器使用）
export type ToolCall =
  | { name: "create_item";     args: CreateItemArgs }
  | { name: "update_item";     args: UpdateItemArgs }
  | { name: "delete_item";     args: DeleteItemArgs }
  | { name: "toggle_complete"; args: ToggleCompleteArgs }
  | { name: "list_items";      args: ListItemsArgs };

// ============================================================
// Helper：精简的 DdlItem（用于回传给 AI 看上下文，不要给完整 source）
// ============================================================
export function compactItem(item: DdlItem): Record<string, unknown> {
  return {
    id: item.id,
    taskName: item.taskName,
    dueDate: item.dueDate,
    dueTime: item.dueTime,
    weight: item.weight,
    description: item.description,
    isGroupWork: item.isGroupWork,
    completed: item.completed,
  };
}
