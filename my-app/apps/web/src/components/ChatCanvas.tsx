"use client";

// ============================================================
// components/ChatCanvas.tsx — 漫画式对话主区（融入式）
//
// 设计：管家不再有独立栏，绝对定位浮在主区左下；
//      AI 消息全部用漫画对话框（无头像，墨绿描边白底，尾巴指向左下管家）；
//      用户消息保持简单墨绿淡底气泡；
//      历史区 + 输入区都左 padding 让出管家空间。
// ============================================================

import React, { useRef, useEffect, useMemo, useState } from "react";
import { FileUp, CalendarPlus, ListChecks, FileText, Image as ImageIcon, File as FileIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, ProcessingPipeline as Pipeline, UploadedFile } from "@/lib/types";
import type { PendingBatch } from "@/lib/pending";
import type { AiModelId } from "@/lib/ai-models";
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

// 管家占用的主区左侧宽度，所有右侧内容（历史 / 输入）都要左 padding 让出空间
const BUTLER_GUTTER = 260;

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
  inputValue: string;
  onInputChange: (val: string) => void;
  onSend: () => void;
  attachedFiles: UploadedFile[];
  onAttach: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  selectedModel?: AiModelId;
  onSelectModel?: (id: AiModelId) => void;
}

// ============================================================
// 用户消息：简单墨绿淡底气泡（右对齐）
// ============================================================
function UserBubble({ msg }: { msg: ChatMessage }) {
  const hasFiles = msg.files && msg.files.length > 0;
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          maxWidth: "80%",
          background: "var(--color-primary-soft)",
          border: "1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
          borderRadius: 14,
          padding: "10px 14px",
          userSelect: "text",
          WebkitUserSelect: "text",
        }}
      >
        {hasFiles && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: msg.content ? 6 : 0,
            }}
          >
            {msg.files!.map((f) => (
              <UserFileChip key={f.id} file={f} />
            ))}
          </div>
        )}
        {msg.content && (
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text)",
              lineHeight: 1.55,
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {msg.content}
          </p>
        )}
      </div>
    </div>
  );
}

function UserFileChip({ file }: { file: UploadedFile }) {
  const isImage = file.mime.startsWith("image/");
  const isPdf = file.mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const Icon = isImage ? ImageIcon : isPdf ? FileText : FileIcon;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 6,
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        fontSize: 11,
        color: "var(--color-text)",
        maxWidth: 220,
      }}
    >
      <Icon size={12} color="var(--color-primary)" style={{ flexShrink: 0 }} />
      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontWeight: 500,
        }}
      >
        {file.name}
      </span>
    </div>
  );
}

// ============================================================
// 管家漫画对话框（无头像，墨绿粗边白底，尾巴指向左下管家）
// ============================================================
function ButlerBubble({ content, isTyping }: { content: string; isTyping?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div
        style={{
          position: "relative",
          maxWidth: "90%",
          background: "var(--color-bg)",
          border: "2px solid var(--color-primary)",
          borderRadius: 18,
          padding: "12px 16px",
          boxShadow: "0 2px 10px rgba(27,61,47,0.08)",
          animation: "bubble-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          userSelect: "text",
          WebkitUserSelect: "text",
        }}
      >
        <div
          className="ai-md"
          style={{ fontSize: 14, color: "var(--color-text)", lineHeight: 1.65 }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || " "}</ReactMarkdown>
          {isTyping && (
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 14,
                background: "var(--color-primary)",
                marginLeft: 2,
                verticalAlign: "middle",
                animation: "cursor-blink 1s steps(2) infinite",
              }}
            />
          )}
        </div>

      </div>
    </div>
  );
}

// ============================================================
// 主组件
// ============================================================
export default function ChatCanvas(props: ChatCanvasProps) {
  const {
    messages,
    pipelines,
    pendingBatches,
    butlerPose,
    onAcceptBatch,
    onRejectBatch,
    onDropChange,
    onQuickAction,
    isLoading = false,
    onJumpToTasks,
    onJumpToCalendar,
    inputValue,
    onInputChange,
    onSend,
    attachedFiles,
    onAttach,
    onRemoveAttachment,
    selectedModel,
    onSelectModel,
  } = props;
  const historyRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // 自动滚到底 — 用户向上滚后禁用
  useEffect(() => {
    if (!autoScroll) return;
    const el = historyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading, pipelines, pendingBatches, autoScroll]);

  const onScroll = () => {
    const el = historyRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(atBottom);
  };

  // 最新一条 assistant id（用于在最新气泡末尾显示 typing cursor）
  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].id;
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
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--color-bg)",
        position: "relative",
      }}
    >
      {/* 浮动管家 — 绝对定位贴主区左下角，占满高度，pointer-events 穿透 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: BUTLER_GUTTER,
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <ButlerCharacter pose={butlerPose} fillContainer />
      </div>

      {/* 历史区 */}
      <div
        ref={historyRef}
        onScroll={onScroll}
        className="message-stream"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `24px 32px 14px ${BUTLER_GUTTER + 12}px`,
          minHeight: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        {isEmpty ? (
          /* 欢迎屏：管家直接"说话" + 3 张快捷卡片 */
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 18,
            }}
          >
            <ButlerBubble content={"你好，Feng。\n\n告诉我你的安排，或者拖一份课件给我整理。"} />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {QUICK_CARDS.map((card) => (
                <QuickCard key={card.id} card={card} onClick={() => onQuickAction(card.prompt)} />
              ))}
            </div>
          </div>
        ) : (
          /* 历史消息流 */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg) => {
              if (msg.role === "user") return <UserBubble key={msg.id} msg={msg} />;
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
              // assistant
              const isTyping = isLoading && msg.id === lastAssistantId;
              return <ButlerBubble key={msg.id} content={msg.content} isTyping={isTyping} />;
            })}
            {/* 流式中：assistant 消息尚未建出（首个 delta 之前）→ 占位 typing 气泡 */}
            {isLoading && lastAssistantId === null && (
              <ButlerBubble content="" isTyping />
            )}
          </div>
        )}
      </div>

      {/* 输入区 — 透明背景 + 无边框，让管家完整露出 */}
      <div
        style={{
          padding: `12px 32px 14px ${BUTLER_GUTTER + 12}px`,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          position: "relative",
          zIndex: 2,
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
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--color-text-faint)",
            margin: 0,
          }}
        >
          Butler 可能犯错，重要信息请自行核实。
        </p>
      </div>

      <style>{`
        @keyframes bubble-pop {
          from { transform: scale(0.95); opacity: 0; }
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
