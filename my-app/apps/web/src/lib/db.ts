// ============================================================
// lib/db.ts — Dexie (IndexedDB) 本地持久化
//
// Phase 2 单用户场景：所有 DDL / 消息存浏览器本地，0 部署、0 月费。
// Phase 3 切 Tauri 桌面壳时改用 SQLite；Phase 4 上云时迁 Neon。
// Schema 与 packages/database/src/schema.ts 字段保持一致。
// ============================================================

import Dexie, { type Table } from "dexie";
import type { DdlItem, ChatMessage, StoredBlob, ChatSession } from "./types";

export class ButlerDB extends Dexie {
  ddls!: Table<DdlItem, string>;          // 主键 id
  messages!: Table<ChatMessage, string>;  // 主键 id（消息历史）
  blobs!: Table<StoredBlob, string>;      // 主键 id（附件文件二进制）
  sessions!: Table<ChatSession, string>;  // 主键 id（多会话）

  constructor() {
    super("butler-db");
    this.version(1).stores({
      // & = primary key, 后续是索引
      ddls: "&id, dueDate, completed, source",
      messages: "&id, timestamp, role",
    });
    // v2: 新增 blobs 表（不影响 v1 数据，自动迁移）
    this.version(2).stores({
      ddls: "&id, dueDate, completed, source",
      messages: "&id, timestamp, role",
      blobs: "&id, createdAt",
    });
    // v3: 新增 sessions 表 + messages 加 sessionId 索引
    // upgrade: 把 v2 的孤立 messages 全部归到一个「历史对话」session
    this.version(3).stores({
      ddls: "&id, dueDate, completed, source",
      messages: "&id, sessionId, timestamp, role",
      blobs: "&id, createdAt",
      sessions: "&id, updatedAt",
    }).upgrade(async (tx) => {
      const defaultId = "sess-legacy-" + Date.now().toString(36);
      const now = Date.now();
      await tx.table("sessions").add({
        id: defaultId,
        title: "历史对话",
        createdAt: now,
        updatedAt: now,
      });
      await tx.table("messages").toCollection().modify((m: ChatMessage) => {
        if (!m.sessionId) m.sessionId = defaultId;
      });
    });
  }
}

// 单例（Next.js 客户端组件多处 import 同一份）
let _db: ButlerDB | null = null;
export function getDb(): ButlerDB {
  if (typeof window === "undefined") {
    throw new Error("getDb() 仅可在客户端调用");
  }
  if (!_db) _db = new ButlerDB();
  return _db;
}
