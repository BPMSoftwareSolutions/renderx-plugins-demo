#!/usr/bin/env node

/**
 * Generate BDD Gherkin specifications for all self-healing handlers
 * 
 * This script:
 * 1. Reads all JSON sequences
 * 2. Extracts handlers and their metadata
 * 3. Generates Gherkin Given-When-Then scenarios
 * 4. Creates comprehensive BDD specification document
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// BDD scenario templates for different handler types
const BDD_TEMPLATES = {
  'telemetry': {
    'parseTelemetryRequested': {
      happy: {
        given: ['a user requests telemetry parsing', 'the system is ready to process logs'],
        when: ['parseTelemetryRequested handler is invoked', 'with valid request context'],
        then: ['the handler should validate the request', 'it should emit telemetry:parse:requested event', 'it should return success status']
      },
      error: {
        given: ['a user requests telemetry parsing', 'the request context is missing required fields'],
        when: ['parseTelemetryRequested handler is invoked', 'with invalid request context'],
        then: ['the handler should reject the request', 'it should return error status', 'it should not emit parse event']
      }
    },
    'loadLogFiles': {
      happy: {
        given: ['log files exist in .logs directory', 'files contain beat execution events'],
        when: ['loadLogFiles handler is invoked', 'with valid directory path'],
        then: ['the handler should read all log files', 'it should parse file contents', 'it should return array of log entries']
      },
      error: {
        given: ['log directory does not exist', 'no log files are available'],
        when: ['loadLogFiles handler is invoked'],
        then: ['the handler should handle missing directory gracefully', 'it should return empty array', 'it should not throw error']
      }
    },
    'extractTelemetryEvents': {
      happy: {
        given: ['log entries contain beat-started and beat-completed events', 'events have timestamps and handler names'],
        when: ['extractTelemetryEvents handler is invoked', 'with array of log entries'],
        then: ['the handler should parse event types', 'it should extract timestamps', 'it should return TelemetryEvent array']
      },
      error: {
        given: ['some log entries are malformed', 'some entries lack required fields'],
        when: ['extractTelemetryEvents handler is invoked'],
        then: ['the handler should skip malformed entries', 'it should extract valid events', 'it should return partial results']
      }
    }
  },
  'anomaly': {
    'detectAnomaliesRequested': {
      happy: {
        given: ['telemetry metrics are available', 'anomaly detection is requested'],
        when: ['detectAnomaliesRequested handler is invoked'],
        then: ['the handler should validate request', 'it should emit anomaly:detect:requested event', 'it should return success']
      },
      error: {
        given: ['no telemetry data available', 'detection is requested'],
        when: ['detectAnomaliesRequested handler is invoked'],
        then: ['the handler should reject request', 'it should return error status']
      }
    }
  },
  'diagnosis': {
    'analyzeRequested': {
      happy: {
        given: ['anomalies have been detected', 'analysis is requested'],
        when: ['analyzeRequested handler is invoked'],
        then: ['the handler should validate request', 'it should emit diagnosis:analyze:requested event']
      },
      error: {
        given: ['no anomalies available', 'analysis is requested'],
        when: ['analyzeRequested handler is invoked'],
        then: ['the handler should reject request', 'it should return error status']
      }
    }
  },
  'fix': {
    'generateRequested': {
      happy: {
        given: ['diagnosis results are available', 'fix generation is requested'],
        when: ['generateRequested handler is invoked'],
        then: ['the handler should validate request', 'it should emit fix:generate:requested event']
      },
      error: {
        given: ['no diagnosis available', 'fix generation is requested'],
        when: ['generateRequested handler is invoked'],
        then: ['the handler should reject request', 'it should return error status']
      }
    }
  },
  'validation': {
    'validateRequested': {
      happy: {
        given: ['patches are ready for validation', 'validation is requested'],
        when: ['validateRequested handler is invoked'],
        then: ['the handler should validate request', 'it should emit validation:validate:requested event']
      },
      error: {
        given: ['no patches available', 'validation is requested'],
        when: ['validateRequested handler is invoked'],
        then: ['the handler should reject request', 'it should return error status']
      }
    }
  },
  'deployment': {
    'deployRequested': {
      happy: {
        given: ['validation passed', 'deployment is requested'],
        when: ['deployRequested handler is invoked'],
        then: ['the handler should validate request', 'it should emit deployment:deploy:requested event']
      },
      error: {
        given: ['validation failed', 'deployment is requested'],
        when: ['deployRequested handler is invoked'],
        then: ['the handler should reject request', 'it should return error status']
      }
    }
  },
  'learning': {
    'trackRequested': {
      happy: {
        given: ['deployment completed', 'tracking is requested'],
        when: ['trackRequested handler is invoked'],
        then: ['the handler should validate request', 'it should emit learning:track:requested event']
      },
      error: {
        given: ['no deployment data', 'tracking is requested'],
        when: ['trackRequested handler is invoked'],
        then: ['the handler should reject request', 'it should return error status']
      }
    }
  }
};

function getSequenceType(filename) {
  if (filename.includes('telemetry')) return 'telemetry';
  if (filename.includes('anomaly')) return 'anomaly';
  if (filename.includes('diagnosis')) return 'diagnosis';
  if (filename.includes('fix')) return 'fix';
  if (filename.includes('validation')) return 'validation';
  if (filename.includes('deployment')) return 'deployment';
  if (filename.includes('learning')) return 'learning';
  return 'generic';
}

function generateScenarios(handler, kind, sequenceType) {
  const scenarios = [];
  
  // Happy path scenario
  scenarios.push({
    handler,
    kind,
    scenario: `${handler} - happy path`,
    given: [`${handler} is invoked with valid input`, 'all dependencies are available'],
    when: [`${handler} handler executes`, 'with correct context'],
    then: [`the handler should process successfully`, 'it should emit appropriate event', 'it should return valid result']
  });

  // Error handling scenario
  scenarios.push({
    handler,
    kind,
    scenario: `${handler} - error handling`,
    given: [`${handler} is invoked`, 'input validation fails or dependencies are unavailable'],
    when: [`${handler} handler executes`, 'with invalid or missing context'],
    then: [`the handler should catch the error`, 'it should emit error event', 'it should return error status']
  });

  // Edge case scenario
  scenarios.push({
    handler,
    kind,
    scenario: `${handler} - edge case`,
    given: [`${handler} is invoked`, 'with boundary or edge case input'],
    when: [`${handler} handler executes`, 'with edge case context'],
    then: [`the handler should handle edge case gracefully`, 'it should return appropriate result', 'it should not crash']
  });

  return scenarios;
}

async function generateBddSpecifications() {
  console.log('📋 Generating BDD Specifications');
  console.log('='.repeat(60));

  const sequencesDir = path.join(rootDir, 'packages', 'self-healing', 'json-sequences');
  const outputDir = path.join(rootDir, 'packages', 'self-healing', '.generated');
  const outputFile = path.join(outputDir, 'bdd-specifications.json');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sequenceFiles = fs.readdirSync(sequencesDir)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  const features = [];
  let totalScenarios = 0;

  for (const file of sequenceFiles) {
    const filePath = path.join(sequencesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    const sequenceType = getSequenceType(file);
    const scenarios = [];

    if (content.movements && Array.isArray(content.movements)) {
      for (const movement of content.movements) {
        if (movement.beats && Array.isArray(movement.beats)) {
          for (const beat of movement.beats) {
            if (beat.handler) {
              const handlerScenarios = generateScenarios(beat.handler, beat.kind || 'pure', sequenceType);
              scenarios.push(...handlerScenarios);
              totalScenarios += handlerScenarios.length;
            }
          }
        }
      }
    }

    features.push({
      name: content.name,
      description: content.description,
      sequenceId: content.id,
      scenarios
    });

    console.log(`✅ ${content.name}: ${scenarios.length} scenarios`);
  }

  const bdd = {
    version: '1.0.0',
    plugin: 'SelfHealingPlugin',
    description: 'BDD Specifications for Self-Healing System Handlers using Gherkin Syntax',
    timestamp: new Date().toISOString(),
    summary: {
      totalFeatures: features.length,
      totalScenarios,
      totalHandlers: features.reduce((sum, f) => sum + new Set(f.scenarios.map(s => s.handler)).size, 0)
    },
    features
  };

  fs.writeFileSync(outputFile, JSON.stringify(bdd, null, 2));
  console.log(`\n✅ Generated: ${outputFile}`);
  console.log(`   📊 Features: ${bdd.summary.totalFeatures}`);
  console.log(`   🎯 Handlers: ${bdd.summary.totalHandlers}`);
  console.log(`   📝 Scenarios: ${bdd.summary.totalScenarios}`);
}

generateBddSpecifications().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

