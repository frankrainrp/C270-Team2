// smoke.mjs — minimal MCP client that spawns the server over stdio,
// runs the JSON-RPC handshake, lists tools, and calls a couple of them.
// Proves the server actually works end-to-end without Claude Desktop.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entry = resolve(__dirname, "..", "dist", "index.js");

const child = spawn(process.execPath, [entry], {
  stdio: ["pipe", "pipe", "inherit"],
  env: { ...process.env, BUTLER_VAULT: resolve(__dirname, "smoke-vault.json") },
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
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  }
});

let nextId = 1;
function rpc(method, params) {
  const id = nextId++;
  return new Promise((res) => {
    pending.set(id, res);
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}
function notify(method, params) {
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
}

const assert = (cond, label) => {
  if (!cond) { console.error("❌ FAIL:", label); process.exitCode = 1; }
  else console.error("✅", label);
};

const run = async () => {
  const init = await rpc("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "smoke", version: "0.0.0" },
  });
  assert(init.result?.serverInfo?.name === "butler-mcp", "initialize → butler-mcp");
  notify("notifications/initialized", {});

  const tools = await rpc("tools/list", {});
  const names = tools.result.tools.map((t) => t.name);
  assert(names.length === 14, `tools/list → 14 tools (got ${names.length})`);
  for (const n of ["list_notes", "create_task", "list_events", "create_workflow"])
    assert(names.includes(n), `tool present: ${n}`);

  const created = await rpc("tools/call", {
    name: "create_task",
    arguments: { taskName: "Smoke test task", dueDate: "2026-06-09", priority: "high", source: "smoke" },
  });
  assert(created.result?.content?.[0]?.text?.includes("Smoke test task"), "create_task works");

  const events = await rpc("tools/call", {
    name: "list_events",
    arguments: { from: "2026-06-01", to: "2026-06-30" },
  });
  assert(events.result.content[0].text.includes("Smoke test task"), "list_events sees the dated task");

  const notes = await rpc("tools/call", { name: "list_notes", arguments: {} });
  assert(/note\(s\)|No notes/.test(notes.result.content[0].text), "list_notes responds");

  child.kill();
  console.error(process.exitCode ? "\n💥 smoke test FAILED" : "\n🎉 smoke test PASSED");
  process.exit(process.exitCode ?? 0);
};

run();
