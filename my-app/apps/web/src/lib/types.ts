// ============================================================
// lib/types.ts — 前端共享类型（与 packages/ai-core 的 Zod Schema 对齐）
// ============================================================

export type NavId = "chat" | "tasks" | "calendar" | "notes";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  file?: File; // 真实 File 对象，客户端 only，不序列化
}

export type PipelineStepStatus = "pending" | "running" | "success" | "failed";

export interface PipelineStep {
  id: "ocr" | "extract" | "calendar" | "persist";
  label: string;
  status: PipelineStepStatus;
  detail?: string;
}

export interface ProcessingPipeline {
  id: string;
  file: UploadedFile;
  steps: PipelineStep[];
  status: "running" | "completed" | "failed";
  startedAt: number;
  finishedAt?: number;
  extractedCount?: number;
}

export type AttachmentKind = "url" | "filepath" | "blob";

export interface DdlAttachment {
  id: string;
  kind: AttachmentKind;
  label: string;       // 显示名（默认取 URL host / 文件名）
  ref: string;         // url / 本地路径 / blob id
  mime?: string;       // blob 类型
  size?: number;       // blob 字节数
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "med" | "high";

export interface DdlItem {
  id: string;
  taskName: string;
  weight: number | null;
  dueDate: string; // YYYY-MM-DD 或空串表示"待定"
  dueTime: string; // HH:MM
  description: string;
  isGroupWork: boolean;
  source: string;
  completed: boolean;                   // 保留兼容；status="done" 时同步为 true
  notes?: string;                       // 长备注
  attachments?: DdlAttachment[];        // 附件列表
  // v4 新增（C.2）
  status?: TaskStatus;                  // todo / in_progress / done（v4 起填充）
  tags?: string[];                      // 自定义标签
  priority?: TaskPriority;              // low / med / high
}

// Dexie blobs 表记录形态
export interface StoredBlob {
  id: string;
  data: Blob;
  mime: string;
  name: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;                      // 所属会话（v3 起必填）
  role: "user" | "assistant" | "pipeline" | "confirm";
  content: string;
  files?: UploadedFile[];
  pipelineId?: string;
  /** role=confirm 时关联的 PendingBatch id */
  confirmBatchId?: string;
  timestamp: Date;
}

// 多会话：每个 ChatSession 持有一组独立的消息流
// 任务/日历/笔记数据全局共享，不绑定 session（见 [[project_product_definition]]）
export interface ChatSession {
  id: string;
  title: string;        // "新对话" → 首条用户消息后自动取前 24 字
  createdAt: number;
  updatedAt: number;    // 用于列表排序
}
