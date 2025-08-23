#!/usr/bin/env node

/**
 * Generate interaction-manifest.json from per-plugin route catalogs
 * and component-level overrides.
 *
 * Sources:
 *  - json-interactions/*.json           → per-plugin default route catalogs
 *  - json-components/*.json            → optional component-level overrides under integration.routeOverrides or top-level routeOverrides
 *
 * Outputs:
 *  - interaction-manifest.json         (repo root)
 *  - public/interaction-manifest.json  (served to browser)
 */

import { promises as fs } from "fs";
import { readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

export function buildInteractionManifest(catalogs, componentOverrideMaps) {
  const routes = {};
  for (const cat of catalogs || []) {
    const r = cat?.routes || {};
    for (const [key, val] of Object.entries(r)) routes[key] = val;
  }
  for (const o of componentOverrideMaps || []) {
    const r = o || {};
    for (const [key, val] of Object.entries(r)) routes[key] = val;
  }
  return { version: "1.0.0", routes };
}

async function readJsonSafe(path) {
  try {
    const txt = await fs.readFile(path, "utf-8");
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

async function readPluginCatalogs() {
  const dir = join(rootDir, "json-interactions");
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

function extractOverridesFromComponentJson(json) {
  return (
    json?.integration?.routeOverrides ||
    json?.routeOverrides ||
    json?.integration?.interactions?.routeOverrides ||
    {}
  );
}

async function readComponentOverrides() {
  const dir = join(rootDir, "json-components");
  try {
    const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
    const overrides = [];
    for (const f of files) {
      const json = await readJsonSafe(join(dir, f));
      if (json) overrides.push(extractOverridesFromComponentJson(json));
    }
    return overrides;
  } catch {
    return [];
  }
}

async function main() {
  const catalogs = await readPluginCatalogs();
  const componentOverrides = await readComponentOverrides();
  const manifest = buildInteractionManifest(catalogs, componentOverrides);

  const outRoot = join(rootDir, "interaction-manifest.json");
  const outPublic = join(rootDir, "public", "interaction-manifest.json");

  const jsonText = JSON.stringify(manifest, null, 2) + "\n";
  await fs.writeFile(outRoot, jsonText, "utf-8");
  await fs.writeFile(outPublic, jsonText, "utf-8");

  console.log(
    "✅ interaction-manifest.json generated:",
    Object.keys(manifest.routes).length,
    "routes"
  );
}

// If executed as a script, run main(); when imported (tests), do nothing.
// Use a cross-platform check that works on Windows and POSIX
import { fileURLToPath as _fileURLToPath } from "url";
const _isMain = _fileURLToPath(import.meta.url) === __filename;
if (_isMain) {
  main().catch((err) => {
    console.error("❌ Failed to generate interaction-manifest.json", err);
    process.exit(1);
  });
}
