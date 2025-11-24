#!/usr/bin/env node

/**
 * JSON File Allocation System
 * 
 * Purpose: Analyze all JSON files in repository and determine where they should go
 *          based on governance rules from orchestration-audit-system-project-plan.json
 * 
 * Strategy:
 *   1. Scan all JSON files in root (excluding build artifacts)
 *   2. Classify by type: governance, config, generated, manifests
 *   3. Map to target locations based on project plan
 *   4. Generate allocation report
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PROJECT_PLAN_PATH = path.join(ROOT, 'orchestration-audit-system-project-plan.json');
const ALLOCATION_REPORT_PATH = path.join(ROOT, '.generated/json-allocation-report.json');
const ALLOCATION_MANIFEST_PATH = path.join(ROOT, '.generated/json-allocation-manifest.json');

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Read project plan
function readProjectPlan() {
  if (!fs.existsSync(PROJECT_PLAN_PATH)) {
    throw new Error(`Project plan not found: ${PROJECT_PLAN_PATH}`);
  }
  return JSON.parse(fs.readFileSync(PROJECT_PLAN_PATH, 'utf-8'));
}

// Get all JSON files in root
function getJsonFilesInRoot() {
  const files = fs.readdirSync(ROOT);
  return files
    .filter(f => f.endsWith('.json') && !f.startsWith('.'))
    .filter(f => {
      const fullPath = path.join(ROOT, f);
      return fs.statSync(fullPath).isFile();
    })
    .sort();
}

// Classify JSON files
function classifyJsonFile(filename) {
  // Governance & Authority JSON files
  if (filename === 'orchestration-audit-system-project-plan.json') {
    return { category: 'governance', domain: null, reason: 'AUTHORITY: Project plan' };
  }
  if (filename === 'orchestration-domains.json') {
    return { category: 'governance', domain: null, reason: 'CONFIG: Domain mapping' };
  }
  if (filename.startsWith('PROJECT_')) {
    return { category: 'governance', domain: null, reason: 'CONFIG: Project metadata' };
  }

  // Shape-related configs
  if (filename.startsWith('shape') || filename.startsWith('SHAPE_')) {
    return { category: 'domain-config', domain: 'shape', reason: 'Shape/evolution configuration' };
  }

  // React-related configs
  if (filename.includes('react-component') || filename === 'REACT_COMPONENT_SELECTION_TRACE.json') {
    return { category: 'domain-config', domain: 'react', reason: 'React component configuration' };
  }

  // Manifest files
  if (filename.includes('manifest')) {
    return { category: 'manifests', domain: null, reason: 'Plugin/layout manifest' };
  }

  // Generated/derived files
  if (filename === 'knowledge-index.json') {
    return { category: 'generated-index', domain: null, reason: 'Generated knowledge index' };
  }
  if (filename === 'root-context.json') {
    return { category: 'generated-context', domain: null, reason: 'Generated context' };
  }
  if (filename === 'DOC_INDEX.json') {
    return { category: 'generated-index', domain: null, reason: 'Generated documentation index' };
  }
  if (filename === 'public-api.hash.json') {
    return { category: 'generated-hash', domain: null, reason: 'Generated API hash' };
  }
  if (filename === 'canvas_symphony_data.json') {
    return { category: 'generated-data', domain: null, reason: 'Generated symphony data' };
  }

  // Temp/analysis files
  if (filename === '.tmp-telemetry-analysis.json') {
    return { category: 'temp', domain: null, reason: 'Temporary telemetry analysis' };
  }

  // Standard build files (keep in root)
  if (['package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.base.json'].includes(filename)) {
    return { category: 'build-config', domain: null, reason: 'Build/runtime configuration' };
  }

  return { category: 'unclassified', domain: null, reason: 'Unclassified JSON file' };
}

// Map category to target location
function getTargetLocation(classification) {
  switch (classification.category) {
    case 'governance':
      return 'docs/governance';
    case 'domain-config':
      return `docs/${classification.domain}`;
    case 'manifests':
      return 'docs/manifests';
    case 'generated-index':
    case 'generated-context':
    case 'generated-hash':
    case 'generated-data':
      return 'docs/search';
    case 'temp':
      return '.generated';
    case 'build-config':
      return '.'; // Keep in root
    default:
      return '.generated';
  }
}

// Allocate all JSON files
function allocateJsonFiles() {
  console.log('\n📊 JSON File Allocation System\n');

  const projectPlan = readProjectPlan();
  const files = getJsonFilesInRoot();

  console.log(`📋 Found ${files.length} JSON files in root\n`);

  const allocations = files.map(filename => {
    const classification = classifyJsonFile(filename);
    const targetLocation = getTargetLocation(classification);
    const sourceFile = path.relative(ROOT, path.join(ROOT, filename));

    return {
      filename,
      sourceLocation: '.',
      classification: classification.category,
      domain: classification.domain,
      reason: classification.reason,
      targetLocation,
      shouldMove: targetLocation !== '.',
      action: targetLocation === '.' ? 'keep-in-root' : 'move',
      fullSourcePath: path.join(ROOT, filename),
      fullTargetPath: path.join(ROOT, targetLocation, filename)
    };
  });

  // Group by action
  const groupedByAction = {};
  allocations.forEach(alloc => {
    if (!groupedByAction[alloc.action]) {
      groupedByAction[alloc.action] = [];
    }
    groupedByAction[alloc.action].push(alloc);
  });

  // Print summary
  console.log('📍 Allocation Summary:\n');
  Object.entries(groupedByAction).forEach(([action, files]) => {
    console.log(`  ${action}: ${files.length} files`);
    files.slice(0, 3).forEach(f => {
      console.log(`    - ${f.filename} → ${f.targetLocation}`);
    });
    if (files.length > 3) {
      console.log(`    ... and ${files.length - 3} more`);
    }
    console.log();
  });

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    totalFiles: files.length,
    byCategory: {},
    byAction: {},
    recommendations: []
  };

  allocations.forEach(alloc => {
    if (!report.byCategory[alloc.classification]) {
      report.byCategory[alloc.classification] = [];
    }
    report.byCategory[alloc.classification].push(alloc);

    if (!report.byAction[alloc.action]) {
      report.byAction[alloc.action] = [];
    }
    report.byAction[alloc.action].push(alloc);
  });

  // Generate recommendations
  if (groupedByAction['move']) {
    report.recommendations.push(
      `Move ${groupedByAction['move'].length} JSON files to proper domains and folders`
    );
  }

  // Save report
  ensureDir(path.dirname(ALLOCATION_REPORT_PATH));
  fs.writeFileSync(ALLOCATION_REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`✅ Report: ${path.relative(ROOT, ALLOCATION_REPORT_PATH)}\n`);

  // Save manifest for relocation
  ensureDir(path.dirname(ALLOCATION_MANIFEST_PATH));
  fs.writeFileSync(ALLOCATION_MANIFEST_PATH, JSON.stringify({ allocations, timestamp: new Date().toISOString() }, null, 2));
  console.log(`✅ Manifest: ${path.relative(ROOT, ALLOCATION_MANIFEST_PATH)}\n`);

  return allocations;
}

try {
  allocateJsonFiles();
  process.exit(0);
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
