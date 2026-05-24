"use client";

// ============================================================
// components/ui/GlassButton.tsx — 玻璃态按钮（来自 chat_UI.txt .box）
// 必须放在 .fx-layer 容器内才能呈现 contrast 强化的玻璃边缘
// ============================================================

import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;                // 直径 (px)，默认 44
  variant?: "default" | "primary" | "dashed";
  active?: boolean;
  color?: string;               // 图标颜色
  withFxWrapper?: boolean;      // 是否自带 fx-layer 包裹（默认 true）
}

const GlassButton = React.forwardRef<HTMLButtonElement, Props>(function GlassButton(
  { size = 44, variant = "default", active = false, color, withFxWrapper = true, children, className = "", style, ...rest },
  ref,
) {
  const btn = (
    <button
      ref={ref}
      className={`glass-btn ${active ? "is-active" : ""} ${variant === "primary" ? "is-primary" : ""} ${variant === "dashed" ? "is-dashed" : ""} ${className}`}
      style={{
        // CSS 变量驱动尺寸
        // @ts-expect-error custom CSS vars
        "--w": `${size}px`,
        "--h": `${size}px`,
        color: color ?? (variant === "primary" ? "#fff" : "#374151"),
        border: "none",
        outline: "none",
        fontFamily: "inherit",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
  return withFxWrapper ? <span className="fx-layer">{btn}</span> : btn;
});

export default GlassButton;
