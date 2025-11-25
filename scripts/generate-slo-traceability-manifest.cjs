#!/usr/bin/env node
/**
 * Generates the SLO Dashboard traceability manifest by correlating sequences, telemetry anomalies,
 * emitted test events, BDD scenarios, and shape evolution annotations.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(ROOT, '.generated/slo-dashboard');
const OUT_FILE = path.join(OUT_DIR, 'traceability-manifest.json');

const PATHS = {
  telemetry: path.resolve(ROOT, '.generated/renderx-web-telemetry.json'),
  tests: path.resolve(ROOT, '.generated/renderx-web-test-results.json'),
  bdd: path.resolve(ROOT, 'packages/slo-dashboard/.generated/slo-dashboard-business-bdd-specifications.json'),
  sequencesDir: path.resolve(ROOT, 'packages/slo-dashboard/json-sequences'),
  shape: path.resolve(ROOT, 'docs/shape/shape-evolutions.json')
};

const PHASE_CONFIG = [
  {
    phaseId: 'dashboard.load',
    sequenceFile: 'packages/slo-dashboard/json-sequences/dashboard.load.json',
    telemetryEvents: ['canvas:render:performance:throttle', 'canvas:concurrent:creation:race'],
    scenarioTitles: [
      'Initial load shows aggregate compliance & SLO list',
      'Error budget sorting prioritizes most at-risk SLOs',
      'Color coding reflects compliance tiers'
    ],
    shapeFeatures: ['shape-budgets']
  },
  {
    phaseId: 'dashboard.refresh.metrics',
    sequenceFile: 'packages/slo-dashboard/json-sequences/dashboard.refresh.metrics.json',
    telemetryEvents: ['control:panel:state:sync:race', 'control:panel:property:binding:lag'],
    scenarioTitles: [
      'Refresh preserves panel visibility state',
      'Projection warns of imminent breach',
      'Self-healing impact reflected in compliance trend'
    ],
    shapeFeatures: ['detect-slo-breaches']
  },
  {
    phaseId: 'dashboard.export.report',
    sequenceFile: 'packages/slo-dashboard/json-sequences/dashboard.export.report.json',
    telemetryEvents: ['library:search:cache:invalidation', 'host:sdk:communication:timeout'],
    scenarioTitles: [
      'Export produces signed CSV & JSON artifacts',
      'Partial data excludes incomplete SLOs from aggregate'
    ],
    shapeFeatures: ['shape-persistence']
  }
];

function loadJson(file) {
  if (!fs.existsSync(file)) {
    console.warn(`[warn] Missing JSON source: ${file}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function toCoverageStatus(total, covered) {
  if (covered === 0) return 'missing';
  if (covered === total) return 'complete';
  return 'partial';
}

function latestShapeHashes(annotations, feature) {
  if (!annotations) return [];
  const matches = annotations.filter((a) => a.feature === feature);
  if (!matches.length) return [];
  const latest = matches.reduce((acc, item) => {
    if (!acc) return item;
    return new Date(item.annotatedAt) > new Date(acc.annotatedAt) ? item : acc;
  }, null);
  return latest
    ? [{ feature, hash: latest.newHash, annotatedAt: latest.annotatedAt, reason: latest.reason }]
    : [];
}

function buildEventTestMap(testResults) {
  const map = new Map();
  if (!testResults || !Array.isArray(testResults.testResults)) return map;
  for (const suite of testResults.testResults) {
    const assertions = suite.assertionResults || [];
    for (const assertion of assertions) {
      const emitted = assertion.emittedEvents || [];
      for (const event of emitted) {
        if (!map.has(event)) map.set(event, []);
        map.get(event).push({
          testName: assertion.fullName,
          title: assertion.title,
          status: assertion.status,
          file: suite.name,
          duration: assertion.duration || 0
        });
      }
    }
  }
  return map;
}

function main() {
  const telemetry = loadJson(PATHS.telemetry);
  const testResults = loadJson(PATHS.tests);
  const bddSpec = loadJson(PATHS.bdd);
  const shape = loadJson(PATHS.shape);

  const anomaliesByEvent = new Map();
  if (telemetry && Array.isArray(telemetry.anomalies)) {
    telemetry.anomalies.forEach((anom) => anomaliesByEvent.set(anom.event, anom));
  }

  const scenarioMap = new Map();
  if (bddSpec && Array.isArray(bddSpec.scenarios)) {
    bddSpec.scenarios.forEach((scenario, index) => {
      scenarioMap.set(scenario.title, {
        scenarioId: `scenario-${index + 1}-${slugify(scenario.title)}`,
        title: scenario.title
      });
    });
  }

  const shapeAnnotations = (shape && Array.isArray(shape.annotations)) ? shape.annotations : [];
  const eventTestMap = buildEventTestMap(testResults);

  const phases = PHASE_CONFIG.map((cfg) => {
    const telemetryDetails = cfg.telemetryEvents.map((eventId) => {
      const anomaly = anomaliesByEvent.get(eventId);
      return {
        event: eventId,
        anomaly: anomaly || null,
        status: anomaly ? 'linked' : 'missing'
      };
    });

    const tests = cfg.telemetryEvents.flatMap((eventId) => eventTestMap.get(eventId) || []);
    const uniqueTests = Array.from(new Map(tests.map((t) => [t.testName, t])).values());

    const coveredEvents = cfg.telemetryEvents.filter((eventId) => (eventTestMap.get(eventId) || []).length > 0).length;
    const coverageStatus = toCoverageStatus(cfg.telemetryEvents.length, coveredEvents);
    const coverageId = crypto
      .createHash('sha256')
      .update(cfg.phaseId + JSON.stringify(cfg.telemetryEvents) + JSON.stringify(uniqueTests))
      .digest('hex');

    const bddScenarios = cfg.scenarioTitles
      .map((title) => scenarioMap.get(title))
      .filter(Boolean);

    const shapeHashes = cfg.shapeFeatures.flatMap((feature) => latestShapeHashes(shapeAnnotations, feature));

    return {
      phase_id: cfg.phaseId,
      sequence_ref: cfg.sequenceFile,
      telemetry_events: telemetryDetails,
      tests: uniqueTests,
      bdd_scenarios: bddScenarios,
      shape_hashes: shapeHashes,
      coverage: {
        coverage_id: coverageId,
        total_events: cfg.telemetryEvents.length,
        covered_events: coveredEvents,
        status: coverageStatus
      }
    };
  });

  const totalPhases = phases.length;
  const linkedPhases = phases.filter((p) => p.coverage.status !== 'missing').length;
  const coverageStatus = linkedPhases === 0
    ? 'missing'
    : linkedPhases === totalPhases && phases.every((p) => p.coverage.status === 'complete')
    ? 'complete'
    : 'partial';

  const manifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    domain: 'slo-dashboard',
    sources: {
      telemetry: path.relative(ROOT, PATHS.telemetry).replace(/\\/g, '/'),
      tests: path.relative(ROOT, PATHS.tests).replace(/\\/g, '/'),
      bdd: path.relative(ROOT, PATHS.bdd).replace(/\\/g, '/'),
      shapeAnnotations: path.relative(ROOT, PATHS.shape).replace(/\\/g, '/'),
      sequencesRoot: 'packages/slo-dashboard/json-sequences'
    },
    phases,
    summary: {
      total_phases: totalPhases,
      linked_phases: linkedPhases,
      status: coverageStatus
    }
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`SLO traceability manifest written to ${OUT_FILE}`);
}

main();
