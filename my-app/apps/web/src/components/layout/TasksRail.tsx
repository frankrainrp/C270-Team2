"use client";

// ============================================================
// components/layout/TasksRail.tsx
// LeftRail @ Tasks Tab — Stage A 基础壳，详细 views/tags 在 Stage C 填充
// ============================================================

import React from "react";
import { Plus, Inbox, Clock, CheckCircle2, ListTodo } from "lucide-react";
import { RailPrimaryBtn, RailGroupTitle, RailItem } from "./LeftRail";

interface TasksRailProps {
  onCreateTask: () => void;
  // Stage C 接入：active view / setView / 计数 / tags 等
}

export default function TasksRail({ onCreateTask }: TasksRailProps) {
  return (
    <>
      <RailPrimaryBtn icon={<Plus size={14} />} label="New Task" onClick={onCreateTask} />

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <RailGroupTitle>Views</RailGroupTitle>
        <RailItem icon={<Inbox size={14} />} label="Active" active />
        <RailItem icon={<Clock size={14} />} label="Upcoming" />
        <RailItem icon={<ListTodo size={14} />} label="All Tasks" />
        <RailItem icon={<CheckCircle2 size={14} />} label="Completed" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <RailGroupTitle>Tags</RailGroupTitle>
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-faint)",
            padding: "4px 8px",
          }}
        >
          Stage C 接入
        </p>
      </div>
    </>
  );
}
