// ============================================================
// lib/ai-models.ts — 可切换的 AI 模型注册表
//
// 用户可在 InputPod 的 model badge 下拉切换。
// 当前都走 DeepSeek API（同一 baseURL）；后续 Phase 4 可扩展 OpenAI / Anthropic。
// ============================================================

export type AiModelId = "deepseek-v4-flash" | "deepseek-chat" | "deepseek-reasoner";

export interface AiModelMeta {
  id: AiModelId;
  /** 显示名（短，badge 用） */
  label: string;
  /** 副标题（下拉项里用） */
  tagline: string;
  /** 简短描述（下拉项里用） */
  desc: string;
  /** 估算成本类别：低=¥0.003/份 中=¥0.03 高=¥0.3+ */
  tier: "low" | "mid" | "high";
  /** 是否支持工具调用（toggle_complete 等） */
  supportsTools: boolean;
}

export const AI_MODELS: AiModelMeta[] = [
  {
    id: "deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    tagline: "默认 · 最低成本",
    desc: "V4 系列轻量版，速度快、成本是 V3 的 1/3-1/25。日常对话/任务管理首选。",
    tier: "low",
    supportsTools: true,
  },
  {
    id: "deepseek-chat",
    label: "DeepSeek V3.1",
    tagline: "通用 · 中等成本",
    desc: "经典 chat 模型，复杂指令/长上下文表现更好，但成本约 V4 Flash 的 3-25 倍。",
    tier: "mid",
    supportsTools: true,
  },
  {
    id: "deepseek-reasoner",
    label: "DeepSeek Reasoner",
    tagline: "推理增强 · 高成本",
    desc: "深度推理模型（CoT），适合复杂分析/数学/逻辑。不建议日常对话，慢且贵。",
    tier: "high",
    supportsTools: false,
  },
];

export const DEFAULT_MODEL_ID: AiModelId = "deepseek-v4-flash";

export function getModelMeta(id: AiModelId): AiModelMeta {
  return AI_MODELS.find((m) => m.id === id) ?? AI_MODELS[0];
}

export function isValidModelId(id: string): id is AiModelId {
  return AI_MODELS.some((m) => m.id === id);
}

// localStorage 持久化 key
export const MODEL_STORAGE_KEY = "butler.selectedModel";
