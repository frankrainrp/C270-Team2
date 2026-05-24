// ============================================================
// lib/chat-client.ts — 客户端 AI 调用层
// 负责：fetch '/api/chat' + SSE 流解析 + tool calling 自动循环
// ============================================================

import type { ToolResult } from "./ai-tools";

// OpenAI Chat Completion message 格式（含 tool calls）
export interface ApiMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ApiToolCall[];
  tool_call_id?: string;
}

export interface ApiToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

// 流式回调接口
export interface StreamCallbacks {
  /** 文本内容增量 */
  onContentDelta?: (delta: string) => void;
  /** 单条 assistant 消息完成（可能含 tool_calls） */
  onAssistantMessage?: (msg: ApiMessage) => void;
  /** AI 决定调用工具时触发，在执行前 */
  onToolCallStart?: (call: ApiToolCall) => void;
  /** 工具执行结果 */
  onToolCallEnd?: (call: ApiToolCall, result: ToolResult) => void;
  /** 错误 */
  onError?: (err: Error) => void;
  /** 全部完成（含可能的多轮 tool calling） */
  onDone?: () => void;
}

export interface StreamOptions {
  messages: ApiMessage[];
  contextSummary?: string;
  userName?: string;
  includeTools?: boolean;
  /** AI 模型 id（来自 lib/ai-models AiModelId）；不传则用服务端默认 */
  model?: string;
  executeToolCall: (call: ApiToolCall) => Promise<ToolResult>;
  callbacks: StreamCallbacks;
  signal?: AbortSignal;
  /** 防止无限循环（默认 5） */
  maxRounds?: number;
}

// SSE 流原始 chunk（OpenAI 格式简化）
interface SseChunk {
  choices?: Array<{
    delta?: {
      content?: string;
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: "function";
        function?: { name?: string; arguments?: string };
      }>;
    };
    finish_reason?: string | null;
  }>;
  error?: string;
}

// ============================================================
// 主入口：自动多轮 tool calling
// ============================================================
export async function streamChat(opts: StreamOptions): Promise<void> {
  const maxRounds = opts.maxRounds ?? 5;
  let messages = [...opts.messages];

  for (let round = 0; round < maxRounds; round++) {
    const { assistantMsg, hadToolCalls } = await streamOneRound({
      messages,
      contextSummary: opts.contextSummary,
      userName: opts.userName,
      includeTools: opts.includeTools,
      model: opts.model,
      callbacks: opts.callbacks,
      signal: opts.signal,
    });

    messages.push(assistantMsg);
    opts.callbacks.onAssistantMessage?.(assistantMsg);

    if (!hadToolCalls) break;

    // 执行所有 tool_calls，收集 tool result 消息
    const toolResultMessages: ApiMessage[] = [];
    for (const call of assistantMsg.tool_calls ?? []) {
      opts.callbacks.onToolCallStart?.(call);
      let result: ToolResult;
      try {
        result = await opts.executeToolCall(call);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result = { ok: false, message: `工具执行异常：${msg}` };
      }
      opts.callbacks.onToolCallEnd?.(call, result);
      toolResultMessages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
    messages = [...messages, ...toolResultMessages];
  }

  opts.callbacks.onDone?.();
}

// ============================================================
// 单轮流式调用
// ============================================================
async function streamOneRound(opts: {
  messages: ApiMessage[];
  contextSummary?: string;
  userName?: string;
  includeTools?: boolean;
  model?: string;
  callbacks: StreamCallbacks;
  signal?: AbortSignal;
}): Promise<{ assistantMsg: ApiMessage; hadToolCalls: boolean }> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: opts.messages,
        contextSummary: opts.contextSummary,
        userName: opts.userName,
        includeTools: opts.includeTools !== false,
        model: opts.model,
      }),
      signal: opts.signal,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    opts.callbacks.onError?.(new Error(`网络请求失败：${msg}`));
    throw err;
  }

  if (!res.ok || !res.body) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      detail = j.error || detail;
    } catch { /* ignore */ }
    const err = new Error(detail);
    opts.callbacks.onError?.(err);
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  const toolCallsAcc: Map<number, ApiToolCall> = new Map();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE 按 \n\n 分隔事件
    let sepIdx;
    while ((sepIdx = buffer.indexOf("\n\n")) >= 0) {
      const rawEvent = buffer.slice(0, sepIdx);
      buffer = buffer.slice(sepIdx + 2);

      // 提取 data: 行
      const dataLines = rawEvent
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim());
      const data = dataLines.join("");

      if (!data) continue;
      if (data === "[DONE]") continue;

      let chunk: SseChunk;
      try {
        chunk = JSON.parse(data);
      } catch {
        continue;
      }

      if (chunk.error) {
        opts.callbacks.onError?.(new Error(chunk.error));
        continue;
      }

      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;

      // 文本增量
      if (delta.content) {
        content += delta.content;
        opts.callbacks.onContentDelta?.(delta.content);
      }

      // tool_calls 增量（分片拼装）
      if (delta.tool_calls) {
        for (const tcDelta of delta.tool_calls) {
          const existing = toolCallsAcc.get(tcDelta.index) ?? {
            id: "",
            type: "function" as const,
            function: { name: "", arguments: "" },
          };
          if (tcDelta.id) existing.id = tcDelta.id;
          if (tcDelta.function?.name) existing.function.name += tcDelta.function.name;
          if (tcDelta.function?.arguments) existing.function.arguments += tcDelta.function.arguments;
          toolCallsAcc.set(tcDelta.index, existing);
        }
      }
    }
  }

  const tool_calls = Array.from(toolCallsAcc.values());
  const hadToolCalls = tool_calls.length > 0;

  const assistantMsg: ApiMessage = {
    role: "assistant",
    content: content || null,
    ...(hadToolCalls ? { tool_calls } : {}),
  };

  return { assistantMsg, hadToolCalls };
}
