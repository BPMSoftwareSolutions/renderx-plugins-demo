#!/usr/bin/env node

/**
 * System Documentation Generator
 * 
 * Generates comprehensive system documentation from:
 * - Catalog manifests (plugins, slots, modules)
 * - Sequences (orchestration flows)
 * - Topics (event system)
 * - Comprehensive audit (test coverage, handlers)
 * - Handler implementations (from IR)
 * 
 * Output:
 * - SYSTEM_ARCHITECTURE.md - High-level architecture overview
 * - PLUGIN_GUIDE.md - Plugin system documentation
 * - ORCHESTRATION_GUIDE.md - Sequence and event documentation
 * - HANDLER_REFERENCE.md - Complete handler reference
 * - TEST_COVERAGE_GUIDE.md - Test coverage analysis
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

async function generateSystemDocumentation() {
  console.log("📚 Generating System Documentation");
  console.log("=" .repeat(60));

  const artifactDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web");
  const docsDir = join(rootDir, "docs", "generated");
  
  await ensureDir(docsDir);

  // Load all data
  const catalogManifest = await readJsonFile(join(artifactDir, "catalog", "catalog-manifest.json"));
  const catalogSeq = await readJsonFile(join(artifactDir, "catalog", "catalog-sequences.json"));
  const catalogTopics = await readJsonFile(join(artifactDir, "catalog", "catalog-topics.json"));
  const catalogComponents = await readJsonFile(join(artifactDir, "catalog", "catalog-components.json"));
  const audit = await readJsonFile(join(artifactDir, "analysis", "comprehensive-audit.json"));
  const irHandlers = await readJsonFile(join(artifactDir, "ir", "ir-handlers.json"));

  // Generate documentation files
  await generateArchitectureDoc(docsDir, catalogManifest, catalogSeq, catalogTopics);
  await generatePluginGuide(docsDir, catalogManifest, audit);
  await generateOrchestrationGuide(docsDir, catalogSeq, catalogTopics);
  await generateHandlerReference(docsDir, irHandlers, audit);
  await generateTestCoverageGuide(docsDir, audit);
  await generateSystemOverview(docsDir, catalogManifest, catalogSeq, catalogTopics, audit);

  console.log(`\n✅ System Documentation Generated`);
  console.log(`📁 Output Directory: ${docsDir.replace(rootDir, "")}`);
  console.log(`\n📄 Generated Files:`);
  console.log(`   - SYSTEM_OVERVIEW.md`);
  console.log(`   - SYSTEM_ARCHITECTURE.md`);
  console.log(`   - PLUGIN_GUIDE.md`);
  console.log(`   - ORCHESTRATION_GUIDE.md`);
  console.log(`   - HANDLER_REFERENCE.md`);
  console.log(`   - TEST_COVERAGE_GUIDE.md`);
}

async function generateSystemOverview(docsDir, manifest, sequences, topics, audit) {
  const content = `# RenderX System Overview

**Generated**: ${new Date().toISOString()}

## Quick Stats

| Metric | Value |
|--------|-------|
| **Plugins** | ${manifest.summary.totalPlugins} |
| **UI Plugins** | ${manifest.summary.uiPlugins} |
| **Runtime Plugins** | ${manifest.summary.runtimePlugins} |
| **Slots** | ${manifest.summary.totalSlots} |
| **Sequences** | ${sequences.summary.totalSequences} |
| **Handlers** | ${sequences.summary.totalHandlers} |
| **Topics** | ${sequences.summary.totalTopics} |
| **Test Files** | ${audit.summary.totalTestFiles} |
| **Total Tests** | ${audit.summary.totalTests} |
| **Test Coverage** | ${audit.summary.testCoveragePercentage}% |

## Architecture Layers

### 1. Plugin System
- **9 Plugins** providing UI and runtime functionality
- **7 UI Plugins** mounted in 6 slots
- **6 Runtime Plugins** for orchestration

### 2. Orchestration Layer
- **54 Sequences** defining system behavior
- **87 Handlers** implementing business logic
- **97 Topics** for event-driven communication

### 3. Test Coverage
- **Public API**: ${audit.summary.sequenceDefinedCoveragePercentage}% coverage (${audit.summary.sequenceDefinedWithTests}/${audit.summary.sequenceDefinedHandlers} handlers)
- **Internal**: ${audit.summary.internalCoveragePercentage}% coverage (${audit.summary.internalHandlersWithTests}/${audit.summary.internalImplementationHandlers} handlers)

## Key Plugins

${manifest.plugins.slice(0, 5).map(p => `- **${p.id}**: ${p.hasUI ? '🎨 UI' : ''} ${p.hasRuntime ? '⚙️ Runtime' : ''}`).join('\n')}

## Next Steps

1. **Architecture**: See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
2. **Plugins**: See [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)
3. **Orchestration**: See [ORCHESTRATION_GUIDE.md](./ORCHESTRATION_GUIDE.md)
4. **Handlers**: See [HANDLER_REFERENCE.md](./HANDLER_REFERENCE.md)
5. **Testing**: See [TEST_COVERAGE_GUIDE.md](./TEST_COVERAGE_GUIDE.md)
`;

  await writeFile(join(docsDir, "SYSTEM_OVERVIEW.md"), content);
  console.log("   ✓ System overview");
}

async function generateArchitectureDoc(docsDir, manifest, sequences, topics) {
  const slotRows = manifest.plugins
    .filter(p => p.ui)
    .map(p => `| ${p.ui.slot} | UI Component | ${p.id} |`)
    .join('\n');

  const content = `# System Architecture

**Generated**: ${new Date().toISOString()}

## Architecture Overview

RenderX is a plugin-based system with orchestrated sequences and event-driven communication.

### Core Components

#### 1. Plugin System
- **Slot-based architecture**: Plugins mount to predefined slots
- **UI Plugins**: React components for user interface
- **Runtime Plugins**: Handlers for business logic
- **Manifest-driven**: All plugins defined in \`plugin-manifest.json\`

#### 2. Orchestration Layer
- **Sequences**: Define workflows as movements with beats
- **Handlers**: Pure functions, I/O operations, or DOM manipulation
- **Topics**: Event channels for inter-plugin communication

#### 3. Event System
- **Topic-based**: Decoupled communication via topics
- **Public Topics**: ${topics.summary.publicTopics} documented topics
- **Plugin-scoped**: Topics organized by plugin

## Plugin Slots

| Slot | Purpose | Plugins |
|------|---------|---------|
${slotRows}

## Sequence Architecture

- **Total Sequences**: ${sequences.summary.totalSequences}
- **Total Handlers**: ${sequences.summary.totalHandlers}
- **Handler Types**: pure, io, stage-crew
- **Timing**: immediate, deferred, async

## Data Flow

\`\`\`
User Action → Event → Topic → Sequence → Handlers → UI Update
\`\`\`

## See Also

- [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) - Plugin system details
- [ORCHESTRATION_GUIDE.md](./ORCHESTRATION_GUIDE.md) - Sequence documentation
`;

  await writeFile(join(docsDir, "SYSTEM_ARCHITECTURE.md"), content);
  console.log("   ✓ Architecture documentation");
}

async function generatePluginGuide(docsDir, manifest, audit) {
  const pluginDetails = manifest.plugins.map(p => {
    const uiInfo = p.ui ? `\n  - **UI**: ${p.ui.module} → ${p.ui.export}` : '';
    const runtimeInfo = p.runtime ? `\n  - **Runtime**: ${p.runtime.module} → ${p.runtime.export}` : '';
    return `### ${p.id}${uiInfo}${runtimeInfo}`;
  }).join('\n\n');

  const slots = [...new Set(manifest.plugins.filter(p => p.ui).map(p => p.ui.slot))].map(slot => `- ${slot}`).join('\n');

  const coverage = audit.pluginAnalysis.map(p => {
    const pct = Math.round((p.handlersWithTests / (p.handlersWithTests + p.handlersWithoutTests)) * 100);
    return `### ${p.name}\n- **Handlers**: ${p.handlers.length}\n- **With Tests**: ${p.handlersWithTests}\n- **Without Tests**: ${p.handlersWithoutTests}\n- **Coverage**: ${pct}%`;
  }).join('\n\n');

  const content = `# Plugin Guide

**Generated**: ${new Date().toISOString()}

## Plugin System Overview

RenderX uses a plugin architecture with:
- **${manifest.summary.totalPlugins} Plugins** total
- **${manifest.summary.uiPlugins} UI Plugins** for user interface
- **${manifest.summary.runtimePlugins} Runtime Plugins** for orchestration

## All Plugins

${pluginDetails}

## Plugin Slots

Plugins mount to these slots:

${slots}

## Test Coverage by Plugin

${coverage}
`;

  await writeFile(join(docsDir, "PLUGIN_GUIDE.md"), content);
  console.log("   ✓ Plugin guide");
}

async function generateOrchestrationGuide(docsDir, sequences, topics) {
  const sampleSeqs = sequences.sequences.slice(0, 5).map(seq => {
    const movements = seq.movements.map(m => `  - ${m.name} (${m.beatCount} beats)`).join('\n');
    return `### ${seq.name}\n${movements}`;
  }).join('\n\n');

  const topicsList = topics.allTopics.map(t => `- **${t.name}**: ${t.notes}`).join('\n');

  const content = `# Orchestration Guide

**Generated**: ${new Date().toISOString()}

## Sequences Overview

- **Total Sequences**: ${sequences.summary.totalSequences}
- **Total Handlers**: ${sequences.summary.totalHandlers}
- **Total Topics**: ${sequences.summary.totalTopics}

## Sequence Structure

Each sequence has:
- **Movements**: Logical groupings of work
- **Beats**: Individual handler invocations
- **Handler Types**: pure, io, stage-crew
- **Timing**: immediate or deferred

## Sample Sequences

${sampleSeqs}

## Event Topics

### Public Topics

${topicsList}

## Handler Types

- **pure**: Pure functions, no side effects
- **io**: I/O operations (API calls, storage)
- **stage-crew**: DOM manipulation and rendering

## See Also

- [HANDLER_REFERENCE.md](./HANDLER_REFERENCE.md) - Handler details
`;

  await writeFile(join(docsDir, "ORCHESTRATION_GUIDE.md"), content);
  console.log("   ✓ Orchestration guide");
}

async function generateHandlerReference(docsDir, handlers, audit) {
  const handlersByPlugin = audit.pluginAnalysis.map(p => {
    const handlerList = p.handlers.slice(0, 10);
    const more = p.handlers.length > 10 ? `... and ${p.handlers.length - 10} more` : '';
    return `### ${p.name}\n${handlerList.map(h => `- ${h}`).join('\n')}\n${more}`;
  }).join('\n\n');

  const untestedList = audit.handlerCoverage.withoutTests.slice(0, 20).map(h => `- **${h.name}** (${h.plugin})`).join('\n');
  const untestedMore = audit.handlerCoverage.withoutTests.length > 20 ? `\n... and ${audit.handlerCoverage.withoutTests.length - 20} more` : '';

  const content = `# Handler Reference

**Generated**: ${new Date().toISOString()}

## Handler Statistics

- **Total Handlers**: ${handlers.summary.totalHandlers}
- **With Tests**: ${audit.summary.handlersWithTests}
- **Without Tests**: ${audit.summary.handlersWithoutTests}
- **Coverage**: ${audit.summary.testCoveragePercentage}%

## Handlers by Plugin

${handlersByPlugin}

## Untested Handlers (Priority)

${untestedList}${untestedMore}

## See Also

- [TEST_COVERAGE_GUIDE.md](./TEST_COVERAGE_GUIDE.md) - Test coverage analysis
`;

  await writeFile(join(docsDir, "HANDLER_REFERENCE.md"), content);
  console.log("   ✓ Handler reference");
}

async function generateTestCoverageGuide(docsDir, audit) {
  const untestedSeqHandlers = audit.handlerCoverage.withoutTests
    .filter(h => audit.summary.sequenceDefinedHandlers > 0)
    .slice(0, 15)
    .map(h => `- ${h.name} (${h.plugin})`)
    .join('\n');

  const coverageByPlugin = audit.pluginAnalysis.map(p => {
    const coverage = p.handlersWithTests + p.handlersWithoutTests > 0
      ? Math.round((p.handlersWithTests / (p.handlersWithTests + p.handlersWithoutTests)) * 100)
      : 0;
    return `- **${p.name}**: ${coverage}% (${p.handlersWithTests}/${p.handlersWithTests + p.handlersWithoutTests})`;
  }).join('\n');

  const content = `# Test Coverage Guide

**Generated**: ${new Date().toISOString()}

## Coverage Overview

| Category | Total | Tested | Untested | Coverage |
|----------|-------|--------|----------|----------|
| **Public API** | ${audit.summary.sequenceDefinedHandlers} | ${audit.summary.sequenceDefinedWithTests} | ${audit.summary.sequenceDefinedWithoutTests} | **${audit.summary.sequenceDefinedCoveragePercentage}%** |
| **Internal** | ${audit.summary.internalImplementationHandlers} | ${audit.summary.internalHandlersWithTests} | ${audit.summary.internalHandlersWithoutTests} | **${audit.summary.internalCoveragePercentage}%** |
| **Overall** | ${audit.summary.totalHandlers} | ${audit.summary.handlersWithTests} | ${audit.summary.handlersWithoutTests} | **${audit.summary.testCoveragePercentage}%** |

## Test Files

- **Total Test Files**: ${audit.summary.totalTestFiles}
- **Total Tests**: ${audit.summary.totalTests}

## Priority: Untested Sequence Handlers

These ${audit.summary.sequenceDefinedWithoutTests} handlers are part of the public API and need tests:

${untestedSeqHandlers}

## Coverage by Plugin

${coverageByPlugin}
`;

  await writeFile(join(docsDir, "TEST_COVERAGE_GUIDE.md"), content);
  console.log("   ✓ Test coverage guide");
}

generateSystemDocumentation().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

