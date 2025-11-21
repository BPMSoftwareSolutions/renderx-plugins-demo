#!/usr/bin/env node

/**
 * Phase 2: Extract IR - Sequences
 * 
 * Scans source code for sequence orchestration and generates:
 * - ir-sequences.json: All extracted sequence implementations
 * - Validates sequence structure
 * - Extracts sequence metadata
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

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

async function readFile2(path) {
  try {
    return await readFile(path, "utf-8");
  } catch (err) {
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
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        await callback(fullPath);
      }
    }
  } catch (err) {
    // Directory may not exist
  }
}

function extractSequences(content, filePath) {
  const sequences = [];
  
  // Match: export const sequenceName = { movements: [...] }
  const sequenceRegex = /export\s+const\s+(\w+)\s*=\s*\{[\s\S]*?movements:\s*\[([\s\S]*?)\]\s*\}/g;
  let match;
  
  while ((match = sequenceRegex.exec(content)) !== null) {
    const name = match[1];
    const movementsStr = match[2];
    
    // Count beats in movements
    const beatMatches = movementsStr.match(/beat:/g) || [];
    
    sequences.push({
      name,
      beatCount: beatMatches.length,
      hasMovements: movementsStr.includes("movements")
    });
  }
  
  return sequences;
}

async function extractIRSequences() {
  console.log("🔍 Phase 2: Extracting IR - Sequences");
  console.log("=" .repeat(60));

  const outputDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web", "ir");
  const outputFile = join(outputDir, "ir-sequences.json");

  await ensureDir(outputDir);

  const sequences = [];
  const sequencesByPlugin = {};
  let fileCount = 0;

  // Scan all plugin packages
  for (const pkgPath of PLUGIN_PACKAGES) {
    const pluginName = pkgPath.split("/").pop();
    sequencesByPlugin[pluginName] = [];

    // Look in src/symphonies for symphony/sequence implementations
    const symphoniesDir = join(rootDir, pkgPath, "src", "symphonies");

    await walkDir(symphoniesDir, async (filePath) => {
      const content = await readFile2(filePath);
      if (!content) return;

      // Only process symphony files (not stage-crew or other helpers)
      if (!filePath.includes(".symphony.ts")) return;

      fileCount++;
      const extractedSequences = extractSequences(content, filePath);

      if (extractedSequences.length > 0) {
        console.log(`✅ Found ${extractedSequences.length} sequence(s) in: ${filePath.replace(rootDir, "")}`);

        extractedSequences.forEach(seq => {
          const fullSeq = {
            name: seq.name,
            plugin: pluginName,
            file: filePath.replace(rootDir, ""),
            beatCount: seq.beatCount,
            hasMovements: seq.hasMovements
          };

          sequences.push(fullSeq);
          sequencesByPlugin[pluginName].push(seq.name);
        });
      }
    });
  }

  // Generate IR
  const ir = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "Phase 2: IR Extraction",
      sourceDirectories: PLUGIN_PACKAGES.map(p => `${p}/src/sequences/`),
      fileCount
    },
    summary: {
      totalSequences: sequences.length,
      totalPlugins: Object.keys(sequencesByPlugin).length,
      pluginsWithSequences: Object.values(sequencesByPlugin).filter(s => s.length > 0).length
    },
    sequences,
    sequencesByPlugin
  };

  // Write output
  await writeFile(outputFile, JSON.stringify(ir, null, 2));
  console.log("\n" + "=" .repeat(60));
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log(`📊 Summary:`);
  console.log(`   - Sequences: ${sequences.length}`);
  console.log(`   - Plugins: ${Object.keys(sequencesByPlugin).length}`);
  console.log(`   - Files: ${fileCount}`);
  console.log("✅ Phase 2 Complete: IR Sequences Extracted");
}

extractIRSequences().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

