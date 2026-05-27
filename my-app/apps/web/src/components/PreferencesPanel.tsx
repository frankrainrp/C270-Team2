"use client";

// ============================================================
// components/PreferencesPanel.tsx — 用户偏好设置 modal
//
// Epic 3 个性化:
//   - 亮/暗主题切换 (data-theme on <html>)
//   - 字体大小档位 (--font-base 变量)
//   - localStorage 持久化
// ============================================================

import React, { useEffect, useState } from "react";
import { X, Sun, Moon, Type, Heart, MessageSquare, Flame, Palette, RotateCcw } from "lucide-react";
import {
  ACCENT_PRESETS,
  DEFAULT_ACCENT,
  applyStoredAccent,
  getStoredAccent,
  normalizeHex,
  setStoredAccent,
} from "@/lib/theme";

type Theme = "light" | "dark";
type FontSize = "sm" | "md" | "lg";
export type Personality = "gentle" | "standard" | "sassy";

const THEME_KEY = "butler.theme";
const FONT_KEY = "butler.fontSize";
const PERSONALITY_KEY = "butler.personality";

export function applyStoredPreferences() {
  if (typeof document === "undefined") return;
  try {
    const theme = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light";
    document.documentElement.dataset.theme = theme;
    const font = (localStorage.getItem(FONT_KEY) as FontSize | null) ?? "md";
    document.documentElement.dataset.fontSize = font;
  } catch { /* silent */ }
  // Phase B: 应用用户自定义 primary 色（无则跳过，保留 globals.css 默认墨绿）
  applyStoredAccent();
}

export function getStoredPersonality(): Personality {
  if (typeof window === "undefined") return "standard";
  try {
    const p = localStorage.getItem(PERSONALITY_KEY) as Personality | null;
    return p ?? "standard";
  } catch { return "standard"; }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PreferencesPanel({ open, onClose }: Props) {
  const [theme, setTheme] = useState<Theme>("light");
  const [font, setFont] = useState<FontSize>("md");
  const [personality, setPersonality] = useState<Personality>("standard");
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT);

  // 进 panel 时读 localStorage
  useEffect(() => {
    if (!open) return;
    try {
      const t = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light";
      const f = (localStorage.getItem(FONT_KEY) as FontSize | null) ?? "md";
      const p = (localStorage.getItem(PERSONALITY_KEY) as Personality | null) ?? "standard";
      setTheme(t);
      setFont(f);
      setPersonality(p);
      setAccent(getStoredAccent());
    } catch { /* silent */ }
  }, [open]);

  const applyTheme = (t: Theme) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch { /* silent */ }
  };
  const applyFont = (f: FontSize) => {
    setFont(f);
    document.documentElement.dataset.fontSize = f;
    try { localStorage.setItem(FONT_KEY, f); } catch { /* silent */ }
  };
  const applyPersonality = (p: Personality) => {
    setPersonality(p);
    try { localStorage.setItem(PERSONALITY_KEY, p); } catch { /* silent */ }
  };
  const applyAccent = (hex: string | null) => {
    const target = hex ?? DEFAULT_ACCENT;
    const norm = normalizeHex(target) ?? DEFAULT_ACCENT;
    setAccent(norm);
    setStoredAccent(hex); // null → 移除存储恢复默认
  };

  // Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.30)",
          zIndex: 80,
          animation: "fade-in 0.18s ease-out",
        }}
      />
      <div
        role="dialog"
        aria-label="偏好设置"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          maxWidth: "92vw",
          background: "var(--color-bg)",
          borderRadius: 14,
          border: "1px solid var(--color-border)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          zIndex: 81,
          animation: "modal-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          color: "var(--color-text)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h2 style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
            偏好设置
          </h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            style={{
              width: 28, height: 28, borderRadius: 6, border: "none",
              background: "transparent", cursor: "pointer",
              color: "var(--color-text-muted)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            <X size={14} />
          </button>
        </header>

        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* 主题 */}
          <Section title="主题">
            <SegRow>
              <SegBtn active={theme === "light"} onClick={() => applyTheme("light")} icon={<Sun size={14} />} label="亮色" />
              <SegBtn active={theme === "dark"} onClick={() => applyTheme("dark")} icon={<Moon size={14} />} label="暗色" />
            </SegRow>
          </Section>

          {/* Phase B 主题色 */}
          <Section title="主题色">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              {ACCENT_PRESETS.map((p) => (
                <SwatchBtn
                  key={p.value}
                  active={accent.toUpperCase() === p.value.toUpperCase()}
                  color={p.value}
                  label={p.label}
                  onClick={() => applyAccent(p.value)}
                />
              ))}
              {/* 自定义 color picker：HTML5 input type=color */}
              <label
                title="自定义颜色"
                style={{
                  position: "relative",
                  width: 30, height: 30, borderRadius: 8,
                  border: "1px dashed var(--color-border)",
                  background: "var(--color-bg)",
                  cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-text-muted)",
                  overflow: "hidden",
                }}
              >
                <Palette size={14} />
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => applyAccent(e.target.value)}
                  style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    opacity: 0, cursor: "pointer", border: "none", padding: 0,
                  }}
                />
              </label>
              {accent.toUpperCase() !== DEFAULT_ACCENT.toUpperCase() && (
                <button
                  onClick={() => applyAccent(null)}
                  title="重置为默认墨绿"
                  aria-label="重置主题色"
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg)",
                    cursor: "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    color: "var(--color-text-muted)",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-bg)")}
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-faint)", marginTop: 8, lineHeight: 1.5 }}>
              hover / soft 自动派生；暗色模式会自动提亮以保持对比度
            </p>
          </Section>

          {/* 字体大小 */}
          <Section title="字体大小">
            <SegRow>
              <SegBtn active={font === "sm"} onClick={() => applyFont("sm")} icon={<Type size={12} />} label="小" />
              <SegBtn active={font === "md"} onClick={() => applyFont("md")} icon={<Type size={14} />} label="标准" />
              <SegBtn active={font === "lg"} onClick={() => applyFont("lg")} icon={<Type size={16} />} label="大" />
            </SegRow>
          </Section>

          {/* G5.1 管家性格 */}
          <Section title="管家性格">
            <SegRow>
              <SegBtn active={personality === "gentle"}   onClick={() => applyPersonality("gentle")}   icon={<Heart size={12} />} label="温柔" />
              <SegBtn active={personality === "standard"} onClick={() => applyPersonality("standard")} icon={<MessageSquare size={12} />} label="标准" />
              <SegBtn active={personality === "sassy"}    onClick={() => applyPersonality("sassy")}    icon={<Flame size={12} />} label="损友" />
            </SegRow>
            <p style={{ fontSize: 11, color: "var(--color-text-faint)", marginTop: 6, lineHeight: 1.5 }}>
              影响 AI 对话语气;切换后立刻生效(下一条消息开始)
            </p>
          </Section>
        </div>

        <footer
          style={{
            padding: "10px 18px",
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            fontSize: 11,
            color: "var(--color-text-faint)",
            textAlign: "center",
          }}
        >
          所有设置仅保存在你的浏览器
        </footer>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-pop {
          from { transform: translate(-50%, -50%) scale(0.96); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--color-text-muted)",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          margin: "0 0 8px",
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function SegRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--color-bg)",
      }}
    >
      {children}
    </div>
  );
}

function SwatchBtn({
  active, color, label, onClick,
}: { active: boolean; color: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={`${label} ${color}`}
      aria-label={label}
      style={{
        width: 30, height: 30, borderRadius: 8,
        border: active ? "2px solid var(--color-text)" : "1px solid var(--color-border)",
        background: color,
        cursor: "pointer",
        padding: 0,
        boxShadow: active ? "0 0 0 2px var(--color-bg) inset" : "none",
        transition: "transform 0.12s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)")}
    />
  );
}

function SegBtn({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 10px",
        border: "none",
        background: active ? "var(--color-primary-soft)" : "transparent",
        color: active ? "var(--color-primary)" : "var(--color-text-muted)",
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        fontFamily: "inherit",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {icon} {label}
    </button>
  );
}
