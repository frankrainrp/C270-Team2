"use client";

// ============================================================
// components/ChatCanvas.tsx — 漫画式对话主区（居中管家版）
//
// 设计：管家绝对定位贴主区底部水平居中，处于输入框后层（z-index < 输入区）；
//      历史区 / 输入区对称居中（max-width 800），不再左偏；
//      AI 消息墨绿描边白底气泡，用户消息墨绿淡底气泡；
//      InputPod 自带白底自然遮挡管家下半身，营造"踩在输入框后"的层次。
// ============================================================

import React, { useRef, useEffect, useMemo, useState } from "react";
import { FileUp, CalendarPlus, ListChecks, FileText, Image as ImageIcon, File as FileIcon, Brain, ChevronDown, Copy, RefreshCw, Check as CheckIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, ProcessingPipeline as Pipeline, UploadedFile, DdlItem } from "@/lib/types";
import type { PendingBatch } from "@/lib/pending";
import { getModelMeta, type AiModelId } from "@/lib/ai-models";
import ProcessingPipeline from "./ProcessingPipeline";
import ButlerCharacter, { type ButlerPose } from "./ButlerCharacter";
import ConfirmCard from "./ConfirmCard";
import InputPod from "./InputPod";
import TodayHero from "./TodayHero";
import DailyBrief from "./DailyBrief";

export type Message = ChatMessage;

const QUICK_CARDS = [
  { id: "card-upload",   icon: <FileUp size={18} color="var(--color-primary)" />,      title: "上传课件",  prompt: "我想上传一份课程大纲，自动整理 DDL" },
  { id: "card-calendar", icon: <CalendarPlus size={18} color="var(--color-primary)" />, title: "添加日程",  prompt: "明天下午 3 点和导师开会，讨论论文进度" },
  { id: "card-task",     icon: <ListChecks size={18} color="var(--color-primary)" />,   title: "拆解任务",  prompt: "帮我把「写完毕业论文」拆解成本周可执行的任务" },
];

// 对话栏 / 历史流的最大宽度（居中布局）
const CONTENT_MAX = 800;

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
  onStop?: () => void;
  /** 重新生成：抹掉该 assistant 消息及之后所有消息，重发上一条 user */
  onRegenerate?: (assistantMessageId: string) => void;
  attachedFiles: UploadedFile[];
  onAttach: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  selectedModel?: AiModelId;
  onSelectModel?: (id: AiModelId) => void;
  // Epic 4.1 今日 Hero 卡(欢迎屏显示)
  ddls?: DdlItem[];
  onJumpToTask?: (taskId: string) => void;
  // G1.1 Demo 数据按钮(仅在 ddls/notes 都为空时显示)
  onLoadDemo?: () => void;
  hasAnyData?: boolean;
  // G2.1 / G5.2 透传给 TodayHero
  streakDays?: number;
  bestHourLabel?: string | null;
  // Phase D 管家位置（"left" | "center" | "right" | "hidden"）
  butlerPosition?: "left" | "center" | "right" | "hidden";
  // [065] 每日仪式 · 今日简报（每天首次打开顶部出现一次）
  showDailyBrief?: boolean;
  onStartFocus?: () => void;
  onDismissBrief?: () => void;
}

// ============================================================
// 用户消息：简单墨绿淡底气泡（右对齐）
// ============================================================
function UserBubble({ msg }: { msg: ChatMessage }) {
  const hasFiles = msg.files && msg.files.length > 0;
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        className="comic-bubble"
        style={{
          position: "relative",
          maxWidth: "80%",
          background: "var(--color-primary-soft)",
          border: "1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
          borderRadius: "var(--radius-card)",
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
// 思考折叠面板（V4 思考模式 reasoning_content）
//   - 思考中（还没出正文）：默认展开
//   - 思考结束（content 已开始）：默认折叠成"已思考"
//   - 用户手动 toggle 后以用户偏好为准
// ============================================================
function ReasoningPanel({
  reasoning, thinkingActive,
}: { reasoning: string; thinkingActive: boolean }) {
  const [forced, setForced] = useState<boolean | null>(null);
  const open = forced ?? thinkingActive;
  return (
    <div
      style={{
        marginBottom: 10,
        borderRadius: 10,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-soft)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setForced(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: "6px 10px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 12,
          color: "var(--color-text-muted)",
          textAlign: "left",
        }}
      >
        <Brain size={13} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 600 }}>
          {thinkingActive ? "思考中…" : "已思考"}
        </span>
        {thinkingActive && (
          <span
            style={{
              display: "inline-block",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--color-primary)",
              animation: "cursor-blink 0.8s steps(2) infinite",
            }}
          />
        )}
        <span style={{ flex: 1 }} />
        <ChevronDown
          size={13}
          color="var(--color-text-faint)"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.15s",
          }}
        />
      </button>
      {open && (
        <div
          style={{
            padding: "0 10px 10px",
            fontSize: 12,
            lineHeight: 1.55,
            color: "var(--color-text-muted)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            borderTop: "1px solid var(--color-border-soft)",
            paddingTop: 8,
            maxHeight: 280,
            overflowY: "auto",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            userSelect: "text",
            WebkitUserSelect: "text",
          }}
        >
          {reasoning}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 管家漫画对话框（无头像，墨绿粗边白底，尾巴指向左下管家）
// ============================================================
function MessageToolbar({
  content, isError, onRegenerate, alwaysVisible,
}: {
  content: string;
  isError?: boolean;
  onRegenerate?: () => void;
  /** error 消息常显工具栏；普通消息仅 hover 显示 */
  alwaysVisible?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 老浏览器降级（少见）
      console.warn("[copy] clipboard API unavailable");
    }
  };
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        marginTop: 8,
        opacity: alwaysVisible ? 1 : 0,
        transition: "opacity 0.15s",
      }}
      className={alwaysVisible ? "" : "msg-toolbar"}
    >
      <button
        onClick={handleCopy}
        aria-label={copied ? "已复制" : "复制"}
        title={copied ? "已复制" : "复制"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 8px",
          fontSize: 11,
          fontFamily: "inherit",
          color: copied ? "var(--color-success)" : "var(--color-text-muted)",
          background: "transparent",
          border: "1px solid var(--color-border-soft)",
          borderRadius: 6,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        {copied ? <CheckIcon size={11} /> : <Copy size={11} />}
        {copied ? "已复制" : "复制"}
      </button>
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          aria-label={isError ? "重试" : "重新生成"}
          title={isError ? "重试" : "重新生成"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            fontSize: 11,
            fontFamily: "inherit",
            color: isError ? "var(--color-danger, #dc2626)" : "var(--color-text-muted)",
            background: "transparent",
            border: `1px solid ${isError ? "var(--color-danger, #dc2626)" : "var(--color-border-soft)"}`,
            borderRadius: 6,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isError ? "var(--color-danger-soft)" : "var(--color-surface)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <RefreshCw size={11} />
          {isError ? "重试" : "重新生成"}
        </button>
      )}
    </div>
  );
}

/** 思考点：AI 首字未到时的「管家斟酌中」指示（3 点错相跳动）*/
function TypingDots() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 18, padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--color-primary)",
            animation: "dot-bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </span>
  );
}

function ButlerBubble({
  content, reasoning, isTyping, showReasoning = true, isError, onRegenerate,
}: {
  content: string;
  reasoning?: string;
  isTyping?: boolean;
  /** 是否渲染思考折叠面板（Flash 模式默认 false,reasoning 仍持久化但不展示） */
  showReasoning?: boolean;
  /** error 消息：红色边框 + 永显 retry */
  isError?: boolean;
  /** 重新生成 / 重试 callback；缺省则不显示该按钮 */
  onRegenerate?: () => void;
}) {
  const hasReasoning = showReasoning && !!(reasoning && reasoning.trim());
  // 思考过程已结束的判断：reasoning 存在但正文已经开始（content 非空）
  const thinkingActive = hasReasoning && !content;
  const borderColor = isError ? "var(--color-danger)" : "var(--color-primary)";
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }} className="bubble-wrap">
      <div
        className="comic-bubble"
        style={{
          position: "relative",
          maxWidth: "90%",
          background: "var(--color-surface)",
          border: isError ? `1.5px solid ${borderColor}` : "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          padding: "12px 16px",
          boxShadow: "var(--shadow-bubble)",
          userSelect: "text",
          WebkitUserSelect: "text",
        }}
      >
        {hasReasoning && (
          <ReasoningPanel reasoning={reasoning!} thinkingActive={thinkingActive} />
        )}
        <div
          className="ai-md"
          style={{ fontSize: 14, color: "var(--color-text)", lineHeight: 1.65 }}
        >
          {isTyping && !content ? (
            /* 首字未到：管家斟酌中的思考点 */
            <TypingDots />
          ) : (
            <>
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
            </>
          )}
        </div>
        {/* 工具栏：流式中（isTyping）隐藏；error 时常显；其他 hover 显示 */}
        {!isTyping && content && (
          <MessageToolbar
            content={content}
            isError={isError}
            onRegenerate={onRegenerate}
            alwaysVisible={isError}
          />
        )}
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
    onStop,
    onRegenerate,
    attachedFiles,
    onAttach,
    onRemoveAttachment,
    selectedModel,
    onSelectModel,
    ddls = [],
    onJumpToTask,
    onLoadDemo,
    hasAnyData = false,
    streakDays = 0,
    bestHourLabel,
    butlerPosition = "center",
    showDailyBrief = false,
    onStartFocus,
    onDismissBrief,
  } = props;

  // Phase D 管家位置 → 容器定位
  // hidden 时整个不渲染；left/right 改 left% + transform origin
  const butlerStyle = ((): React.CSSProperties | null => {
    if (butlerPosition === "hidden") return null;
    const base: React.CSSProperties = {
      position: "absolute",
      bottom: 0,
      pointerEvents: "none",
      zIndex: 1,
    };
    if (butlerPosition === "left") {
      return { ...base, left: 24, transform: "none" };
    }
    if (butlerPosition === "right") {
      return { ...base, right: 24, transform: "none" };
    }
    return { ...base, left: "50%", transform: "translateX(-50%)" };
  })();
  const historyRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  // 思考模式时才展示 reasoning 折叠面板；Flash 模式即使 API 返回轻量 CoT 也不渲染
  const showReasoning = !!(selectedModel && getModelMeta(selectedModel).thinking);

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
        background: "transparent",
        position: "relative",
      }}
    >
      {/* 浮动管家 — Phase D：位置可配 left/center/right；hidden 时不渲染 */}
      {butlerStyle && (
        <div style={butlerStyle}>
          <ButlerCharacter pose={butlerPose} />
        </div>
      )}

      {/* [065] 每日仪式 · 今日简报（每天首次打开顶部出现一次）*/}
      {showDailyBrief && onStartFocus && onDismissBrief && (
        <DailyBrief
          ddls={ddls}
          streakDays={streakDays}
          onStartFocus={onStartFocus}
          onJumpToTask={onJumpToTask}
          onDismiss={onDismissBrief}
        />
      )}

      {/* 历史区 */}
      <div
        ref={historyRef}
        onScroll={onScroll}
        className="message-stream"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 32px 14px",
          minHeight: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        {isEmpty ? (
          /* 欢迎屏：管家直接"说话" + 3 张快捷卡片，水平居中 */
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              maxWidth: CONTENT_MAX,
              margin: "0 auto",
            }}
          >
            <ButlerBubble
              content={
                hasAnyData
                  ? "你好,Feng。\n\n告诉我你的安排,或者拖一份课件给我整理。"
                  : "你好,Feng。我是 Butler 👋\n\n第一次见面,要不要让我帮你**拖一份课件试试**?或者点下方按钮先看个 Demo。"
              }
            />
            {/* Epic 4.1 今日聚焦概览(纯本地数据,零 token) */}
            <TodayHero ddls={ddls} onJumpToTask={onJumpToTask} streakDays={streakDays} bestHourLabel={bestHourLabel} />
            {/* G1.2 大拖拽热区(仅空数据时强引导) */}
            {!hasAnyData && (
              <DropHeroZone
                onAttach={onAttach}
                onLoadDemo={onLoadDemo}
              />
            )}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {QUICK_CARDS.map((card) => (
                <QuickCard key={card.id} card={card} onClick={() => onQuickAction(card.prompt)} />
              ))}
            </div>
          </div>
        ) : (
          /* 历史消息流：去 max-width 居中容器,让 AI 气泡彻底贴 main 左 padding */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
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
                // 核实卡居中浮在管家上方（区别于普通 AI 消息的左对齐,强调"等待你决策"）
                return (
                  <div key={msg.id} className="comic-bubble" style={{ display: "flex", justifyContent: "center" }}>
                    <ConfirmCard
                      batch={batch}
                      onAccept={onAcceptBatch}
                      onReject={onRejectBatch}
                      onDropChange={onDropChange}
                    />
                  </div>
                );
              }
              // assistant
              const isTyping = isLoading && msg.id === lastAssistantId;
              return (
                <ButlerBubble
                  key={msg.id}
                  content={msg.content}
                  reasoning={msg.reasoning}
                  isTyping={isTyping}
                  showReasoning={showReasoning}
                  isError={msg.isError}
                  onRegenerate={onRegenerate ? () => onRegenerate(msg.id) : undefined}
                />
              );
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
          padding: "12px 32px 14px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ width: "100%", maxWidth: CONTENT_MAX, display: "flex", justifyContent: "center" }}>
          <InputPod
            value={inputValue}
            onChange={onInputChange}
            onSend={onSend}
            onStop={onStop}
            isLoading={isLoading}
            attachedFiles={attachedFiles}
            onAttach={onAttach}
            onRemoveAttachment={onRemoveAttachment}
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
          />
        </div>
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
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        .ai-md p { margin: 0 0 6px; }
        .ai-md p:last-child { margin-bottom: 0; }
        .ai-md ul, .ai-md ol { margin: 4px 0 6px; padding-left: 20px; }
        .ai-md li { margin: 2px 0; }
        .ai-md code { background: var(--color-primary-soft); padding: 1px 5px; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12.5px; color: var(--color-primary); }
        .ai-md pre { background: var(--color-code-bg); color: var(--color-code-text); padding: 10px; border-radius: 8px; overflow-x: auto; font-size: 12.5px; line-height: 1.55; margin: 6px 0; }
        .ai-md pre code { background: transparent; color: inherit; padding: 0; }
        .ai-md a { color: var(--color-primary); text-decoration: underline; }
        .ai-md strong { font-weight: 600; }
        .ai-md table { border-collapse: collapse; margin: 6px 0; font-size: 12.5px; }
        .ai-md th, .ai-md td { border: 1px solid var(--color-border); padding: 4px 8px; text-align: left; }
        .ai-md th { background: var(--color-surface); font-weight: 600; }
        /* hover ButlerBubble 显示工具栏（error 永显走 inline alwaysVisible） */
        .bubble-wrap:hover .msg-toolbar { opacity: 1 !important; }
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
        boxShadow: hov ? "var(--shadow-card-hover)" : "var(--shadow-card)",
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

// ============================================================
// G1.2 欢迎屏大拖拽热区(仅首次用户/空数据时显示)
// ============================================================
function DropHeroZone({
  onAttach, onLoadDemo,
}: {
  onAttach: (files: FileList) => void;
  onLoadDemo?: () => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragActive(true);
          }
        }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) onAttach(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          padding: "26px 24px",
          borderRadius: 14,
          border: `2px dashed ${dragActive ? "var(--color-primary)" : "color-mix(in srgb, var(--color-primary) 40%, transparent)"}`,
          background: dragActive
            ? "var(--color-primary-soft)"
            : "color-mix(in srgb, var(--color-primary) 4%, transparent)",
          cursor: "pointer",
          transition: "all 0.18s",
          textAlign: "center",
          fontFamily: "inherit",
        }}
      >
        <FileUp size={28} color="var(--color-primary)" style={{ marginBottom: 8 }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", margin: "0 0 4px" }}>
          {dragActive ? "释放即可上传" : "拖一份 PDF 课件到这里"}
        </p>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0 }}>
          管家会自动提取所有 DDL → 加入任务清单 + 日历
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) onAttach(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {onLoadDemo && (
        <button
          onClick={onLoadDemo}
          style={{
            padding: "8px 14px",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: "var(--color-bg)",
            color: "var(--color-text-muted)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            alignSelf: "center",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = "var(--color-primary)";
            el.style.color = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = "var(--color-border)";
            el.style.color = "var(--color-text-muted)";
          }}
        >
          没课件？点这里先看个 Demo →
        </button>
      )}
    </div>
  );
}
