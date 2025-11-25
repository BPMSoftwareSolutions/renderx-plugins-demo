#!/usr/bin/env node
/**
 * Validates that every topic interaction has a telemetry signature pipeline
 * that traverses the governance stages and emits identifiers detectable in
 * live session conductor logs.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const manifestPath = path.join(rootDir, 'docs', 'manifests', 'topics-manifest.json');
const governancePath = path.join(rootDir, 'docs', 'governance', 'topic-telemetry-governance.json');
const telemetryPath = path.join(rootDir, '.generated', 'topics', 'topic-telemetry-signatures.json');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Unable to read ${filePath}: ${err.message}`);
  }
}

function stageSatisfied(pipelineStage, requiredStage) {
  if (pipelineStage === requiredStage) return true;
  if (pipelineStage.startsWith(requiredStage + ':')) return true;
  return false;
}

function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${filePath} not found. Run generate-topic-telemetry-signatures first.`);
  }
}

function main() {
  ensureFileExists(telemetryPath);
  const manifest = readJson(manifestPath);
  const governance = readJson(governancePath);
  const telemetry = readJson(telemetryPath);

  const topics = manifest?.topics || {};
  const requiredStages = governance?.requiredStages || [];
  const requiredLogStages = new Set((governance?.logSources || []).map(source => source.stage));
  const entryMap = new Map((telemetry.entries || []).map(entry => [entry.topic, entry]));

  const errors = [];

  for (const topic of Object.keys(topics)) {
    const entry = entryMap.get(topic);
    if (!entry) {
      errors.push(`Missing telemetry signatures for topic: ${topic}`);
      continue;
    }

    const pipeline = entry.pipeline || [];
    for (const stage of requiredStages) {
      const satisfied = pipeline.some(stageValue => stageSatisfied(stageValue, stage));
      if (!satisfied) {
        errors.push(`Topic ${topic} missing required pipeline stage: ${stage}`);
      }
    }

    const telemetrySignatures = entry.telemetry_signatures || [];
    if (!telemetrySignatures.length) {
      errors.push(`Topic ${topic} has no telemetry signatures defined.`);
      continue;
    }

    const stagesPresent = new Set(telemetrySignatures.map(sig => sig.stage));
    for (const requiredStage of requiredLogStages) {
      if (!stagesPresent.has(requiredStage)) {
        errors.push(`Topic ${topic} missing telemetry signature for stage: ${requiredStage}`);
      }
    }

    telemetrySignatures.forEach(sig => {
      if (!sig.signature || typeof sig.signature !== 'string') {
        errors.push(`Topic ${topic} has telemetry signature with empty pattern for stage ${sig.stage}`);
      } else if (!sig.signature.includes(topic)) {
        errors.push(`Telemetry signature for topic ${topic} (${sig.signature}) does not reference the topic name.`);
      }
    });
  }

  if (errors.length) {
    console.error('\n[TOPIC-TELEMETRY-VALIDATION] FAIL');
    errors.forEach(err => console.error(' -', err));
    console.error(`Total issues: ${errors.length}`);
    process.exit(1);
  }

  console.log('[TOPIC-TELEMETRY-VALIDATION] PASS');
  console.log(`Topics validated: ${Object.keys(topics).length}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('❌ Failed to validate topic telemetry signatures');
    console.error(err.message || err);
    process.exit(1);
  }
}
