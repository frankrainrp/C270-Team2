#!/usr/bin/env node
// ============================================================
// index.ts — Butler MCP server (stdio transport).
//
// Exposes four Butler domains as MCP tools so any MCP client
// (Claude Desktop, Claude Code, …) can read and write the user's
// study data through natural language:
//
//   • notes      — Markdown notes
//   • tasks       — deadlines / to-dos (Butler `DdlItem`)
//   • events      — calendar projection of dated tasks
//   • workflows   — recurring-task automations (Butler `RecurringTask`)
//
// Data lives in a JSON vault (see store.ts). Run with:
//   BUTLER_VAULT=/path/to/butler-vault.json node dist/index.js
// ============================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadVault, mutateVault, newId, VAULT_PATH } from "./store.js";
import type { Note, Task, Workflow } from "./types.js";

const server = new McpServer({
  name: "butler-mcp",
  version: "0.1.0",
});

// ---------- helpers ----------
const ok = (text: string) => ({ content: [{ type: "text" as const, text }] });
const json = (label: string, data: unknown) =>
  ok(`${label}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``);

function noteSummary(n: Note): string {
  const tags = n.tags?.length ? ` #${n.tags.join(" #")}` : "";
  return `• [${n.id}] ${n.pinned ? "📌 " : ""}${n.title}${tags}`;
}
function taskSummary(t: Task): string {
  const when = t.dueDate ? ` — due ${t.dueDate}${t.dueTime ? " " + t.dueTime : ""}` : "";
  const mark = t.status === "done" ? "✓" : t.status === "in_progress" ? "▶" : "○";
  const pri = t.priority ? ` (${t.priority})` : "";
  return `${mark} [${t.id}] ${t.taskName}${when}${pri}`;
}
function workflowSummary(w: Workflow): string {
  return `${w.active ? "🟢" : "⚪"} [${w.id}] ${w.emoji ?? "🔁"} ${w.taskName} — ${w.timesPerPeriod}×/${w.cadence} @ ${w.dueTime || "—"}`;
}

// ============================================================
// NOTES
// ============================================================
server.registerTool(
  "list_notes",
  {
    title: "List notes",
    description: "List all notes, optionally filtered by tag or to pinned only. Returns id, title and tags.",
    inputSchema: {
      tag: z.string().optional().describe("Only notes carrying this tag"),
      pinnedOnly: z.boolean().optional().describe("Only pinned notes"),
    },
  },
  async ({ tag, pinnedOnly }) => {
    const { notes } = await loadVault();
    let rows = notes;
    if (tag) rows = rows.filter((n) => n.tags?.includes(tag));
    if (pinnedOnly) rows = rows.filter((n) => n.pinned);
    rows = [...rows].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
    if (!rows.length) return ok("No notes found.");
    return ok(`${rows.length} note(s):\n${rows.map(noteSummary).join("\n")}`);
  },
);

server.registerTool(
  "get_note",
  {
    title: "Get note",
    description: "Fetch one note in full (Markdown content included) by id.",
    inputSchema: { id: z.string().describe("Note id") },
  },
  async ({ id }) => {
    const { notes } = await loadVault();
    const n = notes.find((x) => x.id === id);
    if (!n) return ok(`No note with id ${id}.`);
    return json(`Note "${n.title}"`, n);
  },
);

server.registerTool(
  "search_notes",
  {
    title: "Search notes",
    description: "Full-text search across note titles and Markdown content (case-insensitive).",
    inputSchema: { query: z.string().describe("Search text") },
  },
  async ({ query }) => {
    const { notes } = await loadVault();
    const q = query.toLowerCase();
    const hits = notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
    );
    if (!hits.length) return ok(`No notes match "${query}".`);
    return ok(`${hits.length} match(es) for "${query}":\n${hits.map(noteSummary).join("\n")}`);
  },
);

server.registerTool(
  "create_note",
  {
    title: "Create note",
    description: "Create a new Markdown note.",
    inputSchema: {
      title: z.string().describe("Note title"),
      content: z.string().default("").describe("Markdown body"),
      tags: z.array(z.string()).optional(),
      pinned: z.boolean().optional(),
    },
  },
  async ({ title, content, tags, pinned }) => {
    const now = Date.now();
    const note: Note = { id: newId("note"), title, content, tags, pinned, createdAt: now, updatedAt: now };
    await mutateVault((v) => v.notes.push(note));
    return json(`Created note "${title}".`, note);
  },
);

server.registerTool(
  "update_note",
  {
    title: "Update note",
    description: "Update an existing note's title, content, tags or pinned state. Omitted fields are left unchanged.",
    inputSchema: {
      id: z.string(),
      title: z.string().optional(),
      content: z.string().optional(),
      tags: z.array(z.string()).optional(),
      pinned: z.boolean().optional(),
    },
  },
  async ({ id, ...patch }) => {
    const { result } = await mutateVault((v) => {
      const n = v.notes.find((x) => x.id === id);
      if (!n) return null;
      if (patch.title !== undefined) n.title = patch.title;
      if (patch.content !== undefined) n.content = patch.content;
      if (patch.tags !== undefined) n.tags = patch.tags;
      if (patch.pinned !== undefined) n.pinned = patch.pinned;
      n.updatedAt = Date.now();
      return n;
    });
    if (!result) return ok(`No note with id ${id}.`);
    return json(`Updated note "${result.title}".`, result);
  },
);

// ============================================================
// TASKS
// ============================================================
server.registerTool(
  "list_tasks",
  {
    title: "List tasks",
    description: "List tasks (deadlines / to-dos), filterable by status, source, tag and due date. Completed tasks are hidden unless includeCompleted is true.",
    inputSchema: {
      status: z.enum(["todo", "in_progress", "done"]).optional(),
      source: z.string().optional().describe("e.g. a course code"),
      tag: z.string().optional(),
      dueBefore: z.string().optional().describe("YYYY-MM-DD — only tasks due on or before this date"),
      includeCompleted: z.boolean().optional(),
    },
  },
  async ({ status, source, tag, dueBefore, includeCompleted }) => {
    const { tasks } = await loadVault();
    let rows = tasks;
    if (status) rows = rows.filter((t) => t.status === status);
    else if (!includeCompleted) rows = rows.filter((t) => t.status !== "done");
    if (source) rows = rows.filter((t) => t.source === source);
    if (tag) rows = rows.filter((t) => t.tags?.includes(tag));
    if (dueBefore) rows = rows.filter((t) => t.dueDate && t.dueDate <= dueBefore);
    rows = [...rows].sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
    if (!rows.length) return ok("No tasks found.");
    return ok(`${rows.length} task(s):\n${rows.map(taskSummary).join("\n")}`);
  },
);

server.registerTool(
  "create_task",
  {
    title: "Create task",
    description: "Create a task / deadline. If a dueDate is given it also appears on the calendar as an event.",
    inputSchema: {
      taskName: z.string(),
      dueDate: z.string().optional().describe("YYYY-MM-DD"),
      dueTime: z.string().optional().describe("HH:MM"),
      description: z.string().optional(),
      priority: z.enum(["low", "med", "high"]).optional(),
      tags: z.array(z.string()).optional(),
      weight: z.number().nullable().optional().describe("Grade weight %, if any"),
      source: z.string().optional().describe("Where it came from, e.g. a course code"),
      isGroupWork: z.boolean().optional(),
    },
  },
  async (a) => {
    const task: Task = {
      id: newId("task"),
      taskName: a.taskName,
      weight: a.weight ?? null,
      dueDate: a.dueDate ?? "",
      dueTime: a.dueTime ?? "",
      description: a.description ?? "",
      isGroupWork: a.isGroupWork ?? false,
      source: a.source ?? "mcp",
      completed: false,
      status: "todo",
      tags: a.tags,
      priority: a.priority,
    };
    await mutateVault((v) => v.tasks.push(task));
    return json(`Created task "${task.taskName}".`, task);
  },
);

server.registerTool(
  "complete_task",
  {
    title: "Complete task",
    description: "Mark a task done (sets status=done and completed=true).",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const { result } = await mutateVault((v) => {
      const t = v.tasks.find((x) => x.id === id);
      if (!t) return null;
      t.status = "done";
      t.completed = true;
      return t;
    });
    if (!result) return ok(`No task with id ${id}.`);
    return ok(`✓ Completed "${result.taskName}".`);
  },
);

server.registerTool(
  "update_task",
  {
    title: "Update task",
    description: "Update fields of an existing task. Omitted fields are unchanged.",
    inputSchema: {
      id: z.string(),
      taskName: z.string().optional(),
      dueDate: z.string().optional(),
      dueTime: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["todo", "in_progress", "done"]).optional(),
      priority: z.enum(["low", "med", "high"]).optional(),
      tags: z.array(z.string()).optional(),
    },
  },
  async ({ id, ...patch }) => {
    const { result } = await mutateVault((v) => {
      const t = v.tasks.find((x) => x.id === id);
      if (!t) return null;
      Object.assign(t, patch);
      if (patch.status) t.completed = patch.status === "done";
      return t;
    });
    if (!result) return ok(`No task with id ${id}.`);
    return json(`Updated task "${result.taskName}".`, result);
  },
);

// ============================================================
// EVENTS (calendar projection of dated tasks)
// ============================================================
server.registerTool(
  "list_events",
  {
    title: "List calendar events",
    description: "List dated tasks falling within [from, to] as calendar events, sorted by date & time.",
    inputSchema: {
      from: z.string().describe("Range start YYYY-MM-DD (inclusive)"),
      to: z.string().describe("Range end YYYY-MM-DD (inclusive)"),
    },
  },
  async ({ from, to }) => {
    const { tasks } = await loadVault();
    const rows = tasks
      .filter((t) => t.dueDate && t.dueDate >= from && t.dueDate <= to)
      .sort((a, b) => (a.dueDate + a.dueTime).localeCompare(b.dueDate + b.dueTime));
    if (!rows.length) return ok(`No events between ${from} and ${to}.`);
    const lines = rows.map(
      (t) => `📅 ${t.dueDate}${t.dueTime ? " " + t.dueTime : ""} — ${t.taskName} [${t.id}]`,
    );
    return ok(`${rows.length} event(s):\n${lines.join("\n")}`);
  },
);

server.registerTool(
  "create_event",
  {
    title: "Create calendar event",
    description: "Convenience wrapper that creates a dated task so it shows on the calendar.",
    inputSchema: {
      title: z.string(),
      date: z.string().describe("YYYY-MM-DD"),
      time: z.string().optional().describe("HH:MM"),
      description: z.string().optional(),
    },
  },
  async ({ title, date, time, description }) => {
    const task: Task = {
      id: newId("task"),
      taskName: title,
      weight: null,
      dueDate: date,
      dueTime: time ?? "",
      description: description ?? "",
      isGroupWork: false,
      source: "calendar",
      completed: false,
      status: "todo",
    };
    await mutateVault((v) => v.tasks.push(task));
    return json(`Created event "${title}" on ${date}.`, task);
  },
);

// ============================================================
// WORKFLOWS (recurring-task automations)
// ============================================================
server.registerTool(
  "list_workflows",
  {
    title: "List workflows",
    description: "List recurring-task automations (e.g. 'gym 4×/week').",
    inputSchema: { activeOnly: z.boolean().optional() },
  },
  async ({ activeOnly }) => {
    const { workflows } = await loadVault();
    const rows = activeOnly ? workflows.filter((w) => w.active) : workflows;
    if (!rows.length) return ok("No workflows found.");
    return ok(`${rows.length} workflow(s):\n${rows.map(workflowSummary).join("\n")}`);
  },
);

server.registerTool(
  "create_workflow",
  {
    title: "Create workflow",
    description: "Create a recurring-task automation that generates N task instances every period.",
    inputSchema: {
      taskName: z.string(),
      cadence: z.enum(["daily", "weekly", "monthly"]),
      timesPerPeriod: z.number().int().min(1).describe("How many instances per period"),
      dueTime: z.string().optional().describe("HH:MM"),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      emoji: z.string().optional(),
    },
  },
  async (a) => {
    const wf: Workflow = {
      id: newId("wf"),
      taskName: a.taskName,
      cadence: a.cadence,
      timesPerPeriod: a.timesPerPeriod,
      dueTime: a.dueTime ?? "",
      description: a.description,
      tags: a.tags,
      emoji: a.emoji,
      active: true,
      createdAt: Date.now(),
    };
    await mutateVault((v) => v.workflows.push(wf));
    return json(`Created workflow "${wf.taskName}" (${wf.timesPerPeriod}×/${wf.cadence}).`, wf);
  },
);

server.registerTool(
  "toggle_workflow",
  {
    title: "Toggle workflow",
    description: "Activate or pause a workflow.",
    inputSchema: { id: z.string(), active: z.boolean() },
  },
  async ({ id, active }) => {
    const { result } = await mutateVault((v) => {
      const w = v.workflows.find((x) => x.id === id);
      if (!w) return null;
      w.active = active;
      return w;
    });
    if (!result) return ok(`No workflow with id ${id}.`);
    return ok(`${active ? "🟢 Activated" : "⚪ Paused"} workflow "${result.taskName}".`);
  },
);

// ---------- boot ----------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr is safe for logging; stdout is reserved for the JSON-RPC stream.
  console.error(`[butler-mcp] ready · vault: ${VAULT_PATH}`);
}

main().catch((err) => {
  console.error("[butler-mcp] fatal:", err);
  process.exit(1);
});
