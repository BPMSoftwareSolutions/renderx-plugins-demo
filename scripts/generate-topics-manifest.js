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
import { buildTopicsManifest } from "@renderx-plugins/manifest-tools";
import { generateExternalTopicsCatalog } from "./derive-external-topics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Args parsing
const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.findIndex((a) => a === name || a.startsWith(name + '='));
  if (i === -1) return def;
  const eq = args[i].indexOf('=');
  if (eq > -1) return args[i].slice(eq + 1);
  const nxt = args[i + 1];
  if (nxt && !nxt.startsWith('--')) return nxt;
  return def;
}
const srcRoot = getArg('--srcRoot', rootDir);
const outPublicDir = getArg('--outPublic', join(rootDir, 'public'));

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
    join(srcRoot, "json-topics"),
    join(srcRoot, "json-components", "json-topics"),
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
  // Step 2: External-only topics. Ignore any local json-topics catalogs.
  // const localCatalogs = await readTopicCatalogs();
  const externalCatalog = await generateExternalTopicsCatalog();

  // Synthesize essential notify-only/alias topics that historically lived in local catalogs
  try {
    const topics = externalCatalog.topics || {};
    // 1) Drag start/end notify-only topics (no routes)
    if (topics['canvas.component.drag.start.requested']) {
      const dragRoute = Array.isArray(topics['canvas.component.drag.start.requested'].routes) ? topics['canvas.component.drag.start.requested'].routes[0] : null;
      topics['canvas.component.drag.start'] = topics['canvas.component.drag.start'] || {
        routes: [], payloadSchema: { type: 'object' }, visibility: 'public', notes: 'Synthesized notify-only (drag start)'
      };
      topics['canvas.component.drag.end'] = topics['canvas.component.drag.end'] || {
        routes: [], payloadSchema: { type: 'object' }, visibility: 'public', notes: 'Synthesized notify-only (drag end)'
      };
      if (dragRoute) {
        topics['canvas.component.drag.move'] = topics['canvas.component.drag.move'] || {
          routes: [dragRoute], payloadSchema: { type: 'object' }, visibility: 'public', notes: 'Synthesized alias to drag symphony (move)'
        };
      }
    }
    // 2) Selection changed → route to CP selection.show (alias)
    const cpShow = topics['control.panel.selection.show.requested'];
    if (cpShow && Array.isArray(cpShow.routes) && cpShow.routes.length > 0) {
      topics['canvas.component.selection.changed'] = topics['canvas.component.selection.changed'] || {
        routes: cpShow.routes, payloadSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }, visibility: 'public', notes: 'Synthesized alias to CP selection.show'
      };
    }
    // 3) Canvas component created → notify-only topic
    topics['canvas.component.created'] = topics['canvas.component.created'] || {
      routes: [], payloadSchema: { type: 'object', properties: { id: { type: 'string' } } }, visibility: 'public', notes: 'Synthesized notify-only (component created)'
    };
  } catch {}

  // Use only the (augmented) external catalog
  const allCatalogs = [externalCatalog];
  const manifest = buildTopicsManifest(allCatalogs);

  const outRoot = join(srcRoot === rootDir ? rootDir : process.cwd(), "topics-manifest.json");
  await fs.mkdir(outPublicDir, { recursive: true });
  const outPublic = join(outPublicDir, "topics-manifest.json");

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
