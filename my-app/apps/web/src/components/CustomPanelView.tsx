"use client";

// ============================================================
// components/CustomPanelView.tsx — Phase E 自定义面板渲染
//
// 占据主区，类似 NotesPanel 的单页 markdown 编辑器。
// 顶部：emoji + 可编辑 label + 删除按钮 + 编辑/预览切换
// 中部：textarea（编辑）/ ReactMarkdown 渲染（预览）
// 自动保存：1.2s 防抖（同 NotesPanel B4 风格）
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import { Trash2, Eye, Edit3, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CustomPanel } from "@/lib/types";

interface Props {
  panel: CustomPanel;
  onUpdate: (id: string, patch: Partial<Pick<CustomPanel, "label" | "emoji" | "content">>) => void;
  onDelete: (id: string) => void;
}

export default function CustomPanelView({ panel, onUpdate, onDelete }: Props) {
  const [content, setContent] = useState(panel.content);
  const [label, setLabel] = useState(panel.label);
  const [emoji, setEmoji] = useState(panel.emoji);
  const [mode, setMode] = useState<"edit" | "preview">(panel.content ? "preview" : "edit");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 切换面板时同步 state（panel.id 变化）
  useEffect(() => {
    setContent(panel.content);
    setLabel(panel.label);
    setEmoji(panel.emoji);
    setMode(panel.content ? "preview" : "edit");
  }, [panel.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // content 防抖保存
  const scheduleSave = (patch: Partial<Pick<CustomPanel, "label" | "emoji" | "content">>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onUpdate(panel.id, patch);
      saveTimerRef.current = null;
    }, 1200);
  };

  // unmount 或切换 panel 时立即 flush
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        // 立即保存最新值
        onUpdate(panel.id, { content, label, emoji });
        saveTimerRef.current = null;
      }
    };
  }, [panel.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = () => {
    if (confirm(`确定删除面板「${panel.label}」？此操作不可撤销。`)) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      onDelete(panel.id);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px",
          borderBottom: "1px solid var(--color-border-soft)",
        }}
      >
        <input
          value={emoji}
          onChange={(e) => {
            const v = e.target.value.slice(0, 3);
            setEmoji(v);
            scheduleSave({ emoji: v });
          }}
          maxLength={3}
          style={{
            width: 32, height: 32, borderRadius: 6,
            border: "1px solid transparent",
            background: "transparent",
            fontSize: 20, textAlign: "center",
            outline: "none",
            color: "var(--color-text)",
            fontFamily: "inherit",
          }}
          onFocus={(e) => ((e.currentTarget.style.border = "1px solid var(--color-border)"))}
          onBlur={(e) => ((e.currentTarget.style.border = "1px solid transparent"))}
          title="单字符 emoji（点击编辑）"
        />
        <input
          value={label}
          onChange={(e) => {
            const v = e.target.value.slice(0, 12);
            setLabel(v);
            scheduleSave({ label: v });
          }}
          placeholder="面板名…"
          maxLength={12}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            fontSize: 16,
            fontWeight: 600,
            color: "var(--color-text)",
            outline: "none",
            fontFamily: "inherit",
            padding: "4px 8px",
            borderRadius: 6,
          }}
          onFocus={(e) => ((e.currentTarget.style.background = "var(--color-surface)"))}
          onBlur={(e) => ((e.currentTarget.style.background = "transparent"))}
        />

        {/* edit/preview 切换 */}
        <button
          onClick={() => setMode((m) => (m === "edit" ? "preview" : "edit"))}
          title={mode === "edit" ? "切到预览" : "切到编辑"}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "6px 10px", borderRadius: 6,
            border: "1px solid var(--color-border)",
            background: "var(--color-bg)",
            color: "var(--color-text-muted)",
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {mode === "edit" ? <><Eye size={12} /> 预览</> : <><Edit3 size={12} /> 编辑</>}
        </button>
        <button
          onClick={handleDelete}
          title="删除面板"
          aria-label="删除面板"
          style={{
            width: 30, height: 30, borderRadius: 6,
            border: "1px solid var(--color-border)",
            background: "var(--color-bg)",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "var(--color-danger-soft)";
            el.style.color = "var(--color-danger)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "var(--color-bg)";
            el.style.color = "var(--color-text-muted)";
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", minHeight: 0 }}>
        {mode === "edit" ? (
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              scheduleSave({ content: e.target.value });
            }}
            placeholder="支持 Markdown：# 标题、- 列表、**加粗**、`code`、表格…"
            style={{
              width: "100%",
              minHeight: "100%",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--color-text)",
              background: "transparent",
              fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
            }}
          />
        ) : content.trim() ? (
          <div className="ai-md" style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-text)" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            height: "100%", color: "var(--color-text-faint)", gap: 10,
          }}>
            <FileText size={40} />
            <p style={{ fontSize: 13, margin: 0 }}>面板还没内容，点击右上「编辑」开始写</p>
          </div>
        )}
      </div>
    </div>
  );
}
