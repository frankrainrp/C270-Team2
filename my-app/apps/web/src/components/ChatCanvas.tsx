"use client";

// ============================================================
// components/ChatCanvas.tsx — 漫画式对话主区
//
// 上半：历史区（可上下滚动回看所有 user / assistant / pipeline / confirm 消息）
// 下半：舞台区
//   - 左下：固定大管家 (320px)，pose 切换
//   - 右上：漫画对话气泡（带尾巴指向管家），显示最新 AI 发言（含流式）
//   - 右下：InputPod（嵌入式）
// ============================================================

import React, { useRef, useEffect, useMemo, useState } from "react";
import { FileUp, CalendarPlus, ListChecks, Sparkles, FileText, Image as ImageIcon, File as FileIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, ProcessingPipeline as Pipeline, UploadedFile } from "@/lib/types";
import type { PendingBatch } from "@/lib/pending";
import ProcessingPipeline from "./ProcessingPipeline";
import ButlerCharacter, { type ButlerPose } from "./ButlerCharacter";
import ConfirmCard from "./ConfirmCard";
import InputPod from "./InputPod";

export type Message = ChatMessage;

const QUICK_CARDS = [
  { id: "card-upload",   icon: <FileUp size={18} color="var(--color-primary)" />,      title: "上传课件",  prompt: "我想上传一份课程大纲，自动整理 DDL" },
  { id: "card-calendar", icon: <CalendarPlus size={18} color="var(--color-primary)" />, title: "添加日程",  prompt: "明天下午 3 点和导师开会，讨论论文进度" },
  { id: "card-task",     icon: <ListChecks size={18} color="var(--color-primary)" />,   title: "拆解任务",  prompt: "帮我把「写完毕业论文」拆解成本周可执行的任务" },
];

interface ChatCanvasProps {
  messages: ChatMessage[];
  pipelines: Record<string, Pipeline>;
  pendingBatches: Record<string, PendingBatch>;
  butlerPose: ButlerPose;
  onAcceptBatch: (batchId: string) => void;
  onRejectBatch: (batchId: string) => void;
  onDropChange: (batchId: string, changeId: string) => void;
  onQuickAction: (prompt: string) => void;
  isLoading?: boolean;
  onJumpToTasks: () => void;
  onJumpToCalendar: () => void;
  // InputPod 相关（ChatCanvas 内部 render 它）
  inputValue: string;
  onInputChange: (val: string) => void;
  onSend: () => void;
  attachedFiles: UploadedFile[];
  onAttach: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
}

// ============================================================
// 历史区子组件：紧凑卡片样式（user / assistant / pipeline / confirm）
// ============================================================

function HistoryUserCard({ msg }: { msg: ChatMessage }) {
  const hasFiles = msg.files && msg.files.length > 0;
  return (
    <div style={{
      display: "flex", justifyContent: "flex-end",
      gap: 8,
    }}>
      <div style={{
        maxWidth: "80%",
        background: "var(--color-primary-soft)",
        border: "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)",
        borderRadius: 12,
        padding: "8px 12px",
        userSelect: "text",
        WebkitUserSelect: "text",
      }}>
        {hasFiles && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: msg.content ? 6 : 0 }}>
            {msg.files!.map((f) => <UserFileChip key={f.id} file={f} />)}
          </div>
        )}
        {msg.content && (
          <p style={{ fontSize: 13.5, color: "var(--color-text)", lineHeight: 1.55, margin: 0, whiteSpace: "pre-wrap" }}>
            {msg.content}
          </p>
        )}
      </div>
    </div>
  );
}

function HistoryAssistantCard({ msg }: { msg: ChatMessage }) {
  if (!msg.content) return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div style={{
        maxWidth: "85%",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: "8px 12px",
        userSelect: "text",
        WebkitUserSelect: "text",
        display: "flex", alignItems: "flex-start", gap: 8,
      }}>
        <span style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
          background: "var(--color-primary)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          marginTop: 1,
        }}>
          <Sparkles size={10} color="white" />
        </span>
        <div className="ai-md" style={{ flex: 1, fontSize: 13.5, color: "var(--color-text)", lineHeight: 1.6 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function UserFileChip({ file }: { file: UploadedFile }) {
  const isImage = file.mime.startsWith("image/");
  const isPdf = file.mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const Icon = isImage ? ImageIcon : isPdf ? FileText : FileIcon;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "4px 8px", borderRadius: 6,
      background: "var(--color-bg)",
      border: "1px solid var(--color-border)",
      fontSize: 11, color: "var(--color-text)",
      maxWidth: 220,
    }}>
      <Icon size={12} color="var(--color-primary)" style={{ flexShrink: 0 }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
        {file.name}
      </span>
    </div>
  );
}

// ============================================================
// 漫画对话气泡（带尾巴指向左下角的管家）
// ============================================================
interface BubbleProps {
  content: string;
  isTyping?: boolean;
  empty?: boolean;
}
function SpeechBubble({ content, isTyping, empty }: BubbleProps) {
  return (
    <div
      style={{
        position: "relative",
        background: "var(--color-bg)",
        border: "2px solid var(--color-primary)",
        borderRadius: 18,
        padding: "14px 18px",
        minHeight: 64,
        maxWidth: 560,
        boxShadow: "0 4px 14px rgba(27,61,47,0.10)",
        animation: "bubble-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {empty ? (
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.55 }}>
          有什么我可以帮你的？告诉我你的安排，或拖一份课件给我整理。
        </p>
      ) : (
        <div
          className="ai-md"
          style={{ fontSize: 14, color: "var(--color-text)", lineHeight: 1.65 }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || " "}</ReactMarkdown>
          {isTyping && (
            <span
              style={{
                display: "inline-block",
                width: 6, height: 14,
                background: "var(--color-primary)",
                marginLeft: 2,
                verticalAlign: "middle",
                animation: "cursor-blink 1s steps(2) infinite",
              }}
            />
          )}
        </div>
      )}

      {/* 漫画气泡的尾巴（左侧指向管家） */}
      {/* 外层墨绿描边三角 */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: -16,
          top: 26,
          width: 0,
          height: 0,
          borderTop: "12px solid transparent",
          borderBottom: "12px solid transparent",
          borderRight: "16px solid var(--color-primary)",
        }}
      />
      {/* 内层白底三角（盖在描边内侧形成"指向"形状） */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: -12,
          top: 28,
          width: 0,
          height: 0,
          borderTop: "10px solid transparent",
          borderBottom: "10px solid transparent",
          borderRight: "14px solid var(--color-bg)",
        }}
      />
    </div>
  );
}

// ============================================================
// 主组件
// ============================================================
export default function ChatCanvas(props: ChatCanvasProps) {
  const {
    messages, pipelines, pendingBatches, butlerPose,
    onAcceptBatch, onRejectBatch, onDropChange,
    onQuickAction, isLoading = false,
    onJumpToTasks, onJumpToCalendar,
    inputValue, onInputChange, onSend, attachedFiles, onAttach, onRemoveAttachment,
  } = props;
  const historyRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // 自动滚到底 — 用户向上滚动时禁用
  useEffect(() => {
    if (!autoScroll) return;
    const el = historyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading, pipelines, pendingBatches, autoScroll]);

  // 检测用户是否向上滚动了
  const onScroll = () => {
    const el = historyRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(atBottom);
  };

  // 气泡内容：最新一条 assistant 消息
  const latestAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i];
    }
    return null;
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <main
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        background: "var(--color-bg)",
        position: "relative",
      }}
    >
      {/* ── 左：管家栏（全高，pose 切换） ── */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          position: "relative",
          background:
            "linear-gradient(to bottom, var(--color-bg) 0%, color-mix(in srgb, var(--color-primary-soft) 35%, var(--color-bg)) 100%)",
          borderRight: "1px solid var(--color-border-soft)",
        }}
      >
        <ButlerCharacter pose={butlerPose} fillContainer />
      </div>

      {/* ── 右：内容栏（历史 + 气泡 + 输入） ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
      {/* 历史区 */}
      <div
        ref={historyRef}
        onScroll={onScroll}
        className="message-stream"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px 12px",
          minHeight: 0,
        }}
      >
        {isEmpty ? (
          /* 欢迎首屏：3 张快捷卡片 */
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              你好，Feng。
            </h1>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "-4px 0 12px" }}>
              点一张快捷卡片开始，或直接和 Butler 说话。
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
                maxWidth: 600,
              }}
            >
              {QUICK_CARDS.map((card) => (
                <QuickCard key={card.id} card={card} onClick={() => onQuickAction(card.prompt)} />
              ))}
            </div>
          </div>
        ) : (
          /* 历史消息列表 */
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((msg) => {
              if (msg.role === "user") return <HistoryUserCard key={msg.id} msg={msg} />;
              if (msg.role === "pipeline" && msg.pipelineId) {
                const pipeline = pipelines[msg.pipelineId];
                if (!pipeline) return null;
                return (
                  <ProcessingPipeline
                    key={msg.id}
                    pipeline={pipeline}
                    onJumpToTasks={onJumpToTasks}
                    onJumpToCalendar={onJumpToCalendar}
                  />
                );
              }
              if (msg.role === "confirm" && msg.confirmBatchId) {
                const batch = pendingBatches[msg.confirmBatchId];
                if (!batch) return null;
                return (
                  <ConfirmCard
                    key={msg.id}
                    batch={batch}
                    onAccept={onAcceptBatch}
                    onReject={onRejectBatch}
                    onDropChange={onDropChange}
                  />
                );
              }
              return <HistoryAssistantCard key={msg.id} msg={msg} />;
            })}
          </div>
        )}

      </div>

      {/* 气泡（紧贴底部输入区上方，尾巴指向左侧管家） */}
      <div style={{ padding: "0 24px", marginBottom: 14 }}>
        <SpeechBubble
          content={latestAssistant?.content || ""}
          isTyping={isLoading}
          empty={!latestAssistant}
        />
      </div>

      {/* 输入区 */}
      <div
        style={{
          padding: "0 24px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <InputPod
          value={inputValue}
          onChange={onInputChange}
          onSend={onSend}
          isLoading={isLoading}
          attachedFiles={attachedFiles}
          onAttach={onAttach}
          onRemoveAttachment={onRemoveAttachment}
        />
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--color-text-faint)", margin: 0 }}>
          Butler 可能犯错，重要信息请自行核实。
        </p>
      </div>

      </div>{/* /右内容栏 */}

      <style>{`
        @keyframes bubble-pop {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes cursor-blink {
          to { background: transparent; }
        }
        .ai-md p { margin: 0 0 6px; }
        .ai-md p:last-child { margin-bottom: 0; }
        .ai-md ul, .ai-md ol { margin: 4px 0 6px; padding-left: 20px; }
        .ai-md li { margin: 2px 0; }
        .ai-md code { background: var(--color-primary-soft); padding: 1px 5px; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12.5px; color: var(--color-primary); }
        .ai-md pre { background: #1f2937; color: #f3f4f6; padding: 10px; border-radius: 8px; overflow-x: auto; font-size: 12.5px; line-height: 1.55; margin: 6px 0; }
        .ai-md pre code { background: transparent; color: inherit; padding: 0; }
        .ai-md a { color: var(--color-primary); text-decoration: underline; }
        .ai-md strong { font-weight: 600; }
        .ai-md table { border-collapse: collapse; margin: 6px 0; font-size: 12.5px; }
        .ai-md th, .ai-md td { border: 1px solid var(--color-border); padding: 4px 8px; text-align: left; }
        .ai-md th { background: var(--color-surface); font-weight: 600; }
      `}</style>
    </main>
  );
}

// ============================================================
// 欢迎屏快捷卡片
// ============================================================
function QuickCard({
  card,
  onClick,
}: {
  card: typeof QUICK_CARDS[0];
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      id={card.id}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 180,
        background: "var(--color-bg)",
        border: `1px solid ${hov ? "var(--color-primary)" : "var(--color-border)"}`,
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        boxShadow: hov ? "0 4px 14px rgba(27,61,47,0.08)" : "0 1px 2px rgba(0,0,0,0.03)",
        transition: "all 0.15s",
      }}
    >
      <div style={{ marginBottom: 8 }}>{card.icon}</div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
        {card.title}
      </p>
    </button>
  );
}
