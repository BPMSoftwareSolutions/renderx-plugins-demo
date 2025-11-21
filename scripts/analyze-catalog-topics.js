#!/usr/bin/env node

/**
 * Phase 1: Analyze Catalog Topics
 *
 * Scans ALL plugin packages for json-topics/ directories and generates:
 * - catalog-topics.json: All intended pub/sub topics
 * - Validates topic structure
 * - Extracts topic metadata
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Plugin packages that contain topics
const PLUGIN_PACKAGES = [
  "packages/canvas",
  "packages/canvas-component",
  "packages/components",
  "packages/control-panel",
  "packages/header",
  "packages/library",
  "packages/library-component",
  "packages/real-estate-analyzer"
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

async function analyzeTopics() {
  console.log("📊 Phase 1: Analyzing Catalog Topics");
  console.log("=" .repeat(60));

  const outputDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web", "catalog");
  const outputFile = join(outputDir, "catalog-topics.json");

  await ensureDir(outputDir);

  const topicsByPlugin = {};
  const allTopics = [];
  let fileCount = 0;

  // Scan all plugin packages
  for (const pkgPath of PLUGIN_PACKAGES) {
    const topicsDir = join(rootDir, pkgPath, "json-topics");

    await walkDir(topicsDir, async (filePath) => {
      const data = await readJsonFile(filePath);
      if (!data) return;

      fileCount++;
      const plugin = data.plugin || "Unknown";
      console.log(`✅ Loaded: ${filePath.replace(rootDir, "")} (plugin: ${plugin})`);

      topicsByPlugin[plugin] = {
        topics: data.topics || {}
      };

      // Extract all topics
      Object.entries(data.topics || {}).forEach(([topicName, topicDef]) => {
        allTopics.push({
          name: topicName,
          plugin,
          visibility: topicDef.visibility || "private",
          notes: topicDef.notes || ""
        });
      });
    });
  }

  // Generate catalog
  const catalog = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "Phase 1: Catalog Analysis",
      sourceDirectories: PLUGIN_PACKAGES.map(p => `${p}/json-topics/`),
      fileCount
    },
    summary: {
      totalTopics: allTopics.length,
      totalPlugins: Object.keys(topicsByPlugin).length,
      publicTopics: allTopics.filter(t => t.visibility === "public").length,
      privateTopics: allTopics.filter(t => t.visibility === "private").length
    },
    topicsByPlugin,
    allTopics: allTopics.sort((a, b) => a.name.localeCompare(b.name))
  };

  // Write output
  await writeFile(outputFile, JSON.stringify(catalog, null, 2));
  console.log("\n" + "=" .repeat(60));
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log(`📊 Summary:`);
  console.log(`   - Total Topics: ${allTopics.length}`);
  console.log(`   - Plugins: ${Object.keys(topicsByPlugin).length}`);
  console.log(`   - Public: ${allTopics.filter(t => t.visibility === "public").length}`);
  console.log(`   - Private: ${allTopics.filter(t => t.visibility === "private").length}`);
  console.log(`   - Files: ${fileCount}`);
  console.log("✅ Phase 1 Complete: Catalog Topics Analyzed");
}

analyzeTopics().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

