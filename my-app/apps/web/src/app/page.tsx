"use client";

// ============================================================
// app/page.tsx — 主页面：4 面板路由 + 真实 AI 对话 + AI 驱动 CRUD
// ============================================================

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import TopBar from "@/components/layout/TopBar";
import LeftRail from "@/components/layout/LeftRail";
import MiniAppsDrawer from "@/components/MiniAppsDrawer";
import ChatRail from "@/components/layout/ChatRail";
import TasksRail from "@/components/layout/TasksRail";
import CalendarRail from "@/components/layout/CalendarRail";
import NotesRail from "@/components/layout/NotesRail";
import ChatCanvas from "@/components/ChatCanvas";
import TasksPanel from "@/components/TasksPanel";
import CalendarPanel from "@/components/CalendarPanel";
import NotesPanel from "@/components/NotesPanel";
import TaskDetailDrawer, { type EditingTarget, type FormPayload } from "@/components/TaskDetailDrawer";
import AttachmentPreview from "@/components/AttachmentPreview";
import type { ChatMessage, ChatSession, ProcessingPipeline, DdlItem, NavId, UploadedFile, DdlAttachment } from "@/lib/types";
import { INITIAL_STEPS } from "@/lib/mock-pipeline";
import { streamChat, type ApiMessage } from "@/lib/chat-client";
import { createToolExecutor } from "@/lib/tool-executor";
import { type PendingBatch, type PendingChange, makeBatch, makeChangeId, applyBatch } from "@/lib/pending";
import type { ButlerPose } from "@/components/ButlerCharacter";
import { type AiModelId, DEFAULT_MODEL_ID, MODEL_STORAGE_KEY, isValidModelId } from "@/lib/ai-models";
import type { TaskViewId } from "@/components/layout/TasksRail";

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

export default function HomePage() {
  const [activeNav, setActiveNav] = useState<NavId>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);  // 全 session 共池，渲染时按 activeSessionId 过滤
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [pipelines, setPipelines] = useState<Record<string, ProcessingPipeline>>({});
  const [ddls, setDdls] = useState<DdlItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // 待核实批次：AI tool_call / PDF 提取 都先入此处，用户接受后才落 ddls
  const [pendingBatches, setPendingBatches] = useState<Record<string, PendingBatch>>({});
  // 一次 AI send 期间累积同一 batchId，多个 tool_call 共用一张核实卡
  const currentBatchIdRef = useRef<string | null>(null);
  // PDF pipeline 完成时短暂高亮 pointout 姿势（5s 后回 standing/serving）
  const [pointoutHold, setPointoutHold] = useState(false);
  // 学习工具抽屉
  const [miniAppsOpen, setMiniAppsOpen] = useState(false);
  // Tasks 当前 view
  const [taskView, setTaskView] = useState<TaskViewId>("active");
  // AI 模型选择（localStorage 持久化）
  const [selectedModel, setSelectedModel] = useState<AiModelId>(DEFAULT_MODEL_ID);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODEL_STORAGE_KEY);
      if (saved && isValidModelId(saved)) setSelectedModel(saved);
    } catch { /* ignore */ }
  }, []);
  const handleSelectModel = useCallback((id: AiModelId) => {
    setSelectedModel(id);
    try { localStorage.setItem(MODEL_STORAGE_KEY, id); } catch { /* ignore */ }
  }, []);

  // ddlsRef 保证 AI tool 执行时拿到最新 state（避免闭包陷阱）
  const ddlsRef = useRef(ddls);
  useEffect(() => { ddlsRef.current = ddls; }, [ddls]);
  const activeSessionIdRef = useRef<string | null>(null);
  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);

  // ---------- 持久化：启动 load + 改动同步到 IndexedDB（Dexie） ----------
  const [hydrated, setHydrated] = useState(false);

  // 启动一次性 load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { getDb } = await import("@/lib/db");
        const db = getDb();
        const [ddlRows, sessRows, msgRows] = await Promise.all([
          db.ddls.toArray(),
          db.sessions.toArray(),
          db.messages.toArray(),
        ]);
        if (cancelled) return;
        if (ddlRows.length > 0) setDdls(ddlRows);

        // sessions 排序（最近活跃在前）
        const sortedSessions = [...sessRows].sort((a, b) => b.updatedAt - a.updatedAt);
        if (sortedSessions.length === 0) {
          // 首次启动 → 自动建一个空 session
          const now = Date.now();
          const fresh: ChatSession = {
            id: "sess-" + Math.random().toString(36).slice(2, 9) + now.toString(36),
            title: "新对话",
            createdAt: now,
            updatedAt: now,
          };
          setSessions([fresh]);
          setActiveSessionId(fresh.id);
        } else {
          setSessions(sortedSessions);
          setActiveSessionId(sortedSessions[0].id);
        }

        if (msgRows.length > 0) {
          // 旧 messages 的 timestamp 是 Date 实例，Dexie 序列化为 ISO 字符串/Date — 这里统一回 Date
          const normalized = msgRows.map((m) => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp as unknown as string),
          }));
          setMessages(normalized);
        }
      } catch (e) {
        console.warn("[db] hydrate failed:", e);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 改动同步：每次 ddls 变化，整体替换 IndexedDB 表
  useEffect(() => {
    if (!hydrated) return; // 防止首次渲染（空数组）覆盖已有数据
    (async () => {
      try {
        const { getDb } = await import("@/lib/db");
        const db = getDb();
        await db.transaction("rw", db.ddls, async () => {
          await db.ddls.clear();
          if (ddls.length > 0) await db.ddls.bulkPut(ddls);
        });
      } catch (e) {
        console.warn("[db] sync failed:", e);
      }
    })();
  }, [ddls, hydrated]);

  // 持久化：sessions 变化 → 整体替换
  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        const { getDb } = await import("@/lib/db");
        const db = getDb();
        await db.transaction("rw", db.sessions, async () => {
          await db.sessions.clear();
          if (sessions.length > 0) await db.sessions.bulkPut(sessions);
        });
      } catch (e) {
        console.warn("[db] sessions sync failed:", e);
      }
    })();
  }, [sessions, hydrated]);

  // 持久化：messages 变化 → 整体替换（pipeline 类消息不持久化，避免重启后挂着旧 pipelineId）
  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        const { getDb } = await import("@/lib/db");
        const db = getDb();
        const persistable = messages.filter((m) => m.role !== "pipeline" && m.role !== "confirm");
        await db.transaction("rw", db.messages, async () => {
          await db.messages.clear();
          if (persistable.length > 0) await db.messages.bulkPut(persistable);
        });
      } catch (e) {
        console.warn("[db] messages sync failed:", e);
      }
    })();
  }, [messages, hydrated]);

  // 当前 session 的消息（派生）
  const visibleMessages = useMemo(
    () => (activeSessionId ? messages.filter((m) => m.sessionId === activeSessionId) : []),
    [messages, activeSessionId],
  );

  // 触碰当前 session 的 updatedAt（用户新发消息时调用，让它冒到列表顶部）
  const touchActiveSession = useCallback((titleHint?: string) => {
    const sid = activeSessionIdRef.current;
    if (!sid) return;
    setSessions((prev) => prev.map((s) => {
      if (s.id !== sid) return s;
      const next: ChatSession = { ...s, updatedAt: Date.now() };
      // 默认标题 → 用首条消息前 24 字
      if (titleHint && s.title === "新对话") {
        const t = titleHint.trim().slice(0, 24);
        if (t) next.title = t;
      }
      return next;
    }));
  }, []);

  // ---------- 文件附件 ----------
  const handleAttach = useCallback((fileList: FileList) => {
    const list: UploadedFile[] = Array.from(fileList).map((f) => ({
      id: uid(), name: f.name, size: f.size, mime: f.type || "application/octet-stream",
      file: f, // 保留真实 File 对象供 pipeline 读取
    }));
    setAttachedFiles((prev) => [...prev, ...list]);
  }, []);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ---------- 真实处理流（PDF → 客户端解析 → V4 Flash 提取 → 落 state） ----------
  const runRealPipeline = useCallback(async (uploaded: UploadedFile) => {
    const pipelineId = uid();
    const messageId = uid();
    const sid = activeSessionIdRef.current;
    if (!sid) return;
    const initial: ProcessingPipeline = {
      id: pipelineId, file: uploaded,
      steps: INITIAL_STEPS.map((s) => ({ ...s })),
      status: "running", startedAt: Date.now(),
    };
    setPipelines((prev) => ({ ...prev, [pipelineId]: initial }));
    setMessages((prev) => [
      ...prev,
      { id: messageId, sessionId: sid, role: "pipeline", content: "", pipelineId, timestamp: new Date() },
    ]);

    const setStep = (idx: number, status: "running" | "success" | "failed", detail?: string) => {
      setPipelines((prev) => {
        const cur = prev[pipelineId]; if (!cur) return prev;
        return {
          ...prev,
          [pipelineId]: {
            ...cur,
            steps: cur.steps.map((s, i) => i === idx ? { ...s, status, ...(detail ? { detail } : {}) } : s),
          },
        };
      });
    };
    const finishPipeline = (status: "completed" | "failed", extractedCount?: number) => {
      setPipelines((prev) => {
        const cur = prev[pipelineId]; if (!cur) return prev;
        return {
          ...prev,
          [pipelineId]: { ...cur, status, finishedAt: Date.now(), ...(extractedCount !== undefined ? { extractedCount } : {}) },
        };
      });
    };

    try {
      // ---- Step 1: OCR + 双重粗筛（关键词 → 语义） ----
      setStep(0, "running");
      if (!uploaded.file) throw new Error("文件对象丢失");
      const { parseDocument, filterDdlRelevant } = await import("@/lib/document-parser");
      const parsed = await parseDocument(uploaded.file);
      if (parsed.ok !== true) { setStep(0, "failed", parsed.error); finishPipeline("failed"); return; }

      // 1a. 关键词快速预筛（同步，免费）
      const keywordFiltered = filterDdlRelevant(parsed.text);

      // 1b. 语义粗筛（MiniLM embedding，首次加载 ~22MB；失败降级到纯关键词）
      let finalMd = keywordFiltered;
      let semDetail = "（仅关键词筛）";
      try {
        setStep(0, "running", `${parsed.pages} 页 → ${parsed.text.length} 字 → 关键词 ${keywordFiltered.length} 字，正在语义粗筛…`);
        const { filterBySemantic } = await import("@/lib/semantic-filter");
        // 实测数据：相关段相似度 0.55+，弱相关 0.15-0.30，垃圾 <0.15
        // 阈值 0.35 + topK 20 既能砍掉模板段又保住所有真 DDL
        // 直接用 parsed.text（关键词筛后只剩 1 大段，semantic 自己切分更细）
        const sem = await filterBySemantic(parsed.text, { topK: 30, minSim: 0.35 });
        if (sem.kept > 0) {
          finalMd = sem.text;
          semDetail = `→ 语义 ${sem.kept}/${sem.total} 段 ${sem.text.length} 字 (top sim ${sem.topSim.toFixed(2)})`;
        }
      } catch (e) {
        // 模型下载失败 / 浏览器不支持 → 降级
        console.warn("semantic filter unavailable, fallback to keyword only:", e);
      }
      setStep(0, "success", `${parsed.pages} 页 → ${parsed.text.length} 字 → 关键词 ${keywordFiltered.length} 字 ${semDetail}`);

      // ---- Step 2: V4 Flash 提取 DDL ----
      setStep(1, "running");
      const today = new Date(); const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const res = await fetch("/api/extract-ddls", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ markdown: finalMd, filename: uploaded.name, currentDate: isoToday }),
      });
      const json = await res.json();
      if (!json.ok) { setStep(1, "failed", json.error || "提取失败"); finishPipeline("failed"); return; }
      const items: Array<Omit<DdlItem, "id" | "source" | "completed">> = json.items || [];
      setStep(1, "success", `V4 Flash 提取 ${items.length} 条`);

      // ---- Step 3: 写入日历（暂跳过，Phase 4 接 Google Cal）----
      setStep(2, "running");
      await new Promise((r) => setTimeout(r, 300));
      setStep(2, "success", "（已跳过，Phase 4 接 Google Calendar）");

      // ---- Step 4: 落入待核实队列（v2：不直接 setDdls，需用户核实）----
      setStep(3, "running");
      const newDdls: DdlItem[] = items.map((it) => ({
        ...it,
        id: uid(),
        source: `${uploaded.name}（待核实）`,
        completed: false,
        weight: it.weight ?? null,
        dueTime: it.dueTime || "23:59",
        description: it.description || "",
        isGroupWork: it.isGroupWork ?? false,
      }));

      const batch = makeBatch(
        sid,
        "pdf-extract",
        `我从「${uploaded.name}」中识别到 ${newDdls.length} 条待办，请核实后再写入：`,
      );
      batch.changes = newDdls.map<PendingChange>((d) => ({
        id: makeChangeId(),
        kind: "create",
        summary: `${d.taskName} · ${d.dueDate || "待定"}${d.dueTime ? " " + d.dueTime : ""}${d.weight != null ? ` · ${d.weight}%` : ""}`,
        draft: d,
      }));
      setPendingBatches((prev) => ({ ...prev, [batch.id]: batch }));
      // 同时往聊天流 push 一条 confirm 消息，方便用户在 Chat 里看到
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-" + uid(),
          sessionId: sid,
          role: "confirm",
          content: "",
          confirmBatchId: batch.id,
          timestamp: new Date(),
        },
      ]);
      // 触发管家 pointout 姿势 5 秒
      setPointoutHold(true);
      setTimeout(() => setPointoutHold(false), 5000);

      setStep(3, "success", `识别到 ${newDdls.length} 条，已加入待核实队列`);

      finishPipeline("completed", newDdls.length);
    } catch (err) {
      const msg = (err as Error).message;
      // 哪一步在 running 就标 failed
      setPipelines((prev) => {
        const cur = prev[pipelineId]; if (!cur) return prev;
        const newSteps = cur.steps.map((s) => s.status === "running" ? { ...s, status: "failed" as const, detail: msg } : s);
        return { ...prev, [pipelineId]: { ...cur, steps: newSteps, status: "failed", finishedAt: Date.now() } };
      });
    }
  }, []);

  // ---------- 待核实批次：add / accept / reject / dropChange ----------
  const addPendingChange = useCallback((change: PendingChange) => {
    const sid = activeSessionIdRef.current;
    if (!sid) return;
    // 如果当前 send 还没建过 batch，建一个 + push confirm 消息到聊天流
    let batchId = currentBatchIdRef.current;
    if (!batchId) {
      const batch = makeBatch(sid, "ai-chat", "我准备为你做以下改动，请核实：");
      batchId = batch.id;
      currentBatchIdRef.current = batchId;
      setPendingBatches((prev) => ({ ...prev, [batch.id]: { ...batch, changes: [change] } }));
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-" + uid(),
          sessionId: sid,
          role: "confirm",
          content: "",
          confirmBatchId: batch.id,
          timestamp: new Date(),
        },
      ]);
    } else {
      // 追加到现有 batch
      const bid = batchId;
      setPendingBatches((prev) => {
        const cur = prev[bid];
        if (!cur) return prev;
        return { ...prev, [bid]: { ...cur, changes: [...cur.changes, change] } };
      });
    }
  }, []);

  const handleAcceptBatch = useCallback((batchId: string) => {
    setPendingBatches((prev) => {
      const batch = prev[batchId];
      if (!batch || batch.status !== "pending") return prev;
      const { next, stats } = applyBatch(ddlsRef.current, batch);
      setDdls(next);
      console.log("[pending] accepted batch", batchId, stats);
      return { ...prev, [batchId]: { ...batch, status: "accepted" } };
    });
  }, []);

  const handleRejectBatch = useCallback((batchId: string) => {
    setPendingBatches((prev) => {
      const batch = prev[batchId];
      if (!batch || batch.status !== "pending") return prev;
      return { ...prev, [batchId]: { ...batch, status: "rejected" } };
    });
  }, []);

  const handleDropChange = useCallback((batchId: string, changeId: string) => {
    setPendingBatches((prev) => {
      const batch = prev[batchId];
      if (!batch || batch.status !== "pending") return prev;
      return {
        ...prev,
        [batchId]: { ...batch, changes: batch.changes.filter((c) => c.id !== changeId) },
      };
    });
  }, []);

  // ---------- Butler 姿势：派生 ----------
  const butlerPose: ButlerPose = useMemo(() => {
    if (pointoutHold) return "pointout";
    const hasPdfPending = Object.values(pendingBatches).some(
      (b) => b.origin === "pdf-extract" && b.status === "pending",
    );
    const hasAiPending = Object.values(pendingBatches).some(
      (b) => b.origin === "ai-chat" && b.status === "pending",
    );
    if (hasPdfPending) return "pointout";
    if (isLoading || hasAiPending) return "serving";
    return "standing";
  }, [pointoutHold, pendingBatches, isLoading]);

  // ---------- Tool 执行器（稳定 ref） ----------
  const executeToolCall = useMemo(
    () => createToolExecutor({
      getDdls: () => ddlsRef.current,
      setDdls,
      addPending: addPendingChange,
    }),
    [addPendingChange],
  );

  // ---------- 构建 contextSummary 给 AI ----------
  const buildContextSummary = useCallback((items: DdlItem[]): string => {
    if (items.length === 0) return "用户当前没有任何任务/事件。";
    const sorted = [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const cap = sorted.slice(0, 20);
    const lines = cap.map((d) => {
      const flags: string[] = [];
      if (d.completed) flags.push("✓已完成");
      if (d.isGroupWork) flags.push("小组");
      if (d.weight != null) flags.push(`${d.weight}%`);
      const tag = flags.length ? ` [${flags.join(" ")}]` : "";
      return `- (id=${d.id}) ${d.taskName} — ${d.dueDate} ${d.dueTime}${tag}`;
    });
    const tail = items.length > 20 ? `\n（仅显示最近 20 条，总共 ${items.length} 条）` : "";
    return `当前任务/事件列表：\n${lines.join("\n")}${tail}`;
  }, []);

  // ---------- 发送 ----------
  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content && attachedFiles.length === 0) return;
    if (isLoading) return;
    const sid = activeSessionIdRef.current;
    if (!sid) return;

    const filesSnapshot = attachedFiles;

    // 1. 用户消息入栈
    const userUiMsg: ChatMessage = {
      id: uid(), sessionId: sid, role: "user", content,
      files: filesSnapshot.length > 0 ? filesSnapshot : undefined,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userUiMsg]);
    touchActiveSession(content || filesSnapshot[0]?.name);

    setInputValue("");
    setAttachedFiles([]);

    // 2. 有文件 → 触发 mock pipeline（暂不接 AI，Phase D 再合并）
    if (filesSnapshot.length > 0) {
      filesSnapshot.forEach((f) => runRealPipeline(f));
      return;
    }

    // 3. 纯文本 → 真实 AI 对话
    setIsLoading(true);
    currentBatchIdRef.current = null; // 新一轮 send：清掉旧 batchId，让首个 tool_call 时建新 batch

    // 把当前 session 的 UI 历史消息转成 API 格式
    const historyApi: ApiMessage[] = [...messages, userUiMsg]
      .filter((m) => m.sessionId === sid && (m.role === "user" || m.role === "assistant") && m.content)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // 流式回调：动态创建 UI assistant 消息 + 增量更新
    let currentAssistantId: string | null = null;
    const onDelta = (delta: string) => {
      if (!currentAssistantId) {
        const id = uid();
        currentAssistantId = id;
        setMessages((prev) => [
          ...prev,
          { id, sessionId: sid, role: "assistant", content: delta, timestamp: new Date() },
        ]);
      } else {
        const id = currentAssistantId;
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: m.content + delta } : m)));
      }
    };

    try {
      await streamChat({
        messages: historyApi,
        contextSummary: buildContextSummary(ddlsRef.current),
        userName: "Feng",
        includeTools: true,
        model: selectedModel,
        executeToolCall,
        callbacks: {
          onContentDelta: onDelta,
          onAssistantMessage: () => {
            // 一轮 assistant 消息收尾。下一轮（若有 tool call 后）会重新建立新的 UI 消息
            currentAssistantId = null;
          },
          onToolCallStart: (call) => {
            // eslint-disable-next-line no-console
            console.log("[tool] start", call.function.name, call.function.arguments);
          },
          onToolCallEnd: (call, result) => {
            // eslint-disable-next-line no-console
            console.log("[tool] end", call.function.name, result);
          },
          onError: (err) => {
            setMessages((prev) => [
              ...prev,
              { id: uid(), sessionId: sid, role: "assistant", content: `❌ 出错了：${err.message}`, timestamp: new Date() },
            ]);
          },
        },
      });
    } finally {
      setIsLoading(false);
      currentBatchIdRef.current = null;
    }
  }, [inputValue, attachedFiles, isLoading, messages, runRealPipeline, executeToolCall, buildContextSummary, touchActiveSession, selectedModel]);

  // ---------- 多会话操作 ----------
  const handleNewChat = useCallback(() => {
    // 当前 session 已是空白默认对话 → 只切回 chat 面板，不开新 session
    const sid = activeSessionIdRef.current;
    const cur = sid ? sessions.find((s) => s.id === sid) : null;
    const curEmpty = cur && cur.title === "新对话" &&
      !messages.some((m) => m.sessionId === sid);
    if (curEmpty) {
      setActiveNav("chat");
      return;
    }
    // 否则新建
    const now = Date.now();
    const fresh: ChatSession = {
      id: "sess-" + Math.random().toString(36).slice(2, 9) + now.toString(36),
      title: "新对话",
      createdAt: now,
      updatedAt: now,
    };
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setActiveNav("chat");
  }, [sessions, messages]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setActiveNav("chat");
  }, []);

  const handleRenameSession = useCallback((id: string, title: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    // 1. 清掉它所有 messages
    setMessages((prev) => prev.filter((m) => m.sessionId !== id));
    // 2. 从 sessions 移除；若它是 active，挑剩下最新的；若空，自动建一个
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (activeSessionIdRef.current === id) {
        if (remaining.length > 0) {
          const next = [...remaining].sort((a, b) => b.updatedAt - a.updatedAt)[0];
          setActiveSessionId(next.id);
        } else {
          const now = Date.now();
          const fresh: ChatSession = {
            id: "sess-" + Math.random().toString(36).slice(2, 9) + now.toString(36),
            title: "新对话",
            createdAt: now,
            updatedAt: now,
          };
          setActiveSessionId(fresh.id);
          return [fresh];
        }
      }
      return remaining;
    });
  }, []);

  // session 列表的显示顺序（最近活跃在前）
  const orderedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions],
  );

  // 任务计数（用于 TasksRail 的 views）
  const taskCounts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const effStatus = (d: DdlItem) => d.status ?? (d.completed ? "done" : "todo");
    return {
      all: ddls.length,
      active: ddls.filter((d) => effStatus(d) !== "done").length,
      in_progress: ddls.filter((d) => effStatus(d) === "in_progress").length,
      upcoming: ddls.filter(
        (d) => effStatus(d) !== "done" && d.dueDate && new Date(d.dueDate) >= today,
      ).length,
      completed: ddls.filter((d) => effStatus(d) === "done").length,
    };
  }, [ddls]);

  const handleQuickAction = useCallback((prompt: string) => {
    setInputValue(prompt);
  }, []);

  const handleToggleComplete = useCallback((id: string) => {
    setDdls((prev) => prev.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d)));
  }, []);

  // ---------- 手动 CRUD（TaskEditModal） ----------
  const [editing, setEditing] = useState<EditingTarget | null>(null);
  // 附件预览 modal
  const [previewing, setPreviewing] = useState<DdlAttachment | null>(null);

  const handleSubmitEdit = useCallback((data: FormPayload) => {
    // 计算被移除的 blob 附件，编辑后清理孤立 blob
    if (editing?.mode === "edit") {
      const oldBlobIds = (editing.item.attachments ?? []).filter((a) => a.kind === "blob").map((a) => a.ref);
      const newBlobIds = new Set(data.attachments.filter((a) => a.kind === "blob").map((a) => a.ref));
      const orphans = oldBlobIds.filter((id) => !newBlobIds.has(id));
      if (orphans.length > 0) {
        import("@/lib/blobs").then(({ deleteBlobs }) => deleteBlobs(orphans));
      }
    }
    // status 同步 completed：status="done" → completed=true，否则 false
    const completed = data.status === "done";
    setDdls((prev) => {
      if (editing?.mode === "edit") {
        return prev.map((d) => d.id === editing.item.id ? { ...d, ...data, completed } : d);
      }
      return [...prev, { ...data, id: uid(), completed, source: "手动添加" }];
    });
    setEditing(null);
  }, [editing]);

  const handleDeleteDdl = useCallback((id: string) => {
    // 任务删除时连带清理它的 blob 附件
    const target = ddlsRef.current.find((d) => d.id === id);
    const blobIds = target?.attachments?.filter((a) => a.kind === "blob").map((a) => a.ref) ?? [];
    if (blobIds.length > 0) {
      import("@/lib/blobs").then(({ deleteBlobs }) => deleteBlobs(blobIds));
    }
    setDdls((prev) => prev.filter((d) => d.id !== id));
    setEditing(null);
  }, []);

  // ---------- 导出/导入 ----------
  const handleExportIcs = useCallback(async () => {
    const { downloadIcs } = await import("@/lib/ics-export");
    const r = downloadIcs(ddlsRef.current);
    if (r.count === 0) alert("当前没有可导出的事件（待定任务会被跳过）");
  }, []);

  const handleExportJson = useCallback(async () => {
    const { exportToJson } = await import("@/lib/json-export");
    exportToJson(ddlsRef.current);
  }, []);

  const handleImportJson = useCallback(async () => {
    const { pickJsonFile, importFromFile } = await import("@/lib/json-export");
    const file = await pickJsonFile();
    if (!file) return;
    const r = await importFromFile(file, ddlsRef.current);
    if (r.ok !== true) { alert("导入失败：" + r.error); return; }
    setDdls(r.merged);
    alert(`导入完成：新增 ${r.added} 条，更新 ${r.updated} 条`);
  }, []);

  // ---------- 渲染 ----------
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
      }}
    >
      {/* 顶 Bar */}
      <TopBar
        activeNav={activeNav}
        onNavChange={(id) => setActiveNav(id)}
        miniAppsOpen={miniAppsOpen}
        onToggleMiniApps={() => setMiniAppsOpen((v) => !v)}
      />

      {/* 学习工具抽屉（fixed 浮在右侧，不阻塞主区操作） */}
      <MiniAppsDrawer open={miniAppsOpen} onClose={() => setMiniAppsOpen(false)} />

      {/* 主体：左栏 + 内容区 */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <LeftRail>
          {activeNav === "chat" && (
            <ChatRail
              sessions={orderedSessions}
              activeId={activeSessionId}
              onCreate={handleNewChat}
              onSelect={handleSelectSession}
              onRename={handleRenameSession}
              onDelete={handleDeleteSession}
            />
          )}
          {activeNav === "tasks" && (
            <TasksRail
              onCreateTask={() => setEditing({ mode: "create" })}
              counts={taskCounts}
              view={taskView}
              onSelectView={setTaskView}
            />
          )}
          {activeNav === "calendar" && (
            <CalendarRail onCreateEvent={() => setEditing({ mode: "create" })} />
          )}
          {activeNav === "notes" && <NotesRail />}
        </LeftRail>

        <main
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            background: "var(--color-bg)",
          }}
        >
          {activeNav === "chat" && (
            <ChatCanvas
              messages={visibleMessages}
              pipelines={pipelines}
              pendingBatches={pendingBatches}
              butlerPose={butlerPose}
              onAcceptBatch={handleAcceptBatch}
              onRejectBatch={handleRejectBatch}
              onDropChange={handleDropChange}
              onQuickAction={handleQuickAction}
              isLoading={isLoading}
              onJumpToTasks={() => setActiveNav("tasks")}
              onJumpToCalendar={() => setActiveNav("calendar")}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={handleSend}
              attachedFiles={attachedFiles}
              onAttach={handleAttach}
              onRemoveAttachment={handleRemoveAttachment}
              selectedModel={selectedModel}
              onSelectModel={handleSelectModel}
            />
          )}
          {activeNav === "tasks" && (
            <TasksPanel
              ddls={ddls}
              view={taskView}
              onToggleComplete={handleToggleComplete}
              onRequestCreate={() => setEditing({ mode: "create" })}
              onRequestEdit={(d) => setEditing({ mode: "edit", item: d })}
              onRequestDelete={handleDeleteDdl}
              onRequestPreview={(a) => setPreviewing(a)}
              onExportIcs={handleExportIcs}
              onExportJson={handleExportJson}
              onImportJson={handleImportJson}
            />
          )}
          {activeNav === "calendar" && (
            <CalendarPanel
              ddls={ddls}
              onRequestCreate={(presetDate) => setEditing({ mode: "create", presetDate })}
              onRequestEdit={(d) => setEditing({ mode: "edit", item: d })}
            />
          )}
          {activeNav === "notes" && <NotesPanel />}

          {editing && (
            <TaskDetailDrawer
              target={editing}
              onCancel={() => setEditing(null)}
              onSubmit={handleSubmitEdit}
              onDelete={handleDeleteDdl}
            />
          )}

          {previewing && (
            <AttachmentPreview attachment={previewing} onClose={() => setPreviewing(null)} />
          )}
        </main>
      </div>
    </div>
  );
}
