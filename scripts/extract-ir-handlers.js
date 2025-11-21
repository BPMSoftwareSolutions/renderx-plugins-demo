#!/usr/bin/env node

/**
 * Phase 2: Extract IR - Handlers
 * 
 * Scans source code for handler implementations and generates:
 * - ir-handlers.json: All extracted handler implementations
 * - Validates handler structure
 * - Extracts handler metadata
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
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
        await callback(fullPath);
      }
    }
  } catch (err) {
    // Directory may not exist
  }
}

function extractHandlers(content, filePath) {
  const handlers = [];
  
  // Match: export const handlerName = (params) => { ... }
  const exportConstRegex = /export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/g;
  let match;
  
  while ((match = exportConstRegex.exec(content)) !== null) {
    const name = match[1];
    const params = match[2].trim();
    
    handlers.push({
      name,
      type: "arrow-function",
      parameters: params ? params.split(",").map(p => p.trim()) : [],
      isAsync: content.substring(match.index, match.index + 50).includes("async")
    });
  }
  
  // Match: export function handlerName(params) { ... }
  const exportFuncRegex = /export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  while ((match = exportFuncRegex.exec(content)) !== null) {
    const name = match[1];
    const params = match[2].trim();
    
    handlers.push({
      name,
      type: "function",
      parameters: params ? params.split(",").map(p => p.trim()) : [],
      isAsync: content.substring(match.index, match.index + 50).includes("async")
    });
  }
  
  return handlers;
}

async function extractIRHandlers() {
  console.log("🔍 Phase 2: Extracting IR - Handlers");
  console.log("=" .repeat(60));

  const outputDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web", "ir");
  const outputFile = join(outputDir, "ir-handlers.json");

  await ensureDir(outputDir);

  const handlers = [];
  const handlersByPlugin = {};
  let fileCount = 0;

  // Scan all plugin packages
  for (const pkgPath of PLUGIN_PACKAGES) {
    const pluginName = pkgPath.split("/").pop();
    handlersByPlugin[pluginName] = [];

    // Look in both src/handlers and src/symphonies for handler implementations
    const searchDirs = [
      join(rootDir, pkgPath, "src", "handlers"),
      join(rootDir, pkgPath, "src", "symphonies")
    ];

    for (const searchDir of searchDirs) {
      await walkDir(searchDir, async (filePath) => {
        const content = await readFile2(filePath);
        if (!content) return;

        fileCount++;
        const extractedHandlers = extractHandlers(content, filePath);

        if (extractedHandlers.length > 0) {
          console.log(`✅ Found ${extractedHandlers.length} handler(s) in: ${filePath.replace(rootDir, "")}`);

          extractedHandlers.forEach(handler => {
            const fullHandler = {
              name: handler.name,
              plugin: pluginName,
              file: filePath.replace(rootDir, ""),
              type: handler.type,
              parameters: handler.parameters,
              isAsync: handler.isAsync
            };

            handlers.push(fullHandler);
            handlersByPlugin[pluginName].push(handler.name);
          });
        }
      });
    }
  }

  // Generate IR
  const ir = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "Phase 2: IR Extraction",
      sourceDirectories: PLUGIN_PACKAGES.map(p => `${p}/src/handlers/`),
      fileCount
    },
    summary: {
      totalHandlers: handlers.length,
      totalPlugins: Object.keys(handlersByPlugin).length,
      pluginsWithHandlers: Object.values(handlersByPlugin).filter(h => h.length > 0).length
    },
    handlers,
    handlersByPlugin
  };

  // Write output
  await writeFile(outputFile, JSON.stringify(ir, null, 2));
  console.log("\n" + "=" .repeat(60));
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log(`📊 Summary:`);
  console.log(`   - Handlers: ${handlers.length}`);
  console.log(`   - Plugins: ${Object.keys(handlersByPlugin).length}`);
  console.log(`   - Files: ${fileCount}`);
  console.log("✅ Phase 2 Complete: IR Handlers Extracted");
}

extractIRHandlers().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

