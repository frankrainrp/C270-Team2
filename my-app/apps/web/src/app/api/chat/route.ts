// ============================================================
// app/api/chat/route.ts — DeepSeek-V4-Flash 流式对话 + tool calling
// ============================================================

import { OpenAI } from "openai";
import { TOOLS } from "@/lib/ai-tools";
import { isValidModelId, getModelMeta, DEFAULT_MODEL_ID, type AiModelId } from "@/lib/ai-models";

export const runtime = "nodejs";       // openai SDK 需要 node runtime（含 stream API）
export const dynamic = "force-dynamic"; // 强制动态，禁用静态生成

interface ChatRequest {
  messages: Array<{
    role: "system" | "user" | "assistant" | "tool";
    content: string | null;
    tool_calls?: Array<{
      id: string;
      type: "function";
      function: { name: string; arguments: string };
    }>;
    tool_call_id?: string;
  }>;
  includeTools?: boolean;            // 是否带工具（纯聊天可不带）
  contextSummary?: string;           // 客户端附加的当前 ddls/活跃面板上下文摘要
  userName?: string;
  model?: string;                    // 客户端选择的模型（白名单校验，否则默认）
}

function buildSystemPrompt(userName: string, contextSummary: string): string {
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const weekday = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
  return `你是 Butler —— ${userName} 的智能学习管家。你的工作是帮 ${userName} 维护任务清单与日历事件。

## 当前时间上下文
- 今天：${todayIso}（星期${weekday}）
- 系统时区：${Intl.DateTimeFormat().resolvedOptions().timeZone}

## 当前数据快照
${contextSummary || "（用户当前没有任何任务/事件）"}

## 工作守则
1. **主动调工具**：用户说「明天开会」「下周交作业」时，立刻调用 create_item，不要先问确认细节；缺的字段用合理默认值（dueTime 缺省 23:59；weight 非作业类填 null；description 简洁）。
2. **日期推算要准**：「明天」「下周三」「3 天后」等相对时间，务必基于今天 ${todayIso} 推算成 YYYY-MM-DD 再传入工具。
3. **修改/删除前先查**：用户说「把 Quiz 改到周五」时，若你不知道 itemId，先调用 list_items 拿到 ID，再调 update_item。
4. **不要复述工具结果**：工具调用后用 1-2 句自然语言确认即可，例如「好的，已为你创建：明天 9:00『数据结构 Quiz』」。不要重复列出所有字段。
5. **批量操作**：用户说「把所有已完成的删了」时，先 list_items(filter=completed) → 逐个 delete_item。
6. **用 Markdown**：列表用 \`-\`，重点加粗，日期用 \`\`code\`\`，多任务时可用表格。
7. **语言**：默认中文回复，简洁专业，不啰嗦。

## 你**不能**做的
- 不要编造用户没有的任务（必须靠 list_items 获取真实数据）
- 不要修改/删除用户没明确指定的 item
- 不要解释你正在调用什么工具（用户能从 UI 看到）`;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey.startsWith("sk-xxx")) {
    return new Response(
      JSON.stringify({
        error: "DEEPSEEK_API_KEY 未配置。请在 apps/web/.env.local 中填入真实 key 后重启 dev server。",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return new Response(JSON.stringify({ error: "请求体非合法 JSON" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
  });

  const systemPrompt = buildSystemPrompt(
    body.userName || "Feng",
    body.contextSummary || "",
  );

  // 始终用我们注入的 system prompt 覆盖客户端的 system 消息
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...body.messages.filter((m) => m.role !== "system"),
  ];

  // 模型选择：客户端 model 必须通过白名单；未传或非法 → 默认 V4 Flash
  const requestedModel: AiModelId =
    body.model && isValidModelId(body.model) ? body.model : DEFAULT_MODEL_ID;
  const modelMeta = getModelMeta(requestedModel);
  // reasoner 类模型不支持 tool calling，自动跳过
  const useTools = body.includeTools !== false && modelMeta.supportsTools;

  try {
    const stream = await openai.chat.completions.create({
      model: requestedModel,
      messages: messages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
      tools: useTools ? TOOLS : undefined,
      tool_choice: useTools ? "auto" : undefined,
      stream: true,
      temperature: 0.4,
      max_tokens: 2048,
    });

    const encoder = new TextEncoder();
    const sseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const data = JSON.stringify(chunk);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: `DeepSeek 调用失败：${msg}` }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
}
