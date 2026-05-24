"use client";

// ============================================================
// components/layout/TopBar.tsx — 56px 全宽顶 Bar
// Logo+字标 / 4 Tab / 搜索 / 通知 / 用户区
// ============================================================

import React, { useState } from "react";
import { Search, Bell, ChevronDown, User as UserIcon, LogOut, CreditCard } from "lucide-react";
import type { NavId } from "@/lib/types";

const TABS: { id: NavId; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "tasks", label: "Tasks" },
  { id: "calendar", label: "Calendar" },
  { id: "notes", label: "Notes" },
];

interface TopBarProps {
  activeNav: NavId;
  onNavChange: (id: NavId) => void;
}

export default function TopBar({ activeNav, onNavChange }: TopBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  return (
    <header
      style={{
        height: 56,
        minHeight: 56,
        flexShrink: 0,
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 28,
        zIndex: 50,
        position: "relative",
      }}
    >
      {/* ── 左：Logo + 字标 ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          aria-label="Butler"
          role="img"
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundImage: "url('/assets/logo.png')",
            backgroundSize: "28px 28px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 1.5,
            color: "var(--color-text)",
          }}
        >
          BUTLER
        </span>
      </div>

      {/* ── 中：Tab Bar ── */}
      <nav style={{ display: "flex", alignItems: "center", gap: 0, height: "100%" }}>
        {TABS.map((tab) => {
          const isActive = activeNav === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavChange(tab.id)}
              style={{
                position: "relative",
                padding: "0 14px",
                height: "100%",
                border: "none",
                background: "transparent",
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
              }}
            >
              {tab.label}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: 14,
                    right: 14,
                    height: 2,
                    background: "var(--color-primary)",
                    borderRadius: 2,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── 右：搜索 / 通知 / 用户 ── */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {/* 搜索框 */}
        <div
          style={{
            width: 240,
            height: 32,
            background: "var(--color-surface)",
            border: `1px solid ${searchFocus ? "var(--color-primary)" : "var(--color-border)"}`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
            gap: 8,
            transition: "border-color 0.15s",
          }}
        >
          <Search size={14} color="var(--color-text-faint)" />
          <input
            placeholder="Search..."
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 13,
              color: "var(--color-text)",
              width: 0,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "var(--color-text-faint)",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              padding: "1px 5px",
              background: "var(--color-bg)",
            }}
          >
            ⌘K
          </span>
        </div>

        {/* 通知 */}
        <button
          aria-label="Notifications"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-muted)",
            position: "relative",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
        >
          <Bell size={16} />
        </button>

        {/* 用户区 */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 6px 4px 4px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <UserIcon size={14} />
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>Feng</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>feng@example.com</div>
            </div>
            <ChevronDown size={14} color="var(--color-text-muted)" />
          </button>

          {showUserMenu && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
                onClick={() => setShowUserMenu(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: 44,
                  right: 0,
                  width: 200,
                  zIndex: 50,
                  borderRadius: 10,
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-soft)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>Feng</p>
                  <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                    feng@example.com
                  </p>
                </div>
                <MenuBtn icon={<CreditCard size={14} />} label="账单管理" />
                <MenuBtn icon={<LogOut size={14} />} label="退出登录" danger />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuBtn({
  icon,
  label,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        color: danger
          ? hov
            ? "#b91c1c"
            : "var(--color-danger)"
          : hov
          ? "var(--color-text)"
          : "var(--color-text-muted)",
        background: hov ? "var(--color-surface)" : "transparent",
        transition: "all 0.15s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
