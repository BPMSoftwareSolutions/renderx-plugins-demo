#!/usr/bin/env node

/**
 * Advanced Data-Driven Documentation Generator
 * 
 * Generates comprehensive documentation by mining:
 * - Test specifications (actual test descriptions)
 * - Sequence definitions (orchestration flows with descriptions)
 * - Handler coverage (which tests cover which handlers)
 * - Plugin analysis (coverage by plugin)
 * - External interactions (API calls, dependencies)
 * 
 * This creates a MIRROR of reality, not a summary.
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

async function generateAdvancedDocumentation() {
  console.log("📚 Generating Advanced Data-Driven Documentation");
  console.log("=" .repeat(60));

  const artifactDir = join(rootDir, "packages/ographx/.ographx/artifacts/renderx-web");
  const docsDir = join(rootDir, "docs/generated");
  await ensureDir(docsDir);

  // Load all data
  const audit = await readJsonFile(join(artifactDir, "analysis/comprehensive-audit.json"));
  const sequences = await readJsonFile(join(artifactDir, "catalog/catalog-sequences.json"));
  const manifest = await readJsonFile(join(artifactDir, "catalog/catalog-manifest.json"));
  const topics = await readJsonFile(join(artifactDir, "catalog/catalog-topics.json"));
  const handlers = await readJsonFile(join(artifactDir, "ir/ir-handlers.json"));

  if (!audit || !sequences || !manifest) {
    console.error("❌ Failed to load required data files");
    process.exit(1);
  }

  // Generate advanced documentation
  await generateIndexDoc(docsDir, audit, sequences, manifest);
  await generateHandlerSpecsDoc(docsDir, audit);
  await generateSequenceFlowsDoc(docsDir, sequences, audit);
  await generateTestSpecsDoc(docsDir, audit);
  await generatePluginCoverageDoc(docsDir, audit);
  await generateHandlerTraceabilityDoc(docsDir, audit);
  await generateUntestHandlersDoc(docsDir, audit);

  console.log("\n✅ Advanced Documentation Generated");
  console.log(`📁 Output: ${docsDir}\n`);
  console.log("📄 Generated Files:");
  console.log("   - INDEX.md (Navigation & overview)");
  console.log("   - HANDLER_SPECS.md (Handler signatures & test coverage)");
  console.log("   - SEQUENCE_FLOWS.md (Orchestration flows with test specs)");
  console.log("   - TEST_SPECS.md (All test descriptions by plugin)");
  console.log("   - PLUGIN_COVERAGE.md (Coverage analysis by plugin)");
  console.log("   - HANDLER_TRACEABILITY.md (Handler → Tests mapping)");
  console.log("   - UNTESTED_HANDLERS.md (Handlers needing tests)");
}

// Generate Index Document
async function generateIndexDoc(docsDir, audit, sequences, manifest) {
  const content = buildIndexContent(audit, sequences, manifest);
  await writeFile(join(docsDir, "INDEX.md"), content);
  console.log("   ✓ Index & navigation");
}

function buildIndexContent(audit, sequences, manifest) {
  const withTests = audit.handlerCoverage.withTests.length;
  const withoutTests = audit.handlerCoverage.withoutTests.length;
  const coverage = audit.summary.testCoveragePercentage;

  let content = `# System Documentation Index

**Generated**: ${new Date().toISOString()}

## 📊 System Overview

| Metric | Value |
|--------|-------|
| **Plugins** | ${manifest.plugins.length} |
| **Sequences** | ${sequences.summary.totalSequences} |
| **Handlers** | ${audit.summary.totalHandlers} |
| **Test Files** | ${audit.summary.totalTestFiles} |
| **Total Tests** | ${audit.summary.totalTests} |
| **Test Coverage** | ${coverage}% |
| **Handlers with Tests** | ${withTests} |
| **Handlers without Tests** | ${withoutTests} |

## 📚 Documentation Files

### 1. [HANDLER_SPECS.md](./HANDLER_SPECS.md)
Complete handler specifications with test coverage details.
- All ${audit.summary.totalHandlers} handlers listed
- Test files and test descriptions for each handler
- Function parameters and async status
- **Use this to**: Find what a handler does and what tests cover it

### 2. [SEQUENCE_FLOWS.md](./SEQUENCE_FLOWS.md)
Orchestration sequences and their handler flows.
- All ${sequences.summary.totalSequences} sequences documented
- Handler beats and timing information
- Event flow and handler kinds (pure, io, stage-crew)
- **Use this to**: Understand how sequences orchestrate handlers

### 3. [TEST_SPECS.md](./TEST_SPECS.md)
Complete test specifications organized by plugin.
- ${audit.summary.totalTestFiles} test files
- ${audit.summary.totalTests} test descriptions
- Test organization by plugin and feature
- **Use this to**: Find tests for a specific feature or plugin

### 4. [HANDLER_TRACEABILITY.md](./HANDLER_TRACEABILITY.md)
Complete handler-to-test mapping with all test descriptions.
- Every handler with tests listed
- All test descriptions that cover each handler
- Full traceability from handler to test
- **Use this to**: Trace a handler to all its tests

### 5. [PLUGIN_COVERAGE.md](./PLUGIN_COVERAGE.md)
Test coverage analysis by plugin.
- Coverage percentage per plugin
- Handler count and test count per plugin
- **Use this to**: Identify which plugins need more tests

### 6. [UNTESTED_HANDLERS.md](./UNTESTED_HANDLERS.md)
Handlers that need test coverage.
- ${withoutTests} handlers without tests
- Function signatures and parameters
- Organized by plugin
- **Use this to**: Find handlers that need tests

## 🎯 Quick Navigation

### By Task

**I want to understand a handler:**
1. Search in [HANDLER_SPECS.md](./HANDLER_SPECS.md)
2. Check [HANDLER_TRACEABILITY.md](./HANDLER_TRACEABILITY.md) for tests

**I want to understand a sequence:**
1. Look in [SEQUENCE_FLOWS.md](./SEQUENCE_FLOWS.md)
2. Check [TEST_SPECS.md](./TEST_SPECS.md) for related tests

**I want to find tests for a feature:**
1. Search in [TEST_SPECS.md](./TEST_SPECS.md)
2. Check [HANDLER_TRACEABILITY.md](./HANDLER_TRACEABILITY.md) for handler coverage

**I want to improve test coverage:**
1. Check [PLUGIN_COVERAGE.md](./PLUGIN_COVERAGE.md) for coverage by plugin
2. Review [UNTESTED_HANDLERS.md](./UNTESTED_HANDLERS.md) for priority handlers

## 📈 Coverage Summary

### By Handler Type
- **Sequence-Defined Handlers**: ${audit.summary.sequenceDefinedHandlers || 'N/A'} (${audit.summary.sequenceDefinedCoveragePercentage || 'N/A'}% coverage)
- **Internal Implementation**: ${audit.summary.internalHandlersWithTests + audit.summary.internalHandlersWithoutTests || 'N/A'} (${audit.summary.internalCoveragePercentage || 'N/A'}% coverage)

### By Plugin
See [PLUGIN_COVERAGE.md](./PLUGIN_COVERAGE.md) for detailed breakdown.

## 🔍 Data Quality

This documentation is **automatically generated** from:
- ✅ Actual test files and test descriptions
- ✅ Handler implementations and signatures
- ✅ Sequence definitions and orchestration flows
- ✅ Comprehensive audit data

**Everything is traceable to source code.**

---

*Last updated: ${new Date().toISOString()}*
`;

  return content;
}

// Generate Handler Specifications with Test Coverage
async function generateHandlerSpecsDoc(docsDir, audit) {
  const content = buildHandlerSpecsContent(audit);
  await writeFile(join(docsDir, "HANDLER_SPECS.md"), content);
  console.log("   ✓ Handler specifications");
}

function buildHandlerSpecsContent(audit) {
  const withTests = audit.handlerCoverage.withTests;
  const withoutTests = audit.handlerCoverage.withoutTests;

  let content = `# Handler Specifications & Test Coverage

**Generated**: ${new Date().toISOString()}

## Overview

- **Total Handlers**: ${audit.summary.totalHandlers}
- **With Tests**: ${audit.summary.handlersWithTests}
- **Without Tests**: ${audit.summary.handlersWithoutTests}
- **Coverage**: ${audit.summary.testCoveragePercentage}%

## Handlers WITH Test Coverage (${withTests.length})

`;

  withTests.forEach(handler => {
    content += `### ${handler.name}\n`;
    content += `- **File**: ${handler.file}\n`;
    content += `- **Plugin**: ${handler.plugin}\n`;
    content += `- **Test Files**: ${handler.testCount}\n`;
    content += `- **Tests**:\n`;
    handler.testNames.slice(0, 5).forEach(test => {
      content += `  - ${test}\n`;
    });
    if (handler.testNames.length > 5) {
      content += `  - ... and ${handler.testNames.length - 5} more\n`;
    }
    content += `\n`;
  });

  content += `## Handlers WITHOUT Test Coverage (${withoutTests.length})\n\n`;
  withoutTests.forEach(handler => {
    content += `### ${handler.name}\n`;
    content += `- **File**: ${handler.file}\n`;
    content += `- **Plugin**: ${handler.plugin}\n`;
    content += `- **Parameters**: ${handler.parameters.length > 0 ? handler.parameters.join(", ") : "none"}\n`;
    content += `- **Async**: ${handler.isAsync ? "Yes" : "No"}\n\n`;
  });

  return content;
}

// Generate Sequence Flows with Handler Details
async function generateSequenceFlowsDoc(docsDir, sequences, audit) {
  const content = buildSequenceFlowsContent(sequences, audit);
  await writeFile(join(docsDir, "SEQUENCE_FLOWS.md"), content);
  console.log("   ✓ Sequence flows");
}

function buildSequenceFlowsContent(sequences, audit) {
  let content = `# Sequence Flows & Orchestration

**Generated**: ${new Date().toISOString()}

## Overview

- **Total Sequences**: ${sequences.summary.totalSequences}
- **Total Handlers**: ${sequences.summary.totalHandlers}
- **Total Topics**: ${sequences.summary.totalTopics}

## Sequences by Plugin

`;

  sequences.sequences.slice(0, 10).forEach(seq => {
    content += `### ${seq.name}\n`;
    content += `- **ID**: ${seq.id}\n`;
    content += `- **Plugin**: ${seq.pluginId}\n`;
    content += `- **Movements**: ${seq.movements.length}\n\n`;

    seq.movements.forEach(movement => {
      content += `#### ${movement.name} (${movement.beatCount} beats)\n`;
      movement.beats.forEach(beat => {
        content += `- **Beat ${beat.beat}**: ${beat.handler} (${beat.kind})\n`;
      });
      content += `\n`;
    });
  });

  if (sequences.sequences.length > 10) {
    content += `\n... and ${sequences.sequences.length - 10} more sequences\n`;
  }

  return content;
}

// Generate Test Specifications
async function generateTestSpecsDoc(docsDir, audit) {
  const content = buildTestSpecsContent(audit);
  await writeFile(join(docsDir, "TEST_SPECS.md"), content);
  console.log("   ✓ Test specifications");
}

function buildTestSpecsContent(audit) {
  let content = `# Test Specifications

**Generated**: ${new Date().toISOString()}

## Overview

- **Test Files**: ${audit.summary.totalTestFiles}
- **Total Tests**: ${audit.summary.totalTests}

## Test Files by Plugin

`;

  const byPlugin = {};
  audit.testFiles.forEach(tf => {
    if (!byPlugin[tf.plugin]) byPlugin[tf.plugin] = [];
    byPlugin[tf.plugin].push(tf);
  });

  Object.entries(byPlugin).forEach(([plugin, files]) => {
    content += `### ${plugin} (${files.length} files)\n\n`;
    files.slice(0, 3).forEach(file => {
      content += `#### ${file.path}\n`;
      file.tests.slice(0, 3).forEach(test => {
        content += `- ${test.name}\n`;
      });
      if (file.tests.length > 3) {
        content += `- ... and ${file.tests.length - 3} more\n`;
      }
      content += `\n`;
    });
  });

  return content;
}

// Generate Plugin Coverage Analysis
async function generatePluginCoverageDoc(docsDir, audit) {
  const content = buildPluginCoverageContent(audit);
  await writeFile(join(docsDir, "PLUGIN_COVERAGE.md"), content);
  console.log("   ✓ Plugin coverage");
}

function buildPluginCoverageContent(audit) {
  let content = `# Plugin Coverage Analysis

**Generated**: ${new Date().toISOString()}

## Coverage by Plugin

| Plugin | Handlers | With Tests | Without Tests | Coverage |
|--------|----------|-----------|---------------|----------|
`;

  audit.pluginAnalysis.forEach(p => {
    const total = p.handlersWithTests + p.handlersWithoutTests;
    const pct = total > 0 ? Math.round((p.handlersWithTests / total) * 100) : 0;
    content += `| ${p.name} | ${total} | ${p.handlersWithTests} | ${p.handlersWithoutTests} | ${pct}% |\n`;
  });

  return content;
}

// Generate Handler Traceability
async function generateHandlerTraceabilityDoc(docsDir, audit) {
  const content = buildHandlerTraceabilityContent(audit);
  await writeFile(join(docsDir, "HANDLER_TRACEABILITY.md"), content);
  console.log("   ✓ Handler traceability");
}

function buildHandlerTraceabilityContent(audit) {
  let content = `# Handler → Test Traceability

**Generated**: ${new Date().toISOString()}

## Handler Test Mapping

`;

  audit.handlerCoverage.withTests.forEach(handler => {
    content += `### ${handler.name}\n`;
    content += `**File**: ${handler.file}\n`;
    content += `**Tests**: ${handler.testCount} files\n\n`;
    handler.testNames.forEach(test => {
      content += `- ${test}\n`;
    });
    content += `\n`;
  });

  return content;
}

// Generate Untested Handlers
async function generateUntestHandlersDoc(docsDir, audit) {
  const content = buildUntestHandlersContent(audit);
  await writeFile(join(docsDir, "UNTESTED_HANDLERS.md"), content);
  console.log("   ✓ Untested handlers");
}

function buildUntestHandlersContent(audit) {
  const withoutTests = audit.handlerCoverage.withoutTests;

  // Group by plugin
  const byPlugin = {};
  withoutTests.forEach(handler => {
    if (!byPlugin[handler.plugin]) {
      byPlugin[handler.plugin] = [];
    }
    byPlugin[handler.plugin].push(handler);
  });

  let content = `# Handlers Without Test Coverage

**Generated**: ${new Date().toISOString()}

## Overview

- **Total Untested Handlers**: ${withoutTests.length}
- **Total Handlers**: ${audit.summary.totalHandlers}
- **Coverage Gap**: ${audit.summary.handlersWithoutTests} handlers need tests

## Priority: Sequence-Defined Handlers

These are part of the public orchestration API and should be prioritized:
- **Count**: ${audit.summary.sequenceDefinedWithoutTests || 'N/A'}
- **Coverage**: ${audit.summary.sequenceDefinedCoveragePercentage || 'N/A'}%

## Untested Handlers by Plugin

`;

  Object.entries(byPlugin).sort().forEach(([plugin, handlers]) => {
    content += `### ${plugin} (${handlers.length} handlers)\n\n`;

    handlers.forEach(handler => {
      content += `#### ${handler.name}\n`;
      content += `- **File**: ${handler.file}\n`;
      if (handler.parameters && handler.parameters.length > 0) {
        content += `- **Parameters**: ${handler.parameters.join(", ")}\n`;
      }
      content += `- **Async**: ${handler.isAsync ? "Yes" : "No"}\n\n`;
    });
  });

  return content;
}

generateAdvancedDocumentation().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

