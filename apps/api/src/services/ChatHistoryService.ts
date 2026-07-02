import { z } from "zod";
import { ChatMessageModel } from "../models/ChatMessageModel.js";
import { ChatSessionModel } from "../models/ChatSessionModel.js";

const StoredFileSchema = z.object({
  id: z.string(),
  name: z.string().optional().default(""),
  size: z.number().optional().default(0),
  mime: z.string().optional().default("application/octet-stream"),
});

const ChatSessionSchema = z.object({
  id: z.string(),
  title: z.string().optional().default(""),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const ChatMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string().optional().default(""),
  files: z.array(StoredFileSchema).optional().default([]),
  reasoning: z.string().optional().default(""),
  isError: z.boolean().optional().default(false),
  timestamp: z.union([z.number(), z.string(), z.date()]),
});

const ChatHistorySchema = z.object({
  sessions: z.array(ChatSessionSchema).optional().default([]),
  messages: z.array(ChatMessageSchema).optional().default([]),
});

export async function GetChatHistory() {
  const [sessions, messages] = await Promise.all([
    ChatSessionModel.find().sort({ updatedAtMs: -1 }),
    ChatMessageModel.find().sort({ timestampMs: 1 }),
  ]);

  return {
    sessions: sessions.map(ReadSessionDto),
    messages: messages.map(ReadMessageDto),
  };
}

export async function ReplaceChatHistory(input: unknown) {
  const data = ChatHistorySchema.parse(input);

  await Promise.all([
    ChatSessionModel.deleteMany({}),
    ChatMessageModel.deleteMany({}),
  ]);

  const sessions = data.sessions.map((item) => ({
    clientId: item.id,
    title: item.title,
    createdAtMs: item.createdAt,
    updatedAtMs: item.updatedAt,
  }));

  const messages = data.messages
    .filter((item) => item.role === "user" || item.role === "assistant")
    .map((item) => ({
      clientId: item.id,
      sessionId: item.sessionId,
      role: item.role,
      content: item.content,
      files: item.files.map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        mime: file.mime,
      })),
      reasoning: item.reasoning,
      isError: item.isError,
      timestampMs: ReadTimestampMs(item.timestamp),
    }));

  if (sessions.length > 0) {
    await ChatSessionModel.insertMany(sessions);
  }
  if (messages.length > 0) {
    await ChatMessageModel.insertMany(messages);
  }

  return GetChatHistory();
}

function ReadSessionDto(session: { toObject: () => Record<string, unknown> }) {
  const raw = session.toObject();
  return {
    id: String(raw.clientId),
    title: String(raw.title || ""),
    createdAt: Number(raw.createdAtMs || Date.now()),
    updatedAt: Number(raw.updatedAtMs || Date.now()),
  };
}

function ReadMessageDto(message: { toObject: () => Record<string, unknown> }) {
  const raw = message.toObject();
  return {
    id: String(raw.clientId),
    sessionId: String(raw.sessionId),
    role: raw.role,
    content: String(raw.content || ""),
    files: Array.isArray(raw.files) ? raw.files : [],
    reasoning: raw.reasoning ? String(raw.reasoning) : undefined,
    isError: Boolean(raw.isError),
    timestamp: new Date(Number(raw.timestampMs || Date.now())).toISOString(),
  };
}

function ReadTimestampMs(value: number | string | Date) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}
