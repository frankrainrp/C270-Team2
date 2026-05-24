"use client";

// ============================================================
// components/TasksPanel.tsx — 「每日任务」面板
// Stage C.1：视觉重做（墨绿设计语言，去玻璃 / 去 DecoLayered）
// ============================================================

import React, { useMemo, useState } from "react";
import {
  Check, FileText, Users, Inbox, Plus, Pencil, Trash2,
  CalendarPlus, Download, Upload, Link2, FolderOpen,
  Image as ImageIcon, File as FileIcon, Paperclip,
} from "lucide-react";
import type { DdlItem, DdlAttachment } from "@/lib/types";

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
  tbd:      { label: "待定",   color: "var(--color-warning)" },
  today:    { label: "今天",   color: "var(--color-danger)" },
  thisWeek: { label: "本周",   color: "var(--color-warning)" },
  later:    { label: "之后",   color: "var(--color-primary)" },
  done:     { label: "已完成", color: "var(--color-success)" },
};

function classifyGroup(ddl: DdlItem): GroupKey {
  if (ddl.completed) return "done";
  if (!ddl.dueDate) return "tbd";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(ddl.dueDate);
  const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return "today";
  if (diff <= 7) return "thisWeek";
  return "later";
}

export default function TasksPanel({
  ddls, onToggleComplete, onRequestCreate, onRequestEdit, onRequestDelete,
  onRequestPreview, onExportIcs, onExportJson, onImportJson,
}: Props) {
  const grouped = useMemo(() => {
    const g: Record<GroupKey, DdlItem[]> = { tbd: [], today: [], thisWeek: [], later: [], done: [] };
    for (const ddl of ddls) g[classifyGroup(ddl)].push(ddl);
    for (const k of Object.keys(g) as GroupKey[]) {
      g[k].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    return g;
  }, [ddls]);

  const totalActive = ddls.filter((d) => !d.completed).length;
  const totalDone = ddls.filter((d) => d.completed).length;

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        padding: "28px 32px 40px",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--color-text)",
                margin: 0,
                letterSpacing: "-0.3px",
              }}
            >
              Tasks
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                margin: "4px 0 0",
              }}
            >
              {totalActive > 0
                ? `${totalActive} 项待办${totalDone > 0 ? `· ${totalDone} 已完成` : ""}`
                : "暂无任务 — 上传课件或对 Butler 说「明天要开会」即可创建"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ToolbarBtn onClick={onExportIcs} icon={<CalendarPlus size={13} />} label="订阅日历" tooltip="下载 .ics → 导入手机/电脑系统日历自动提醒" />
            <ToolbarBtn onClick={onExportJson} icon={<Download size={13} />} label="导出" tooltip="导出全部任务为 JSON 文件备份" />
            <ToolbarBtn onClick={onImportJson} icon={<Upload size={13} />} label="导入" tooltip="从 JSON 文件合并任务（按 ID 去重）" />
            <PrimaryBtn onClick={onRequestCreate} icon={<Plus size={14} />} label="New Task" />
          </div>
        </header>

        {ddls.length === 0 ? (
          <EmptyState onCreate={onRequestCreate} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {(["tbd", "today", "thisWeek", "later", "done"] as GroupKey[]).map((key) => {
              const items = grouped[key];
              if (items.length === 0) return null;
              return (
                <TaskGroup
                  key={key}
                  groupKey={key}
                  items={items}
                  onToggle={onToggleComplete}
                  onEdit={onRequestEdit}
                  onDelete={onRequestDelete}
                  onPreview={onRequestPreview}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 分组
// ============================================================
function TaskGroup({
  groupKey, items, onToggle, onEdit, onDelete, onPreview,
}: {
  groupKey: GroupKey;
  items: DdlItem[];
  onToggle: (id: string) => void;
  onEdit: (ddl: DdlItem) => void;
  onDelete: (id: string) => void;
  onPreview: (att: DdlAttachment) => void;
}) {
  const meta = GROUP_META[groupKey];
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: meta.color,
          }}
        />
        <h2
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--color-text-muted)",
            margin: 0,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {meta.label}
        </h2>
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-faint)",
            fontWeight: 500,
          }}
        >
          {items.length}
        </span>
      </div>
      <div
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {items.map((item, idx) => (
          <TaskRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onPreview={onPreview}
            isLast={idx === items.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================
// 单条任务
// ============================================================
function TaskRow({
  item, onToggle, onEdit, onDelete, onPreview, isLast,
}: {
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
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid var(--color-border-soft)",
        background: hov ? "var(--color-surface)" : "transparent",
        transition: "background 0.12s",
      }}
    >
      <Checkbox checked={item.completed} onClick={() => onToggle(item.id)} />

      <div
        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        onClick={() => onEdit(item)}
        title="点击编辑"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: item.completed ? "var(--color-text-faint)" : "var(--color-text)",
              textDecoration: item.completed ? "line-through" : "none",
            }}
          >
            {item.taskName}
          </span>
          {item.isGroupWork && (
            <span title="小组作业" style={{ display: "inline-flex", color: "var(--color-info)" }}>
              <Users size={12} />
            </span>
          )}
          {item.weight !== null && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--color-primary)",
                background: "var(--color-primary-soft)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              {item.weight}%
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            {displayDate} · {item.dueTime}
          </span>
          {item.description && (
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-faint)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.description}
            </span>
          )}
        </div>
        {(item.attachments?.length || item.notes) && (
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {item.notes && (
              <span
                title={item.notes}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "color-mix(in srgb, var(--color-warning) 12%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-warning) 24%, transparent)",
                  fontSize: 10,
                  color: "var(--color-warning)",
                  fontWeight: 500,
                }}
              >
                备注
              </span>
            )}
            {item.attachments?.map((att) => (
              <AttachmentChip
                key={att.id}
                att={att}
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(att);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 2,
          opacity: hov ? 1 : 0,
          transition: "opacity 0.15s",
          pointerEvents: hov ? "auto" : "none",
        }}
      >
        <RowIconBtn label="编辑" onClick={() => onEdit(item)}>
          <Pencil size={12} />
        </RowIconBtn>
        <RowIconBtn
          label="删除"
          danger
          onClick={() => {
            if (confirm(`删除「${item.taskName}」？`)) onDelete(item.id);
          }}
        >
          <Trash2 size={12} />
        </RowIconBtn>
      </div>

      <span
        title={`来源：${item.source}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          color: "var(--color-text-faint)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-soft)",
          padding: "3px 8px",
          borderRadius: 4,
          maxWidth: 140,
          flexShrink: 0,
        }}
      >
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
  const Icon = att.kind === "url" ? Link2
    : att.kind === "filepath" ? FolderOpen
    : (att.mime?.startsWith("image/") ? ImageIcon
      : (att.mime?.includes("pdf") || att.label.toLowerCase().endsWith(".pdf")) ? FileText
      : FileIcon);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={att.ref}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 7px",
        borderRadius: 4,
        background: h ? "var(--color-primary-soft)" : "var(--color-surface)",
        border: "1px solid var(--color-border)",
        fontSize: 10,
        color: "var(--color-text)",
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        maxWidth: 160,
        overflow: "hidden",
      }}
    >
      <Paperclip size={9} color="var(--color-primary)" style={{ flexShrink: 0 }} />
      <Icon size={10} color="var(--color-primary)" style={{ flexShrink: 0 }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {att.label}
      </span>
    </button>
  );
}

function RowIconBtn({
  children, onClick, label, danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        border: "none",
        background: h
          ? (danger ? "color-mix(in srgb, var(--color-danger) 12%, transparent)" : "var(--color-primary-soft)")
          : "transparent",
        color: h
          ? (danger ? "var(--color-danger)" : "var(--color-primary)")
          : "var(--color-text-faint)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ============================================================
// 复选框
// ============================================================
function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={checked ? "标记未完成" : "标记完成"}
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        border: `1.5px solid ${checked ? "var(--color-success)" : "var(--color-border)"}`,
        background: checked ? "var(--color-success)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "all 0.15s",
      }}
    >
      {checked && <Check size={11} color="white" strokeWidth={3} />}
    </button>
  );
}

// ============================================================
// 工具栏按钮
// ============================================================
function ToolbarBtn({
  icon, label, tooltip, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  onClick: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={tooltip}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "7px 10px",
        borderRadius: 8,
        border: "1px solid var(--color-border)",
        background: h ? "var(--color-primary-soft)" : "var(--color-bg)",
        color: h ? "var(--color-primary)" : "var(--color-text-muted)",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// 主操作按钮（墨绿实色）
function PrimaryBtn({
  icon, label, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 8,
        border: "none",
        background: h ? "var(--color-primary-hover)" : "var(--color-primary)",
        color: "white",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background 0.15s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ============================================================
// 空状态
// ============================================================
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      style={{
        background: "var(--color-bg)",
        border: "1px dashed var(--color-border)",
        borderRadius: 12,
        padding: "64px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "var(--color-primary-soft)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <Inbox size={22} color="var(--color-primary)" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", margin: "0 0 6px" }}>
        还没有任何任务
      </p>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 16px" }}>
        切到 <strong style={{ color: "var(--color-text)" }}>Chat</strong> 上传课件，或点下方按钮手动添加
      </p>
      <PrimaryBtn onClick={onCreate} icon={<Plus size={14} />} label="New Task" />
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "待定";
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "今天";
  if (diff === 1) return "明天";
  if (diff === -1) return "昨天";
  if (diff > 0 && diff < 7) return `${diff} 天后`;
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}
