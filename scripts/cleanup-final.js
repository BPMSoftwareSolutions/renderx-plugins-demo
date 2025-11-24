#!/usr/bin/env node

/**
 * Final Root Directory Cleanup Script
 * 
 * Organizes remaining scattered files into proper directories:
 * - Logs → .logs/
 * - Test scripts → scripts/test/
 * - Python tools → scripts/analysis/
 * - Maintenance scripts → scripts/maintenance/
 * - Web files → public/
 * - Visualization assets → docs/assets/
 * 
 * Usage:
 *   npm run cleanup:final                 # Preview mode (show what would move)
 *   npm run cleanup:final -- --execute    # Actual execution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const EXECUTE_MODE = process.argv.includes('--execute');

// Define file allocations by category
const ALLOCATIONS = {
  logs: {
    target: '.logs',
    files: [
      'app_startup.log',
      'audit-output.log',
      'build.log',
      'console_output.log',
      'e2e_startup_test.log',
      'plugin_startup_output.log',
      'REACT_COMPONENT_VERIFICATION_TRACE.log',
      'test_output.log',
      'test-output.log',
      'test-run.log',
      'eslint-raw.txt',
      'eslint-raw2.txt',
      'eslint-raw3.txt',
      'eslint-raw4.txt',
      'eslint-raw5.txt',
      'eslint-raw6.txt',
      'eslint-raw7.txt',
      'eslint-raw8.txt',
      'lint-output.txt'
    ]
  },
  'test-scripts': {
    target: 'scripts/test',
    files: [
      'capture-react-trace.cjs',
      'test-raw-log-parsing.js',
      'test-react-selection.cjs',
      'test-react-ws.cjs',
      'test-semantic-transform-live.js',
      'test-sequence-extraction.js',
      'test-sequence-parsing.js',
      'verify-react-dom.cjs',
      'verify-react-schema.cjs',
      'regenerate-diagnostics.js'
    ]
  },
  'analysis-tools': {
    target: 'scripts/analysis',
    files: [
      'analyze-gap.py',
      'log_analysis.py',
      'log_analysis_new.py',
      'theme_resource_auditor.py',
      'validate_svg.py'
    ]
  },
  'maintenance-scripts': {
    target: 'scripts/maintenance',
    files: [
      'fix-lint-warnings.ps1'
    ]
  },
  'web-files': {
    target: 'public',
    files: {
      'index.html': 'index.html',
      'dashboard-demo.html': 'demos/dashboard-demo.html',
      'test-plugin-loading.html': 'demos/test-plugin-loading.html',
      'sample.html': 'demos/sample.html'
    }
  },
  'assets': {
    target: 'docs/assets',
    files: [
      'catalog-analysis.svg',
      'telemetry-map.svg',
      'RENDERX_CATALOG_ASCII_SKETCH.txt'
    ]
  },
  'delete': {
    files: [
      'orchestration-domains.json' // duplicate in docs/governance/
    ]
  }
};

// Create directory structure
function ensureDirectories() {
  const dirs = [
    '.logs',
    'scripts/test',
    'scripts/analysis',
    'scripts/maintenance',
    'public/demos',
    'docs/assets',
    'tools/docker' // optional
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(ROOT, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created ${dir}/`);
    }
  });
}

// Move files
function moveFiles() {
  let totalMoved = 0;
  let totalToMove = 0;

  Object.entries(ALLOCATIONS).forEach(([category, allocation]) => {
    if (category === 'delete') return;

    const target = allocation.target;
    let files = allocation.files;

    // Handle files object (for web-files with target paths)
    if (typeof files === 'object' && !Array.isArray(files)) {
      files = Object.keys(files);
    }

    files.forEach(file => {
      const source = path.join(ROOT, file);
      let destination = path.join(ROOT, target);

      // Handle subdirectory paths for files object
      if (allocation.files && typeof allocation.files === 'object' && !Array.isArray(allocation.files)) {
        const targetPath = allocation.files[file];
        destination = path.join(ROOT, target, targetPath);
      } else {
        destination = path.join(ROOT, target, path.basename(file));
      }

      if (fs.existsSync(source)) {
        totalToMove++;
        if (EXECUTE_MODE) {
          // Ensure parent directory exists
          const parentDir = path.dirname(destination);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }
          fs.renameSync(source, destination);
          console.log(`  ✅ ${file} → ${path.relative(ROOT, destination)}`);
          totalMoved++;
        } else {
          console.log(`  🔍 ${file} → ${path.relative(ROOT, destination)}`);
        }
      }
    });
  });

  return { totalToMove, totalMoved };
}

// Delete orphaned files
function deleteOrphanedFiles() {
  const deleteList = ALLOCATIONS.delete.files;
  let totalDeleted = 0;
  let totalToDelete = 0;

  deleteList.forEach(file => {
    const fullPath = path.join(ROOT, file);
    if (fs.existsSync(fullPath)) {
      totalToDelete++;
      if (EXECUTE_MODE) {
        fs.unlinkSync(fullPath);
        console.log(`  🗑️  ${file} deleted (duplicate)`);
        totalDeleted++;
      } else {
        console.log(`  🔍 ${file} → DELETE (duplicate)`);
      }
    }
  });

  return { totalToDelete, totalDeleted };
}

// Generate summary report
function generateReport(moveStats, deleteStats) {
  const report = {
    timestamp: new Date().toISOString(),
    mode: EXECUTE_MODE ? 'EXECUTE' : 'PREVIEW',
    files_moved: moveStats.totalMoved,
    files_to_move: moveStats.totalToMove,
    files_deleted: deleteStats.totalDeleted,
    files_to_delete: deleteStats.totalToDelete,
    summary: {
      logs: ALLOCATIONS.logs.files.length,
      test_scripts: ALLOCATIONS['test-scripts'].files.length,
      analysis_tools: ALLOCATIONS['analysis-tools'].files.length,
      maintenance_scripts: ALLOCATIONS['maintenance-scripts'].files.length,
      web_files: Object.keys(ALLOCATIONS['web-files'].files).length,
      assets: ALLOCATIONS.assets.files.length
    }
  };

  const reportPath = path.join(ROOT, '.generated', 'cleanup-final-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}

// Main execution
function main() {
  console.log('\n📂 Final Root Directory Cleanup\n');
  console.log(`Mode: ${EXECUTE_MODE ? '⚠️  EXECUTE (MAKING CHANGES)' : '🔍 PREVIEW (no changes)'}\n`);

  console.log('📊 Directory Structure:');
  ensureDirectories();

  console.log('\n📋 Files to Relocate:\n');

  console.log('📝 Logs → .logs/:');
  console.log(`  (${ALLOCATIONS.logs.files.length} files)`);

  console.log('\n🧪 Test Scripts → scripts/test/:');
  console.log(`  (${ALLOCATIONS['test-scripts'].files.length} files)`);

  console.log('\n🐍 Python Tools → scripts/analysis/:');
  console.log(`  (${ALLOCATIONS['analysis-tools'].files.length} files)`);

  console.log('\n🔧 Maintenance → scripts/maintenance/:');
  console.log(`  (${ALLOCATIONS['maintenance-scripts'].files.length} files)`);

  console.log('\n🌐 Web Files → public/:');
  console.log(`  (${Object.keys(ALLOCATIONS['web-files'].files).length} files)`);

  console.log('\n📊 Assets → docs/assets/:');
  console.log(`  (${ALLOCATIONS.assets.files.length} files)`);

  console.log('\n🗑️  Files to Delete:\n');

  const moveStats = moveFiles();
  const deleteStats = deleteOrphanedFiles();
  const report = generateReport(moveStats, deleteStats);

  console.log('\n📊 Summary:');
  console.log(`  Logs: ${moveStats.totalToMove - 
    (ALLOCATIONS['test-scripts'].files.length + 
     ALLOCATIONS['analysis-tools'].files.length + 
     ALLOCATIONS['maintenance-scripts'].files.length + 
     Object.keys(ALLOCATIONS['web-files'].files).length + 
     ALLOCATIONS.assets.files.length)}`);
  console.log(`  Test Scripts: ${ALLOCATIONS['test-scripts'].files.length}`);
  console.log(`  Python Tools: ${ALLOCATIONS['analysis-tools'].files.length}`);
  console.log(`  Maintenance: ${ALLOCATIONS['maintenance-scripts'].files.length}`);
  console.log(`  Web Files: ${Object.keys(ALLOCATIONS['web-files'].files).length}`);
  console.log(`  Assets: ${ALLOCATIONS.assets.files.length}`);
  console.log(`  Total to move: ${moveStats.totalToMove}`);
  console.log(`  Total to delete: ${deleteStats.totalToDelete}`);

  if (!EXECUTE_MODE) {
    console.log('\n💡 To execute these changes, run:');
    console.log('   npm run cleanup:final -- --execute');
  } else {
    console.log('\n✅ Report: .generated/cleanup-final-report.json');
  }

  console.log('\n');
}

main();
