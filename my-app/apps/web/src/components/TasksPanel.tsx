"use client";

// ============================================================
// components/TasksPanel.tsx — 「每日任务」面板（最简版）
// 接收 extractedDdls，按 今日 / 本周 / 之后 / 已完成 分组
// Phase 2 接入真实 CRUD（add/edit/delete）
// ============================================================

import React, { useMemo, useState } from "react";
import { Check, FileText, Users, Inbox, Plus, Pencil, Trash2, CalendarPlus, Download, Upload, Link2, FolderOpen, Image as ImageIcon, File as FileIcon, Paperclip } from "lucide-react";
import type { DdlItem, DdlAttachment } from "@/lib/types";
import DecoLayered from "./ui/DecoLayered";

interface Props {
  ddls: DdlItem[];
  onToggleComplete: (id: string) => void;
  onRequestCreate: () => void;
  onRequestEdit: (ddl: DdlItem) => void;
  onRequestDelete: (id: string) => void;
  onRequestPreview: (att: DdlAttachment) => void;
  onExportIcs: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
}

type GroupKey = "tbd" | "today" | "thisWeek" | "later" | "done";

const GROUP_META: Record<GroupKey, { label: string; color: string }> = {
  tbd:      { label: "待定",   color: "#eab308" },
  today:    { label: "今天",   color: "#ef4444" },
  thisWeek: { label: "本周",   color: "#f59e0b" },
  later:    { label: "之后",   color: "#6366f1" },
  done:     { label: "已完成", color: "#10b981" },
};

function classifyGroup(ddl: DdlItem): GroupKey {
  if (ddl.completed) return "done";
  if (!ddl.dueDate) return "tbd"; // 空 dueDate = AI 未能确定日期
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(ddl.dueDate);
  const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return "today";
  if (diff <= 7) return "thisWeek";
  return "later";
}

export default function TasksPanel({ ddls, onToggleComplete, onRequestCreate, onRequestEdit, onRequestDelete, onRequestPreview, onExportIcs, onExportJson, onImportJson }: Props) {
  const grouped = useMemo(() => {
    const g: Record<GroupKey, DdlItem[]> = { tbd: [], today: [], thisWeek: [], later: [], done: [] };
    for (const ddl of ddls) g[classifyGroup(ddl)].push(ddl);
    for (const k of Object.keys(g) as GroupKey[]) {
      g[k].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    return g;
  }, [ddls]);

  const totalActive = ddls.filter((d) => !d.completed).length;

  return (
    <div style={{
      height: "100vh", overflow: "auto",
      padding: "32px 32px 40px",
    }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 28,
        }}>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 700, color: "#111",
              margin: 0, letterSpacing: "-0.5px",
            }}>每日任务</h1>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
              {totalActive > 0
                ? `共 ${totalActive} 项待办任务${ddls.some((d) => d.completed) ? `，${ddls.filter((d) => d.completed).length} 项已完成` : ""}`
                : "暂无任务 — 上传课件或对 AI 说「明天要开会」即可创建"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ToolbarBtn onClick={onExportIcs} icon={<CalendarPlus size={13} />} label="订阅日历" tooltip="下载 .ics → 导入手机/电脑系统日历自动提醒" />
            <ToolbarBtn onClick={onExportJson} icon={<Download size={13} />} label="导出" tooltip="导出全部任务为 JSON 文件备份" />
            <ToolbarBtn onClick={onImportJson} icon={<Upload size={13} />} label="导入" tooltip="从 JSON 文件合并任务（按 ID 去重）" />
            <AddButton onClick={onRequestCreate} />
          </div>
        </header>

        {/* 空状态 */}
        {ddls.length === 0 ? (
          <EmptyState onCreate={onRequestCreate} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {(["tbd", "today", "thisWeek", "later", "done"] as GroupKey[]).map((key) => {
              const items = grouped[key];
              if (items.length === 0) return null;
              return <TaskGroup key={key} groupKey={key} items={items} onToggle={onToggleComplete} onEdit={onRequestEdit} onDelete={onRequestDelete} onPreview={onRequestPreview} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- 分组 ----
function TaskGroup({ groupKey, items, onToggle, onEdit, onDelete, onPreview }: {
  groupKey: GroupKey; items: DdlItem[];
  onToggle: (id: string) => void;
  onEdit: (ddl: DdlItem) => void;
  onDelete: (id: string) => void;
  onPreview: (att: DdlAttachment) => void;
}) {
  const meta = GROUP_META[groupKey];
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: meta.color,
        }} />
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0, letterSpacing: 0.3 }}>
          {meta.label.toUpperCase()}
        </h2>
        <span style={{
          fontSize: 11, color: "#9ca3af", fontWeight: 600,
          padding: "1px 7px", borderRadius: 8,
          background: "rgba(0,0,0,0.04)",
        }}>{items.length}</span>
      </div>
      <DecoLayered innerStyle={{ overflow: "hidden" }}>
        {items.map((item, idx) => (
          <TaskRow key={item.id} item={item} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} onPreview={onPreview} isLast={idx === items.length - 1} />
        ))}
      </DecoLayered>
    </section>
  );
}

// ---- 单条任务 ----
function TaskRow({ item, onToggle, onEdit, onDelete, onPreview, isLast }: {
  item: DdlItem;
  onToggle: (id: string) => void;
  onEdit: (ddl: DdlItem) => void;
  onDelete: (id: string) => void;
  onPreview: (att: DdlAttachment) => void;
  isLast: boolean;
}) {
  const [hov, setHov] = useState(false);
  const displayDate = formatDate(item.dueDate);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.05)",
        background: hov ? "rgba(99,102,241,0.04)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <Checkbox checked={item.completed} onClick={() => onToggle(item.id)} />
      <div
        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        onClick={() => onEdit(item)}
        title="点击编辑"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 14, fontWeight: 500,
            color: item.completed ? "#9ca3af" : "#111",
            textDecoration: item.completed ? "line-through" : "none",
          }}>
            {item.taskName}
          </span>
          {item.isGroupWork && (
            <span title="小组作业" style={{ display: "inline-flex", color: "#8b5cf6" }}>
              <Users size={12} />
            </span>
          )}
          {item.weight !== null && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#6366f1",
              background: "rgba(99,102,241,0.1)",
              padding: "1px 6px", borderRadius: 6,
            }}>{item.weight}%</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
          <span style={{ fontSize: 11, color: "#6b7280" }}>
            {displayDate} · {item.dueTime}
          </span>
          {item.description && (
            <span style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.description}
            </span>
          )}
        </div>
        {/* 附件 + 备注指示 */}
        {(item.attachments?.length || item.notes) && (
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {item.notes && (
              <span title={item.notes} style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                padding: "2px 6px", borderRadius: 4,
                background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                fontSize: 10, color: "#92400e", fontWeight: 500,
              }}>
                📝 备注
              </span>
            )}
            {item.attachments?.map((att) => (
              <AttachmentChip key={att.id} att={att} onClick={(e) => { e.stopPropagation(); onPreview(att); }} />
            ))}
          </div>
        )}
      </div>

      {/* Hover 时显示的编辑/删除 */}
      <div style={{
        display: "flex", gap: 2,
        opacity: hov ? 1 : 0,
        transition: "opacity 0.15s",
        pointerEvents: hov ? "auto" : "none",
      }}>
        <RowIconBtn label="编辑" onClick={() => onEdit(item)}>
          <Pencil size={12} />
        </RowIconBtn>
        <RowIconBtn label="删除" danger onClick={() => {
          if (confirm(`删除「${item.taskName}」？`)) onDelete(item.id);
        }}>
          <Trash2 size={12} />
        </RowIconBtn>
      </div>

      <span title={`来源：${item.source}`} style={{
        display: "flex", alignItems: "center", gap: 4,
        fontSize: 10, color: "#9ca3af",
        background: "rgba(0,0,0,0.04)",
        padding: "3px 8px", borderRadius: 8,
        maxWidth: 140,
        flexShrink: 0,
      }}>
        <FileText size={10} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.source}
        </span>
      </span>
    </div>
  );
}

function AttachmentChip({ att, onClick }: { att: DdlAttachment; onClick: (e: React.MouseEvent) => void }) {
  const [h, setH] = useState(false);
  const Icon = att.kind === "url" ? Link2 : att.kind === "filepath" ? FolderOpen
    : (att.mime?.startsWith("image/") ? ImageIcon
      : (att.mime?.includes("pdf") || att.label.toLowerCase().endsWith(".pdf")) ? FileText
      : FileIcon);
  const color = att.kind === "url" ? "#6366f1" : att.kind === "filepath" ? "#10b981" : (att.mime?.includes("pdf") ? "#dc2626" : "#8b5cf6");
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      title={att.ref}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 7px", borderRadius: 4,
        background: h ? `${color}22` : `${color}14`,
        border: `1px solid ${color}33`,
        fontSize: 10, color: "#374151", fontWeight: 500,
        cursor: "pointer", fontFamily: "inherit",
        maxWidth: 160, overflow: "hidden",
      }}
    >
      <Paperclip size={9} color={color} style={{ flexShrink: 0 }} />
      <Icon size={10} color={color} style={{ flexShrink: 0 }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {att.label}
      </span>
    </button>
  );
}

function RowIconBtn({ children, onClick, label, danger }: {
  children: React.ReactNode; onClick: () => void; label: string; danger?: boolean;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={label}
      title={label}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 24, height: 24, borderRadius: 6, border: "none",
        background: h ? (danger ? "rgba(239,68,68,0.12)" : "rgba(99,102,241,0.12)") : "transparent",
        color: h ? (danger ? "#dc2626" : "#6366f1") : "#9ca3af",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ---- 复选框 ----
function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={checked ? "标记未完成" : "标记完成"}
      style={{
        width: 18, height: 18, borderRadius: 6,
        border: `1.5px solid ${checked ? "#10b981" : "#d1d5db"}`,
        background: checked ? "#10b981" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
        transition: "all 0.15s",
      }}
    >
      {checked && <Check size={11} color="white" strokeWidth={3} />}
    </button>
  );
}

// ---- 工具栏小按钮（ICS/导出/导入） ----
function ToolbarBtn({ icon, label, tooltip, onClick }: {
  icon: React.ReactNode; label: string; tooltip: string; onClick: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={tooltip}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "7px 10px", borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.08)",
        background: h ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.7)",
        color: h ? "#6366f1" : "#374151",
        fontSize: 12, fontWeight: 500, cursor: "pointer",
        fontFamily: "inherit", transition: "all 0.15s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ---- 新建按钮 ----
function AddButton({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 10,
        border: "none",
        background: hov ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(99,102,241,0.1)",
        color: hov ? "white" : "#6366f1",
        fontSize: 13, fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit", transition: "all 0.15s",
        boxShadow: hov ? "0 4px 14px rgba(99,102,241,0.35)" : "none",
      }}
    >
      <Plus size={14} />
      新建任务
    </button>
  );
}

// ---- 空状态 ----
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <DecoLayered innerStyle={{ padding: "80px 24px", textAlign: "center" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: "rgba(99,102,241,0.1)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
      }}>
        <Inbox size={26} color="#6366f1" />
      </div>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#111", margin: "0 0 6px" }}>
        还没有任何任务
      </p>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>
        切到 <strong>AI 对话</strong> 上传课件，或点下方按钮手动添加
      </p>
      <button onClick={onCreate} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "9px 18px", borderRadius: 10, border: "none",
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
        boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
        fontFamily: "inherit",
      }}>
        <Plus size={14} /> 新建任务
      </button>
    </DecoLayered>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "待定";
  const d = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "今天";
  if (diff === 1) return "明天";
  if (diff === -1) return "昨天";
  if (diff > 0 && diff < 7) return `${diff} 天后`;
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}
