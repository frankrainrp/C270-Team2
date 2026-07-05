// Gets values from nested objects using paths like "data.items[0]"
import { GetByPath } from "../utils/ObjectPath.js";

// Makes HTTP requests through the backend proxy
import { ProxyFetch } from "./ConnectorService.js";

// AI helper functions
import { ClampText, GetDeepSeekClient, GetDeepSeekModel, InputLimits, ReadJsonObject } from "./AiService.js";

// Defines the data that can be passed into GeneratePanel()
export type GeneratePanelInput = {
  // User prompt
  prompt?: string;
  // Existing dashboard spec (used when editing)
  currentSpec?: unknown;
  // Error returned by a failed data source
  fixError?: string;
  // Whether to test HTTP sources after generation
  probe?: boolean;
};

// Maximum number of HTTP sources to probe
const MaxProbes = 3;

/*
Prompt sent to the AI as the system message.

This tells the AI:

- exactly what JSON format to generate
- available datasource types
- dashboard rules

This helps keep the AI output consistent.
*/

const PanelSystem = `You generate dashboard panel JSON. Return only JSON.
Shape:
{
  "version": 1,
  "title": "short title",
  "emoji": "one emoji",
  "description": "optional sentence",
  "sources": [
    {"id":"s","kind":"static","data":[{"name":"A","value":10}]}
  ],
  "blocks": [
    {"type":"kpiGrid","title":"Overview","metrics":[{"label":"Count","sourceId":"s","agg":"count"}]},
    {"type":"bar","title":"Chart","sourceId":"s","x":"name","y":"value"},
    {"type":"table","title":"Details","sourceId":"s","columns":[{"key":"name","label":"Name"},{"key":"value","label":"Value","format":"number"}]}
  ]
}
Rules:
1. Use kind:"local" for user-owned data such as tasks, notes, sessions, or streak. Available local datasets: ddls, notes, sessions, streak.
2. Use kind:"http" only for public APIs you are confident exist.
3. If unsure, use kind:"static" with realistic sample rows.
4. Keep field names consistent across sources and blocks.
5. Generate 3-5 blocks.`;

export async function GeneratePanel(input: GeneratePanelInput) {
  // Remove whitespace and limit prompt length
  const prompt = ClampText((input.prompt || "").trim(), InputLimits.maxPromptChars);
  // Prompt is required
  if (!prompt) return { ok: false, status: 400, error: "Missing prompt." };

  // First AI generation
  const first = await GeneratePanelOnce(BuildUserContent(prompt, input));
  // Ai generation failed
  if (!first.ok || !first.spec) return first;

  const spec = first.spec;

  // Only probe new dashboards
  const shouldProbe = input.probe !== false && !input.currentSpec;
  // Editing an existing dashboard skips probing
  if (!shouldProbe) return { ok: true, status: 200, spec };

  // Test HTTP datasources
  const samples = await ProbePanelSources(spec);
  // Nothing to test
  if (Object.keys(samples).length === 0) return { ok: true, status: 200, spec };

  // Ask AI to fix incorrect field names
  const secondPrompt = [
    "Fix field bindings in this dashboard JSON using the response samples.",
    "Keep the same structure where possible. Return complete JSON only.",
    `Dashboard JSON: ${JSON.stringify(spec)}`,
    `Samples: ${ClampText(JSON.stringify(samples), 6000)}`,
  ].join("\n\n");

  // AI generates corrected version 
  const second = await GeneratePanelOnce(secondPrompt);
  // If fixing fails, keep the original panel instead
  if (!second.ok) return { ok: true, status: 200, spec, probed: false };

  // Return corrected dashboard
  return { ok: true, status: 200, spec: second.spec, probed: true };
}

async function GeneratePanelOnce(userContent: string) {
  // Create AI cilent
  const client = GetDeepSeekClient();

  // Send request to DeepSeek
  const completion = await client.chat.completions.create({
    model: GetDeepSeekModel(),
    messages: [
      // Rules
      { role: "system", content: PanelSystem },
      // User prompt
      { role: "user", content: userContent },
    ],
    // Force JSON output
    response_format: { type: "json_object" },
    max_tokens: 2600,
    temperature: 0.4,
  });

  // Ai response
  const raw = completion.choices[0]?.message?.content || "";
  
  // Parse JSON safely
  const parsed = ReadJsonObject(raw);
  if (!parsed.ok) return { ok: false, status: 200, error: parsed.error, raw };

  // Validate generated dashboard
  const spec = NormalizePanelSpec(parsed.data);
  if (!spec) return { ok: false, status: 200, error: "Generated panel spec is invalid.", raw };

  // Everything succeeded
  return { ok: true, status: 200, spec };
}

function BuildUserContent(prompt: string, input: GeneratePanelInput) {
  // Creating a brand new dashboard
  if (!input.currentSpec || typeof input.currentSpec !== "object") return prompt;

  // Ai is fixing an error
  if (input.fixError) {
    return [
      `Existing dashboard JSON: ${JSON.stringify(input.currentSpec)}`,
      `A data source failed with this error: ${input.fixError}`,
      "Fix only the necessary source, path, and field bindings.",
    ].join("\n\n");
  }

  // Editing an existing dashboard
  return [
    `Existing dashboard JSON: ${JSON.stringify(input.currentSpec)}`,
    `Change request: ${prompt}`,
    "Change only what is necessary.",
  ].join("\n\n");
}

function NormalizePanelSpec(raw: unknown) {
  // Must be an object
  if (!raw || typeof raw !== "object") return null;

  const spec = raw as Record<string, unknown>;
  // Must contain sources and blocks
  if (!Array.isArray(spec.sources) || !Array.isArray(spec.blocks)) return null;

  // Clean up values
  return {
    version: 1,
    title: String(spec.title || "Panel").slice(0, 32),
    emoji: typeof spec.emoji === "string" ? spec.emoji.slice(0, 4) : "📊",
    description: typeof spec.description === "string" ? spec.description : "",
    // Normalize every datasource
    sources: spec.sources.map(NormalizeSource).filter(Boolean),
    blocks: spec.blocks,
  };
}

function NormalizeSource(source: unknown) {
  // Must be an object
  if (!source || typeof source !== "object") return null;

  const next = { ...(source as Record<string, unknown>) };
  // Default ID
  if (!next.id) next.id = "s";
  // Guess  datasource type
  if (next.kind !== "static" && next.kind !== "http" && next.kind !== "local") {
    next.kind = next.url ? "http" : "static";
  }

  // HTTP source requires URL
  if (next.kind === "http" && !next.url) return null;

  // Default method
  if (next.kind === "http" && !next.method) next.method = "GET";

  // Static source needs data array
  if (next.kind === "static" && !Array.isArray(next.data)) next.data = [];

  return next;
}

async function ProbePanelSources(spec: { sources: unknown[] }) {
  // Stores sample API responses
  const samples: Record<string, unknown> = {};

  // Keep only HTTP sources
  const sources = spec.sources
    .filter((source): source is Record<string, unknown> => Boolean(source && typeof source === "object"))
    .filter((source) => source.kind === "http" && typeof source.url === "string")
    // Maximum of 3 requests
    .slice(0, MaxProbes);

  // Test each API
  await Promise.all(
    sources.map(async (source) => {
      const outcome = await ProxyFetch({
        url: String(source.url),
        method: ReadHttpMethod(source.method),
        headers: ReadRecord(source.headers),
        query: ReadQuery(source.query),
      });

      // Request failed
      if (!outcome.body.ok) return;

      // Extract response
      let data = GetByPath(outcome.body.data, typeof source.path === "string" ? source.path : undefined);

      // Store first object as sample
      const first = Array.isArray(data) ? data[0] : data;
      if (first && typeof first === "object") {
        samples[String(source.id)] = first;
      }
    }),
  );

  return samples;
}

// Only allow supported HTTP methods
function ReadHttpMethod(value: unknown) {
  if (value === "POST" || value === "PUT" || value === "DELETE" || value === "PATCH") return value;
  return "GET";
}

// Makes sure headers is an object
function ReadRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, string>;
}

// Makes sure query parameters are valid
function ReadQuery(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, string | number>;
}
