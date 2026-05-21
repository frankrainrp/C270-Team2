// ============================================================
// packages/ai-core/src/schemas/ddl-schema.ts
// Zod 契约：AI 输出的强类型结构定义（DDL 提取结果）
// 所有 AI 输出必须经过此 Schema 校验，不得直接使用原始 JSON
// ============================================================
import { z } from "zod";

/** 单个截止日期条目 */
export const DdlItemSchema = z.object({
  title: z.string().min(1).describe("任务或作业标题"),
  deadline: z.string().datetime().describe("ISO 8601 格式截止时间"),
  course: z.string().describe("所属课程名称"),
  description: z.string().optional().describe("补充说明"),
});

/** AI 批量提取结果（数组） */
export const DdlExtractionResultSchema = z.object({
  items: z.array(DdlItemSchema),
  confidence: z.number().min(0).max(1).describe("提取置信度"),
});

export type DdlItem = z.infer<typeof DdlItemSchema>;
export type DdlExtractionResult = z.infer<typeof DdlExtractionResultSchema>;
