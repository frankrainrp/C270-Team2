// ============================================================
// lib/pending.ts — AI 写操作的"待核实"模型
// AI 不直接改 ddls，先入 PendingBatch，等用户接受后才落库
// ============================================================

import type { DdlItem } from "./types";

export type PendingChangeKind = "create" | "update" | "delete";

export interface PendingChangeBase {
  id: string;          // change 自身的 id（用于 ✕ 单条删除）
  kind: PendingChangeKind;
  /** 一句话摘要，给 ConfirmCard 显示 */
  summary: string;
}

export interface PendingCreate extends PendingChangeBase {
  kind: "create";
  /** 暂存的 DdlItem 草稿（已经分配了 id，但还没入 ddls）*/
  draft: DdlItem;
}

export interface PendingUpdate extends PendingChangeBase {
  kind: "update";
  targetId: string;
  /** 修改前的快照，用于显示 diff */
  before: DdlItem;
  /** 要 patch 的字段 */
  patch: Partial<DdlItem>;
}

export interface PendingDelete extends PendingChangeBase {
  kind: "delete";
  targetId: string;
  /** 删除前的快照 */
  before: DdlItem;
}

export type PendingChange = PendingCreate | PendingUpdate | PendingDelete;

/** 一批属于同一次 AI 回合（或同一次 PDF pipeline）的 changes */
export interface PendingBatch {
  id: string;
  sessionId: string;
  changes: PendingChange[];
  /** 来源：AI 对话 tool_call / PDF 提取 / 其他自动化 */
  origin: "ai-chat" | "pdf-extract" | "other";
  /** 给 ConfirmCard 顶部显示的一句话 */
  intro: string;
  createdAt: number;
  status: "pending" | "accepted" | "rejected";
}

// ============================================================
// helpers
// ============================================================

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

export const makeBatch = (sessionId: string, origin: PendingBatch["origin"], intro: string): PendingBatch => ({
  id: "batch-" + uid(),
  sessionId,
  changes: [],
  origin,
  intro,
  createdAt: Date.now(),
  status: "pending",
});

export const makeChangeId = () => "chg-" + uid();

/** 把一个 PendingBatch 应用到 ddls 数组（仅接受的）— 返回新 ddls + 统计 */
export function applyBatch(prev: DdlItem[], batch: PendingBatch): { next: DdlItem[]; stats: { created: number; updated: number; deleted: number } } {
  let next = [...prev];
  let created = 0, updated = 0, deleted = 0;
  for (const ch of batch.changes) {
    if (ch.kind === "create") {
      next = [...next, ch.draft];
      created++;
    } else if (ch.kind === "update") {
      next = next.map((d) => (d.id === ch.targetId ? { ...d, ...ch.patch } : d));
      updated++;
    } else if (ch.kind === "delete") {
      next = next.filter((d) => d.id !== ch.targetId);
      deleted++;
    }
  }
  return { next, stats: { created, updated, deleted } };
}
