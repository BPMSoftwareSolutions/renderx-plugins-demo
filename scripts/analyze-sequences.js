#!/usr/bin/env node

/**
 * JSON Sequence Analyzer for Component Template Preservation
 * This script analyzes JSON sequence files to detect drag/drop handlers that may not validate component templates
 */

import fs from "node:fs";
import path from "node:path";

function loadJsonSequences(cwd) {
  try {
    const sequences = new Map();

    const sequenceDirs = [
      path.join(cwd, "json-sequences"),
      path.join(cwd, "dist", "json-sequences"),
      path.join(cwd, "public", "json-sequences"),
    ];

    for (const baseDir of sequenceDirs) {
      if (!fs.existsSync(baseDir)) continue;

      const pluginDirs = fs
        .readdirSync(baseDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const pluginDir of pluginDirs) {
        const pluginPath = path.join(baseDir, pluginDir);
        const files = fs
          .readdirSync(pluginPath)
          .filter((f) => f.endsWith(".json") && f !== "index.json");

        for (const file of files) {
          try {
            const filePath = path.join(pluginPath, file);
            const content = fs.readFileSync(filePath, "utf8");
            const json = JSON.parse(content);
            sequences.set(json.id, { ...json, filePath });
          } catch {
            // Skip malformed JSON files
          }
        }
      }
    }

    return sequences;
  } catch {
    return new Map();
  }
}

function analyzeSequenceHandlers(sequence) {
  const issues = [];

  if (!sequence.movements) return issues;

  for (const movement of sequence.movements) {
    if (!movement.beats) continue;

    for (const beat of movement.beats) {
      if (beat.handler && typeof beat.handler === "string") {
        const isDragDropHandler = beat.handler.toLowerCase().includes('drag') ||
                                 beat.handler.toLowerCase().includes('drop') ||
                                 beat.event?.includes('drag') ||
                                 beat.event?.includes('drop');

        if (isDragDropHandler) {
          issues.push({
            handler: beat.handler,
            event: beat.event,
            sequenceId: sequence.id,
            beat: beat.beat,
            filePath: sequence.filePath,
            message: `Handler "${beat.handler}" in sequence "${sequence.id}" may not validate component.template`
          });
        }
      }
    }
  }

  return issues;
}

function main() {
  const cwd = process.cwd();
  const sequences = loadJsonSequences(cwd);
  const allIssues = [];

  console.log("🔍 Analyzing JSON sequences for component template preservation...\n");

  for (const [, sequence] of sequences) {
    const issues = analyzeSequenceHandlers(sequence);
    allIssues.push(...issues);
  }

  if (allIssues.length === 0) {
    console.log("✅ No issues found in JSON sequences");
    process.exit(0);
  }

  console.log(`❌ Found ${allIssues.length} potential issues:\n`);

  for (const issue of allIssues) {
    console.log(`📁 ${issue.filePath}`);
    console.log(`🎼 Sequence: ${issue.sequenceId}`);
    console.log(`🎯 Handler: ${issue.handler}`);
    console.log(`⚠️  ${issue.message}`);
    console.log("");
  }

  console.log("💡 These handlers should validate that component.template exists before processing");
  console.log("💡 Add checks like: if (!component.template) { throw new Error('Missing component template'); }");
  console.log("💡 NOTE: EventRouter no longer has hard-coded validation - using proper JSON schemas instead");
  console.log("💡 Topic schemas in topics-manifest.json now enforce component.template requirements");
  console.log("💡 External plugin handlers should still validate inputs as defense in depth");

  process.exit(1);
}

main();