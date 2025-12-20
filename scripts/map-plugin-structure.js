#!/usr/bin/env node

/**
 * Map plugin structure across codebase to understand:
 * 1. Where json-sequences are located (packages/ vs domains/)
 * 2. Where json-topics are located (packages/ vs domains/)
 * 3. Which plugins have sequences/topics and where
 * 4. Identify missing or misplaced files
 */

import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

async function findDirectories(basePath, targetName) {
  const results = [];
  try {
    const entries = await fs.readdir(basePath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = join(basePath, entry.name);
        if (entry.name === targetName) {
          results.push(fullPath);
        }
        // Recurse
        const nested = await findDirectories(fullPath, targetName);
        results.push(...nested);
      }
    }
  } catch {}
  return results;
}

async function countFiles(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.filter(e => e.isFile() && e.name.endsWith('.json')).length;
  } catch {
    return 0;
  }
}

async function main() {
  console.log("📊 PLUGIN STRUCTURE MAPPING\n");

  const plugins = [
    "canvas-component",
    "control-panel",
    "header",
    "library",
    "library-component",
    "canvas",
    "real-estate-analyzer"
  ];

  const mapping = {};

  for (const plugin of plugins) {
    mapping[plugin] = {
      "packages/json-sequences": null,
      "packages/json-topics": null,
      "domains/renderx-web/runtime/json-sequences": null,
      "domains/renderx-web/runtime/json-topics": null,
      "domains/renderx-web/ui-plugins/json-sequences": null,
      "domains/renderx-web/ui-plugins/json-topics": null,
      "node_modules/@renderx-web/json-sequences": null,
      "node_modules/@renderx-plugins/json-sequences": null
    };

    // Check packages/
    const pkgSeqPath = join(rootDir, "packages", plugin, "json-sequences");
    const pkgTopicPath = join(rootDir, "packages", plugin, "json-topics");
    mapping[plugin]["packages/json-sequences"] = await countFiles(pkgSeqPath);
    mapping[plugin]["packages/json-topics"] = await countFiles(pkgTopicPath);

    // Check domains/renderx-web/runtime/
    const domRuntimeSeqPath = join(rootDir, "domains/renderx-web/runtime", plugin, "json-sequences");
    const domRuntimeTopicPath = join(rootDir, "domains/renderx-web/runtime", plugin, "json-topics");
    mapping[plugin]["domains/renderx-web/runtime/json-sequences"] = await countFiles(domRuntimeSeqPath);
    mapping[plugin]["domains/renderx-web/runtime/json-topics"] = await countFiles(domRuntimeTopicPath);

    // Check domains/renderx-web/ui-plugins/
    const domUiSeqPath = join(rootDir, "domains/renderx-web/ui-plugins", plugin, "json-sequences");
    const domUiTopicPath = join(rootDir, "domains/renderx-web/ui-plugins", plugin, "json-topics");
    mapping[plugin]["domains/renderx-web/ui-plugins/json-sequences"] = await countFiles(domUiSeqPath);
    mapping[plugin]["domains/renderx-web/ui-plugins/json-topics"] = await countFiles(domUiTopicPath);
  }

  // Print results
  console.log("CURRENT BRANCH STRUCTURE:\n");
  console.log("Plugin".padEnd(25) + "Sequences".padEnd(15) + "Topics".padEnd(15) + "Location");
  console.log("─".repeat(80));

  for (const [plugin, locations] of Object.entries(mapping)) {
    for (const [location, count] of Object.entries(locations)) {
      if (count > 0) {
        const seqCount = location.includes("json-sequences") ? count : "";
        const topicCount = location.includes("json-topics") ? count : "";
        console.log(
          plugin.padEnd(25) +
          (seqCount ? seqCount.toString().padEnd(15) : "".padEnd(15)) +
          (topicCount ? topicCount.toString().padEnd(15) : "".padEnd(15)) +
          location
        );
      }
    }
  }

  // Check original branch
  console.log("\n\nORIGINAL BRANCH (e93ba6e1) STRUCTURE:\n");
  console.log("Plugin".padEnd(25) + "Sequences".padEnd(15) + "Topics".padEnd(15) + "Location");
  console.log("─".repeat(80));

  for (const plugin of plugins) {
    const locations = [
      `packages/${plugin}/json-sequences`,
      `packages/${plugin}/json-topics`,
      `domains/renderx-web/runtime/${plugin}/json-sequences`,
      `domains/renderx-web/runtime/${plugin}/json-topics`,
      `domains/renderx-web/ui-plugins/${plugin}/json-sequences`,
      `domains/renderx-web/ui-plugins/${plugin}/json-topics`
    ];

    for (const location of locations) {
      try {
        const output = execSync(`git show e93ba6e1:${location} 2>&1`, { encoding: "utf-8", stdio: "pipe" });
        if (output.includes("tree") || output.includes(".json")) {
          // Count JSON files in the tree output
          const lines = output.split('\n');
          const count = lines.filter(l => l.includes('.json')).length;
          if (count > 0) {
            const seqCount = location.includes("json-sequences") ? count : "";
            const topicCount = location.includes("json-topics") ? count : "";
            console.log(
              plugin.padEnd(25) +
              (seqCount ? seqCount.toString().padEnd(15) : "".padEnd(15)) +
              (topicCount ? topicCount.toString().padEnd(15) : "".padEnd(15)) +
              location
            );
          }
        }
      } catch (e) {
        // Path doesn't exist in original branch
      }
    }
  }
}

main().catch(console.error);

