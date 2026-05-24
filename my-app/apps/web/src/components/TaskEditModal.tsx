"use client";

// ============================================================
// components/TaskEditModal.tsx — 通用任务编辑对话框
// 同时承载 create 与 edit；edit 模式下额外提供 Delete 按钮
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import { X, Trash2, Users, Link2, FolderOpen, Upload, FileText, Image as ImageIcon, File as FileIcon } from "lucide-react";
import type { DdlItem, DdlAttachment } from "@/lib/types";

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
}

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

interface Props {
  target: EditingTarget;
  onCancel: () => void;
  onSubmit: (data: FormPayload) => void;
  onDelete?: (id: string) => void;
}

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function TaskEditModal({ target, onCancel, onSubmit, onDelete }: Props) {
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
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const canSubmit = taskName.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dueDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const w = weight.trim() === "" ? null : Number(weight);
    onSubmit({
      taskName: taskName.trim(),
      dueDate,
      dueTime: dueTime || "23:59",
      weight: w !== null && Number.isFinite(w) ? Math.max(0, Math.min(100, w)) : null,
      description: description.trim(),
      isGroupWork,
      notes: notes.trim(),
      attachments,
    });
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "modal-in 0.18s ease-out",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%", maxWidth: 520,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderRadius: 18,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: 0 }}>
            {isEdit ? "编辑任务" : "新建任务"}
          </h2>
          <button type="button" onClick={onCancel} aria-label="关闭" style={{
            width: 28, height: 28, borderRadius: 8, border: "none",
            background: "transparent", cursor: "pointer", color: "#6b7280",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="任务名">
            <input
              ref={nameRef}
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="例如：Assignment 1、和导师开会"
              style={inputStyle}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 10 }}>
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

          <Field label="说明">
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="可选，比如「Submit via Blackboard」"
              rows={2}
              style={{ ...inputStyle, resize: "vertical", minHeight: 56 }}
            />
          </Field>

          <label style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, color: "#374151", cursor: "pointer", userSelect: "none",
          }}>
            <input type="checkbox" checked={isGroupWork} onChange={(e) => setIsGroupWork(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#6366f1", cursor: "pointer" }} />
            <Users size={14} color="#8b5cf6" />
            小组协作任务
          </label>

          <Field label="备注（长篇）">
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="可写更详细的笔记、关键信息提醒、链接等。支持 Markdown 后续会渲染。"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
            />
          </Field>

          <AttachmentsEditor attachments={attachments} setAttachments={setAttachments} />
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px", borderTop: "1px solid rgba(0,0,0,0.06)",
          background: "rgba(0,0,0,0.02)",
        }}>
          <div>
            {isEdit && onDelete && (
              <button type="button"
                onClick={() => { if (init && confirm(`删除「${init.taskName}」？`)) onDelete(init.id); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.25)",
                  background: "rgba(254,242,242,0.6)", color: "#dc2626",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Trash2 size={12} /> 删除
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onCancel} style={{
              padding: "7px 16px", borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.1)", background: "white",
              fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer",
              fontFamily: "inherit",
            }}>
              取消
            </button>
            <button type="submit" disabled={!canSubmit} style={{
              padding: "7px 18px", borderRadius: 8, border: "none",
              background: canSubmit ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e5e7eb",
              color: "white", fontSize: 13, fontWeight: 600,
              cursor: canSubmit ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              boxShadow: canSubmit ? "0 2px 10px rgba(99,102,241,0.35)" : "none",
            }}>
              {isEdit ? "保存" : "创建"}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 8,
  fontSize: 13,
  color: "#111",
  outline: "none",
  fontFamily: "inherit",
  background: "white",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", letterSpacing: 0.3 }}>
        {label.toUpperCase()}
      </span>
      {children}
    </label>
  );
}

// ============================================================
// AttachmentsEditor —— 附件列表 + 3 个添加入口
// ============================================================
function AttachmentsEditor({ attachments, setAttachments }: {
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
    setInput(""); setLabelInput(""); setAdding(null);
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
    // blob 文件不在这里 delete，等 page.tsx submit 后由孤立 GC 处理（简化：留着也无碍）
  };

  return (
    <div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", letterSpacing: 0.3, display: "block", marginBottom: 6 }}>
        附件
      </span>

      {/* 已有附件列表 */}
      {attachments.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {attachments.map((a) => <AttChip key={a.id} att={a} onRemove={() => remove(a.id)} />)}
        </div>
      )}

      {/* 输入小框 */}
      {adding && (
        <div style={{
          display: "flex", gap: 6, marginBottom: 8, alignItems: "center",
          padding: 8, borderRadius: 8, background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.2)",
        }}>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrlOrPath(); } }}
            placeholder={adding === "url" ? "https://..." : "C:\\Users\\... 或 /home/..."}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            placeholder="显示名（可选）"
            style={{ ...inputStyle, width: 120 }}
          />
          <button type="button" onClick={addUrlOrPath} style={smallBtn(true)}>添加</button>
          <button type="button" onClick={() => { setAdding(null); setInput(""); setLabelInput(""); }} style={smallBtn(false)}>×</button>
        </div>
      )}

      {/* 3 个入口 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <AddBtn icon={<Link2 size={12} />} label="链接" onClick={() => setAdding("url")} />
        <AddBtn icon={<FolderOpen size={12} />} label="文件路径" onClick={() => setAdding("filepath")} />
        <AddBtn icon={<Upload size={12} />} label={uploading ? "上传中…" : "上传文件"} onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={handleUpload} />
      </div>
    </div>
  );
}

function AttChip({ att, onRemove }: { att: DdlAttachment; onRemove: () => void }) {
  const Icon = att.kind === "url" ? Link2 : att.kind === "filepath" ? FolderOpen : pickBlobIcon(att);
  const color = att.kind === "url" ? "#6366f1" : att.kind === "filepath" ? "#10b981" : (att.mime?.includes("pdf") ? "#dc2626" : "#8b5cf6");
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 4px 4px 8px", borderRadius: 6,
      background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)",
      fontSize: 11, color: "#374151", maxWidth: 220,
    }}>
      <Icon size={12} color={color} style={{ flexShrink: 0 }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {att.label}
      </span>
      <button type="button" onClick={onRemove} aria-label="移除附件" style={{
        width: 16, height: 16, borderRadius: 4, border: "none", padding: 0,
        background: "transparent", cursor: "pointer", color: "#9ca3af",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
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
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "5px 10px", borderRadius: 6,
        border: "1px dashed rgba(99,102,241,0.4)",
        background: h ? "rgba(99,102,241,0.08)" : "transparent",
        color: "#6366f1", fontSize: 11, fontWeight: 500,
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {icon} + {label}
    </button>
  );
}

function smallBtn(primary: boolean): React.CSSProperties {
  return {
    padding: "6px 12px", borderRadius: 6, border: "none",
    background: primary ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(0,0,0,0.05)",
    color: primary ? "white" : "#374151",
    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
    flexShrink: 0,
  };
}
