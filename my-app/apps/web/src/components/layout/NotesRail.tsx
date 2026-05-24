"use client";

// ============================================================
// components/layout/NotesRail.tsx
// LeftRail @ Notes Tab — Phase 3 才解锁，本期占位
// ============================================================

import React from "react";
import { Plus, FileText, Folder } from "lucide-react";
import { RailPrimaryBtn, RailGroupTitle, RailItem } from "./LeftRail";

export default function NotesRail() {
  return (
    <>
      <RailPrimaryBtn icon={<Plus size={14} />} label="New Note" disabled />

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <RailGroupTitle>Library</RailGroupTitle>
        <div style={{ opacity: 0.45, pointerEvents: "none" }}>
          <RailItem icon={<FileText size={14} />} label="All Notes" />
          <RailItem icon={<Folder size={14} />} label="Starred" />
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          padding: 10,
          background: "var(--color-primary-soft)",
          border: "1px dashed var(--color-primary)",
          borderRadius: 8,
          fontSize: 11,
          color: "var(--color-primary)",
          lineHeight: 1.4,
        }}
      >
        🔒 Phase 3 解锁
        <br />
        <span style={{ color: "var(--color-text-muted)" }}>
          需要 Tauri 桌面壳读写本地 Vault
        </span>
      </div>
    </>
  );
}
