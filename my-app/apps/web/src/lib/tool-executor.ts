// ============================================================
// lib/tool-executor.ts — AI tool_call 执行器
//
// 设计原则（v2，2026-05-22 起）：
//   - create / update / delete  → 不直接改 ddls，而是产出 PendingChange 入待核实队列
//   - toggle_complete          → 直接执行（用户高频低风险）
//   - list_items               → 直接执行（只读）
//
// 回执文案使用"建议..."而非"已..."，让 AI 明确告诉用户「需要核实」。
// ============================================================

import type { DdlItem } from "./types";
import type { ApiToolCall } from "./chat-client";
import {
  compactItem,
  type ToolCall,
  type ToolResult,
  type CreateItemArgs,
  type UpdateItemArgs,
  type DeleteItemArgs,
  type ToggleCompleteArgs,
  type ListItemsArgs,
} from "./ai-tools";
import { makeChangeId, type PendingChange } from "./pending";

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

export interface ToolExecutorDeps {
  getDdls: () => DdlItem[];
  setDdls: React.Dispatch<React.SetStateAction<DdlItem[]>>;
  /** 把一个"待核实"改动追加到当前批次（page.tsx 注入） */
  addPending: (change: PendingChange) => void;
}

export function createToolExecutor(deps: ToolExecutorDeps) {
  return async (call: ApiToolCall): Promise<ToolResult> => {
    let args: unknown;
    try {
      args = JSON.parse(call.function.arguments || "{}");
    } catch {
      return { ok: false, message: `工具参数 JSON 解析失败：${call.function.arguments}` };
    }

    switch (call.function.name as ToolCall["name"]) {
      case "create_item":
        return execCreate(args as CreateItemArgs, deps);
      case "update_item":
        return execUpdate(args as UpdateItemArgs, deps);
      case "delete_item":
        return execDelete(args as DeleteItemArgs, deps);
      case "toggle_complete":
        return execToggle(args as ToggleCompleteArgs, deps);
      case "list_items":
        return execList(args as ListItemsArgs, deps);
      default:
        return { ok: false, message: `未知工具：${call.function.name}` };
    }
  };
}

// ============================================================
// 1. create_item → PendingCreate（不入库，待核实）
// ============================================================
function execCreate(args: CreateItemArgs, { addPending }: ToolExecutorDeps): ToolResult {
  if (!args.taskName) {
    return { ok: false, message: "缺少必填字段 taskName" };
  }
  const dueDate = args.dueDate ?? "";
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return { ok: false, message: `dueDate 必须是 YYYY-MM-DD 或空串，当前传入：${dueDate}` };
  }
  const draft: DdlItem = {
    id: uid(),
    taskName: args.taskName,
    weight: args.weight ?? null,
    dueDate,
    dueTime: args.dueTime || "23:59",
    description: args.description || "",
    isGroupWork: args.isGroupWork ?? false,
    source: "AI 创建（待核实）",
    completed: false,
  };
  const dateLabel = draft.dueDate || "待定";
  addPending({
    id: makeChangeId(),
    kind: "create",
    summary: `${draft.taskName} · ${dateLabel}${draft.dueTime ? " " + draft.dueTime : ""}`,
    draft,
  });
  return {
    ok: true,
    message: `已生成「新建」草稿：${draft.taskName}（${dateLabel}）。已加入待核实队列，等用户在卡片上点击「接受」后才会真正写入。`,
    data: compactItem(draft),
  };
}

// ============================================================
// 2. update_item → PendingUpdate（不入库，待核实）
// ============================================================
function execUpdate(args: UpdateItemArgs, { getDdls, addPending }: ToolExecutorDeps): ToolResult {
  const target = findItem(getDdls(), args.itemId, args.taskNameFuzzy);
  if (!target) {
    return {
      ok: false,
      message: `找不到匹配的任务（itemId=${args.itemId}, taskNameFuzzy=${args.taskNameFuzzy}）。建议先调 list_items 查询。`,
    };
  }
  if (args.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(args.dueDate)) {
    return { ok: false, message: `dueDate 必须是 YYYY-MM-DD，当前传入：${args.dueDate}` };
  }

  const patch: Partial<DdlItem> = {
    ...(args.taskName !== undefined ? { taskName: args.taskName } : {}),
    ...(args.dueDate !== undefined ? { dueDate: args.dueDate } : {}),
    ...(args.dueTime !== undefined ? { dueTime: args.dueTime } : {}),
    ...(args.weight !== undefined ? { weight: args.weight } : {}),
    ...(args.description !== undefined ? { description: args.description } : {}),
    ...(args.isGroupWork !== undefined ? { isGroupWork: args.isGroupWork } : {}),
  };
  if (Object.keys(patch).length === 0) {
    return { ok: false, message: "update_item 至少需要 1 个待修改字段" };
  }

  addPending({
    id: makeChangeId(),
    kind: "update",
    targetId: target.id,
    before: target,
    patch,
    summary: `${target.taskName}`,
  });

  return {
    ok: true,
    message: `已生成「修改」草稿：${target.taskName}。已加入待核实队列。`,
    data: compactItem({ ...target, ...patch }),
  };
}

// ============================================================
// 3. delete_item → PendingDelete（不入库，待核实）
// ============================================================
function execDelete(args: DeleteItemArgs, { getDdls, addPending }: ToolExecutorDeps): ToolResult {
  const target = findItem(getDdls(), args.itemId, args.taskNameFuzzy);
  if (!target) {
    return {
      ok: false,
      message: `找不到匹配的任务（itemId=${args.itemId}, taskNameFuzzy=${args.taskNameFuzzy}）`,
    };
  }
  addPending({
    id: makeChangeId(),
    kind: "delete",
    targetId: target.id,
    before: target,
    summary: `${target.taskName}`,
  });
  return {
    ok: true,
    message: `已生成「删除」草稿：${target.taskName}。已加入待核实队列。`,
    data: { id: target.id },
  };
}

// ============================================================
// 4. toggle_complete → 直接执行（用户高频低风险，不走核实）
// ============================================================
function execToggle(args: ToggleCompleteArgs, { getDdls, setDdls }: ToolExecutorDeps): ToolResult {
  const target = findItem(getDdls(), args.itemId, args.taskNameFuzzy);
  if (!target) {
    return { ok: false, message: `找不到匹配的任务` };
  }
  const nextCompleted = args.completed !== undefined ? args.completed : !target.completed;
  setDdls((prev) => prev.map((it) => (it.id === target.id ? { ...it, completed: nextCompleted } : it)));
  return {
    ok: true,
    message: nextCompleted ? `已标记完成：${target.taskName}` : `已取消完成：${target.taskName}`,
    data: { id: target.id, completed: nextCompleted },
  };
}

// ============================================================
// 5. list_items → 直接执行（只读）
// ============================================================
function execList(args: ListItemsArgs, { getDdls }: ToolExecutorDeps): ToolResult {
  const all = getDdls();
  const filter = args.filter || "all";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = all.filter((d) => {
    if (filter === "all") return true;
    if (filter === "active") return !d.completed;
    if (filter === "completed") return d.completed;
    const due = new Date(d.dueDate);
    const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);
    if (filter === "today") return diff === 0 && !d.completed;
    if (filter === "thisWeek") return diff >= 0 && diff <= 7 && !d.completed;
    if (filter === "later") return diff > 7 && !d.completed;
    return true;
  });

  return {
    ok: true,
    message: `当前匹配 ${filtered.length} 条`,
    data: filtered.map(compactItem),
  };
}

// ============================================================
// helper
// ============================================================
function findItem(ddls: DdlItem[], itemId?: string, fuzzy?: string): DdlItem | null {
  if (itemId) {
    const exact = ddls.find((d) => d.id === itemId);
    if (exact) return exact;
  }
  if (fuzzy) {
    const lower = fuzzy.toLowerCase().trim();
    return ddls.find((d) => d.taskName.toLowerCase().includes(lower)) || null;
  }
  return null;
}
