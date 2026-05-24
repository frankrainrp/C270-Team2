"use client";

// ============================================================
// components/NotesPanel.tsx — 「笔记」面板（Phase 3 占位）
// Stage E：墨绿设计语言重做，保留"Phase 3 解锁"心智
// 真实笔记功能需要 Tauri 桌面壳读写本地 Obsidian Vault
// ============================================================

import React from "react";
import { FileText, FolderOpen, Link2, Sparkles, Monitor, Lock } from "lucide-react";

export default function NotesPanel() {
  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        padding: "28px 32px 40px",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--color-text)",
              margin: 0,
              letterSpacing: "-0.3px",
            }}
          >
            Notes
          </h1>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              margin: "4px 0 0",
            }}
          >
            AI 生成、双向链接、与本地 Obsidian Vault 实时同步
          </p>
        </header>

        {/* 大占位 hero */}
        <div
          style={{
            background: "var(--color-bg)",
            border: "1px dashed var(--color-border)",
            borderRadius: 12,
            padding: "48px 36px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={22} color="white" />
            </div>
            <Link2 size={16} color="var(--color-text-faint)" />
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: "var(--color-primary-soft)",
                border: "1px solid color-mix(in srgb, var(--color-primary) 24%, transparent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderOpen size={22} color="var(--color-primary)" />
            </div>
          </div>

          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--color-text)",
              margin: "0 0 10px",
            }}
          >
            笔记功能即将上线
          </h2>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              margin: "0 auto",
              maxWidth: 520,
            }}
          >
            未来在这里，Butler 会根据你的对话、上传的资料，
            <br />
            自动生成 Obsidian 风格的双向链接笔记，
            <br />
            <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
              直接写入你本地的 Obsidian Vault 文件夹
            </span>
            。
          </p>

          {/* 路线图标签 */}
          <div
            style={{
              marginTop: 22,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 8,
              background: "var(--color-primary-soft)",
              border: "1px solid color-mix(in srgb, var(--color-primary) 24%, transparent)",
              color: "var(--color-primary)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Lock size={13} />
            Phase 3 解锁 · 需要 Tauri 桌面壳
            <Monitor size={13} style={{ marginLeft: 4 }} />
          </div>
        </div>

        {/* 预览能力列表 */}
        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          <FeatureCard
            icon={<FileText size={16} />}
            title="AI 撰写笔记"
            desc="对 Butler 说「整理这门课的核心概念」，生成结构化 .md"
          />
          <FeatureCard
            icon={<Link2 size={16} />}
            title="双向链接"
            desc="自动识别 [[wikilink]] 与 #tag，构建知识图谱"
          />
          <FeatureCard
            icon={<FolderOpen size={16} />}
            title="Vault 实时同步"
            desc="文件写入本地 Vault，Obsidian 立即可见"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon, title, desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 10,
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: "var(--color-primary)" }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>
          {title}
        </span>
      </div>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
        {desc}
      </p>
    </div>
  );
}
