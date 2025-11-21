#!/usr/bin/env node

/**
 * Phase 3: Compare Catalog vs IR
 * 
 * Compares Phase 1 (Catalog) with Phase 2 (IR) to identify gaps
 * - catalog-sequences.json vs ir-sequences.json
 * - catalog-topics.json vs ir-topics.json
 * - catalog-manifest.json vs ir-manifest.json
 * - catalog-components.json vs ir-components.json
 * - catalog handlers vs ir-handlers.json
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

async function compareGaps() {
  console.log("📊 Phase 3: Comparing Catalog vs IR");
  console.log("=" .repeat(60));

  const artifactDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web");
  const catalogDir = join(artifactDir, "catalog");
  const irDir = join(artifactDir, "ir");
  const outputDir = join(artifactDir, "analysis");
  const outputFile = join(outputDir, "catalog-vs-ir-gaps.json");

  await ensureDir(outputDir);

  // Load all artifacts
  const catalogSeq = await readJsonFile(join(catalogDir, "catalog-sequences.json"));
  const catalogTopics = await readJsonFile(join(catalogDir, "catalog-topics.json"));
  const catalogManifest = await readJsonFile(join(catalogDir, "catalog-manifest.json"));
  const catalogComponents = await readJsonFile(join(catalogDir, "catalog-components.json"));

  const irHandlers = await readJsonFile(join(irDir, "ir-handlers.json"));
  const irSequences = await readJsonFile(join(irDir, "ir-sequences.json"));
  const irHandlerTests = await readJsonFile(join(irDir, "ir-handler-tests.json"));

  // Extract handler names from catalog (from sequences)
  const catalogHandlerNames = new Set();
  catalogSeq.handlers?.forEach(h => catalogHandlerNames.add(h));

  // Extract handler names from IR
  const irHandlerNames = new Set();
  irHandlers.handlers?.forEach(h => irHandlerNames.add(h.name));

  // Find gaps
  const missingHandlers = Array.from(catalogHandlerNames).filter(h => !irHandlerNames.has(h));
  const extraHandlers = Array.from(irHandlerNames).filter(h => !catalogHandlerNames.has(h));

  // Find handlers without tests
  const handlerTestMap = irHandlerTests?.handlerTestMap || {};
  const handlersWithoutTests = Array.from(irHandlerNames).filter(h => !handlerTestMap[h]);
  const handlersWithTests = Array.from(irHandlerNames).filter(h => handlerTestMap[h]);

  const gaps = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "Phase 3: Gap Analysis",
      catalogDir,
      irDir
    },
    summary: {
      catalogSequences: catalogSeq.summary?.totalSequences || 0,
      irSequences: irSequences.summary?.totalSequences || 0,
      catalogHandlers: catalogSeq.summary?.totalHandlers || 0,
      irHandlers: irHandlers.summary?.totalHandlers || 0,
      catalogTopics: catalogTopics.summary?.totalTopics || 0,
      catalogComponents: catalogComponents.summary?.totalComponents || 0,
      catalogPlugins: catalogManifest.summary?.totalPlugins || 0,
      testFiles: irHandlerTests?.summary?.totalTestFiles || 0,
      totalTests: irHandlerTests?.summary?.totalTests || 0,
      handlersWithTests: handlersWithTests.length,
      handlersWithoutTests: handlersWithoutTests.length,
      testCoverage: handlersWithTests.length > 0 ? Math.round((handlersWithTests.length / irHandlerNames.size) * 100) : 0
    },
    gaps: {
      handlers: {
        missing: missingHandlers,
        extra: extraHandlers,
        missingCount: missingHandlers.length,
        extraCount: extraHandlers.length
      },
      testCoverage: {
        handlersWithTests: handlersWithTests,
        handlersWithoutTests: handlersWithoutTests,
        withTestsCount: handlersWithTests.length,
        withoutTestsCount: handlersWithoutTests.length,
        coveragePercentage: Math.round((handlersWithTests.length / irHandlerNames.size) * 100)
      },
      sequences: {
        catalogCount: catalogSeq.summary?.totalSequences || 0,
        irCount: irSequences.summary?.totalSequences || 0,
        note: "Sequences are declarative (JSON), not in source code - this is expected"
      }
    },
    status: {
      handlersMatch: missingHandlers.length === 0 && extraHandlers.length === 0,
      sequencesExpected: irSequences.summary?.totalSequences === 0,
      testCoverageGood: Math.round((handlersWithTests.length / irHandlerNames.size) * 100) >= 80,
      allGood: missingHandlers.length === 0 && irSequences.summary?.totalSequences === 0 && Math.round((handlersWithTests.length / irHandlerNames.size) * 100) >= 80
    }
  };

  // Write output
  await writeFile(outputFile, JSON.stringify(gaps, null, 2));
  console.log("\n" + "=" .repeat(60));
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log(`\n📊 Comparison Summary:`);
  console.log(`   Catalog Sequences: ${gaps.summary.catalogSequences}`);
  console.log(`   IR Sequences: ${gaps.summary.irSequences}`);
  console.log(`   Catalog Handlers: ${gaps.summary.catalogHandlers}`);
  console.log(`   IR Handlers: ${gaps.summary.irHandlers}`);
  console.log(`   Catalog Topics: ${gaps.summary.catalogTopics}`);
  console.log(`   Catalog Components: ${gaps.summary.catalogComponents}`);
  console.log(`   Catalog Plugins: ${gaps.summary.catalogPlugins}`);
  
  console.log(`\n🔍 Handler Gaps:`);
  console.log(`   Missing: ${gaps.gaps.handlers.missingCount}`);
  console.log(`   Extra: ${gaps.gaps.handlers.extraCount}`);
  
  if (missingHandlers.length > 0) {
    console.log(`\n❌ Missing Handlers:`);
    missingHandlers.forEach(h => console.log(`   - ${h}`));
  }
  
  if (extraHandlers.length > 0) {
    console.log(`\n⚠️  Extra Handlers (not in catalog):`);
    extraHandlers.slice(0, 10).forEach(h => console.log(`   - ${h}`));
    if (extraHandlers.length > 10) {
      console.log(`   ... and ${extraHandlers.length - 10} more`);
    }
  }
  
  console.log(`\n📋 Test Coverage:`);
  console.log(`   Test Files: ${gaps.summary.testFiles}`);
  console.log(`   Total Tests: ${gaps.summary.totalTests}`);
  console.log(`   Handlers with Tests: ${gaps.summary.handlersWithTests}`);
  console.log(`   Handlers without Tests: ${gaps.summary.handlersWithoutTests}`);
  console.log(`   Coverage: ${gaps.summary.testCoverage}%`);

  if (handlersWithoutTests.length > 0) {
    console.log(`\n⚠️  Handlers without Tests (first 10):`);
    handlersWithoutTests.slice(0, 10).forEach(h => console.log(`   - ${h}`));
    if (handlersWithoutTests.length > 10) {
      console.log(`   ... and ${handlersWithoutTests.length - 10} more`);
    }
  }

  console.log(`\n✅ Phase 3 Complete: Gap Analysis Generated`);
}

compareGaps().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

