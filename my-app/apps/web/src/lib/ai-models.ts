// ============================================================
// lib/ai-models.ts — 可切换的 AI 模型注册表
//
// 当前只保留 V4 系列（旧 deepseek-chat / deepseek-reasoner 2026-07-24 弃用）
// 两个候选：V4 Flash（默认）/ V4 思考模式
// ============================================================

export type AiModelId = "deepseek-v4-flash" | "deepseek-v4-thinking";

export interface AiModelMeta {
  id: AiModelId;
  /** 实际传给 DeepSeek API 的 model 字段 */
  apiModel: string;
  /** 显示名（短，badge 用） */
  label: string;
  /** 副标题（下拉项里用） */
  tagline: string;
  /** 简短描述（下拉项里用） */
  desc: string;
  /** 估算成本档：low / mid / high */
  tier: "low" | "mid" | "high";
  /** 是否支持工具调用（toggle_complete 等） */
  supportsTools: boolean;
  /** V4 Thinking 模式参数（见 DeepSeek thinking_mode 官方文档） */
  thinking?: {
    reasoningEffort: "high" | "max";
  };
}

export const AI_MODELS: AiModelMeta[] = [
  {
    id: "deepseek-v4-flash",
    apiModel: "deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    tagline: "默认 · 最低成本",
    desc: "V4 系列轻量版，速度快、$0.0028/M 输入 token（cache hit）。日常对话 / 任务管理首选。",
    tier: "low",
    supportsTools: true,
  },
  {
    id: "deepseek-v4-thinking",
    apiModel: "deepseek-v4-pro",
    label: "DeepSeek V4 思考",
    tagline: "深度推理 · 中等成本",
    desc: "V4 Pro 启用思考模式（CoT 推理）。复杂分析 / 数学 / 逻辑题强，慢但准确。reasoning_effort=high。",
    tier: "mid",
    supportsTools: true,
    thinking: { reasoningEffort: "high" },
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
