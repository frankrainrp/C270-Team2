"use client";

// ============================================================
// components/MiniAppsDrawer.tsx — 右侧"小程序仓库"滑入抽屉
//
// 装一系列学习辅助小工具（Focus Timer / 后续: 番茄记录 / 单词卡 / 计算器...）
// 入口：TopBar 右上的 LayoutGrid 按钮
//
// 设计：
//   - 用户用 App 时 drawer 长开，主区不被遮罩（pointer-events 透）
//   - drawer 内顶部是 App 列表（图标网格），点击切换当前显示的 App
//   - 主区域随选中 App 渲染对应组件
// ============================================================

import React, { useState } from "react";
import { X, Target, Sparkles } from "lucide-react";
import FocusTimer from "./mini-apps/FocusTimer";

interface MiniApp {
  id: string;
  name: string;
  icon: React.ReactNode;
  Component: React.ComponentType;
  disabled?: boolean;
}

const APPS: MiniApp[] = [
  { id: "focus", name: "专注计时", icon: <Target size={16} />, Component: FocusTimer },
  // 占位：后续添加
  // { id: "flashcard", name: "单词卡", icon: <BookOpen size={16} />, Component: ComingSoon, disabled: true },
];

interface MiniAppsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MiniAppsDrawer({ open, onClose }: MiniAppsDrawerProps) {
  const [activeId, setActiveId] = useState<string>("focus");
  const active = APPS.find((a) => a.id === activeId) ?? APPS[0];
  const ActiveComponent = active.Component;

  return (
    <>
      {/* 抽屉本体 */}
      <aside
        aria-label="Mini Apps Drawer"
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 56,            // TopBar 高度
          right: 0,
          bottom: 0,
          width: 320,
          background: "var(--color-bg)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: open ? "-8px 0 24px rgba(0,0,0,0.06)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 标题栏 */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 14px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <Sparkles size={14} color="var(--color-primary)" />
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
              margin: 0,
              letterSpacing: 0.3,
              flex: 1,
            }}
          >
            学习工具
          </h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            <X size={16} />
          </button>
        </header>

        {/* App 切换器（图标 + 名称 横向条，>= 2 个 App 时显示） */}
        {APPS.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: "8px 12px",
              borderBottom: "1px solid var(--color-border-soft)",
              overflowX: "auto",
            }}
          >
            {APPS.map((app) => {
              const isActive = app.id === activeId;
              return (
                <button
                  key={app.id}
                  onClick={() => !app.disabled && setActiveId(app.id)}
                  disabled={app.disabled}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid " + (isActive ? "var(--color-primary)" : "var(--color-border)"),
                    background: isActive ? "var(--color-primary-soft)" : "var(--color-bg)",
                    color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                    cursor: app.disabled ? "not-allowed" : "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    opacity: app.disabled ? 0.5 : 1,
                  }}
                >
                  {app.icon}
                  {app.name}
                </button>
              );
            })}
          </div>
        )}

        {/* App 主区 */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 16px",
          }}
        >
          <ActiveComponent />
        </div>
      </aside>
    </>
  );
}
