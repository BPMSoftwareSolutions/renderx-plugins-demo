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

let logStream = null;
let logBuffer = [];
let isInitialized = false;

/**
 * Initialize the build logger
 * Clears any existing build.log and prepares for new build session
 */
export async function initBuildLogger() {
  if (isInitialized) return;

  const timestamp = new Date().toISOString();
  const header = `
${'='.repeat(80)}
BUILD CATALOG TELEMETRY LOG
Started: ${timestamp}
${'='.repeat(80)}

`;

  await fs.writeFile(BUILD_LOG_PATH, header, 'utf-8');
  isInitialized = true;
  console.log(`📋 Build log initialized: ${BUILD_LOG_PATH}`);
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
