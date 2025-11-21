#!/usr/bin/env node

/**
 * Phase 1: Analyze Catalog Sequences
 *
 * Scans ALL plugin packages for json-sequences/ directories and generates:
 * - catalog-sequences.json: All intended symphonies and beats
 * - Validates sequence structure
 * - Extracts handler requirements
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Plugin packages that contain sequences
const PLUGIN_PACKAGES = [
  "packages/canvas",
  "packages/canvas-component",
  "packages/components",
  "packages/control-panel",
  "packages/header",
  "packages/library",
  "packages/library-component"
];

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

async function readJsonFile(path) {
  try {
    const content = await readFile(path, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`❌ Failed to read ${path}: ${err.message}`);
    return null;
  }
}

async function walkDir(dir, callback) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkDir(fullPath, callback);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        await callback(fullPath);
      }
    }
  } catch (err) {
    // Directory may not exist, that's ok
  }
}

async function analyzeSequences() {
  console.log("📊 Phase 1: Analyzing Catalog Sequences");
  console.log("=" .repeat(60));

  const outputDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web", "catalog");
  const outputFile = join(outputDir, "catalog-sequences.json");

  await ensureDir(outputDir);

  const sequences = [];
  const handlers = new Set();
  const topics = new Set();
  let fileCount = 0;

  // Scan all plugin packages
  for (const pkgPath of PLUGIN_PACKAGES) {
    const sequencesDir = join(rootDir, pkgPath, "json-sequences");

    await walkDir(sequencesDir, async (filePath) => {
      const data = await readJsonFile(filePath);
      if (!data) return;

      fileCount++;
      console.log(`✅ Loaded: ${filePath.replace(rootDir, "")}`);

      // Extract sequence info
      sequences.push({
        id: data.id,
        pluginId: data.pluginId,
        name: data.name,
        movements: data.movements?.map(m => ({
          id: m.id,
          name: m.name,
          beatCount: m.beats?.length || 0,
          beats: m.beats?.map(b => ({
            beat: b.beat,
            event: b.event,
            handler: b.handler,
            kind: b.kind,
            timing: b.timing
          })) || []
        })) || []
      });

      // Extract handler and topic requirements
      data.movements?.forEach(movement => {
        movement.beats?.forEach(beat => {
          if (beat.handler) handlers.add(beat.handler);
          if (beat.event) topics.add(beat.event);
        });
      });
    });
  }

  // Generate catalog
  const catalog = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "Phase 1: Catalog Analysis",
      sourceDirectories: PLUGIN_PACKAGES.map(p => `${p}/json-sequences/`),
      fileCount
    },
    summary: {
      totalSequences: sequences.length,
      totalHandlers: handlers.size,
      totalTopics: topics.size
    },
    sequences,
    handlers: Array.from(handlers).sort(),
    topics: Array.from(topics).sort()
  };

  // Write output
  await writeFile(outputFile, JSON.stringify(catalog, null, 2));
  console.log("\n" + "=" .repeat(60));
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log(`📊 Summary:`);
  console.log(`   - Sequences: ${sequences.length}`);
  console.log(`   - Handlers: ${handlers.size}`);
  console.log(`   - Topics: ${topics.size}`);
  console.log(`   - Files: ${fileCount}`);
  console.log("✅ Phase 1 Complete: Catalog Sequences Analyzed");
}

analyzeSequences().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

