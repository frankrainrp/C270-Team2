"use client";

// ============================================================
// components/ui/DecoLayered.tsx — 三层装饰板（来自 chat_UI.txt .deco-layered）
// 外层 rgba(24,24,24,0.2) → 中层 rgba(255,255,255,0.18) → 内层白
// 顶左各露出 6px 形成「卡片堆叠」错位感
// ============================================================

import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  innerStyle?: React.CSSProperties; // 给最内层加 padding/min-height 等
  hoverable?: boolean;              // hover 时上浮 + 阴影加强
}

export default function DecoLayered({
  children, className = "", style, innerStyle, hoverable = false,
}: Props) {
  return (
    <div
      className={`deco-layered ${hoverable ? "deco-layered-btn" : ""} ${className}`}
      style={style}
    >
      <div className="deco-layered-inner-1">
        <div className="deco-layered-inner-2" style={innerStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}
