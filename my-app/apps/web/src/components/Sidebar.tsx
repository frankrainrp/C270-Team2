"use client";

// ============================================================
// components/Sidebar.tsx  — 窄幅垂直图标导航栏
// ============================================================

import React, { useState } from "react";
import {
  MessageSquare, ListTodo, CalendarDays, FileText,
  Settings, Plus, LogOut, CreditCard, User, History,
} from "lucide-react";
import GlassButton from "./ui/GlassButton";

interface NavItem { id: string; icon: React.ReactNode; label: string; }

const NAV_ITEMS: NavItem[] = [
  { id: "chat",     icon: <MessageSquare size={18} />, label: "AI 对话" },
  { id: "tasks",    icon: <ListTodo size={18} />,      label: "每日任务" },
  { id: "calendar", icon: <CalendarDays size={18} />,  label: "日历" },
  { id: "notes",    icon: <FileText size={18} />,      label: "笔记" },
];

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  onNewChat: () => void;
  onToggleSessions: () => void;
  sessionsOpen: boolean;
}

export default function Sidebar({
  activeNav, onNavChange, onNewChat, onToggleSessions, sessionsOpen,
}: SidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <aside style={{
      width: 68,
      minWidth: 68,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 16,
      paddingBottom: 16,
      borderRight: "1px solid rgba(0,0,0,0.07)",
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      flexShrink: 0,
      zIndex: 50,
    }}>
      {/* ── A. 顶部 ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {/* Logo — Butler 先生（viewBox 1536×1024，两侧留白巨大，用 background-size 放大裁切） */}
        <div
          aria-label="Butler Logo"
          role="img"
          style={{
            width: 44, height: 44, borderRadius: 12,
            backgroundImage: "url('/assets/logo.svg')",
            backgroundSize: "101px auto",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* 新对话按钮 */}
        <NewChatBtn onClick={onNewChat} />

        {/* 会话列表按钮 */}
        <div className="nav-icon-btn" style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <GlassButton
            id="nav-sessions"
            aria-label="会话列表"
            onClick={onToggleSessions}
            size={42}
            active={sessionsOpen}
            color={sessionsOpen ? "#4338ca" : "#6b7280"}
          >
            <History size={18} />
          </GlassButton>
          <span className="nav-tooltip">会话列表</span>
        </div>
      </div>

      {/* ── B. 中部 Core ── */}
      <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <div key={item.id} className="nav-icon-btn" style={{ position: "relative", display: "flex", alignItems: "center" }}>
              {/* Active 指示条 */}
              <span style={{
                position: "absolute", left: -6, zIndex: 60,
                width: 4, height: 20, borderRadius: "0 4px 4px 0",
                background: "#6366f1",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "scaleY(1)" : "scaleY(0.4)",
                transition: "opacity 0.25s, transform 0.25s",
              }} />
              <GlassButton
                id={`nav-${item.id}`}
                aria-label={item.label}
                onClick={() => onNavChange(item.id)}
                size={42}
                active={isActive}
                color={isActive ? "#4338ca" : "#6b7280"}
              >
                {item.icon}
              </GlassButton>
              {/* Tooltip */}
              <span className="nav-tooltip">{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* ── C. 底部 ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {/* 设置 */}
        <div className="nav-icon-btn" style={{ position: "relative" }}>
          <GlassButton
            id="nav-settings"
            aria-label="系统设置"
            size={42}
            color="#6b7280"
          >
            <Settings size={18} />
          </GlassButton>
          <span className="nav-tooltip">系统设置</span>
        </div>

        {/* 用户头像 */}
        <div style={{ position: "relative" }}>
          <button id="user-avatar-btn" aria-label="用户菜单"
            onClick={() => setShowUserMenu((v) => !v)}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", cursor: "pointer", color: "white",
              boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
              position: "relative",
            }}>
            <User size={15} />
            <span style={{
              position: "absolute", bottom: 0, right: 0,
              width: 10, height: 10, borderRadius: "50%",
              background: "#22c55e", border: "2px solid white",
            }} />
          </button>

          {/* Popover */}
          {showUserMenu && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowUserMenu(false)} />
              <div style={{
                position: "absolute", bottom: 44, left: "50%", transform: "translateX(-50%)",
                width: 176, zIndex: 50, borderRadius: 12,
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                overflow: "hidden",
              }}>
                <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Feng</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>feng@example.com</p>
                </div>
                <PopoverBtn icon={<CreditCard size={13} />} label="账单管理" />
                <PopoverBtn icon={<LogOut size={13} />} label="退出登录" danger />
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function NewChatBtn({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <GlassButton
        id="new-chat-btn"
        aria-label="新建对话"
        onClick={onClick}
        size={44}
        variant="dashed"
        color={hovered ? "#6366f1" : "#9ca3af"}
      >
        <Plus
          size={18}
          style={{
            transform: hovered ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </GlassButton>
    </span>
  );
}

function PopoverBtn({ icon, label, danger }: { icon: React.ReactNode; label: string; danger?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", border: "none", cursor: "pointer", textAlign: "left",
        fontSize: 13, color: danger ? (hov ? "#dc2626" : "#ef4444") : (hov ? "#111" : "#374151"),
        background: hov ? (danger ? "rgba(254,242,242,0.9)" : "rgba(0,0,0,0.04)") : "transparent",
        transition: "all 0.15s",
      }}>
      {icon}{label}
    </button>
  );
}
