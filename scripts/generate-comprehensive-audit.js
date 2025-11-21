#!/usr/bin/env node

/**
 * Comprehensive Audit Report Generator
 * 
 * Generates a complete, traceable audit with:
 * - All test files with paths
 * - All tests with descriptions
 * - Handler-to-test mappings
 * - Coverage analysis by plugin
 * - Gap analysis with full details
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

async function generateComprehensiveAudit() {
  console.log("📋 Generating Comprehensive Audit Report");
  console.log("=" .repeat(60));

  const artifactDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web");
  const outputDir = join(artifactDir, "analysis");
  const outputFile = join(outputDir, "comprehensive-audit.json");

  await ensureDir(outputDir);

  // Load all data
  const irHandlers = await readJsonFile(join(artifactDir, "ir", "ir-handlers.json"));
  const irTests = await readJsonFile(join(artifactDir, "ir", "ir-handler-tests.json"));
  const catalogSeq = await readJsonFile(join(artifactDir, "catalog", "catalog-sequences.json"));
  const catalogTopics = await readJsonFile(join(artifactDir, "catalog", "catalog-topics.json"));
  const catalogManifest = await readJsonFile(join(artifactDir, "catalog", "catalog-manifest.json"));
  const catalogComponents = await readJsonFile(join(artifactDir, "catalog", "catalog-components.json"));
  const gaps = await readJsonFile(join(outputDir, "catalog-vs-ir-gaps.json"));
  const externalInteractions = await readJsonFile(join(outputDir, "external-interactions-audit.json"));

  // Build comprehensive audit
  const audit = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "Comprehensive Audit Report",
      version: "1.0"
    },
    
    summary: {
      totalTestFiles: irTests.summary.totalTestFiles,
      totalTests: irTests.summary.totalTests,
      totalHandlers: irHandlers.summary.totalHandlers,
      handlersWithTests: gaps.summary.handlersWithTests,
      handlersWithoutTests: gaps.summary.handlersWithoutTests,
      testCoveragePercentage: gaps.summary.testCoverage,
      catalogHandlers: gaps.summary.catalogHandlers,
      missingHandlers: gaps.gaps.handlers.missingCount,
      extraHandlers: gaps.gaps.handlers.extraCount
    },

    testFiles: irTests.testFiles.map(tf => ({
      path: tf.file,
      plugin: tf.plugin,
      testCount: tf.testCount,
      tests: tf.tests,
      handlerReferences: tf.handlerReferences
    })),

    handlerCoverage: {
      withTests: gaps.gaps.testCoverage.handlersWithTests.map(name => {
        const handler = irHandlers.handlers.find(h => h.name === name);
        const tests = irTests.handlerTestMap[name] || [];
        return {
          name,
          file: handler?.file,
          plugin: handler?.plugin,
          testCount: tests.length,
          testFiles: tests.map(t => t.testFile),
          testNames: tests.flatMap(t => t.testNames)
        };
      }),
      
      withoutTests: gaps.gaps.testCoverage.handlersWithoutTests.map(name => {
        const handler = irHandlers.handlers.find(h => h.name === name);
        return {
          name,
          file: handler?.file,
          plugin: handler?.plugin,
          parameters: handler?.parameters || [],
          isAsync: handler?.isAsync || false
        };
      })
    },

    pluginAnalysis: buildPluginAnalysis(irHandlers, irTests, gaps),

    missingHandlers: gaps.gaps.handlers.missing.map(name => ({
      name,
      status: "MISSING_FROM_SOURCE",
      requiredBy: catalogSeq.handlers?.includes(name) ? "catalog" : "unknown"
    })),

    extraHandlers: gaps.gaps.handlers.extra.map(name => {
      const handler = irHandlers.handlers.find(h => h.name === name);
      return {
        name,
        file: handler?.file,
        plugin: handler?.plugin,
        status: "NOT_IN_CATALOG",
        likelyPurpose: classifyHandler(name)
      };
    }),

    catalogData: {
      sequences: catalogSeq.summary,
      topics: catalogTopics.summary,
      components: catalogComponents.summary,
      plugins: catalogManifest.summary,
      externalInteractions: externalInteractions ? externalInteractions.summary : null
    }
  };

  if (externalInteractions) {
    audit.summary.externalInteractionEdges = externalInteractions.summary.interactionEdges;
    audit.summary.externalMissingHandlers = externalInteractions.summary.missingHandlers;
    audit.summary.externalMissingSequences = externalInteractions.summary.missingSequences;
    audit.summary.externalMissingTopics = externalInteractions.summary.missingTopics;
    audit.summary.externalOrphanHandlers = externalInteractions.summary.orphanHandlers;
    audit.summary.externalOrphanTopics = externalInteractions.summary.orphanTopics;
    audit.summary.externalHandlerEdgeCoverage = externalInteractions.summary.handlerCoverageInEdges;
    audit.summary.externalTopicEdgeCoverage = externalInteractions.summary.topicCoverageInEdges;
  }

  await writeFile(outputFile, JSON.stringify(audit, null, 2));
  console.log(`\n✅ Comprehensive Audit Generated`);
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log(`\n📊 Audit Contents:`);
  console.log(`   - Test Files: ${audit.summary.totalTestFiles}`);
  console.log(`   - Total Tests: ${audit.summary.totalTests}`);
  console.log(`   - Handlers: ${audit.summary.totalHandlers}`);
  console.log(`   - Coverage: ${audit.summary.testCoveragePercentage}%`);
  console.log(`   - Handlers with Tests: ${audit.summary.handlersWithTests}`);
  console.log(`   - Handlers without Tests: ${audit.summary.handlersWithoutTests}`);
  console.log(`   - Missing Handlers: ${audit.summary.missingHandlers}`);
  console.log(`   - Extra Handlers: ${audit.summary.extraHandlers}`);
}

function buildPluginAnalysis(irHandlers, irTests, gaps) {
  const plugins = {};
  
  irHandlers.handlers.forEach(handler => {
    const plugin = handler.plugin;
    if (!plugins[plugin]) {
      plugins[plugin] = {
        name: plugin,
        handlers: [],
        testFiles: [],
        totalTests: 0,
        handlersWithTests: 0,
        handlersWithoutTests: 0
      };
    }
    
    plugins[plugin].handlers.push(handler.name);
    
    const hasTests = gaps.gaps.testCoverage.handlersWithTests.includes(handler.name);
    if (hasTests) {
      plugins[plugin].handlersWithTests++;
    } else {
      plugins[plugin].handlersWithoutTests++;
    }
  });

  irTests.testFiles.forEach(tf => {
    const plugin = tf.plugin;
    if (plugins[plugin]) {
      plugins[plugin].testFiles.push(tf.file);
      plugins[plugin].totalTests += tf.testCount;
    }
  });

  return Object.values(plugins);
}

function classifyHandler(name) {
  if (name.includes("ensure") || name.includes("create") || name.includes("get")) return "helper/utility";
  if (name.includes("inject") || name.includes("apply") || name.includes("compute")) return "DOM/style manipulation";
  if (name.includes("attach") || name.includes("resolve")) return "event/interaction handler";
  if (name.includes("render") || name.includes("cleanup")) return "React/rendering";
  return "internal";
}

generateComprehensiveAudit().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

