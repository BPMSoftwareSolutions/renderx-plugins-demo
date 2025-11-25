#!/usr/bin/env node
/**
 * Generates a governance artifact that maps every topic interaction to the
 * telemetry signatures that must be detectable inside live session conductor
 * logs. The resulting file is consumed by validators and telemetry analysis.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const manifestPath = path.join(rootDir, 'docs', 'manifests', 'topics-manifest.json');
const governancePath = path.join(rootDir, 'docs', 'governance', 'topic-telemetry-governance.json');
const outDir = path.join(rootDir, '.generated', 'topics');
const outPath = path.join(outDir, 'topic-telemetry-signatures.json');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Unable to read ${filePath}: ${err.message}`);
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizePipeline(defaultStages, route) {
  const dynamicStages = [];
  if (route?.pluginId) {
    dynamicStages.push(`plugin:${route.pluginId}`);
  } else {
    dynamicStages.push('plugin:auto-derived');
  }
  if (route?.sequenceId) {
    dynamicStages.push(`json-sequences:${route.sequenceId}`);
  } else {
    dynamicStages.push('json-sequences:auto-derived');
  }
  dynamicStages.push('pre:manifest:topics');
  dynamicStages.push('interactions:JSON-component-interaction-integration');
  dynamicStages.push('live-session-conductor-logs');
  dynamicStages.push('telemetry-extraction');

  const stageSet = new Set();
  [...defaultStages, ...dynamicStages].forEach(stage => stageSet.add(stage));
  return Array.from(stageSet);
}

function buildSignatures(topic, route, logSources) {
  return logSources.map(source => {
    const template = source.signatureTemplate || '${topic}';
    const signature = template
      .replace(/\$\{topic\}/g, topic)
      .replace(/\$\{pluginId\}/g, route?.pluginId || 'auto')
      .replace(/\$\{sequenceId\}/g, route?.sequenceId || 'auto');
    return {
      stage: source.stage,
      logSource: source.path,
      detector: source.detector || 'telemetry-extraction',
      signature,
      detectionFields: {
        topic,
        pluginId: route?.pluginId || null,
        sequenceId: route?.sequenceId || null
      }
    };
  });
}

function main() {
  const manifest = readJson(manifestPath);
  const governance = readJson(governancePath);
  const topics = manifest?.topics || {};
  const requiredStages = governance?.requiredStages || [];
  const logSources = governance?.logSources || [];

  if (!Object.keys(topics).length) {
    throw new Error('topics-manifest.json does not contain any topics. Run generate-topics-manifest first.');
  }
  if (!logSources.length) {
    throw new Error('topic-telemetry-governance.json is missing logSources definitions.');
  }

  ensureDir(outDir);

  const entries = Object.entries(topics).map(([topic, definition]) => {
    const primaryRoute = Array.isArray(definition.routes) && definition.routes.length ? definition.routes[0] : null;
    const pipeline = normalizePipeline(requiredStages, primaryRoute);
    const telemetrySignatures = buildSignatures(topic, primaryRoute, logSources);
    return {
      topic,
      routes: definition.routes || [],
      pipeline,
      telemetry_signatures: telemetrySignatures
    };
  });

  const artifact = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    governanceRef: path.relative(rootDir, governancePath).replace(/\\/g, '/'),
    requiredStages,
    logSources,
    totalTopics: entries.length,
    entries
  };

  fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(`✅ topic telemetry signatures generated (${entries.length} topics)`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('❌ Failed to generate topic telemetry signatures');
    console.error(err.message || err);
    process.exit(1);
  }
}
