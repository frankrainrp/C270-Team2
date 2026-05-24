"use client";

// ============================================================
// components/ProcessingPipeline.tsx — 4 步处理流水线可视化
// 在 ChatCanvas 消息流里作为特殊 message 渲染
// ============================================================

import React from "react";
import {
  Loader2, Check, X as XIcon, FileText, Sparkles,
  ScanText, Brain, CalendarPlus, Database, ChevronRight,
} from "lucide-react";
import type { ProcessingPipeline as Pipeline, PipelineStep } from "@/lib/types";
import { getStepDetail } from "@/lib/mock-pipeline";
import DecoLayered from "./ui/DecoLayered";

const STEP_ICONS: Record<PipelineStep["id"], React.ReactNode> = {
  ocr:      <ScanText size={14} />,
  extract:  <Brain size={14} />,
  calendar: <CalendarPlus size={14} />,
  persist:  <Database size={14} />,
};

interface Props {
  pipeline: Pipeline;
  onJumpToTasks?: () => void;
  onJumpToCalendar?: () => void;
}

export default function ProcessingPipeline({ pipeline, onJumpToTasks, onJumpToCalendar }: Props) {
  const { file, steps, status, extractedCount } = pipeline;
  const isComplete = status === "completed";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      {/* AI 头像 */}
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(99,102,241,0.35)", marginTop: 2,
      }}>
        <Sparkles size={14} color="white" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 标题行 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <FileText size={14} color="#6366f1" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
            正在解析 <span style={{ color: "#6366f1" }}>{file.name}</span>
          </span>
          {isComplete && extractedCount !== undefined && (
            <span style={{
              fontSize: 11, color: "#10b981", fontWeight: 600,
              background: "rgba(16,185,129,0.1)",
              padding: "2px 8px", borderRadius: 10,
            }}>
              提取到 {extractedCount} 条 DDL
            </span>
          )}
        </div>

        {/* Pipeline 卡片（DecoLayered 三层板） */}
        <DecoLayered innerStyle={{ padding: "14px 16px" }}>
          {steps.map((step, idx) => (
            <StepRow key={step.id} step={step} isLast={idx === steps.length - 1} />
          ))}

          {/* 完成态：跳转操作 */}
          {isComplete && (
            <div style={{
              marginTop: 14, paddingTop: 12,
              borderTop: "1px dashed rgba(0,0,0,0.08)",
              display: "flex", gap: 8, flexWrap: "wrap",
            }}>
              {onJumpToTasks && (
                <JumpBtn label="查看任务面板" onClick={onJumpToTasks} />
              )}
              {onJumpToCalendar && (
                <JumpBtn label="查看日历" onClick={onJumpToCalendar} />
              )}
            </div>
          )}
        </DecoLayered>
      </div>
    </div>
  );
}

// ---- 单步行 ----
function StepRow({ step, isLast }: { step: PipelineStep; isLast: boolean }) {
  const detail = getStepDetail(step.id);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, position: "relative" }}>
      {/* 左侧图标 + 连接线 */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        flexShrink: 0, paddingTop: 2,
      }}>
        <StepIcon step={step} />
        {!isLast && (
          <div style={{
            width: 1, flex: 1, minHeight: 18,
            background: step.status === "success"
              ? "rgba(16,185,129,0.4)"
              : "rgba(0,0,0,0.08)",
            marginTop: 4,
            transition: "background 0.3s",
          }} />
        )}
      </div>

      {/* 右侧文本 */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 13,
            fontWeight: step.status === "running" ? 600 : 500,
            color: step.status === "pending" ? "#9ca3af" :
                   step.status === "failed" ? "#ef4444" : "#111",
            transition: "color 0.2s",
          }}>
            {step.label}
          </span>
          {step.status === "running" && (
            <span style={{
              fontSize: 10, color: "#6366f1", fontWeight: 600,
              animation: "pipeline-pulse 1.4s ease-in-out infinite",
            }}>
              进行中
            </span>
          )}
        </div>
        <p style={{
          fontSize: 11, color: "#9ca3af", margin: "2px 0 0",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
        }}>
          {step.detail || detail}
        </p>
      </div>

      <style>{`
        @keyframes pipeline-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ---- 步骤图标（含状态） ----
function StepIcon({ step }: { step: PipelineStep }) {
  const size = 24;
  if (step.status === "pending") {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.08)",
        color: "#9ca3af",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {STEP_ICONS[step.id]}
      </div>
    );
  }
  if (step.status === "running") {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(99,102,241,0.12)",
        border: "1px solid rgba(99,102,241,0.45)",
        color: "#6366f1",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "step-spin 1s linear infinite",
      }}>
        <Loader2 size={14} />
        <style>{`@keyframes step-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
      </div>
    );
  }
  if (step.status === "success") {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 6px rgba(16,185,129,0.35)",
      }}>
        <Check size={14} strokeWidth={3} />
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <XIcon size={14} strokeWidth={3} />
    </div>
  );
}

function JumpBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "6px 12px", borderRadius: 8,
        border: "1px solid rgba(99,102,241,0.3)",
        background: hov ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.06)",
        color: "#6366f1", fontSize: 12, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.15s",
      }}
    >
      {label}
      <ChevronRight size={12} />
    </button>
  );
}
