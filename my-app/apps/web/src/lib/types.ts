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
  // v5+ 跨面板联动（B1）
  noteId?: string;                      // 关联笔记 id（一对一,反向 Note.taskIds 通过 ddls 反查）
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
  /** V4 思考模式产生的推理过程（CoT），仅 assistant 可能有 */
  reasoning?: string;
  /** 标记此条 assistant 是错误消息（来自 onError 兜底），UI 显示 retry 按钮 */
  isError?: boolean;
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

// 笔记（浏览器内简易 Markdown 版，Dexie v5 起）
// Phase 3 接 Tauri 后，会迁移到本地 Obsidian Vault（用 path 字段标记同步状态）
export interface Note {
  id: string;
  title: string;
  /** Markdown 内容 */
  content: string;
  /** 自定义标签 */
  tags?: string[];
  /** 是否置顶 */
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  /** Phase 3 同步本地 Vault 时填，当前留空 */
  vaultPath?: string;
  /** B4 已自动同步到 Tasks 的 todo 文本（去重防止重复创建任务） */
  syncedTodos?: string[];
}

// 用户自定义管家形象（[050] Phase C，Dexie v6 起）
// poseName="default" 表示替换全部 7 内置姿势；后续可支持具体 pose name 单独覆盖
export interface ButlerAsset {
  poseName: string;     // "default" | "standing" | "serving" | ...
  blob: Blob;           // 已 trim 透明 PNG
  width: number;        // trim 后真实宽度
  height: number;       // trim 后真实高度
  updatedAt: number;
}

// 用户自定义面板（[052] Phase E，Dexie v7 起）
// 出现在 Tab Bar 内置 4 Tab 后；目前 Markdown body（iframe / 嵌入网页等后续扩展）
export interface CustomPanel {
  id: string;          // "custom-{nanoid}"
  label: string;       // Tab 显示名（≤12 字符）
  emoji: string;       // Tab 前缀单字符 emoji
  content: string;     // Markdown body
  createdAt: number;
  updatedAt: number;
}
