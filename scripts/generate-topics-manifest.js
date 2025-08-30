#!/usr/bin/env node

/**
 * Generate topics-manifest.json from per-plugin topic catalogs.
 *
 * Sources:
 *  - json-topics/*.json           → per-plugin catalogs
 *
 * Outputs:
 *  - topics-manifest.json         (repo root)
 *  - public/topics-manifest.json  (served to browser)
 */

import { promises as fs } from "fs";
import { readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

export function buildTopicsManifest(catalogs) {
  const topics = {};
  for (const cat of catalogs || []) {
    const t = cat?.topics || {};
    for (const [key, def] of Object.entries(t)) {
      // Normalize to routes[]
      const routes = [];
      if (def?.route) routes.push(def.route);
      if (Array.isArray(def?.routes)) routes.push(...def.routes);
      topics[key] = {
        routes,
        payloadSchema: def?.payloadSchema || null,
        visibility: def?.visibility || "public",
        correlationKeys: Array.isArray(def?.correlationKeys)
          ? def.correlationKeys
          : [],
        perf: def?.perf || {},
        notes: def?.notes || "",
      };
    }
  }
  return { version: "1.0.0", topics };
}

async function readJsonSafe(path) {
  try {
    const txt = await fs.readFile(path, "utf-8");
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

async function readTopicCatalogs() {
  // Prefer root json-topics/, but also support json-components/json-topics/ for compatibility
  const dirs = [
    join(rootDir, "json-topics"),
    join(rootDir, "json-components", "json-topics"),
  ];
  const catalogs = [];
  for (const dir of dirs) {
    try {
      const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
      for (const f of files) {
        const json = await readJsonSafe(join(dir, f));
        if (json) catalogs.push(json);
      }
    } catch {
      // ignore missing directory
    }
  }
  return catalogs;
}

async function main() {
  const catalogs = await readTopicCatalogs();
  const manifest = buildTopicsManifest(catalogs);

  const outRoot = join(rootDir, "topics-manifest.json");
  const outPublic = join(rootDir, "public", "topics-manifest.json");

  const jsonText = JSON.stringify(manifest, null, 2) + "\n";
  await fs.writeFile(outRoot, jsonText, "utf-8");
  await fs.mkdir(join(rootDir, "public"), { recursive: true });
  await fs.writeFile(outPublic, jsonText, "utf-8");

  console.log(
    "✅ topics-manifest.json generated:",
    Object.keys(manifest.topics).length,
    "topics"
  );
}

// If executed as a script, run main(); when imported (tests), do nothing.
import { fileURLToPath as _fileURLToPath } from "url";
const _isMain = _fileURLToPath(import.meta.url) === __filename;
if (_isMain) {
  main().catch((err) => {
    console.error("❌ Failed to generate topics-manifest.json", err);
    process.exit(1);
  });
}
