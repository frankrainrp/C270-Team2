"use client";

// ============================================================
// components/layout/TopBar.tsx — 56px 全宽顶 Bar
// Logo+字标 / 4 Tab / 搜索 / 通知 / 用户区
// ============================================================

import React, { useState } from "react";
import { Bell, ChevronDown, User as UserIcon, LogOut, CreditCard, LayoutGrid, Settings } from "lucide-react";
import type { NavId, DdlItem, Note, ChatMessage } from "@/lib/types";
import GlobalSearch from "./GlobalSearch";

const TAB_LABELS: Record<NavId, string> = {
  chat: "Chat",
  tasks: "Tasks",
  calendar: "Calendar",
  notes: "Notes",
};
const DEFAULT_TAB_ORDER: NavId[] = ["chat", "tasks", "calendar", "notes"];

interface TopBarProps {
  activeNav: NavId;
  onNavChange: (id: NavId) => void;
  miniAppsOpen?: boolean;
  onToggleMiniApps?: () => void;
  // 全局搜索数据源
  ddls?: DdlItem[];
  notes?: Note[];
  messages?: ChatMessage[];
  /** B3: 搜索结果点击后透传给 page.tsx,用于跳转 + 高亮目标 */
  onSearchJump?: (target: NavId, refId?: string) => void;
  /** Epic 3 偏好设置入口 */
  onOpenPreferences?: () => void;
  /** Phase D 用户自定义 Tab 顺序，未传则用默认 */
  tabsOrder?: NavId[];
  /** Phase D 隐藏的 Tab 集合 */
  hiddenTabs?: Set<NavId>;
  /** Phase D 拖拽重排后回调 */
  onTabsReorder?: (newOrder: NavId[]) => void;
}

export default function TopBar({
  activeNav, onNavChange, miniAppsOpen, onToggleMiniApps,
  ddls = [], notes = [], messages = [], onSearchJump, onOpenPreferences,
  tabsOrder, hiddenTabs, onTabsReorder,
}: TopBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Phase D Tab 拖拽：dragOverId 指示拖到哪个 tab 上（视觉反馈）
  const [dragOverId, setDragOverId] = useState<NavId | null>(null);

  const order = tabsOrder ?? DEFAULT_TAB_ORDER;
  const hidden = hiddenTabs ?? new Set<NavId>();
  const visibleTabs = order.filter((id) => !hidden.has(id));

  // 处理 drop：把 src 插入到 target 之前
  const handleDropTab = (sourceId: NavId, targetId: NavId) => {
    if (sourceId === targetId) return;
    const newOrder = order.filter((id) => id !== sourceId);
    const targetIdx = newOrder.indexOf(targetId);
    if (targetIdx < 0) return;
    newOrder.splice(targetIdx, 0, sourceId);
    onTabsReorder?.(newOrder);
  };

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

      {/* ── 中：Tab Bar （Phase D 可拖拽重排 + 可隐藏） ── */}
      <nav style={{ display: "flex", alignItems: "center", gap: 0, height: "100%" }}>
        {visibleTabs.map((id) => {
          const isActive = activeNav === id;
          const isDragOver = dragOverId === id;
          return (
            <button
              key={id}
              onClick={() => onNavChange(id)}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData("text/butler-tab", id); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes("text/butler-tab")) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverId !== id) setDragOverId(id);
                }
              }}
              onDragLeave={() => { if (dragOverId === id) setDragOverId(null); }}
              onDrop={(e) => {
                e.preventDefault();
                const sourceId = e.dataTransfer.getData("text/butler-tab") as NavId;
                setDragOverId(null);
                if (sourceId && sourceId !== id) handleDropTab(sourceId, id);
              }}
              title="点击切换，拖拽重排"
              style={{
                position: "relative",
                padding: "0 14px",
                height: "100%",
                border: "none",
                background: isDragOver ? "var(--color-primary-soft)" : "transparent",
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
                cursor: "pointer",
                transition: "color 0.15s, background 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
              }}
            >
              {TAB_LABELS[id]}
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
        {/* 全局搜索（接 ddls/notes/messages） */}
        <GlobalSearch
          ddls={ddls}
          notes={notes}
          messages={messages}
          onJump={(target, refId) => {
            if (onSearchJump) onSearchJump(target, refId);
            else onNavChange(target);
          }}
        />

        {/* 学习工具抽屉切换 */}
        <button
          aria-label="学习工具"
          title="学习工具（专注计时等）"
          onClick={onToggleMiniApps}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: miniAppsOpen ? "1px solid var(--color-primary)" : "none",
            background: miniAppsOpen ? "var(--color-primary-soft)" : "transparent",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: miniAppsOpen ? "var(--color-primary)" : "var(--color-text-muted)",
            position: "relative",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!miniAppsOpen) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)";
          }}
          onMouseLeave={(e) => {
            if (!miniAppsOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <LayoutGrid size={16} />
        </button>

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
                <MenuBtn
                  icon={<Settings size={14} />}
                  label="偏好设置"
                  onClick={() => { setShowUserMenu(false); onOpenPreferences?.(); }}
                />
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
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
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
