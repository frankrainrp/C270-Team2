"use client";

// ============================================================
// components/AttachmentPreview.tsx — 附件预览 modal
//
// URL：直接新窗口打开（不进 modal）
// filepath：显示路径 + 复制按钮（Tauri 后续接"打开所在地"）
// blob：PDF iframe / 图片 img / 其他下载
// ============================================================

import React, { useEffect, useState } from "react";
import { X, ExternalLink, Copy, Download, FolderOpen } from "lucide-react";
import type { DdlAttachment } from "@/lib/types";

interface Props {
  attachment: DdlAttachment;
  onClose: () => void;
}

export default function AttachmentPreview({ attachment, onClose }: Props) {
  const [blobInfo, setBlobInfo] = useState<{ url: string; mime: string; name: string } | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    let url: string | null = null;
    if (attachment.kind === "blob") {
      (async () => {
        try {
          const { getBlobUrl } = await import("@/lib/blobs");
          const info = await getBlobUrl(attachment.ref);
          if (!active) return;
          if (info) { url = info.url; setBlobInfo(info); }
          else setLoadErr("附件文件已丢失（IndexedDB 中找不到）");
        } catch (e) {
          if (active) setLoadErr((e as Error).message);
        }
      })();
    }
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [attachment]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 250,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 880, maxHeight: "90vh",
        background: "rgba(255,255,255,0.97)",
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)",
          flexShrink: 0,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {attachment.label}
            </h2>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {attachment.ref}
            </p>
          </div>
          <button onClick={onClose} aria-label="关闭" style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "transparent", cursor: "pointer", color: "#6b7280",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {attachment.kind === "url" && <UrlView ref_={attachment.ref} />}
          {attachment.kind === "filepath" && <FilepathView path={attachment.ref} />}
          {attachment.kind === "blob" && (
            loadErr ? <ErrorView msg={loadErr} /> :
            blobInfo ? <BlobView info={blobInfo} /> :
            <LoadingView />
          )}
        </div>
      </div>
    </div>
  );
}

// ---- 子视图 ----

function UrlView({ ref_ }: { ref_: string }) {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <ExternalLink size={36} color="#6366f1" />
      <p style={{ fontSize: 14, color: "#374151", margin: "16px 0 6px" }}>外部链接附件</p>
      <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px", wordBreak: "break-all" }}>{ref_}</p>
      <a href={ref_} target="_blank" rel="noopener noreferrer" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "9px 18px", borderRadius: 10, border: "none",
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none",
        boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
      }}>
        <ExternalLink size={14} /> 在新窗口打开
      </a>
    </div>
  );
}

function FilepathView({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <FolderOpen size={36} color="#10b981" />
      <p style={{ fontSize: 14, color: "#374151", margin: "16px 0 6px" }}>本地文件路径</p>
      <p style={{
        fontSize: 12, color: "#374151", margin: "0 0 8px",
        wordBreak: "break-all", fontFamily: "ui-monospace, monospace",
        background: "rgba(0,0,0,0.04)", padding: "8px 12px", borderRadius: 8,
        display: "inline-block", maxWidth: "90%",
      }}>{path}</p>
      <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 20px" }}>
        浏览器无法直接打开本地路径；Phase 3 桌面壳上线后可一键"在文件管理器中显示"
      </p>
      <button onClick={copy} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)",
        background: copied ? "#dcfce7" : "white",
        color: copied ? "#065f46" : "#374151", fontSize: 13, fontWeight: 500,
        cursor: "pointer", fontFamily: "inherit",
      }}>
        <Copy size={14} /> {copied ? "已复制" : "复制路径"}
      </button>
    </div>
  );
}

function BlobView({ info }: { info: { url: string; mime: string; name: string } }) {
  const isImg = info.mime.startsWith("image/");
  const isPdf = info.mime === "application/pdf" || info.name.toLowerCase().endsWith(".pdf");

  if (isImg) {
    return (
      <div style={{ padding: 16, display: "flex", justifyContent: "center", background: "rgba(0,0,0,0.02)" }}>
        <img src={info.url} alt={info.name} style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8 }} />
      </div>
    );
  }
  if (isPdf) {
    return (
      <iframe
        src={info.url}
        title={info.name}
        style={{ width: "100%", height: "70vh", border: "none" }}
      />
    );
  }
  // 其他类型 → 下载
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <Download size={36} color="#6366f1" />
      <p style={{ fontSize: 14, color: "#374151", margin: "16px 0 6px" }}>{info.name}</p>
      <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 20px" }}>{info.mime}</p>
      <a href={info.url} download={info.name} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "9px 18px", borderRadius: 10,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none",
        boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
      }}>
        <Download size={14} /> 下载
      </a>
    </div>
  );
}

function LoadingView() {
  return <div style={{ padding: 60, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>加载中…</div>;
}

function ErrorView({ msg }: { msg: string }) {
  return <div style={{ padding: 60, textAlign: "center", color: "#dc2626", fontSize: 13 }}>❌ {msg}</div>;
}
