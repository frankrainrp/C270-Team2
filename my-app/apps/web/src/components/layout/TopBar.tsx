"use client";

// ============================================================
// components/layout/TopBar.tsx — 56px 全宽顶 Bar
// Logo+字标 / 4 Tab / 搜索 / 通知 / 用户区
// ============================================================

import React, { useState, useEffect } from "react";
import { Bell, ChevronDown, User as UserIcon, LogOut, CreditCard, LayoutGrid, Settings, Plus, Sun, Moon, Feather, Trophy } from "lucide-react";
import type { NavId, DdlItem, Note, ChatMessage, CustomPanel } from "@/lib/types";
import GlobalSearch from "./GlobalSearch";
import { GlassButton } from "@/components/ui/Glass";
import { getStoredTheme, setStoredTheme, type Theme } from "@/components/PreferencesPanel";

const TAB_LABELS: Record<NavId, string> = {
  chat: "Chat",
  tasks: "Tasks",
  calendar: "Calendar",
  notes: "Notes",
};
const DEFAULT_TAB_ORDER: NavId[] = ["chat", "tasks", "calendar", "notes"];

// 主题循环：亮 → 暗 → 复古
const THEME_CYCLE: Theme[] = ["light", "dark", "retro"];
const THEME_META: Record<Theme, { icon: React.ReactNode; label: string }> = {
  light: { icon: <Sun size={16} />, label: "亮色" },
  dark: { icon: <Moon size={16} />, label: "暗色" },
  retro: { icon: <Feather size={16} />, label: "复古" },
};

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
  /** #3 成就收藏室入口 */
  onOpenAchievements?: () => void;
  /** Phase D 用户自定义 Tab 顺序，未传则用默认 */
  tabsOrder?: NavId[];
  /** Phase D 隐藏的 Tab 集合 */
  hiddenTabs?: Set<NavId>;
  /** Phase D 拖拽重排后回调 */
  onTabsReorder?: (newOrder: NavId[]) => void;
  /** Phase E 自定义面板列表（按 createdAt 升序）*/
  customPanels?: Pick<CustomPanel, "id" | "label" | "emoji">[];
  /** Phase E 当前激活的自定义面板 id（非 null 时盖过 activeNav）*/
  activeCustomPanelId?: string | null;
  /** Phase E 点击自定义面板 Tab */
  onSelectCustomPanel?: (id: string) => void;
  /** Phase E 「+」按钮：创建新自定义面板 */
  onCreateCustomPanel?: () => void;
  /** 手机响应式：隐藏 pill-nav（底部 tab 代替）*/
  isMobile?: boolean;
}

export default function TopBar({
  activeNav, onNavChange, miniAppsOpen, onToggleMiniApps,
  ddls = [], notes = [], messages = [], onSearchJump, onOpenPreferences, onOpenAchievements,
  tabsOrder, hiddenTabs, onTabsReorder,
  customPanels = [], activeCustomPanelId, onSelectCustomPanel, onCreateCustomPanel,
  isMobile = false,
}: TopBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Phase D Tab 拖拽：dragOverId 指示拖到哪个 tab 上（视觉反馈）
  const [dragOverId, setDragOverId] = useState<NavId | null>(null);
  // 主题开关（与偏好设置共用 butler.theme 持久化）：循环 亮→暗→复古
  const [themeMode, setThemeMode] = useState<Theme>("light");
  useEffect(() => { setThemeMode(getStoredTheme()); }, []);
  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(themeMode);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    setStoredTheme(next);
    setThemeMode(next);
  };

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
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        background: "var(--glass-bg-strong)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        boxShadow: "var(--shadow-card-hover)",
        display: "flex",
        alignItems: "center",
        padding: isMobile ? "0 10px" : "0 16px",
        gap: isMobile ? 8 : 28,
        zIndex: 50,
        position: "relative",
      }}
    >
      {/* ── 左：Logo + 字标 ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          aria-label="Butler"
          role="img"
          className="app-logo"
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
          className="font-display"
          style={{
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: 2,
            color: "var(--color-text)",
          }}
        >
          Butler
        </span>
        {/* 管家领结徽标（燕尾服元素点缀，管家金）*/}
        <svg width="20" height="13" viewBox="0 0 24 16" aria-hidden="true" style={{ marginLeft: 1, color: "var(--butler-gold)", flexShrink: 0 }}>
          <path d="M11 8 L2.5 3.2 a1 1 0 0 0-1.5 0.9 V11.9 a1 1 0 0 0 1.5 0.9 L11 8 z" fill="currentColor" />
          <path d="M13 8 L21.5 3.2 a1 1 0 0 1 1.5 0.9 V11.9 a1 1 0 0 1-1.5 0.9 L13 8 z" fill="currentColor" />
          <circle cx="12" cy="8" r="2.2" fill="currentColor" />
        </svg>
      </div>

      {/* ── 中：拟物胶囊导航条（样例 #B）；手机隐藏，底部 MobileTabBar 代替 ── */}
      {!isMobile && (
      <nav className="pill-nav">
        {visibleTabs.map((id) => {
          // Phase E：有 activeCustomPanelId 时所有内置 Tab 都不 active
          const isActive = !activeCustomPanelId && activeNav === id;
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
              className={isActive ? "pill-nav-item active" : "pill-nav-item"}
              style={isDragOver ? { boxShadow: "inset 0 0 0 2px var(--color-primary)" } : undefined}
            >
              {TAB_LABELS[id]}
            </button>
          );
        })}

        {/* Phase E 自定义面板 Tab（按 createdAt 顺序） */}
        {customPanels.map((p) => {
          const isActive = activeCustomPanelId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectCustomPanel?.(p.id)}
              title={p.label}
              className={isActive ? "pill-nav-item active" : "pill-nav-item"}
              style={{ paddingLeft: 12, paddingRight: 12 }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>{p.emoji}</span>
              <span style={{
                maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{p.label}</span>
            </button>
          );
        })}

        {/* Phase E 「+」新建按钮 */}
        {onCreateCustomPanel && (
          <button
            onClick={onCreateCustomPanel}
            title="新建自定义面板"
            aria-label="新建自定义面板"
            className="pill-nav-item"
            style={{ padding: 0, width: 30, justifyContent: "center" }}
          >
            <Plus size={15} />
          </button>
        )}
      </nav>
      )}

      {/* ── 右：搜索 / 通知 / 用户 ── */}
      <div style={{ ...(isMobile ? { flex: 1, marginLeft: 10 } : { marginLeft: "auto" }), display: "flex", alignItems: "center", gap: isMobile ? 8 : 10 }}>
        {/* 全局搜索（接 ddls/notes/messages） */}
        <GlobalSearch
          isMobile={isMobile}
          ddls={ddls}
          notes={notes}
          messages={messages}
          onJump={(target, refId) => {
            if (onSearchJump) onSearchJump(target, refId);
            else onNavChange(target);
          }}
        />

        {/* 主题/工具/通知：手机隐藏（收进偏好设置 + 用户菜单，避免顶栏溢出）*/}
        {!isMobile && (
          <>
            <GlassButton
              aria-label={`切换主题（当前：${THEME_META[themeMode].label}）`}
              title={`主题：${THEME_META[themeMode].label}（点击切换）`}
              onClick={cycleTheme}
              circle
              style={{ width: 36, height: 36, color: "var(--color-text-muted)" }}
            >
              {THEME_META[themeMode].icon}
            </GlassButton>
            <GlassButton
              aria-label="学习工具"
              title="学习工具（专注计时等）"
              onClick={onToggleMiniApps}
              circle
              variant={miniAppsOpen ? "primary" : "default"}
              style={{ width: 36, height: 36 }}
            >
              <LayoutGrid size={16} />
            </GlassButton>
            <GlassButton
              aria-label="Notifications"
              circle
              style={{ width: 36, height: 36, color: "var(--color-text-muted)" }}
            >
              <Bell size={16} />
            </GlassButton>
          </>
        )}

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
            {!isMobile && (
              <>
                <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>Feng</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>feng@example.com</div>
                </div>
                <ChevronDown size={14} color="var(--color-text-muted)" />
              </>
            )}
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
                <MenuBtn
                  icon={<Trophy size={14} />}
                  label="成就收藏室"
                  onClick={() => { setShowUserMenu(false); onOpenAchievements?.(); }}
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
