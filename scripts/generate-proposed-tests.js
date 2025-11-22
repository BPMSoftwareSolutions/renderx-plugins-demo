#!/usr/bin/env node

/**
 * Generate Proposed Test Files Structure
 * 
 * Creates a JSON file with proposed test files for all handlers without tests
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

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

async function generateProposedTests() {
  console.log("📋 Generating Proposed Test Files");
  console.log("=" .repeat(60));

  const artifactDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web");
  const outputDir = join(artifactDir, "analysis");
  const gapsFile = join(outputDir, "catalog-vs-ir-gaps.json");
  const irHandlersFile = join(artifactDir, "ir", "ir-handlers.json");
  const outputFile = join(outputDir, "proposed-tests.handlers.json");

  await ensureDir(outputDir);

  const gaps = await readJsonFile(gapsFile);
  if (!gaps) {
    console.error("❌ Cannot generate proposed tests without gaps analysis");
    process.exit(1);
  }

  const handlersWithoutTests = gaps.gaps.testCoverage.handlersWithoutTests || [];

  // Load IR handlers so we can map handler name -> plugin
  const irHandlersJson = await readJsonFile(irHandlersFile);
  const irHandlers = irHandlersJson?.handlers || [];
  const handlerPluginMap = new Map();
  for (const h of irHandlers) {
    if (h?.name && h?.plugin && !handlerPluginMap.has(h.name)) {
      handlerPluginMap.set(h.name, h.plugin);
    }
  }
  const testFiles = [];
  const pluginMap = {};

  // Group handlers by plugin and test file pattern
  handlersWithoutTests.forEach(handlerEntry => {
    // Support both string entries and object entries (future-proof)
    let handlerName = typeof handlerEntry === "string" ? handlerEntry : handlerEntry?.name;
    if (!handlerName) return;
    const plugin = typeof handlerEntry === "object" && handlerEntry?.plugin
      ? handlerEntry.plugin
      : handlerPluginMap.get(handlerName) || "unknown";
    const testGroup = (typeof handlerEntry === "object" && handlerEntry?.testGroup) || "handlers";
    const key = `${plugin}:${testGroup}`;

    if (!pluginMap[key]) {
      pluginMap[key] = { plugin, testGroup, handlers: [] };
    }
    pluginMap[key].handlers.push(handlerName);
  });

  // Create test file entries
  Object.values(pluginMap).forEach(group => {
    const testFileName = `${group.testGroup}.handlers.spec.ts`;
    const testPath = `packages/${group.plugin}/__tests__/${testFileName}`;
    
    const tests = [];
    tests.push({ type: "describe", name: `${group.plugin} ${group.testGroup} handlers` });
    group.handlers.forEach(handlerName => {
      tests.push({ type: "it", name: `${handlerName} - happy path` });
      tests.push({ type: "it", name: `${handlerName} - edge case/error handling` });
    });

    testFiles.push({
      path: testPath,
      plugin: group.plugin,
      testGroup: group.testGroup,
      handlers: group.handlers,
      tests,
      testCount: group.handlers.length * 2
    });
  });

  const proposed = {
    timestamp: new Date().toISOString(),
    summary: {
      totalHandlers: handlersWithoutTests.length,
      totalTestFiles: testFiles.length,
      totalTests: testFiles.reduce((sum, f) => sum + f.testCount, 0)
    },
    handlersCount: handlersWithoutTests.length,
    testFiles
  };

  await writeFile(outputFile, JSON.stringify(proposed, null, 2));
  console.log(`✅ Generated: ${outputFile}`);
  console.log(`   📊 Test Files: ${testFiles.length}`);
  console.log(`   📝 Total Tests: ${proposed.summary.totalTests}`);
  console.log(`   🎯 Handlers: ${handlersWithoutTests.length}`);
}

generateProposedTests().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

