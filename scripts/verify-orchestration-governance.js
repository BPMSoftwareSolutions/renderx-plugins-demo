#!/usr/bin/env node
/**
 * Orchestration Documentation Governance Check
 * Purpose: Flag any markdown files under docs/orchestration/ that aren't auto-generated
 *          by the central gen-orchestration-docs.js pipeline.
 *
 * Policy: docs/orchestration/ must contain ONLY generated output or approved manifests.
 * Manual markdown files = governance violation.
 *
 * Output: stdout report with violations, exit 0 if compliant, exit 1 if violations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const ORCHESTRATION_DOC_DIR = path.join(rootDir, 'docs', 'orchestration');
const GENERATED_DOC_DIR = path.join(rootDir, 'docs', 'generated');

// Files/dirs allowed in docs/orchestration/ (not auto-generated)
const ALLOWED_MANUAL_FILES = [
  '.gitkeep',
  'README.md',
  'governance.json',
  'policy.md'
];

// Files that are expected to be auto-generated in docs/generated/
const EXPECTED_GENERATED = [
  'orchestration-domains.md',
  'orchestration-execution-flow.md',
  'unified-musical-sequence-interface.md'
];

function main() {
  console.log('🔍 Verifying orchestration documentation governance...\n');

  let compliant = true;
  const violations = [];

  // Check 1: Ensure generated docs exist in docs/generated/
  if (!fs.existsSync(GENERATED_DOC_DIR)) {
    console.log('⚠️  Generated docs directory does not exist: ' + GENERATED_DOC_DIR);
    console.log('   Run: npm run pre:manifests\n');
    compliant = false;
  } else {
    EXPECTED_GENERATED.forEach(file => {
      const filePath = path.join(GENERATED_DOC_DIR, file);
      if (!fs.existsSync(filePath)) {
        violations.push({
          type: 'MISSING_GENERATED',
          file: file,
          severity: 'HIGH',
          message: `Missing expected generated file: ${file}`
        });
        compliant = false;
      }
    });
  }

  // Check 2: Flag non-generated markdown in docs/orchestration/
  if (fs.existsSync(ORCHESTRATION_DOC_DIR)) {
    const files = fs.readdirSync(ORCHESTRATION_DOC_DIR);
    files.forEach(file => {
      // Skip directories
      const filePath = path.join(ORCHESTRATION_DOC_DIR, file);
      if (fs.statSync(filePath).isDirectory()) return;

      // Check if file is in allowed list
      if (ALLOWED_MANUAL_FILES.includes(file)) return;

      // Check if it's a markdown file
      if (file.endsWith('.md')) {
        // Read first few lines to check for AUTO-GENERATED marker
        const content = fs.readFileSync(filePath, 'utf-8');
        if (!content.includes('AUTO-GENERATED')) {
          violations.push({
            type: 'MANUAL_MARKDOWN',
            file: file,
            severity: 'HIGH',
            message: `Non-generated markdown file (missing AUTO-GENERATED marker): ${file}`,
            hint: 'Edit the JSON source instead, do not create markdown manually.'
          });
          compliant = false;
        }
      }
    });
  }

  // Report findings
  if (violations.length > 0) {
    console.log('❌ GOVERNANCE VIOLATIONS FOUND:\n');
    violations.forEach((v, idx) => {
      console.log(`  ${idx + 1}. [${v.severity}] ${v.type}`);
      console.log(`     File: ${v.file}`);
      console.log(`     ${v.message}`);
      if (v.hint) console.log(`     💡 ${v.hint}`);
      console.log('');
    });
  }

  // Summary
  if (compliant) {
    console.log('✅ COMPLIANT: Orchestration documentation follows governance policies.');
    console.log(`   ✓ All expected generated files present in ${GENERATED_DOC_DIR}`);
    console.log(`   ✓ No manual markdown violations in ${ORCHESTRATION_DOC_DIR}`);
  } else {
    console.log('❌ GOVERNANCE VIOLATIONS: Fix the issues above.');
    console.log('\nRecovery Steps:');
    console.log('  1. Delete any manual markdown from docs/orchestration/');
    console.log('  2. Run: npm run pre:manifests');
    console.log('  3. Re-run: npm run verify:orchestration:governance');
  }

  process.exit(compliant ? 0 : 1);
}

main().catch(err => {
  console.error('❌ Governance check failed:', err);
  process.exit(1);
});
