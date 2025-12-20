#!/usr/bin/env node

/**
 * Build Logger Utility
 *
 * Provides centralized logging for build process telemetry.
 * Logs all catalog processing operations to build.log with details about:
 * - Source location (where JSON came from)
 * - Destination location (where it's being allocated for app use)
 * - Processing stage and context
 */

import { promises as fs } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const BUILD_LOG_PATH = join(rootDir, 'build.log');

let isInitialized = false;
let buildStats = {
  sequences: { files: 0, packages: 0 },
  components: { files: 0, packages: 0 },
  topics: { derived: 0, sequences: 0, catalogs: 0, bySource: {} },
  interactions: { derived: 0, sequences: 0 },
  plugins: { discovered: 0, total: 0 }
};

/**
 * Initialize the build logger
 * Clears any existing build.log and prepares for new build session
 * If the log already exists and has stats, preserve them
 */
export async function initBuildLogger() {
  if (isInitialized) return;

  // Try to read existing stats from the log file
  try {
    const existing = await fs.readFile(BUILD_LOG_PATH, 'utf-8');
    // Extract stats from existing executive summary if present
    const seqFilesMatch = existing.match(/Total Files Synced:\s+(\d+)/);
    const seqPkgsMatch = existing.match(/Source Packages:\s+(\d+)/);
    const compFilesMatch = existing.match(/COMPONENTS:\s+Total Files Synced:\s+(\d+)/);
    const compPkgsMatch = existing.match(/COMPONENTS:.*?Source Packages:\s+(\d+)/s);
    const topicsDerivedMatch = existing.match(/Total Topics Derived:\s+(\d+)/);
    const topicsSeqMatch = existing.match(/Source Sequences Processed:\s+(\d+)/);
    const topicsCatMatch = existing.match(/Source Topic Catalogs:\s+(\d+)/);
    const topicsExplicitMatch = existing.match(/Explicit json-topics catalog:\s+(\d+)/);
    const topicsSequenceMatch = existing.match(/Sequence file auto-derived:\s+(\d+)/);
    const topicsLifecycleMatch = existing.match(/Lifecycle auto-generated:\s+(\d+)/);
    const topicsBeatMatch = existing.match(/Beat events:\s+(\d+)/);
    const interactionsDerivedMatch = existing.match(/INTERACTIONS:.*?Total Interactions Derived:\s+(\d+)/s);
    const interactionsSeqMatch = existing.match(/INTERACTIONS:.*?Source Sequences Processed:\s+(\d+)/s);
    const pluginsDiscoveredMatch = existing.match(/Total Plugins Discovered:\s+(\d+)/);
    const pluginsTotalMatch = existing.match(/Total Plugins in Manifest:\s+(\d+)/);

    if (seqFilesMatch) buildStats.sequences.files = parseInt(seqFilesMatch[1], 10);
    if (seqPkgsMatch) buildStats.sequences.packages = parseInt(seqPkgsMatch[1], 10);
    if (compFilesMatch) buildStats.components.files = parseInt(compFilesMatch[1], 10);
    if (compPkgsMatch) buildStats.components.packages = parseInt(compPkgsMatch[1], 10);
    if (topicsDerivedMatch) buildStats.topics.derived = parseInt(topicsDerivedMatch[1], 10);
    if (topicsSeqMatch) buildStats.topics.sequences = parseInt(topicsSeqMatch[1], 10);
    if (topicsCatMatch) buildStats.topics.catalogs = parseInt(topicsCatMatch[1], 10);
    if (topicsExplicitMatch) buildStats.topics.bySource['explicit-json-topics-catalog'] = parseInt(topicsExplicitMatch[1], 10);
    if (topicsSequenceMatch) buildStats.topics.bySource['sequence-file'] = parseInt(topicsSequenceMatch[1], 10);
    if (topicsLifecycleMatch) buildStats.topics.bySource['lifecycle-auto-generated'] = parseInt(topicsLifecycleMatch[1], 10);
    if (topicsBeatMatch) buildStats.topics.bySource['beat-event'] = parseInt(topicsBeatMatch[1], 10);
    if (interactionsDerivedMatch) buildStats.interactions.derived = parseInt(interactionsDerivedMatch[1], 10);
    if (interactionsSeqMatch) buildStats.interactions.sequences = parseInt(interactionsSeqMatch[1], 10);
    if (pluginsDiscoveredMatch) buildStats.plugins.discovered = parseInt(pluginsDiscoveredMatch[1], 10);
    if (pluginsTotalMatch) buildStats.plugins.total = parseInt(pluginsTotalMatch[1], 10);

    isInitialized = true;
    return; // Log already exists with stats
  } catch {
    // File doesn't exist, create new
  }

  const timestamp = new Date().toISOString();
  const header = `
${'='.repeat(80)}
BUILD CATALOG TELEMETRY LOG
Started: ${timestamp}
${'='.repeat(80)}

EXECUTIVE SUMMARY
(This section will be updated at the end of the build with final statistics)

`;

  await fs.writeFile(BUILD_LOG_PATH, header, 'utf-8');
  isInitialized = true;
  console.log(`📋 Build log initialized: ${BUILD_LOG_PATH}`);
}

/**
 * Update build statistics
 */
export function updateBuildStats(category, field, value) {
  if (!buildStats[category]) buildStats[category] = {};
  if (typeof value === 'number') {
    buildStats[category][field] = (buildStats[category][field] || 0) + value;
  } else {
    buildStats[category][field] = value;
  }
}

/**
 * Write executive summary at the beginning of the log
 * Preserves any detailed operations that were already appended
 */
export async function writeExecutiveSummary() {
  // Ensure we've loaded any existing stats from the log
  await initBuildLogger();

  const timestamp = new Date().toISOString();

  // Read the existing log to preserve detailed operations
  let existingContent = '';
  try {
    existingContent = await fs.readFile(BUILD_LOG_PATH, 'utf-8');

    // Check if this is the initial log (has placeholder text) or has real content
    if (existingContent.includes('(This section will be updated')) {
      // Initial log - extract everything after the placeholder
      const lines = existingContent.split('\n');
      let startIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('(This section will be updated')) {
          startIndex = i + 2; // Skip the placeholder and next blank line
          break;
        }
      }
      existingContent = lines.slice(startIndex).join('\n');
    } else {
      // Has executive summary - extract everything after the "DETAILED OPERATIONS LOG" section
      const detailsMarker = 'DETAILED OPERATIONS LOG\n' + '='.repeat(80);
      const detailsIndex = existingContent.indexOf(detailsMarker);
      if (detailsIndex !== -1) {
        // Keep everything after the marker
        existingContent = existingContent.substring(detailsIndex + detailsMarker.length);
      } else {
        existingContent = '';
      }
    }
  } catch {
    existingContent = '';
  }

  const summary = `
${'='.repeat(80)}
BUILD CATALOG TELEMETRY LOG
Started: ${timestamp}
${'='.repeat(80)}

EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
Build Catalog Extraction Audit

SEQUENCES:
  Total Files Synced: ${buildStats.sequences.files || 0}
  Source Packages: ${buildStats.sequences.packages || 0}

COMPONENTS:
  Total Files Synced: ${buildStats.components.files || 0}
  Source Packages: ${buildStats.components.packages || 0}

TOPICS:
  Total Topics Derived: ${buildStats.topics.derived || 0}
  Source Sequences Processed: ${buildStats.topics.sequences || 0}
  Source Topic Catalogs: ${buildStats.topics.catalogs || 0}
  By Derivation Method:
    - Explicit json-topics catalog: ${buildStats.topics.bySource['explicit-json-topics-catalog'] || 0}
    - Sequence file auto-derived: ${buildStats.topics.bySource['sequence-file'] || 0}
    - Lifecycle auto-generated: ${buildStats.topics.bySource['lifecycle-auto-generated'] || 0}
    - Beat events: ${buildStats.topics.bySource['beat-event'] || 0}

INTERACTIONS:
  Total Interactions Derived: ${buildStats.interactions.derived || 0}
  Source Sequences Processed: ${buildStats.interactions.sequences || 0}

PLUGINS:
  Total Plugins Discovered: ${buildStats.plugins.discovered || 0}
  Total Plugins in Manifest: ${buildStats.plugins.total || 0}

${'='.repeat(80)}

DETAILED OPERATIONS LOG
${'='.repeat(80)}
${existingContent}`;

  await fs.writeFile(BUILD_LOG_PATH, summary, 'utf-8');
}

/**
 * Format a path relative to the project root for cleaner logs
 */
function formatPath(absolutePath) {
  try {
    const rel = relative(rootDir, absolutePath);
    return rel.startsWith('..') ? absolutePath : rel;
  } catch {
    return absolutePath;
  }
}

/**
 * Core logging function
 */
async function appendToLog(content) {
  try {
    await fs.appendFile(BUILD_LOG_PATH, content + '\n', 'utf-8');
  } catch (err) {
    console.error('⚠️  Failed to write to build.log:', err.message);
  }
}

/**
 * Log a catalog processing operation
 *
 * @param {Object} options
 * @param {string} options.stage - Processing stage (e.g., "SYNC", "GENERATE", "AGGREGATE")
 * @param {string} options.catalogType - Type of catalog (e.g., "sequences", "components", "interactions", "topics", "plugins")
 * @param {string} options.source - Source path or description
 * @param {string} options.destination - Destination path
 * @param {Object} options.metadata - Additional metadata (optional)
 */
export async function logCatalogOperation({ stage, catalogType, source, destination, metadata = {} }) {
  if (!isInitialized) {
    await initBuildLogger();
  }

  const timestamp = new Date().toISOString();
  const formattedSource = formatPath(source);
  const formattedDestination = formatPath(destination);

  let logEntry = `
[${timestamp}] ${stage} - ${catalogType}
  Source:      ${formattedSource}
  Destination: ${formattedDestination}`;

  if (Object.keys(metadata).length > 0) {
    logEntry += '\n  Metadata:';
    for (const [key, value] of Object.entries(metadata)) {
      logEntry += `\n    ${key}: ${JSON.stringify(value)}`;
    }
  }

  await appendToLog(logEntry);
}

/**
 * Log a section header for better organization
 */
export async function logSection(title) {
  if (!isInitialized) {
    await initBuildLogger();
  }

  const timestamp = new Date().toISOString();
  const section = `
${'-'.repeat(80)}
[${timestamp}] ${title}
${'-'.repeat(80)}`;

  await appendToLog(section);
}

/**
 * Log a package summary header
 * Shows summary stats for a specific package being processed
 */
export async function logPackageSummary({ packageName, catalogType, stats = {} }) {
  if (!isInitialized) {
    await initBuildLogger();
  }

  const timestamp = new Date().toISOString();
  let content = `
[${timestamp}] 📦 PACKAGE: ${packageName} (${catalogType})`;

  if (Object.keys(stats).length > 0) {
    content += '\n  Summary:';
    for (const [key, value] of Object.entries(stats)) {
      content += `\n    ${key}: ${value}`;
    }
  }

  await appendToLog(content);
}

/**
 * Log a processing summary
 */
export async function logSummary(stage, summary) {
  if (!isInitialized) {
    await initBuildLogger();
  }

  const timestamp = new Date().toISOString();
  let entry = `\n[${timestamp}] SUMMARY - ${stage}`;

  for (const [key, value] of Object.entries(summary)) {
    entry += `\n  ${key}: ${value}`;
  }

  await appendToLog(entry);
}

/**
 * Finalize the build log
 */
export async function finalizeBuildLog() {
  if (!isInitialized) return;

  const timestamp = new Date().toISOString();
  const footer = `
${'='.repeat(80)}
BUILD CATALOG TELEMETRY LOG COMPLETE
Finished: ${timestamp}
${'='.repeat(80)}
`;

  await appendToLog(footer);
  console.log(`✅ Build log finalized: ${BUILD_LOG_PATH}`);
}

/**
 * Convenience function to log file copy operations
 */
export async function logFileCopy(source, destination, context = {}) {
  await logCatalogOperation({
    stage: 'COPY',
    catalogType: context.catalogType || 'file',
    source,
    destination,
    metadata: {
      size: context.size,
      ...context.metadata
    }
  });
}

/**
 * Convenience function to log manifest generation
 */
export async function logManifestGeneration(manifestType, sources, destination, stats = {}) {
  await logCatalogOperation({
    stage: 'GENERATE_MANIFEST',
    catalogType: manifestType,
    source: Array.isArray(sources) ? sources.join(', ') : sources,
    destination,
    metadata: stats
  });
}

/**
 * Convenience function to log plugin discovery
 */
export async function logPluginDiscovery(pluginSource, pluginData) {
  await logCatalogOperation({
    stage: 'DISCOVER_PLUGIN',
    catalogType: 'plugin',
    source: pluginSource,
    destination: 'plugin-manifest.json',
    metadata: {
      pluginId: pluginData.id,
      hasUI: !!pluginData.ui,
      hasRuntime: !!pluginData.runtime,
      ...pluginData
    }
  });
}

export default {
  initBuildLogger,
  logCatalogOperation,
  logSection,
  logSummary,
  finalizeBuildLog,
  logFileCopy,
  logManifestGeneration,
  logPluginDiscovery
};
