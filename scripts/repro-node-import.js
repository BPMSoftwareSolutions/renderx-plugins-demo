#!/usr/bin/env node

/**
 * Minimal, isolated repro for a single plugin import in Node (outside Vite).
 * - Attempts require.resolve and dynamic import of the given package
 * - Shows the actual file it resolves to (if any)
 * - Useful to distinguish package-level problems from Vite optimizeDeps issues
 *
 * Usage:
 *   node scripts/repro-node-import.js @renderx-plugins/library
 *   node scripts/repro-node-import.js @renderx-plugins/header
 */

import { createRequire } from "module";

const pkg = process.argv[2];
if (!pkg) {
  console.error("Usage: node scripts/repro-node-import.js <package-name>");
  process.exit(2);
}

const requireFromCwd = createRequire(process.cwd() + "/package.json");

function tryResolve(id) {
  try {
    return requireFromCwd.resolve(id);
  } catch {
    return null;
  }
}

async function tryImport(id) {
  try {
    const mod = await import(id);
    return { ok: true, exports: Object.keys(mod) };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

const resolved = tryResolve(pkg);
console.log(`🔎 require.resolve(${pkg}) => ${resolved || "NOT RESOLVED"}`);

const result = await tryImport(pkg);
if (result.ok) {
  console.log(`✅ dynamic import OK for ${pkg}`);
  console.log(`   Exports: ${result.exports.join(", ")}`);
  process.exit(0);
} else {
  console.error(`❌ dynamic import FAILED for ${pkg}`);
  console.error(`   Error: ${result.error}`);
  process.exit(1);
}
