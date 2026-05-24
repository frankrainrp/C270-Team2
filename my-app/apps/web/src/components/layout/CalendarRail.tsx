"use client";

// ============================================================
// components/layout/CalendarRail.tsx
// LeftRail @ Calendar Tab — Stage A 基础壳，迷你月历/calendars 在 Stage D 填充
// ============================================================

import React from "react";
import { Plus, CalendarDays, Layers } from "lucide-react";
import { RailPrimaryBtn, RailGroupTitle, RailItem } from "./LeftRail";

interface CalendarRailProps {
  onCreateEvent: () => void;
}

export default function CalendarRail({ onCreateEvent }: CalendarRailProps) {
  return (
    <>
      {/* 迷你月历占位（Stage D 接入） */}
      <div
        style={{
          padding: 8,
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          fontSize: 11,
          color: "var(--color-text-faint)",
          textAlign: "center",
          minHeight: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Mini calendar
        <br />
        (Stage D)
      </div>

      <RailPrimaryBtn icon={<Plus size={14} />} label="New Event" onClick={onCreateEvent} />

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <RailGroupTitle>Calendars</RailGroupTitle>
        <RailItem icon={<CalendarDays size={14} />} label="My Calendar" active />
        <RailItem icon={<Layers size={14} />} label="Study" />
      </div>
    </>
  );
}
