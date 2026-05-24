"use client";

// ============================================================
// components/InputPod.tsx — 悬浮底栏输入舱（含文件上传 + 拖拽）
// ============================================================

import React, { useRef, useEffect, useState } from "react";
import { Paperclip, ArrowUp, ChevronDown, FileText, Image as ImageIcon, X, File as FileIcon } from "lucide-react";
import type { UploadedFile } from "@/lib/types";

interface InputPodProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  attachedFiles: UploadedFile[];
  onAttach: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
}

const ACCEPTED_TYPES = ".pdf,.docx,.doc,.txt,.md,image/*";

export default function InputPod({
  value, onChange, onSend, isLoading = false,
  attachedFiles, onAttach, onRemoveAttachment,
}: InputPodProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  const canSend = !isLoading && (!!(value ?? "").trim() || attachedFiles.length > 0);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAttach(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAttach(e.dataTransfer.files);
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: 720,
    }}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          background: dragActive ? "var(--color-primary-soft)" : "var(--color-bg)",
          border: `1px solid ${
            dragActive ? "var(--color-primary)" :
            focused ? "var(--color-primary)" : "var(--color-border)"
          }`,
          borderRadius: 14,
          boxShadow: focused || dragActive
            ? "0 0 0 3px var(--color-primary-soft), 0 4px 16px rgba(0,0,0,0.06)"
            : "0 1px 2px rgba(0,0,0,0.04)",
          overflow: "hidden",
          transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
          position: "relative",
        }}>
        {/* 拖拽提示遮罩 */}
        {dragActive && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
            background: "rgba(99,102,241,0.04)",
            color: "#6366f1", fontSize: 13, fontWeight: 600,
            letterSpacing: 0.2,
          }}>
            释放即可上传文档
          </div>
        )}

        {/* 附件 chips */}
        {attachedFiles.length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 6,
            padding: "10px 12px 0",
          }}>
            {attachedFiles.map((f) => (
              <FileChip key={f.id} file={f} onRemove={() => onRemoveAttachment(f.id)} />
            ))}
          </div>
        )}

        {/* 上层 textarea */}
        <div style={{ padding: "12px 16px 4px" }}>
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={
              attachedFiles.length > 0
                ? "添加备注后按 Enter 发送，AI 将解析文档并提取 DDL…"
                : "向 Butler 提问，或拖拽 PDF / 课件到此处自动整理 DDL…"
            }
            rows={1}
            style={{
              width: "100%",
              background: "transparent",
              resize: "none",
              outline: "none",
              border: "none",
              fontSize: 14,
              color: "#111",
              lineHeight: 1.6,
              minHeight: 44,
              maxHeight: 200,
              fontFamily: "inherit",
              userSelect: "text",
              WebkitUserSelect: "text",
            }}
          />
        </div>

        {/* 下层：模型 badge + 工具 | 发送 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "4px 12px 10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* 模型 Badge */}
            <button id="model-selector-btn" style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(0,0,0,0.05)", border: "none",
              padding: "5px 10px", borderRadius: 8, cursor: "pointer",
              fontSize: 12, color: "#374151", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.09)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"; }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>DeepSeek-V4 Flash</span>
              <span style={{ color: "#9ca3af", fontSize: 11 }}>(Smart Router)</span>
              <ChevronDown size={12} color="#9ca3af" />
            </button>

            {/* 附件 */}
            <button
              id="attach-btn"
              aria-label="附加文件"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 32, height: 32, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", cursor: "pointer", background: "transparent", color: "#9ca3af",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"; (e.currentTarget as HTMLButtonElement).style.color = "#374151"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
            >
              <Paperclip size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES}
              style={{ display: "none" }}
              onChange={handleFilePick}
            />
          </div>

          {/* 发送按钮 — 墨绿圆形 */}
          <button
            id="send-btn"
            aria-label="发送消息"
            onClick={onSend}
            disabled={!canSend}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: !canSend ? "var(--color-border)" : "var(--color-primary)",
              color: "white",
              cursor: !canSend ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (canSend) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-primary-hover)";
            }}
            onMouseLeave={(e) => {
              if (canSend) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-primary)";
            }}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- 文件 chip ----
function FileChip({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) {
  const [hov, setHov] = useState(false);
  const isImage = file.mime.startsWith("image/");
  const isPdf = file.mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const Icon = isImage ? ImageIcon : isPdf ? FileText : FileIcon;
  const color = isPdf ? "#dc2626" : isImage ? "#10b981" : "#6366f1";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 8px 5px 8px", borderRadius: 8,
        background: "rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.06)",
        fontSize: 12, color: "#374151",
        maxWidth: 220,
        transition: "background 0.15s",
      }}
    >
      <Icon size={14} color={color} style={{ flexShrink: 0 }} />
      <span style={{
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        fontWeight: 500, maxWidth: 140,
      }}>{file.name}</span>
      <span style={{ color: "#9ca3af", fontSize: 10, flexShrink: 0 }}>
        {formatSize(file.size)}
      </span>
      <button
        aria-label="移除附件"
        onClick={onRemove}
        style={{
          width: 18, height: 18, borderRadius: 4, border: "none",
          background: hov ? "rgba(0,0,0,0.08)" : "transparent",
          cursor: "pointer", color: "#6b7280",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background 0.15s",
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
