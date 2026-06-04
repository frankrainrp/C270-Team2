// ============================================================
// store.ts — JSON-file data store ("the vault").
//
// Butler persists its real data in the browser's IndexedDB, which a
// separate server process cannot read. The MCP server therefore reads
// and writes a plain JSON vault file that acts as the shared source of
// truth. The path is configurable via the BUTLER_VAULT env var so the
// same binary can point at a demo file, a synced export, or (later) a
// Tauri/SQLite-backed export.
//
// Reads are loaded fresh on every call so external edits (or Butler
// syncing into the file) are picked up without a restart. Writes are
// atomic (temp file + rename) to avoid corrupting the vault on crash.
// ============================================================

import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Vault } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Resolved absolute path of the active vault file. */
export const VAULT_PATH = resolve(
  process.env.BUTLER_VAULT ?? resolve(__dirname, "..", "butler-vault.json"),
);

const EMPTY: Vault = { notes: [], tasks: [], workflows: [] };

/** Load the vault from disk, tolerating a missing/partial file. */
export async function loadVault(): Promise<Vault> {
  if (!existsSync(VAULT_PATH)) return structuredClone(EMPTY);
  try {
    const raw = await readFile(VAULT_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<Vault>;
    return {
      notes: parsed.notes ?? [],
      tasks: parsed.tasks ?? [],
      workflows: parsed.workflows ?? [],
    };
  } catch (err) {
    throw new Error(
      `Vault at ${VAULT_PATH} is not valid JSON: ${(err as Error).message}`,
    );
  }
}

/** Persist the vault atomically. */
export async function saveVault(vault: Vault): Promise<void> {
  await mkdir(dirname(VAULT_PATH), { recursive: true });
  const tmp = `${VAULT_PATH}.tmp`;
  await writeFile(tmp, JSON.stringify(vault, null, 2) + "\n", "utf8");
  await rename(tmp, VAULT_PATH);
}

/** Read-modify-write helper: mutate the vault inside `fn`, then save. */
export async function mutateVault<T>(
  fn: (vault: Vault) => T,
): Promise<{ result: T; vault: Vault }> {
  const vault = await loadVault();
  const result = fn(vault);
  await saveVault(vault);
  return { result, vault };
}

/** Short, sortable id (timestamp + random suffix), mirrors the app's nanoid use. */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}
