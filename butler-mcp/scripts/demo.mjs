// demo.mjs — a guided demonstration of the Butler MCP server.
// Spawns the server over stdio (exactly like Claude Desktop would),
// then plays a realistic study-session script across all four domains,
// printing each tool call and its result so the effect is visible.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { copyFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entry = resolve(__dirname, "..", "dist", "index.js");

// Work on a throwaway copy of the seed vault so the real one is untouched.
const demoVault = resolve(__dirname, "demo-vault.json");
copyFileSync(resolve(__dirname, "..", "butler-vault.json"), demoVault);

const child = spawn(process.execPath, [entry], {
  stdio: ["pipe", "pipe", "inherit"],
  env: { ...process.env, BUTLER_VAULT: demoVault },
});

let buf = "";
const pending = new Map();
child.stdout.on("data", (chunk) => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    const msg = JSON.parse(line);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  }
});

let nextId = 1;
const rpc = (method, params) =>
  new Promise((res) => {
    const id = nextId++;
    pending.set(id, res);
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
const notify = (method, params) =>
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");

const line = "─".repeat(64);
async function call(name, args, intent) {
  console.log(`\n\x1b[36m▶ ${intent}\x1b[0m`);
  console.log(`  \x1b[90mcall ${name}(${JSON.stringify(args)})\x1b[0m`);
  const r = await rpc("tools/call", { name, arguments: args });
  const text = r.result?.content?.[0]?.text ?? JSON.stringify(r.error);
  console.log(text.split("\n").map((l) => "  " + l).join("\n"));
}

const run = async () => {
  await rpc("initialize", {
    protocolVersion: "2024-11-05", capabilities: {},
    clientInfo: { name: "butler-demo", version: "1.0.0" },
  });
  notify("notifications/initialized", {});
  const { result } = await rpc("tools/list", {});
  console.log(`\x1b[1mConnected to butler-mcp · ${result.tools.length} tools available\x1b[0m`);

  console.log(`\n${line}\n  SCENARIO: a student opens Claude Desktop on a Friday\n${line}`);

  // --- NOTES ---
  await call("list_notes", {}, "“Show me my notes.”");
  await call("search_notes", { query: "dashboard" }, "“Which note mentions the dashboard idea?”");

  // --- TASKS ---
  await call("list_tasks", { dueBefore: "2026-06-12" }, "“What's due before next Friday?”");
  await call("create_task",
    { taskName: "Draft CA1 box-plot answers", dueDate: "2026-06-09", dueTime: "18:00", priority: "high", source: "C245", tags: ["C245", "assessment"] },
    "“Add a high-priority task to draft my CA1 answers for Monday 6pm.”");
  await call("complete_task", { id: "task-seed-2" }, "“Mark the chapter-3 reading as done.”");
  await call("list_tasks", {}, "“Show my open tasks now.”");

  // --- EVENTS (calendar) ---
  await call("list_events", { from: "2026-06-01", to: "2026-06-30" }, "“What's on my calendar this month?”");
  await call("create_event",
    { title: "Library study block", date: "2026-06-07", time: "10:00", description: "Deep work on the dashboard project" },
    "“Block out Sunday 10am for library study.”");

  // --- WORKFLOWS ---
  await call("list_workflows", {}, "“What recurring habits am I tracking?”");
  await call("create_workflow",
    { taskName: "Review flashcards", cadence: "daily", timesPerPeriod: 1, dueTime: "08:00", emoji: "🃏", tags: ["study"] },
    "“Add a daily flashcard-review habit at 8am.”");
  await call("toggle_workflow", { id: "wf-seed-1", active: false }, "“Pause the gym workflow during exam week.”");
  await call("list_workflows", {}, "“Show my workflows now.”");

  console.log(`\n${line}\n  \x1b[32mAll four domains exercised against the live server.\x1b[0m\n${line}`);
  child.kill();
  process.exit(0);
};

run();
