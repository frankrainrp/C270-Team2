"use client";

// ============================================================
// components/SessionListPanel.tsx — 240px 滑入面板，列出全部 ChatSession
// 从 Sidebar 右侧推出，点击外部 / 同一按钮再次点击则收起。
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, MessageCircle } from "lucide-react";
import type { ChatSession } from "@/lib/types";

interface Props {
  open: boolean;
  sessions: ChatSession[];
  activeId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

const PANEL_WIDTH = 240;
const SIDEBAR_W = 68;

export default function SessionListPanel({
  open, sessions, activeId, onClose, onSelect, onCreate, onRename, onDelete,
}: Props) {
  return (
    <>
      {/* 外部遮罩（透明，仅用于点击收起） */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0, left: SIDEBAR_W + PANEL_WIDTH, right: 0, bottom: 0,
            zIndex: 45,
          }}
        />
      )}

      <aside
        aria-label="会话列表"
        style={{
          position: "fixed",
          top: 0,
          left: SIDEBAR_W,
          width: PANEL_WIDTH,
          height: "100vh",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(0,0,0,0.07)",
          boxShadow: open ? "8px 0 28px rgba(0,0,0,0.08)" : "none",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          zIndex: 46,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 头部 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px 10px", borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111", letterSpacing: 0.2 }}>
            会话列表
          </span>
          <button
            onClick={onClose}
            aria-label="关闭"
            style={{
              border: "none", background: "transparent", cursor: "pointer",
              color: "#9ca3af", padding: 4, borderRadius: 6, display: "flex",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* 新建按钮 */}
        <div style={{ padding: "10px 12px" }}>
          <button
            onClick={onCreate}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "9px 12px", borderRadius: 10,
              border: "1px dashed rgba(99,102,241,0.5)",
              background: "rgba(99,102,241,0.05)",
              color: "#4338ca", fontSize: 13, fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
          >
            <Plus size={14} />
            <span>新建对话</span>
          </button>
        </div>

        {/* 列表 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 16px" }}>
          {sessions.length === 0 ? (
            <div style={{
              fontSize: 12, color: "#9ca3af", textAlign: "center",
              padding: "40px 12px", lineHeight: 1.6,
            }}>
              还没有对话<br />点上方「新建对话」开始
            </div>
          ) : (
            sessions.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                active={s.id === activeId}
                onSelect={() => onSelect(s.id)}
                onRename={(t) => onRename(s.id, t)}
                onDelete={() => onDelete(s.id)}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}

function SessionRow({
  session, active, onSelect, onRename, onDelete,
}: {
  session: ChatSession;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(session.title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      setDraft(session.title);
      // 微任务后聚焦
      queueMicrotask(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, session.title]);

  const commitRename = () => {
    const t = draft.trim();
    if (t && t !== session.title) onRename(t);
    setEditing(false);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!editing) onSelect(); }}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 10px", marginBottom: 2, borderRadius: 10,
        background: active
          ? "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.10))"
          : hovered ? "rgba(0,0,0,0.04)" : "transparent",
        cursor: editing ? "text" : "pointer",
        position: "relative",
        transition: "background 0.15s",
      }}
    >
      <MessageCircle
        size={14}
        style={{ color: active ? "#6366f1" : "#9ca3af", flexShrink: 0 }}
      />

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            else if (e.key === "Escape") setEditing(false);
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1, fontSize: 12.5, color: "#111",
            background: "white", border: "1px solid rgba(99,102,241,0.4)",
            borderRadius: 6, padding: "3px 6px", outline: "none",
            minWidth: 0,
          }}
        />
      ) : (
        <span style={{
          flex: 1, fontSize: 12.5, color: active ? "#4338ca" : "#374151",
          fontWeight: active ? 600 : 500,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          minWidth: 0,
        }}>
          {session.title}
        </span>
      )}

      {/* hover 操作图标 */}
      {hovered && !editing && (
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          <IconBtn
            label="重命名"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            <Pencil size={11} />
          </IconBtn>
          <IconBtn
            label="删除"
            danger
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`确定删除「${session.title}」？此操作不可撤销。`)) onDelete();
            }}
          >
            <Trash2 size={11} />
          </IconBtn>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children, onClick, label, danger,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  danger?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: "none", cursor: "pointer", padding: 4, borderRadius: 5,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: hov ? (danger ? "rgba(254,226,226,0.95)" : "rgba(0,0,0,0.08)") : "transparent",
        color: danger ? (hov ? "#dc2626" : "#9ca3af") : (hov ? "#374151" : "#9ca3af"),
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
