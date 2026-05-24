// ============================================================
// lib/document-parser.ts — 客户端文档解析（零 API 成本）
// 当前支持 PDF（unpdf / 基于 PDF.js）；docx/image 留待后续扩展
// ============================================================

import { extractText, getDocumentProxy } from "unpdf";

export type ParseResult = { ok: true; text: string; pages: number } | { ok: false; error: string };

export async function parsePdf(file: File): Promise<ParseResult> {
  try {
    const buf = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buf);
    const { text, totalPages } = await extractText(pdf, { mergePages: true });
    return { ok: true, text, pages: totalPages };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// 自动按 mime / 扩展名路由
export async function parseDocument(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return parsePdf(file);
  // 占位：docx 用 mammoth、图片用 Tesseract.js（按需扩展）
  return { ok: false, error: `暂不支持类型：${file.type || name}（当前仅 PDF）` };
}

// ============================================================
// 关键词过滤：DDL 提取前把无关页/段去掉，降 AI 输入 token
// ============================================================
const DDL_KEYWORDS = [
  // 中英文 DDL 标志
  "deadline", "due", "submit", "submission", "assessment", "assignment", "exam", "quiz",
  "project", "report", "presentation", "lab", "tutorial", "test",
  "week", "semester", "midterm", "final",
  "ddl", "截止", "提交", "考试", "作业", "测验", "周次", "学期", "期中", "期末",
  // 权重/分数标记
  "%", "percent", "weight", "grade", "marks", "points", "ca", "fa", "sdcl", "mcq",
];

const KW_REGEX = new RegExp(DDL_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");

/**
 * 把 markdown 按段落切分，只保留含 DDL 关键词的段落。
 * 通常能砍掉 60-80% 无关内容。若全文都没有匹配（少见），返回原文兜底。
 */
export function filterDdlRelevant(text: string): string {
  // 双换行 / 多空格分段；同时把 "Official (Closed) \\ Sensitive Normal" 类页眉清掉
  const cleaned = text
    .replace(/Official\s*\(?[\w\s\\\/]*\)?\s*Sensitive\s*Normal/gi, "")
    .replace(/\s{3,}/g, "\n\n");
  const paragraphs = cleaned.split(/\n{2,}|(?<=\.)\s{2,}/);
  const hits = paragraphs.filter((p) => p.trim().length > 0 && KW_REGEX.test(p));
  if (hits.length === 0) return text.slice(0, 8000); // 兜底：取前 8000 字
  return hits.join("\n\n").slice(0, 8000); // 上限 8000 字（~12000 token）
}
