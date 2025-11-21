#!/usr/bin/env node

/**
 * External Interactions Audit Generator
 *
 * Consolidates and validates the end-to-end interaction surface:
 *  - Component interaction events (catalog-components.json interactionMap)
 *  - Sequences (catalog-sequences.json) and their beats (handlers + events)
 *  - Pub/Sub topics (catalog-topics.json)
 *  - Implemented handlers (ir-handlers.json)
 *  - Implemented sequences (ir-sequences.json)
 *  - Tests referencing handlers (ir-handler-tests.json)
 *
 * Produces:
 *  - external-interactions-audit.json containing an interaction edge matrix
 *  - Summary coverage & gap counts (missing sequences, handlers, topics)
 *  - Orphans (unused topics, unused handlers)
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

async function readJson(path) {
  try {
    const content = await readFile(path, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return null; // Graceful: missing artifact treated as absent
  }
}

function buildLookupBy(list, key) {
  const map = new Map();
  (list || []).forEach(item => {
    if (item && item[key] != null) {
      map.set(item[key], item);
    }
  });
  return map;
}

function collectBeatDetails(sequence) {
  const beats = [];
  sequence.movements?.forEach(m => {
    m.beats?.forEach(b => {
      beats.push({
        movementId: m.id,
        movementName: m.name,
        beat: b.beat,
        event: b.event,
        handler: b.handler,
        kind: b.kind || null,
        timing: b.timing || null
      });
    });
  });
  return beats;
}

async function generateExternalInteractionsAudit() {
  console.log("🔗 Generating External Interactions Audit");
  console.log("=".repeat(60));

  const artifactBase = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web");
  const catalogDir = join(artifactBase, "catalog");
  const irDir = join(artifactBase, "ir");
  const analysisDir = join(artifactBase, "analysis");
  const outputFile = join(analysisDir, "external-interactions-audit.json");

  await ensureDir(analysisDir);

  // Load artifacts (catalog)
  const catalogComponents = await readJson(join(catalogDir, "catalog-components.json"));
  const catalogSequences = await readJson(join(catalogDir, "catalog-sequences.json"));
  const catalogTopics = await readJson(join(catalogDir, "catalog-topics.json"));

  // Load artifacts (IR)
  const irHandlers = await readJson(join(irDir, "ir-handlers.json"));
  const irSequences = await readJson(join(irDir, "ir-sequences.json"));
  const irHandlerTests = await readJson(join(irDir, "ir-handler-tests.json"));

  if (!catalogComponents || !catalogSequences || !catalogTopics) {
    console.error("❌ Missing required catalog artifacts (components/sequences/topics). Run Phase 1 scripts first.");
    process.exit(1);
  }
  if (!irHandlers || !irSequences || !irHandlerTests) {
    console.error("❌ Missing required IR artifacts (handlers/sequences/tests). Run Phase 2 scripts first.");
    process.exit(1);
  }

  // Build lookups
  const sequenceById = buildLookupBy(catalogSequences.sequences || [], "id");
  const irSequenceFiles = new Set((irSequences.sequences || []).map(s => s.name)); // Names only; sequence id may differ
  const handlerNames = new Set((irHandlers.handlers || []).map(h => h.name));
  const topicNames = new Set((catalogTopics.allTopics || []).map(t => t.name));
  const handlerTestMap = irHandlerTests.handlerTestMap || {};

  // Component interaction map: { eventName: [ { component, pluginId, sequenceId } ] }
  const interactionMap = catalogComponents.interactionMap || {};

  const edges = [];
  const missing = { sequences: new Set(), handlers: new Set(), topics: new Set(), pluginOwnership: new Set() };
  const pluginMismatches = [];
  const referencedHandlers = new Set();
  const referencedTopics = new Set();

  // For each interaction event -> list of link entries
  Object.entries(interactionMap).forEach(([eventName, links]) => {
    links.forEach(link => {
      const { component, pluginId, sequenceId } = link;
      const seq = sequenceById.get(sequenceId);
      const sequenceImplemented = !!seq;
      const pluginOwnershipValid = sequenceImplemented ? (seq.pluginId === pluginId) : false;
      if (sequenceImplemented && !pluginOwnershipValid) {
        pluginMismatches.push({ sequenceId, declaredPlugin: seq.pluginId, interactionPlugin: pluginId });
        missing.pluginOwnership.add(sequenceId);
      }
      if (!sequenceImplemented) {
        missing.sequences.add(sequenceId);
      }

      // If sequence exists, enumerate beats; else produce a placeholder edge
      const beats = sequenceImplemented ? collectBeatDetails(seq) : [];

      if (beats.length === 0) {
        // Produce one edge entry to reflect missing or empty sequence state
        edges.push({
          componentEvent: eventName,
          componentType: component,
            pluginId,
          sequenceId,
          sequenceName: seq?.name || null,
          movementId: null,
          movementName: null,
          beatIndex: null,
          handler: null,
          handlerExists: false,
          topic: null,
          topicExists: false,
          sequenceImplemented,
          pluginOwnershipValid,
          tests: { count: 0, files: [] }
        });
      } else {
        beats.forEach((beat, idx) => {
          const handler = beat.handler || null;
          const topic = beat.event || null;
          const handlerExists = handler ? handlerNames.has(handler) : false;
          const topicExists = topic ? topicNames.has(topic) || interactionMap[topic] != null : false; // consider component event reuse
          if (handler && !handlerExists) missing.handlers.add(handler);
          if (topic && !topicExists) missing.topics.add(topic);
          if (handlerExists) referencedHandlers.add(handler);
          if (topicExists && topic) referencedTopics.add(topic);

          const testsForHandler = handler && handlerTestMap[handler] ? handlerTestMap[handler] : [];
          edges.push({
            componentEvent: eventName,
            componentType: component,
            pluginId,
            sequenceId,
            sequenceName: seq?.name || null,
            movementId: beat.movementId || null,
            movementName: beat.movementName || null,
            beatIndex: idx,
            handler,
            handlerExists,
            topic,
            topicExists,
            sequenceImplemented,
            pluginOwnershipValid,
            tests: {
              count: testsForHandler.reduce((sum, t) => sum + (t.testCount || 0), 0),
              files: testsForHandler.map(t => t.testFile)
            }
          });
        });
      }
    });
  });

  // Orphans: topics declared but never referenced; handlers implemented but never referenced
  const orphanTopics = Array.from(topicNames).filter(t => !referencedTopics.has(t));
  const orphanHandlers = Array.from(handlerNames).filter(h => !referencedHandlers.has(h));

  const audit = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "External Interactions Audit",
      version: "1.0",
      sources: {
        catalogComponents: !!catalogComponents,
        catalogSequences: !!catalogSequences,
        catalogTopics: !!catalogTopics,
        irHandlers: !!irHandlers,
        irSequences: !!irSequences,
        irHandlerTests: !!irHandlerTests
      }
    },
    summary: {
      interactionEvents: Object.keys(interactionMap).length,
      interactionEdges: edges.length,
      sequencesReferenced: new Set(edges.map(e => e.sequenceId).filter(Boolean)).size,
      missingSequences: missing.sequences.size,
      missingHandlers: missing.handlers.size,
      missingTopics: missing.topics.size,
      orphanTopics: orphanTopics.length,
      orphanHandlers: orphanHandlers.length,
      pluginOwnershipMismatches: pluginMismatches.length,
      handlerCoverageInEdges: referencedHandlers.size > 0 ? Math.round((referencedHandlers.size / handlerNames.size) * 100) : 0,
      topicCoverageInEdges: referencedTopics.size > 0 ? Math.round((referencedTopics.size / topicNames.size) * 100) : 0
    },
    edges,
    gaps: {
      missingSequences: Array.from(missing.sequences).sort(),
      missingHandlers: Array.from(missing.handlers).sort(),
      missingTopics: Array.from(missing.topics).sort(),
      pluginOwnership: pluginMismatches
    },
    orphans: {
      topics: orphanTopics.sort(),
      handlers: orphanHandlers.sort()
    },
    coverage: {
      handlerReferencedCount: referencedHandlers.size,
      handlerTotal: handlerNames.size,
      topicReferencedCount: referencedTopics.size,
      topicTotal: topicNames.size
    }
  };

  await writeFile(outputFile, JSON.stringify(audit, null, 2));
  console.log("\n" + "=".repeat(60));
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log("📊 Summary:");
  console.log(`   Interaction Events: ${audit.summary.interactionEvents}`);
  console.log(`   Interaction Edges: ${audit.summary.interactionEdges}`);
  console.log(`   Missing Sequences: ${audit.summary.missingSequences}`);
  console.log(`   Missing Handlers: ${audit.summary.missingHandlers}`);
  console.log(`   Missing Topics: ${audit.summary.missingTopics}`);
  console.log(`   Plugin Ownership Mismatches: ${audit.summary.pluginOwnershipMismatches}`);
  console.log(`   Orphan Topics: ${audit.summary.orphanTopics}`);
  console.log(`   Orphan Handlers: ${audit.summary.orphanHandlers}`);
  console.log(`   Handler Edge Coverage: ${audit.summary.handlerCoverageInEdges}%`);
  console.log(`   Topic Edge Coverage: ${audit.summary.topicCoverageInEdges}%`);
  console.log("✅ External Interactions Audit Complete");
}

generateExternalInteractionsAudit().catch(err => {
  console.error("❌ Error generating external interactions audit:", err);
  process.exit(1);
});
