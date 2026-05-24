"use client";

// ============================================================
// components/layout/TasksRail.tsx
// LeftRail @ Tasks Tab — 显示真实任务计数（views 不可点切换，等 C.2 接入）
// ============================================================

import React from "react";
import { Plus, Inbox, Clock, CheckCircle2, ListTodo } from "lucide-react";
import { RailPrimaryBtn, RailGroupTitle, RailItem } from "./LeftRail";

export interface TaskCounts {
  active: number;
  upcoming: number;
  all: number;
  completed: number;
}

interface TasksRailProps {
  onCreateTask: () => void;
  counts: TaskCounts;
}

function CountBadge({ n }: { n: number }) {
  if (n === 0) return null;
  return (
    <span
      style={{
        fontSize: 11,
        color: "var(--color-text-faint)",
        fontWeight: 500,
        minWidth: 18,
        textAlign: "right",
      }}
    >
      {n}
    </span>
  );
}

export default function TasksRail({ onCreateTask, counts }: TasksRailProps) {
  return (
    <>
      <RailPrimaryBtn icon={<Plus size={14} />} label="New Task" onClick={onCreateTask} />

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <RailGroupTitle>Views</RailGroupTitle>
        <RailItem icon={<Inbox size={14} />} label="Active" active badge={<CountBadge n={counts.active} />} />
        <RailItem icon={<Clock size={14} />} label="Upcoming" badge={<CountBadge n={counts.upcoming} />} />
        <RailItem icon={<ListTodo size={14} />} label="All Tasks" badge={<CountBadge n={counts.all} />} />
        <RailItem icon={<CheckCircle2 size={14} />} label="Completed" badge={<CountBadge n={counts.completed} />} />
      </div>
    </>
  );
}
