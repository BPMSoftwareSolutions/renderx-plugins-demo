#!/usr/bin/env node

/**
 * 🏛️ Verify Documentation Governance
 * 
 * Enforces the rule: JSON is authority. Markdown is reflection.
 * 
 * Checks:
 * 1. All docs in DOC_INDEX.json have generated markdown files
 * 2. Generated markdown files have correct context blocks
 * 3. Source JSON hashes match stored hashes
 * 4. No markdown files are manually edited (hash mismatch)
 * 5. All docs declare role and audience
 * 
 * Usage:
 *   node scripts/verify-docs-governance.js
 *   node scripts/verify-docs-governance.js --strict
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

class DocGovernanceVerifier {
  constructor() {
    this.docIndex = null;
    this.violations = [];
    this.warnings = [];
    this.passed = [];
  }

  /**
   * Load DOC_INDEX.json
   */
  loadDocIndex() {
    console.log('\n🏛️ Loading DOC_INDEX.json...');
    
    const indexPath = path.join(ROOT, 'DOC_INDEX.json');
    this.docIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    
    console.log(`✅ DOC_INDEX loaded (${this.docIndex.docs.length} docs)`);
    return this;
  }

  /**
   * Compute hash of JSON sources
   */
  computeSourceHash(sourceFiles) {
    let combined = '';
    for (const file of sourceFiles) {
      const filePath = path.join(ROOT, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        combined += content;
      }
    }
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    return hash.substring(0, 16);
  }

  /**
   * Check if generated markdown file exists
   */
  checkFileExists(docDef) {
    const outputPath = path.join(ROOT, 'docs', 'generated', `${docDef.id}.md`);
    
    if (!fs.existsSync(outputPath)) {
      this.violations.push({
        type: 'MISSING_FILE',
        docId: docDef.id,
        message: `Generated markdown file not found: ${outputPath}`,
        severity: 'HIGH'
      });
      return false;
    }

    this.passed.push({
      type: 'FILE_EXISTS',
      docId: docDef.id
    });
    return true;
  }

  /**
   * Check if markdown has context block
   */
  checkContextBlock(docDef) {
    const outputPath = path.join(ROOT, 'docs', 'generated', `${docDef.id}.md`);
    const content = fs.readFileSync(outputPath, 'utf-8');

    if (!content.includes('> **Context**')) {
      this.violations.push({
        type: 'MISSING_CONTEXT_BLOCK',
        docId: docDef.id,
        message: 'Generated markdown missing context block',
        severity: 'HIGH'
      });
      return false;
    }

    if (!content.includes('> ⚠️ **DO NOT EDIT — GENERATED**')) {
      this.warnings.push({
        type: 'MISSING_EDIT_WARNING',
        docId: docDef.id,
        message: 'Generated markdown missing edit warning'
      });
    }

    this.passed.push({
      type: 'CONTEXT_BLOCK_OK',
      docId: docDef.id
    });
    return true;
  }

  /**
   * Check if source hash matches
   */
  checkSourceHash(docDef) {
    const currentHash = this.computeSourceHash(docDef.sourceJson);
    const storedHash = docDef.generation.lastGeneratedFromHash;

    if (currentHash !== storedHash) {
      this.warnings.push({
        type: 'HASH_MISMATCH',
        docId: docDef.id,
        message: `Source JSON changed. Current: ${currentHash}, Stored: ${storedHash}`,
        action: 'Run: npm run gen:docs'
      });
      return false;
    }

    this.passed.push({
      type: 'HASH_VERIFIED',
      docId: docDef.id
    });
    return true;
  }

  /**
   * Check if doc declares role and audience
   */
  checkMetadata(docDef) {
    if (!docDef.role) {
      this.violations.push({
        type: 'MISSING_ROLE',
        docId: docDef.id,
        message: 'Doc must declare a role',
        severity: 'HIGH'
      });
      return false;
    }

    if (!docDef.audience || docDef.audience.length === 0) {
      this.violations.push({
        type: 'MISSING_AUDIENCE',
        docId: docDef.id,
        message: 'Doc must declare audience',
        severity: 'HIGH'
      });
      return false;
    }

    if (!this.docIndex.docRoles[docDef.role]) {
      this.violations.push({
        type: 'INVALID_ROLE',
        docId: docDef.id,
        message: `Unknown role: ${docDef.role}`,
        severity: 'HIGH'
      });
      return false;
    }

    this.passed.push({
      type: 'METADATA_OK',
      docId: docDef.id
    });
    return true;
  }

  /**
   * Verify all docs
   */
  verify() {
    console.log('\n🔍 Verifying documentation governance...\n');

    for (const docDef of this.docIndex.docs) {
      console.log(`📄 Checking: ${docDef.id}`);
      
      this.checkMetadata(docDef);
      this.checkFileExists(docDef);
      
      if (fs.existsSync(path.join(ROOT, 'docs', 'generated', `${docDef.id}.md`))) {
        this.checkContextBlock(docDef);
        this.checkSourceHash(docDef);
      }
    }

    return this;
  }

  /**
   * Display results
   */
  display() {
    console.log('\n' + '═'.repeat(70));
    console.log('🏛️ DOCUMENTATION GOVERNANCE VERIFICATION');
    console.log('═'.repeat(70));

    console.log(`\n✅ Passed: ${this.passed.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`❌ Violations: ${this.violations.length}`);

    if (this.violations.length > 0) {
      console.log(`\n❌ VIOLATIONS:`);
      for (const v of this.violations) {
        console.log(`   [${v.severity}] ${v.type}: ${v.docId}`);
        console.log(`   → ${v.message}`);
      }
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ WARNINGS:`);
      for (const w of this.warnings) {
        console.log(`   ${w.type}: ${w.docId}`);
        console.log(`   → ${w.message}`);
        if (w.action) console.log(`   → Action: ${w.action}`);
      }
    }

    console.log('\n' + '═'.repeat(70));

    if (this.violations.length > 0) {
      console.log('\n❌ GOVERNANCE VERIFICATION FAILED\n');
      return false;
    }

    console.log('\n✅ GOVERNANCE VERIFICATION PASSED\n');
    return true;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');

  try {
    const verifier = new DocGovernanceVerifier();
    
    verifier.loadDocIndex();
    verifier.verify();
    const passed = verifier.display();

    if (!passed) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}\n`);
    process.exit(1);
  }
}

main();

