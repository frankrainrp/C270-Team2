"use client";

// ============================================================
// components/TaskDetailDrawer.tsx — 任务详情抽屉（C.2-c）
// 替代 TaskEditModal：右侧 380px 滑入，create / edit 双模式
// 新增字段：status / tags / priority
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import {
  X, Trash2, Users, Link2, FolderOpen, Upload,
  FileText, Image as ImageIcon, File as FileIcon,
} from "lucide-react";
import type { DdlItem, DdlAttachment, TaskStatus, TaskPriority } from "@/lib/types";

export type EditingTarget =
  | { mode: "create"; presetDate?: string }
  | { mode: "edit"; item: DdlItem };

export interface FormPayload {
  taskName: string;
  dueDate: string;
  dueTime: string;
  weight: number | null;
  description: string;
  isGroupWork: boolean;
  notes: string;
  attachments: DdlAttachment[];
  status: TaskStatus;
  tags: string[];
  priority?: TaskPriority;
}

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

interface Props {
  target: EditingTarget;
  onCancel: () => void;
  onSubmit: (data: FormPayload) => void;
  onDelete?: (id: string) => void;
}

const STATUS_OPTIONS: { v: TaskStatus; label: string; color: string }[] = [
  { v: "todo", label: "待办", color: "var(--color-text-muted)" },
  { v: "in_progress", label: "进行中", color: "var(--color-warning)" },
  { v: "done", label: "已完成", color: "var(--color-success)" },
];

const PRIORITY_OPTIONS: { v: TaskPriority; label: string; color: string }[] = [
  { v: "low", label: "低", color: "var(--color-info)" },
  { v: "med", label: "中", color: "var(--color-warning)" },
  { v: "high", label: "高", color: "var(--color-danger)" },
];

export default function TaskDetailDrawer({ target, onCancel, onSubmit, onDelete }: Props) {
  const isEdit = target.mode === "edit";
  const init = isEdit ? target.item : null;
  const initialDate = isEdit ? target.item.dueDate : (target.presetDate ?? todayIso());

  const [taskName, setTaskName] = useState(init?.taskName ?? "");
  const [dueDate, setDueDate] = useState(initialDate);
  const [dueTime, setDueTime] = useState(init?.dueTime ?? "23:59");
  const [weight, setWeight] = useState<string>(init?.weight != null ? String(init.weight) : "");
  const [description, setDescription] = useState(init?.description ?? "");
  const [isGroupWork, setIsGroupWork] = useState<boolean>(init?.isGroupWork ?? false);
  const [notes, setNotes] = useState(init?.notes ?? "");
  const [attachments, setAttachments] = useState<DdlAttachment[]>(init?.attachments ?? []);
  // 新字段
  const [status, setStatus] = useState<TaskStatus>(
    init?.status ?? (init?.completed ? "done" : "todo"),
  );
  const [tagsInput, setTagsInput] = useState((init?.tags ?? []).join(", "));
  const [priority, setPriority] = useState<TaskPriority | "">(init?.priority ?? "");

  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const canSubmit = taskName.trim().length > 0 && (dueDate === "" || /^\d{4}-\d{2}-\d{2}$/.test(dueDate));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const w = weight.trim() === "" ? null : Number(weight);
    const tags = tagsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    onSubmit({
      taskName: taskName.trim(),
      dueDate,
      dueTime: dueTime || "23:59",
      weight: w !== null && Number.isFinite(w) ? Math.max(0, Math.min(100, w)) : null,
      description: description.trim(),
      isGroupWork,
      notes: notes.trim(),
      attachments,
      status,
      tags,
      priority: priority || undefined,
    });
  };

  return (
    <>
      {/* 半透明遮罩（轻量级，点击关闭） */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.18)",
          zIndex: 70,
          animation: "drawer-fade 0.18s ease-out",
        }}
      />
      {/* 右侧抽屉 */}
      <aside
        style={{
          position: "fixed",
          top: 56,
          right: 0,
          bottom: 0,
          width: 380,
          background: "var(--color-bg)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.08)",
          zIndex: 71,
          display: "flex",
          flexDirection: "column",
          animation: "drawer-slide 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid var(--color-border)",
              flexShrink: 0,
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
              {isEdit ? "Task Details" : "New Task"}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              aria-label="关闭"
              style={{
                width: 28, height: 28, borderRadius: 6, border: "none",
                background: "transparent", cursor: "pointer", color: "var(--color-text-muted)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
            >
              <X size={16} />
            </button>
          </header>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="任务名">
              <input
                ref={nameRef}
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="例如：Assignment 1、和导师开会"
                style={inputStyle}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 80px", gap: 8 }}>
              <Field label="截止日期">
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="时间">
                <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="权重 %">
                <input
                  type="number" min={0} max={100} step={1}
                  value={weight} onChange={(e) => setWeight(e.target.value)}
                  placeholder="—"
                  style={inputStyle}
                />
              </Field>
            </div>

            {/* 状态 + 优先级（同一行 segmented） */}
            <Field label="状态">
              <SegmentedRadio
                options={STATUS_OPTIONS.map((s) => ({ value: s.v, label: s.label, color: s.color }))}
                value={status}
                onChange={(v) => setStatus(v as TaskStatus)}
              />
            </Field>

            <Field label="优先级">
              <SegmentedRadio
                options={[
                  { value: "", label: "无", color: "var(--color-text-faint)" },
                  ...PRIORITY_OPTIONS.map((p) => ({ value: p.v, label: p.label, color: p.color })),
                ]}
                value={priority}
                onChange={(v) => setPriority(v as TaskPriority | "")}
              />
            </Field>

            <Field label="标签（逗号分隔）">
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="例如：C245, 期末, 论文"
                style={inputStyle}
              />
              {tagsInput.trim() && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                  {tagsInput.split(/[,，]/).map((t) => t.trim()).filter(Boolean).map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 10,
                        color: "var(--color-text-muted)",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        padding: "1px 6px",
                        borderRadius: 4,
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <label style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 13, color: "var(--color-text)", cursor: "pointer", userSelect: "none",
            }}>
              <input
                type="checkbox"
                checked={isGroupWork}
                onChange={(e) => setIsGroupWork(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--color-primary)", cursor: "pointer" }}
              />
              <Users size={14} color="var(--color-info)" />
              小组协作任务
            </label>

            <Field label="说明">
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="可选，比如「Submit via Blackboard」"
                rows={2}
                style={{ ...inputStyle, resize: "vertical", minHeight: 52 }}
              />
            </Field>

            <Field label="备注（长篇）">
              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="可写更详细的笔记、关键信息提醒、链接等"
                rows={3}
                style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
              />
            </Field>

            <AttachmentsEditor attachments={attachments} setAttachments={setAttachments} />
          </div>

          {/* Footer */}
          <footer
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderTop: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              flexShrink: 0,
            }}
          >
            <div>
              {isEdit && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (init && confirm(`删除「${init.taskName}」？`)) onDelete(init.id);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "6px 10px", borderRadius: 6,
                    border: "1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)",
                    background: "transparent", color: "var(--color-danger)",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <Trash2 size={12} /> 删除
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: "7px 14px", borderRadius: 6,
                  border: "1px solid var(--color-border)", background: "var(--color-bg)",
                  fontSize: 13, fontWeight: 500, color: "var(--color-text-muted)", cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  padding: "7px 16px", borderRadius: 6, border: "none",
                  background: canSubmit ? "var(--color-primary)" : "var(--color-border)",
                  color: "white", fontSize: 13, fontWeight: 500,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                }}
              >
                {isEdit ? "保存" : "创建"}
              </button>
            </div>
          </footer>
        </form>
      </aside>

      <style>{`
        @keyframes drawer-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawer-slide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

// ============================================================
// Segmented Radio
// ============================================================
function SegmentedRadio<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string; color: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 6,
        padding: 2,
        gap: 2,
      }}
    >
      {options.map((o) => {
        const isActive = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: 4,
              border: "none",
              background: isActive ? "var(--color-bg)" : "transparent",
              color: isActive ? o.color : "var(--color-text-muted)",
              fontSize: 12,
              fontWeight: isActive ? 600 : 500,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.12s",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// 基础组件
// ============================================================
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  fontSize: 13,
  color: "var(--color-text)",
  outline: "none",
  fontFamily: "inherit",
  background: "var(--color-bg)",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </span>
      {children}
    </label>
  );
}

// ============================================================
// AttachmentsEditor —— 附件列表 + 3 个添加入口（与 TaskEditModal 一致）
// ============================================================
function AttachmentsEditor({
  attachments, setAttachments,
}: {
  attachments: DdlAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<DdlAttachment[]>>;
}) {
  const [adding, setAdding] = useState<null | "url" | "filepath">(null);
  const [input, setInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const addUrlOrPath = () => {
    if (!input.trim() || !adding) return;
    let label = labelInput.trim();
    if (!label) {
      label = adding === "url"
        ? (() => { try { return new URL(input).hostname; } catch { return input.slice(0, 40); } })()
        : input.split(/[\\\/]/).pop() ?? input;
    }
    setAttachments((prev) => [
      ...prev,
      { id: uid(), kind: adding, label, ref: input.trim() },
    ]);
    setInput("");
    setLabelInput("");
    setAdding(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { saveBlob } = await import("@/lib/blobs");
      const newOnes: DdlAttachment[] = [];
      for (const f of Array.from(files)) {
        const rec = await saveBlob(f);
        newOnes.push({
          id: uid(), kind: "blob", label: rec.name,
          ref: rec.id, mime: rec.mime, size: rec.data.size,
        });
      }
      setAttachments((prev) => [...prev, ...newOnes]);
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const remove = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div>
      <span
        style={{
          fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)",
          letterSpacing: 0.4, display: "block", marginBottom: 6,
        }}
      >
        附件
      </span>

      {attachments.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {attachments.map((a) => <AttChip key={a.id} att={a} onRemove={() => remove(a.id)} />)}
        </div>
      )}

      {adding && (
        <div
          style={{
            display: "flex", gap: 6, marginBottom: 8, alignItems: "center",
            padding: 8, borderRadius: 6,
            background: "var(--color-primary-soft)",
            border: "1px solid var(--color-primary)",
          }}
        >
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addUrlOrPath(); }
            }}
            placeholder={adding === "url" ? "https://..." : "C:\\Users\\..."}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="button" onClick={addUrlOrPath} style={smallBtn(true)}>+</button>
          <button type="button" onClick={() => { setAdding(null); setInput(""); setLabelInput(""); }} style={smallBtn(false)}>×</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <AddBtn icon={<Link2 size={11} />} label="链接" onClick={() => setAdding("url")} />
        <AddBtn icon={<FolderOpen size={11} />} label="路径" onClick={() => setAdding("filepath")} />
        <AddBtn icon={<Upload size={11} />} label={uploading ? "上传中…" : "上传"} onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={handleUpload} />
      </div>
    </div>
  );
}

function AttChip({ att, onRemove }: { att: DdlAttachment; onRemove: () => void }) {
  const Icon = att.kind === "url" ? Link2 : att.kind === "filepath" ? FolderOpen : pickBlobIcon(att);
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 4px 4px 8px", borderRadius: 6,
        background: "var(--color-surface)", border: "1px solid var(--color-border)",
        fontSize: 11, color: "var(--color-text)", maxWidth: 200,
      }}
    >
      <Icon size={12} color="var(--color-primary)" style={{ flexShrink: 0 }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {att.label}
      </span>
      <button
        type="button" onClick={onRemove} aria-label="移除"
        style={{
          width: 16, height: 16, borderRadius: 4, border: "none", padding: 0,
          background: "transparent", cursor: "pointer", color: "var(--color-text-faint)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={11} />
      </button>
    </div>
  );
}

function pickBlobIcon(a: DdlAttachment) {
  const m = a.mime || "";
  if (m.startsWith("image/")) return ImageIcon;
  if (m === "application/pdf" || a.label.toLowerCase().endsWith(".pdf")) return FileText;
  return FileIcon;
}

function AddBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "5px 10px", borderRadius: 6,
        border: "1px dashed var(--color-primary)",
        background: h ? "var(--color-primary-soft)" : "transparent",
        color: "var(--color-primary)", fontSize: 11, fontWeight: 500,
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {icon} + {label}
    </button>
  );
}

function smallBtn(primary: boolean): React.CSSProperties {
  return {
    padding: "5px 10px", borderRadius: 4, border: "none",
    background: primary ? "var(--color-primary)" : "var(--color-surface)",
    color: primary ? "white" : "var(--color-text-muted)",
    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
    flexShrink: 0,
  };
}
