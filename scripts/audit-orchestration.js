#!/usr/bin/env node

/**
 * Orchestration Audit System
 *
 * Validates orchestration domains against the JSON registry
 * Checks for:
 * - Missing sequence files
 * - Broken relationships
 * - Incomplete domain definitions
 * - Generated documentation sync
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORCHESTRATION_JSON = path.join(__dirname, '..', 'orchestration-domains.json');
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'generated');

// Load orchestration domains
const orchestration = JSON.parse(fs.readFileSync(ORCHESTRATION_JSON, 'utf8'));

let issues = [];
let warnings = [];
let info = [];

console.log('\n🔍 ORCHESTRATION AUDIT SYSTEM\n');
console.log('═'.repeat(60) + '\n');

// Audit 1: Check domain definitions
console.log('📋 Audit 1: Domain Definitions\n');
orchestration.domains.forEach((domain) => {
  if (!domain.id) issues.push(`Domain missing id`);
  if (!domain.name) issues.push(`Domain ${domain.id} missing name`);
  if (!domain.description) issues.push(`Domain ${domain.id} missing description`);
  if (!domain.category) issues.push(`Domain ${domain.id} missing category`);
  if (!domain.purpose) issues.push(`Domain ${domain.id} missing purpose`);
  
  info.push(`✅ Domain: ${domain.emoji} ${domain.name}`);
});

// Audit 2: Check related domains exist
console.log('🔗 Audit 2: Domain Relationships\n');
orchestration.domains.forEach((domain) => {
  if (domain.relatedDomains && domain.relatedDomains.length > 0) {
    domain.relatedDomains.forEach((relatedId) => {
      const exists = orchestration.domains.find(d => d.id === relatedId);
      if (!exists) {
        issues.push(`Domain ${domain.id} references non-existent domain ${relatedId}`);
      }
    });
  }
});

// Audit 3: Check sequence files exist
console.log('📁 Audit 3: Sequence Files\n');
orchestration.domains.forEach((domain) => {
  if (domain.sequenceFile) {
    const filePath = path.join(__dirname, '..', domain.sequenceFile);
    if (!fs.existsSync(filePath)) {
      warnings.push(`Sequence file not found: ${domain.sequenceFile}`);
    } else {
      info.push(`✅ Sequence file exists: ${domain.sequenceFile}`);
    }
  }
});

// Audit 4: Check generated documentation
console.log('📚 Audit 4: Generated Documentation\n');
const requiredDocs = [
  'orchestration-domains.md',
  'orchestration-execution-flow.md',
  'unified-musical-sequence-interface.md'
];

requiredDocs.forEach((doc) => {
  const docPath = path.join(DOCS_DIR, doc);
  if (!fs.existsSync(docPath)) {
    warnings.push(`Generated documentation missing: ${doc}`);
  } else {
    info.push(`✅ Documentation exists: ${doc}`);
  }
});

// Audit 5: Check unified interface
console.log('🎼 Audit 5: Unified Interface\n');
if (!orchestration.unifiedInterface) {
  issues.push('Unified interface definition missing');
} else {
  if (!orchestration.unifiedInterface.name) issues.push('Unified interface missing name');
  if (!orchestration.unifiedInterface.source) issues.push('Unified interface missing source');
  if (!orchestration.unifiedInterface.fields || orchestration.unifiedInterface.fields.length === 0) {
    issues.push('Unified interface missing fields');
  } else {
    info.push(`✅ Unified interface: ${orchestration.unifiedInterface.name}`);
    info.push(`✅ Fields defined: ${orchestration.unifiedInterface.fields.length}`);
  }
}

// Audit 6: Check execution flow
console.log('🎵 Audit 6: Execution Flow\n');
if (!orchestration.executionFlow || orchestration.executionFlow.length === 0) {
  issues.push('Execution flow not defined');
} else {
  info.push(`✅ Execution flow steps: ${orchestration.executionFlow.length}`);
}

// Audit 7: Check categories
console.log('📊 Audit 7: Categories\n');
if (!orchestration.categories || orchestration.categories.length === 0) {
  issues.push('Categories not defined');
} else {
  info.push(`✅ Categories defined: ${orchestration.categories.length}`);
}

// Audit 8: Check dynamics
console.log('🎵 Audit 8: Dynamics\n');
if (!orchestration.dynamics || orchestration.dynamics.length === 0) {
  issues.push('Dynamics not defined');
} else {
  info.push(`✅ Dynamics defined: ${orchestration.dynamics.length}`);
}

// Print results
console.log('\n' + '═'.repeat(60) + '\n');
console.log('📊 AUDIT RESULTS\n');

if (info.length > 0) {
  console.log('ℹ️  INFO:\n');
  info.forEach(msg => console.log(`  ${msg}`));
  console.log();
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach(msg => console.log(`  ⚠️  ${msg}`));
  console.log();
}

if (issues.length > 0) {
  console.log('❌ ISSUES:\n');
  issues.forEach(msg => console.log(`  ❌ ${msg}`));
  console.log();
}

// Summary
console.log('═'.repeat(60) + '\n');
console.log(`📈 Summary:\n`);
console.log(`  Domains: ${orchestration.domains.length}`);
console.log(`  Info: ${info.length}`);
console.log(`  Warnings: ${warnings.length}`);
console.log(`  Issues: ${issues.length}\n`);

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ ORCHESTRATION AUDIT PASSED\n');
  process.exit(0);
} else if (issues.length === 0) {
  console.log('⚠️  ORCHESTRATION AUDIT PASSED WITH WARNINGS\n');
  process.exit(0);
} else {
  console.log('❌ ORCHESTRATION AUDIT FAILED\n');
  process.exit(1);
}

