#!/usr/bin/env node

/**
 * Phase 2: Extract IR - Handlers
 *
 * Scans source code for handler implementations and generates:
 * - ir-handlers.json: All extracted handler implementations
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

async function readText(filePath) {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

async function walkDir(dir, onFile) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkDir(fullPath, onFile);
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
        await onFile(fullPath);
      }
    }
  } catch {
    // directory may not exist
  }
}

function extractHandlersObject(content) {
  const results = [];

  // Case 1: export const handlers = { ... }
  const declRegex = /export\s+const\s+handlers\s*=\s*\{/g;
  const declMatch = declRegex.exec(content);
  if (declMatch) {
    let idx = content.indexOf("{", declMatch.index);
    if (idx !== -1) {
      let depth = 0;
      let end = idx;
      for (let i = idx; i < content.length; i++) {
        const ch = content[i];
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      const body = content.slice(idx + 1, end);

      // key: (params) => ...
      const arrowRe = /(\w+)\s*:\s*(async\s+)?\(([^)]*)\)\s*=>/g;
      let a;
      while ((a = arrowRe.exec(body)) !== null) {
        const name = a[1];
        const params = (a[3] || "").trim();
        const isAsync = !!a[2];
        results.push({
          name,
          type: "object-arrow",
          parameters: params ? params.split(",").map(p => p.trim()) : [],
          isAsync
        });
      }

      // key: function (params) { ... }
      const funcRe = /(\w+)\s*:\s*function\s*\(([^)]*)\)\s*\{/g;
      let f;
      while ((f = funcRe.exec(body)) !== null) {
        const name = f[1];
        const params = (f[2] || "").trim();
        results.push({
          name,
          type: "object-function",
          parameters: params ? params.split(",").map(p => p.trim()) : [],
          isAsync: false
        });
      }

      // method syntax: [async] name(params) { ... }
      const methodRe = /(async\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g;
      let md;
      while ((md = methodRe.exec(body)) !== null) {
        const name = md[2];
        const params = (md[3] || "").trim();
        const isAsync = !!md[1];
        results.push({
          name,
          type: "object-method",
          parameters: params ? params.split(",").map(p => p.trim()) : [],
          isAsync
        });
      }
    }
  }

  // Case 2: export default { ..., handlers: { ... }, ... }
  const defaultObjRegex = /export\s+default\s*\{/g;
  const defMatch = defaultObjRegex.exec(content);
  if (defMatch) {
    let start = content.indexOf("{", defMatch.index);
    if (start !== -1) {
      let depth = 0;
      let end = start;
      for (let i = start; i < content.length; i++) {
        const ch = content[i];
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      const objBody = content.slice(start + 1, end);
      const handlersProp = /handlers\s*:\s*\{/g.exec(objBody);
      if (handlersProp) {
        let hStart = objBody.indexOf("{", handlersProp.index);
        if (hStart !== -1) {
          // translate to absolute indices for brace matching
          hStart = start + 1 + hStart;
          let d = 0;
          let hEnd = hStart;
          for (let i = hStart; i < content.length; i++) {
            const ch = content[i];
            if (ch === "{") d++;
            else if (ch === "}") {
              d--;
              if (d === 0) { hEnd = i; break; }
            }
          }
          const body = content.slice(hStart + 1, hEnd);

          const arrowRe = /(\w+)\s*:\s*(async\s+)?\(([^)]*)\)\s*=>/g;
          let a;
          while ((a = arrowRe.exec(body)) !== null) {
            const name = a[1];
            const params = (a[3] || "").trim();
            const isAsync = !!a[2];
            results.push({
              name,
              type: "object-arrow",
              parameters: params ? params.split(",").map(p => p.trim()) : [],
              isAsync
            });
          }

          const funcRe = /(\w+)\s*:\s*function\s*\(([^)]*)\)\s*\{/g;
          let f;
          while ((f = funcRe.exec(body)) !== null) {
            const name = f[1];
            const params = (f[2] || "").trim();
            results.push({
              name,
              type: "object-function",
              parameters: params ? params.split(",").map(p => p.trim()) : [],
              isAsync: false
            });
          }

          const methodRe = /(async\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g;
          let md;
          while ((md = methodRe.exec(body)) !== null) {
            const name = md[2];
            const params = (md[3] || "").trim();
            const isAsync = !!md[1];
            results.push({
              name,
              type: "object-method",
              parameters: params ? params.split(",").map(p => p.trim()) : [],
              isAsync
            });
          }
        }
      }
    }
  }

  // Case 3: Fallback - any handlers: { ... } object literal in file
  // This helps when a named const is exported as default later.
  const anyHandlers = [];
  let searchIdx = 0;
  while (true) {
    const propMatch = /handlers\s*:\s*\{/.exec(content.slice(searchIdx));
    if (!propMatch) break;
    const absStart = searchIdx + propMatch.index;
    let hStart = content.indexOf("{", absStart);
    if (hStart === -1) break;
    let d2 = 0;
    let hEnd = hStart;
    for (let i = hStart; i < content.length; i++) {
      const ch = content[i];
      if (ch === "{") d2++;
      else if (ch === "}") {
        d2--;
        if (d2 === 0) { hEnd = i; break; }
      }
    }
    anyHandlers.push(content.slice(hStart + 1, hEnd));
    searchIdx = hEnd + 1;
  }
  for (const body of anyHandlers) {
    const arrowRe = /(\w+)\s*:\s*(async\s+)?\(([^)]*)\)\s*=>/g;
    let a;
    while ((a = arrowRe.exec(body)) !== null) {
      const name = a[1];
      const params = (a[3] || "").trim();
      const isAsync = !!a[2];
      results.push({
        name,
        type: "object-arrow",
        parameters: params ? params.split(",").map(p => p.trim()) : [],
        isAsync
      });
    }
    const funcRe = /(\w+)\s*:\s*function\s*\(([^)]*)\)\s*\{/g;
    let f;
    while ((f = funcRe.exec(body)) !== null) {
      const name = f[1];
      const params = (f[2] || "").trim();
      results.push({
        name,
        type: "object-function",
        parameters: params ? params.split(",").map(p => p.trim()) : [],
        isAsync: false
      });
    }
  }

  return results;
}

function extractHandlers(content, filePath) {
  const handlers = [];

  // Collect locally-declared function-like symbols to support shorthand entries in objects
  const knownFns = new Map(); // name -> { parameters: string[], isAsync: boolean }
  {
    const funcDecl = /(export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
    let m;
    while ((m = funcDecl.exec(content)) !== null) {
      const name = m[2];
      const head = content.substring(m.index, m.index + 40);
      const isAsync = head.includes("async");
      const params = (m[3] || "").trim();
      knownFns.set(name, { parameters: params ? params.split(",").map(p => p.trim()) : [], isAsync });
    }
    const constArrow = /(export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g;
    while ((m = constArrow.exec(content)) !== null) {
      const name = m[2];
      const head = content.substring(m.index, m.index + 40);
      const isAsync = head.includes("async");
      const params = (m[3] || "").trim();
      knownFns.set(name, { parameters: params ? params.split(",").map(p => p.trim()) : [], isAsync });
    }
  }

  // export const name = (...) => ...
  const exportConstArrow = /export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/g;
  let m;
  while ((m = exportConstArrow.exec(content)) !== null) {
    const name = m[1];
    const params = (m[2] || "").trim();
    handlers.push({
      name,
      type: "arrow-function",
      parameters: params ? params.split(",").map(p => p.trim()) : [],
      isAsync: content.substring(m.index, m.index + 40).includes("async")
    });
  }

  // export function name(...) { }
  const exportFunc = /export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  while ((m = exportFunc.exec(content)) !== null) {
    const name = m[1];
    const params = (m[2] || "").trim();
    handlers.push({
      name,
      type: "function",
      parameters: params ? params.split(",").map(p => p.trim()) : [],
      isAsync: content.substring(m.index, m.index + 40).includes("async")
    });
  }

  // export default function name(...) { }
  const exportDefaultFunc = /export\s+default\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  while ((m = exportDefaultFunc.exec(content)) !== null) {
    const name = m[1];
    const params = (m[2] || "").trim();
    handlers.push({
      name,
      type: "default-function",
      parameters: params ? params.split(",").map(p => p.trim()) : [],
      isAsync: content.substring(m.index, m.index + 40).includes("async")
    });
  }

  // export default (...) => ... (anonymous)
  const exportDefaultArrow = /export\s+default\s+(?:async\s+)?\(([^)]*)\)\s*=>/g;
  while ((m = exportDefaultArrow.exec(content)) !== null) {
    const params = (m[1] || "").trim();
    const baseName = filePath.split(/[\\/]/).pop().replace(/\.(tsx?|jsx?)$/, "");
    const name = `${baseName}Default`;
    handlers.push({
      name,
      type: "default-arrow",
      parameters: params ? params.split(",").map(p => p.trim()) : [],
      isAsync: content.substring(m.index, m.index + 40).includes("async")
    });
  }

  // export class ClassName { method(...) { ... } }
  const exportClass = /export\s+class\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let cm;
  while ((cm = exportClass.exec(content)) !== null) {
    const className = cm[1];
    const body = cm[2];
    const methodRe = /(?:public\s+|protected\s+|private\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g;
    let mm;
    while ((mm = methodRe.exec(body)) !== null) {
      const methodName = mm[1];
      if (methodName === "constructor") continue;
      const params = (mm[2] || "").trim();
      handlers.push({
        name: `${className}.${methodName}`,
        type: "class-method",
        parameters: params ? params.split(",").map(p => p.trim()) : [],
        isAsync: false
      });
    }
  }

  // exported handlers object literal (including shorthand entries)
  const objectHandlers = extractHandlersObject(content);
  if (objectHandlers.length) {
    // Also parse shorthand within any detected handlers object bodies (fallback already extracts only explicit forms)
    // Use a broad search for handlers blocks again and augment from knownFns
    let searchIdx = 0;
    while (true) {
      const propMatch = /handlers\s*:\s*\{/.exec(content.slice(searchIdx));
      if (!propMatch) break;
      const absStart = searchIdx + propMatch.index;
      let hStart = content.indexOf("{", absStart);
      if (hStart === -1) break;
      let d2 = 0;
      let hEnd = hStart;
      for (let i = hStart; i < content.length; i++) {
        const ch = content[i];
        if (ch === "{") d2++;
        else if (ch === "}") {
          d2--;
          if (d2 === 0) { hEnd = i; break; }
        }
      }
      const body = content.slice(hStart + 1, hEnd);
      const shorthandRe = /(\w+)\s*(?=,|\n|\r|\})/g;
      let sm;
      while ((sm = shorthandRe.exec(body)) !== null) {
        const name = sm[1];
        // Ensure this occurrence isn't a key with ':' immediately after the identifier
        const nextChars = body.slice(sm.index + sm[0].length, sm.index + sm[0].length + 2);
        if (nextChars.trim().startsWith(":")) continue;
        const info = knownFns.get(name);
        if (info) {
          objectHandlers.push({
            name,
            type: "object-shorthand",
            parameters: info.parameters,
            isAsync: info.isAsync
          });
        }
      }
      searchIdx = hEnd + 1;
    }
  }
  objectHandlers.forEach(h => handlers.push(h));

  return handlers;
}

async function extractIRHandlers() {
  console.log("🔍 Phase 2: Extracting IR - Handlers");
  console.log("=".repeat(60));

  const outputDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web", "ir");
  const outputFile = join(outputDir, "ir-handlers.json");
  await ensureDir(outputDir);

  const handlers = [];
  const handlersByPlugin = {};
  let fileCount = 0;

  for (const pkgPath of PLUGIN_PACKAGES) {
    const pluginName = pkgPath.split("/").pop();
    handlersByPlugin[pluginName] = [];

    const searchDirs = [
      join(rootDir, pkgPath, "src", "handlers"),
      join(rootDir, pkgPath, "src", "symphonies"),
      join(rootDir, pkgPath, "src")
    ];

    for (const dir of searchDirs) {
      await walkDir(dir, async (filePath) => {
        const content = await readText(filePath);
        if (!content) return;
        fileCount++;
        const found = extractHandlers(content, filePath);
        if (found.length) {
          console.log(`✅ Found ${found.length} handler(s) in: ${filePath.replace(rootDir, "")}`);
          for (const h of found) {
            handlers.push({
              name: h.name,
              plugin: pluginName,
              file: filePath.replace(rootDir, ""),
              type: h.type,
              parameters: h.parameters,
              isAsync: h.isAsync
            });
            handlersByPlugin[pluginName].push(h.name);
          }
        }
      });
    }
  }

  const ir = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "Phase 2: IR Extraction",
      sourceDirectories: PLUGIN_PACKAGES.map(p => `${p}/src`),
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

  await writeFile(outputFile, JSON.stringify(ir, null, 2));
  console.log("\n" + "=".repeat(60));
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log("📊 Summary:");
  console.log(`   - Handlers: ${handlers.length}`);
  console.log(`   - Plugins: ${Object.keys(handlersByPlugin).length}`);
  console.log(`   - Files: ${fileCount}`);
  console.log("✅ Phase 2 Complete: IR Handlers Extracted");
}

extractIRHandlers().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

