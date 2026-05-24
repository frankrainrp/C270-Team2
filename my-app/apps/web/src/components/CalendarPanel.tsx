"use client";

// ============================================================
// components/CalendarPanel.tsx — 「日历」面板（月视图）
// 接收 extractedDdls，按 dueDate 落到当月网格
// Phase 2 接入事件 CRUD + 周视图 / 日视图切换
// ============================================================

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { DdlItem } from "@/lib/types";
import DecoLayered from "./ui/DecoLayered";

interface Props {
  ddls: DdlItem[];
  onRequestCreate: (presetDate?: string) => void;
  onRequestEdit: (ddl: DdlItem) => void;
}

const WEEK_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export default function CalendarPanel({ ddls, onRequestCreate, onRequestEdit }: Props) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  });
  const [hoverDay, setHoverDay] = useState<string | null>(null);

  const { cells, monthLabel } = useMemo(() => buildMonth(cursor), [cursor]);

  const ddlMap = useMemo(() => {
    const m = new Map<string, DdlItem[]>();
    for (const d of ddls) {
      if (!d.dueDate) continue; // 跳过"待定"事件，月历无处可落
      const arr = m.get(d.dueDate) ?? [];
      arr.push(d);
      m.set(d.dueDate, arr);
    }
    return m;
  }, [ddls]);

  const goPrev = () => setCursor((c) => {
    const n = new Date(c); n.setMonth(n.getMonth() - 1); return n;
  });
  const goNext = () => setCursor((c) => {
    const n = new Date(c); n.setMonth(n.getMonth() + 1); return n;
  });
  const goToday = () => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
    setCursor(d);
  };

  const todayIso = isoDate(new Date());

  return (
    <div style={{ height: "100vh", overflow: "auto", padding: "32px 32px 40px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24,
        }}>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 700, color: "#111",
              margin: 0, letterSpacing: "-0.5px",
            }}>{monthLabel}</h1>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
              本月共 {countMonthEvents(ddls, cursor)} 件待办事项
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <NavBtn onClick={goPrev} aria="上一月"><ChevronLeft size={16} /></NavBtn>
            <button onClick={goToday} style={{
              padding: "7px 14px", border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(255,255,255,0.7)", borderRadius: 10,
              fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer",
              fontFamily: "inherit",
            }}>今天</button>
            <NavBtn onClick={goNext} aria="下一月"><ChevronRight size={16} /></NavBtn>
          </div>
        </header>

        {/* 空状态 */}
        {ddls.length === 0 ? (
          <EmptyState onCreate={() => onRequestCreate()} />
        ) : (
          <DecoLayered innerStyle={{ overflow: "hidden" }}>
            {/* 周标题行 */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              background: "rgba(0,0,0,0.02)",
            }}>
              {WEEK_LABELS.map((w) => (
                <div key={w} style={{
                  padding: "10px 12px", fontSize: 11, fontWeight: 600,
                  color: "#6b7280", textAlign: "center",
                }}>
                  星期{w}
                </div>
              ))}
            </div>
            {/* 网格 */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              gridAutoRows: "minmax(108px, auto)",
            }}>
              {cells.map((cell) => {
                const events = ddlMap.get(cell.iso) ?? [];
                const isToday = cell.iso === todayIso;
                const isHovered = hoverDay === cell.iso;
                return (
                  <div
                    key={cell.iso}
                    onMouseEnter={() => setHoverDay(cell.iso)}
                    onMouseLeave={() => setHoverDay(null)}
                    onClick={() => { if (cell.inMonth) onRequestCreate(cell.iso); }}
                    title={cell.inMonth ? "点击在此日期新建任务" : ""}
                    style={{
                      borderRight: "1px solid rgba(0,0,0,0.05)",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                      padding: "8px",
                      background: !cell.inMonth ? "rgba(0,0,0,0.015)"
                        : isHovered ? "rgba(99,102,241,0.06)" : "transparent",
                      transition: "background 0.15s",
                      minHeight: 108,
                      display: "flex", flexDirection: "column",
                      gap: 4,
                      cursor: cell.inMonth ? "pointer" : "default",
                      position: "relative",
                    }}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span style={{
                        fontSize: 12, fontWeight: isToday ? 700 : 500,
                        color: !cell.inMonth ? "#cbd5e1"
                          : isToday ? "white" : "#374151",
                        background: isToday ? "#6366f1" : "transparent",
                        width: isToday ? 22 : "auto", height: isToday ? 22 : "auto",
                        borderRadius: isToday ? "50%" : 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: isToday ? "0 2px 6px rgba(99,102,241,0.45)" : "none",
                      }}>
                        {cell.day}
                      </span>
                      {events.length > 0 && (
                        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>
                          {events.length}
                        </span>
                      )}
                    </div>
                    {/* 事件 pills（最多 3 个） */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, overflow: "hidden" }}>
                      {events.slice(0, 3).map((ev) => (
                        <EventPill key={ev.id} event={ev} onClick={(e) => { e.stopPropagation(); onRequestEdit(ev); }} />
                      ))}
                      {events.length > 3 && (
                        <span style={{
                          fontSize: 10, color: "#6366f1", fontWeight: 600,
                          padding: "1px 4px",
                        }}>
                          +{events.length - 3} 更多
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </DecoLayered>
        )}
      </div>
    </div>
  );
}

// ---- 事件 pill ----
function EventPill({ event, onClick }: { event: DdlItem; onClick: (e: React.MouseEvent) => void }) {
  const [hov, setHov] = useState(false);
  const color = event.isGroupWork ? "#8b5cf6" : event.weight && event.weight >= 20 ? "#ef4444" : "#6366f1";
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`${event.taskName} · ${event.dueTime}${event.weight ? ` · ${event.weight}%` : ""}`}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "2px 6px", borderRadius: 4,
        background: hov ? `${color}26` : `${color}1a`,
        cursor: "pointer", overflow: "hidden",
        transition: "background 0.15s",
      }}
    >
      <span style={{
        width: 4, height: 4, borderRadius: "50%", background: color, flexShrink: 0,
      }} />
      <span style={{
        fontSize: 11, color: "#374151", fontWeight: 500,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {event.taskName}
      </span>
    </div>
  );
}

// ---- 导航按钮 ----
function NavBtn({ children, onClick, aria }: {
  children: React.ReactNode; onClick: () => void; aria: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)",
        background: hov ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.7)",
        cursor: "pointer", color: "#374151",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ---- 空状态 ----
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <DecoLayered innerStyle={{ padding: "80px 24px", textAlign: "center" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: "rgba(139,92,246,0.1)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
      }}>
        <CalendarDays size={26} color="#8b5cf6" />
      </div>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#111", margin: "0 0 6px" }}>
        日历空空如也
      </p>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>
        告诉 AI 安排、上传课件，或点下方按钮手动创建
      </p>
      <button onClick={onCreate} style={{
        padding: "9px 18px", borderRadius: 10, border: "none",
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
        boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
        fontFamily: "inherit",
      }}>
        + 新建事件
      </button>
    </DecoLayered>
  );
}

// ---- 工具函数 ----
interface Cell { iso: string; day: number; inMonth: boolean; }

function buildMonth(cursor: Date): { cells: Cell[]; monthLabel: string } {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // 周一为首列 (1..7 → idx 0..6)
  const firstWeekday = (first.getDay() + 6) % 7;
  const totalDays = last.getDate();

  const cells: Cell[] = [];
  // 上月填充
  if (firstWeekday > 0) {
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevLast - i);
      cells.push({ iso: isoDate(d), day: d.getDate(), inMonth: false });
    }
  }
  // 本月
  for (let d = 1; d <= totalDays; d++) {
    const dt = new Date(year, month, d);
    cells.push({ iso: isoDate(dt), day: d, inMonth: true });
  }
  // 下月填充至 6 行 (42)
  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    if (!last) break;
    const dt = new Date(last.iso);
    dt.setDate(dt.getDate() + 1);
    cells.push({ iso: isoDate(dt), day: dt.getDate(), inMonth: false });
  }

  const monthLabel = `${year} 年 ${month + 1} 月`;
  return { cells, monthLabel };
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function countMonthEvents(ddls: DdlItem[], cursor: Date): number {
  const y = cursor.getFullYear(); const m = cursor.getMonth();
  return ddls.filter((d) => {
    const dt = new Date(d.dueDate);
    return dt.getFullYear() === y && dt.getMonth() === m;
  }).length;
}
