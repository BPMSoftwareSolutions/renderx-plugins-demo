#!/usr/bin/env node

/**
 * Documentation File Relocator
 * 
 * Purpose: Execute file moves to properly organize documentation
 *          based on allocation report
 * 
 * Strategy:
 *   1. Read allocation manifest
 *   2. Execute moves (with preview mode option)
 *   3. Update documentation indexes
 *   4. Verify new structure
 *   5. Generate verification report
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ALLOCATION_MANIFEST_PATH = path.join(ROOT, '.generated/file-allocation-manifest.json');
const RELOCATION_REPORT_PATH = path.join(ROOT, '.generated/file-relocation-report.json');

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Read allocation manifest
function readAllocationManifest() {
  if (!fs.existsSync(ALLOCATION_MANIFEST_PATH)) {
    throw new Error(`Allocation manifest not found. Run allocate first: npm run allocate:documents`);
  }
  return JSON.parse(fs.readFileSync(ALLOCATION_MANIFEST_PATH, 'utf-8'));
}

// Move file safely
function moveFile(sourcePath, destPath) {
  try {
    // Ensure source exists
    if (!fs.existsSync(sourcePath)) {
      return { success: false, error: 'Source file not found' };
    }

    // Ensure dest dir exists
    const destDir = path.dirname(destPath);
    ensureDir(destDir);

    // Check if dest already exists
    if (fs.existsSync(destPath)) {
      const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
      const destContent = fs.readFileSync(destPath, 'utf-8');
      
      if (sourceContent === destContent) {
        // Same content, safe to delete source
        fs.unlinkSync(sourcePath);
        return { success: true, action: 'duplicate-removed', message: 'Duplicate removed' };
      } else {
        // Different content, don't overwrite
        return { success: false, error: 'Destination exists with different content' };
      }
    }

    // Read source
    const content = fs.readFileSync(sourcePath, 'utf-8');

    // Write destination
    fs.writeFileSync(destPath, content, 'utf-8');

    // Delete source
    fs.unlinkSync(sourcePath);

    return { success: true, action: 'moved', message: `Moved to ${path.relative(ROOT, destPath)}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Execute relocations
function executeRelocations(previewOnly = true) {
  console.log(`\n📂 Documentation File Relocation\n`);
  console.log(`Mode: ${previewOnly ? '🔍 PREVIEW' : '⚠️  EXECUTE (MAKING CHANGES)'}\n`);

  const manifest = readAllocationManifest();
  const results = {
    timestamp: new Date().toISOString(),
    mode: previewOnly ? 'preview' : 'execute',
    totalFiles: manifest.allocations.length,
    relocated: 0,
    unchanged: 0,
    errors: 0,
    details: []
  };

  manifest.allocations.forEach((allocation, idx) => {
    const sourcePath = path.join(ROOT, allocation.currentPath);
    const destPath = path.join(ROOT, allocation.allocatedPath, allocation.filename);

    // Skip if no move needed
    if (!allocation.action.includes('move')) {
      results.unchanged++;
      return;
    }

    // Show action
    console.log(`[${idx + 1}/${manifest.allocations.length}] ${allocation.filename}`);
    console.log(`  From: ${allocation.currentPath}`);
    console.log(`  To: ${path.relative(ROOT, destPath)}`);

    if (previewOnly) {
      console.log(`  Action: PREVIEW (no changes)\n`);
      results.details.push({
        filename: allocation.filename,
        action: 'would-move',
        from: allocation.currentPath,
        to: path.relative(ROOT, destPath),
        status: 'preview'
      });
    } else {
      const result = moveFile(sourcePath, destPath);
      
      if (result.success) {
        console.log(`  ✅ ${result.message}\n`);
        results.relocated++;
        results.details.push({
          filename: allocation.filename,
          action: result.action,
          from: allocation.currentPath,
          to: path.relative(ROOT, destPath),
          status: 'success'
        });
      } else {
        console.log(`  ❌ ERROR: ${result.error}\n`);
        results.errors++;
        results.details.push({
          filename: allocation.filename,
          action: 'failed',
          from: allocation.currentPath,
          error: result.error,
          status: 'error'
        });
      }
    }
  });

  // Summary
  console.log('📊 Relocation Summary:');
  console.log(`  Total files: ${results.totalFiles}`);
  if (!previewOnly) {
    console.log(`  Relocated: ${results.relocated}`);
  }
  console.log(`  Unchanged: ${results.unchanged}`);
  if (!previewOnly && results.errors > 0) {
    console.log(`  Errors: ${results.errors} ❌`);
  }

  // Save report
  fs.writeFileSync(RELOCATION_REPORT_PATH, JSON.stringify(results, null, 2));
  console.log(`\n✅ Report: ${RELOCATION_REPORT_PATH}\n`);

  return results;
}

// Check command line args
const args = process.argv.slice(2);
const execute = args.includes('--execute') || args.includes('-x');
const previewOnly = !execute;

try {
  const results = executeRelocations(previewOnly);

  if (previewOnly) {
    console.log('💡 To execute these moves, run:');
    console.log('   npm run relocate:documents -- --execute\n');
  }

  process.exit(0);
} catch (err) {
  console.error('❌ Relocation error:', err.message);
  process.exit(1);
}
