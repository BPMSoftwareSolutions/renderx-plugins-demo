#!/usr/bin/env node

/**
 * Generate layout-manifest.json from per-layout catalogs.
 *
 * Sources:
 *  - json-layout/*.json           → per-layout catalogs
 *
 * Outputs:
 *  - layout-manifest.json         (repo root)
 *  - public/layout-manifest.json  (served to browser)
 */

import { promises as fs } from "fs";
import { readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

export function buildLayoutManifest(catalogs) {
  // Start with default layout
  let manifest = {
    version: "1.0.0",
    layout: {
      kind: "grid",
      columns: ["320px", "1fr", "360px"],
      rows: ["1fr"],
      areas: [["library", "canvas", "controlPanel"]],
      gap: { column: "0", row: "0" }
    },
    slots: [
      { name: "library", constraints: { minWidth: 280, maxWidth: 360 } },
      { name: "canvas", constraints: { minWidth: 480 } },
      { name: "controlPanel", constraints: { minWidth: 320, maxWidth: 420 } }
    ]
  };

  // Merge catalogs (later sources win)
  for (const cat of catalogs || []) {
    if (cat?.layout) {
      manifest.layout = { ...manifest.layout, ...cat.layout };
    }
    if (Array.isArray(cat?.slots)) {
      manifest.slots = cat.slots;
    }
    if (cat?.version) {
      manifest.version = cat.version;
    }
  }

  return manifest;
}

async function readJsonSafe(path) {
  try {
    const txt = await fs.readFile(path, "utf-8");
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

async function readLayoutCatalogs() {
  const dir = join(rootDir, "json-layout");
  try {
    const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
    const catalogs = [];
    for (const f of files) {
      const json = await readJsonSafe(join(dir, f));
      if (json) catalogs.push(json);
    }
    return catalogs;
  } catch {
    return [];
  }
}

async function main() {
  const catalogs = await readLayoutCatalogs();
  const manifest = buildLayoutManifest(catalogs);

  const outRoot = join(rootDir, "layout-manifest.json");
  const outPublic = join(rootDir, "public", "layout-manifest.json");

  const jsonText = JSON.stringify(manifest, null, 2) + "\n";
  await fs.writeFile(outRoot, jsonText, "utf-8");
  await fs.mkdir(join(rootDir, "public"), { recursive: true });
  await fs.writeFile(outPublic, jsonText, "utf-8");

  console.log(
    "✅ layout-manifest.json generated:",
    manifest.slots.length,
    "slots"
  );
}

// If executed as a script, run main(); when imported (tests), do nothing.
import { fileURLToPath as _fileURLToPath } from "url";
const _isMain = _fileURLToPath(import.meta.url) === __filename;
if (_isMain) {
  main().catch((err) => {
    console.error("❌ Failed to generate layout-manifest.json", err);
    process.exit(1);
  });
}
