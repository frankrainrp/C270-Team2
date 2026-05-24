"use client";

// ============================================================
// components/NotesPanel.tsx — 「笔记」面板（占位）
// Phase 3 接入：Tauri 桌面壳 + 本地 Obsidian Vault 读写
// ============================================================

import React from "react";
import { FileText, FolderOpen, Link2, Sparkles, Monitor } from "lucide-react";
import DecoLayered from "./ui/DecoLayered";

export default function NotesPanel() {
  return (
    <div style={{ height: "100vh", overflow: "auto", padding: "32px 32px 40px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 700, color: "#111",
            margin: 0, letterSpacing: "-0.5px",
          }}>笔记</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
            AI 生成、双向链接、与本地 Obsidian Vault 实时同步
          </p>
        </header>

        {/* 大占位 hero (DecoLayered) */}
        <DecoLayered innerStyle={{ padding: "48px 36px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            gap: 14, marginBottom: 24,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}>
              <Sparkles size={26} color="white" />
            </div>
            <Link2 size={20} color="#9ca3af" />
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              fontSize: 26, color: "white", fontWeight: 700,
            }}>
              <FolderOpen size={26} color="white" />
            </div>
          </div>

          <h2 style={{
            fontSize: 20, fontWeight: 700, color: "#111",
            margin: "0 0 10px",
          }}>笔记功能即将上线</h2>
          <p style={{
            fontSize: 14, color: "#6b7280", lineHeight: 1.7,
            margin: "0 auto", maxWidth: 520,
          }}>
            未来在这里，AI 会根据你和它的对话、上传的资料，
            <br />
            自动生成 Obsidian 风格的双向链接笔记，
            <br />
            <span style={{ fontWeight: 600, color: "#374151" }}>
              直接写入你本地的 Obsidian Vault 文件夹
            </span>。
          </p>

          {/* 路线图标签 */}
          <div style={{
            marginTop: 28, display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 14px", borderRadius: 10,
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: "#92400e", fontSize: 12, fontWeight: 600,
          }}>
            <Monitor size={14} />
            Phase 3：需要 Tauri 桌面壳支持本地文件系统访问
          </div>
        </DecoLayered>

        {/* 预览能力列表 */}
        <div style={{
          marginTop: 24, display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}>
          <FeatureCard
            icon={<FileText size={16} color="#6366f1" />}
            title="AI 撰写笔记"
            desc="对 AI 说「整理这门课的核心概念」，生成结构化 .md"
          />
          <FeatureCard
            icon={<Link2 size={16} color="#8b5cf6" />}
            title="双向链接"
            desc="自动识别 [[wikilink]] 与 #tag，构建知识图谱"
          />
          <FeatureCard
            icon={<FolderOpen size={16} color="#10b981" />}
            title="Vault 实时同步"
            desc="文件写入本地 Vault，Obsidian 立即可见"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: {
  icon: React.ReactNode; title: string; desc: string;
}) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 12,
      background: "rgba(255,255,255,0.7)",
      border: "1px solid rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{title}</span>
      </div>
      <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}
