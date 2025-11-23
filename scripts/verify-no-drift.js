#!/usr/bin/env node

/**
 * Drift Detection & Report Verification
 * 
 * Detects when generated reports are out of sync with source data.
 * Automatically regenerates if drift detected (when enabled).
 * 
 * Usage:
 *   node scripts/verify-no-drift.js
 *   node scripts/verify-no-drift.js --auto-regenerate
 *   node scripts/verify-no-drift.js --check-only
 * 
 * Exit codes:
 *   0 = All reports verified, no drift
 *   1 = Drift detected
 *   2 = Missing data or other errors
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class DriftDetector {
  constructor(options = {}) {
    this.options = {
      autoRegenerate: process.argv.includes('--auto-regenerate') || options.autoRegenerate,
      checkOnly: process.argv.includes('--check-only'),
      verbose: process.argv.includes('--verbose'),
      ...options,
    };

    this.driftIssues = [];
    this.verifications = [];
    this.report = {
      timestamp: new Date().toISOString(),
      driftDetected: false,
      issues: [],
      regenerated: [],
      verifications: [],
    };
  }

  computeChecksum(data) {
    try {
      const content = JSON.stringify(data, (key, val) => {
        if (typeof val === 'object' && val !== null) {
          return Object.keys(val)
            .sort()
            .reduce((acc, k) => ({ ...acc, [k]: val[k] }), {});
        }
        return val;
      });
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      return hash.slice(0, 16);
    } catch (e) {
      return null;
    }
  }

  parseReportMetadata(reportPath) {
    if (!fs.existsSync(reportPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(reportPath, 'utf-8');

      // Extract source hashes from markdown comments
      const hashMatches = content.match(/\[Source.*?\]\s*(.*?)(?=\n|$)/g) || [];
      const sourceHashes = {};

      for (const match of hashMatches) {
        const parts = match.match(/\[Source.*?(\w+)\]\s*(.+?)(?:\s|$)/);
        if (parts) {
          sourceHashes[parts[1]] = parts[2];
        }
      }

      return {
        path: reportPath,
        lastModified: fs.statSync(reportPath).mtime,
        sourceHashes,
        hasMetadata: hashMatches.length > 0,
      };
    } catch (e) {
      return null;
    }
  }

  loadSourceData(filepath) {
    if (!fs.existsSync(filepath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      return null;
    }
  }

  detectDrift() {
    console.log('🔍 Detecting drift in generated reports...\n');

    const sourceFiles = {
      anomalies: './.generated/anomalies.json',
      testResults: './test-results.json',
      sloBreaches: './.generated/slo-breaches.json',
    };

    const reportFiles = {
      'test-health-report.md': './.generated/test-coverage-analysis/test-health-report.md',
      'coverage-analysis.md': './.generated/test-coverage-analysis/coverage-analysis.md',
      'recommendations.md': './.generated/test-coverage-analysis/recommendations.md',
    };

    // Load current source data
    const currentSourceHashes = {};
    const sourceData = {};

    console.log('📥 Loading current source data:');
    for (const [key, filepath] of Object.entries(sourceFiles)) {
      const data = this.loadSourceData(filepath);
      if (data) {
        const checksum = this.computeChecksum(data);
        currentSourceHashes[key] = checksum;
        sourceData[key] = data;
        console.log(`  ✅ ${key}: ${checksum}`);
      } else {
        console.log(`  ⚠️  ${key}: Not found or invalid`);
      }
    }

    console.log('\n📋 Checking report metadata:');

    // Check each report
    for (const [reportName, reportPath] of Object.entries(reportFiles)) {
      const metadata = this.parseReportMetadata(reportPath);

      if (!metadata) {
        console.log(`  ⚠️  ${reportName}: Not found or invalid`);
        this.driftIssues.push({
          type: 'missing_report',
          file: reportName,
          severity: 'high',
        });
        continue;
      }

      if (!metadata.hasMetadata) {
        console.log(`  ⚠️  ${reportName}: Missing source metadata`);
        this.driftIssues.push({
          type: 'missing_metadata',
          file: reportName,
          severity: 'medium',
        });
        continue;
      }

      // Compare hashes
      let hasDrift = false;
      for (const [sourceKey, expectedHash] of Object.entries(metadata.sourceHashes)) {
        if (currentSourceHashes[sourceKey] && currentSourceHashes[sourceKey] !== expectedHash) {
          console.log(
            `  ❌ ${reportName}: Source '${sourceKey}' has drifted\n` +
            `     Expected: ${expectedHash}\n` +
            `     Current:  ${currentSourceHashes[sourceKey]}`
          );
          hasDrift = true;
          this.driftIssues.push({
            type: 'hash_mismatch',
            file: reportName,
            sourceKey,
            expectedHash,
            currentHash: currentSourceHashes[sourceKey],
            severity: 'high',
          });
        }
      }

      if (!hasDrift) {
        console.log(`  ✅ ${reportName}: Current`);
      }

      this.verifications.push({
        file: reportName,
        status: hasDrift ? 'drifted' : 'current',
        lastModified: metadata.lastModified,
      });
    }

    this.report.driftDetected = this.driftIssues.length > 0;
    this.report.issues = this.driftIssues;
    this.report.verifications = this.verifications;

    return !this.report.driftDetected;
  }

  regenerateReports() {
    console.log('\n🔄 Regenerating drifted reports...\n');

    try {
      // Run the main pipeline script
      console.log('  Running: npm run traceability:pipeline');
      execSync('npm run traceability:pipeline', { stdio: 'inherit' });

      this.report.regenerated = [
        'test-health-report.md',
        'coverage-analysis.md',
        'recommendations.md',
      ];

      console.log('\n  ✅ Reports regenerated successfully');
      return true;
    } catch (error) {
      console.error('\n  ❌ Failed to regenerate reports:', error.message);
      return false;
    }
  }

  async run() {
    console.log('🚨 DRIFT DETECTION & VERIFICATION\n');

    // Step 1: Detect drift
    const noDrift = this.detectDrift();

    console.log('\n' + '='.repeat(60));

    if (noDrift) {
      console.log('✅ NO DRIFT DETECTED - All reports are current');
      console.log('='.repeat(60) + '\n');
      return { success: true, report: this.report };
    }

    // Drift detected
    console.log(`❌ DRIFT DETECTED - ${this.driftIssues.length} issue(s) found`);
    console.log('='.repeat(60) + '\n');

    if (this.options.checkOnly) {
      console.log('📋 Issues found (check-only mode, not regenerating):');
      for (const issue of this.driftIssues) {
        console.log(`  - [${issue.severity}] ${issue.type}: ${issue.file}`);
      }
      return { success: false, report: this.report };
    }

    if (!this.options.autoRegenerate) {
      console.log('⚠️  To auto-regenerate, run with --auto-regenerate flag:');
      console.log('   npm run verify:no-drift -- --auto-regenerate\n');
      return { success: false, report: this.report };
    }

    // Auto-regenerate
    const regenerated = this.regenerateReports();

    console.log('\n' + '='.repeat(60));
    if (regenerated) {
      console.log('✅ DRIFT RESOLVED - Reports regenerated');
      console.log('='.repeat(60) + '\n');
      return { success: true, report: this.report };
    } else {
      console.log('❌ DRIFT UNRESOLVED - Regeneration failed');
      console.log('='.repeat(60) + '\n');
      return { success: false, report: this.report };
    }
  }

  saveReport() {
    const reportDir = './.generated/lineage/';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'drift-detection-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));

    return reportPath;
  }
}

// Main execution
async function main() {
  const detector = new DriftDetector();
  const result = await detector.run();

  // Save report
  const reportPath = detector.saveReport();
  console.log(`📄 Report saved: ${reportPath}`);

  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(2);
});

module.exports = DriftDetector;
