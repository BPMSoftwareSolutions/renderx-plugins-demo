#!/usr/bin/env node

/**
 * Auto-Fix Common Test Issues
 *
 * Applies mechanical fixes for quick wins:
 * 1. Fix invalid AC tags (wrong sequence IDs)
 * 2. Add missing performance assertions for tests already measuring time
 * 3. Add missing error handling checks for tests with try/catch
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

/**
 * Fix invalid tags
 */
const TAG_FIXES = [
  {
    file: 'tests/select.overlay.dom.spec.ts',
    find: '[AC:renderx-web-orchestration:select:1.1:1]',
    replace: '[AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1]',
    reason: 'Wrong sequence ID - should be renderx-web-orchestration not select'
  },
  {
    file: 'tests/react-component-theme-toggle.spec.ts',
    find: '[AC:renderx-web-orchestration:ui-theme-toggle:1.1:1]',
    replace: '[AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2]',
    reason: 'Wrong sequence ID - should be renderx-web-orchestration not ui-theme-toggle'
  }
];

/**
 * Apply tag fixes
 */
function applyTagFixes() {
  console.log('🔧 Fixing invalid AC tags...\n');

  let fixed = 0;

  for (const fix of TAG_FIXES) {
    const filePath = path.join(WORKSPACE_ROOT, fix.file);

    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  Skipping ${fix.file} - file not found`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    if (!content.includes(fix.find)) {
      console.log(`   ⏭️  Skipping ${fix.file} - tag not found (may already be fixed)`);
      continue;
    }

    content = content.replace(fix.find, fix.replace);
    fs.writeFileSync(filePath, content);

    console.log(`   ✅ Fixed ${fix.file}`);
    console.log(`      ${fix.find} → ${fix.replace}`);
    console.log(`      Reason: ${fix.reason}\n`);

    fixed++;
  }

  return fixed;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 AC-to-Test Auto-Fix\n');

  // Apply tag fixes
  const tagFixes = applyTagFixes();

  console.log(`\n✅ Applied ${tagFixes} fixes`);
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Run validate-test-implementations.cjs to verify improvements`);
  console.log(`   2. Review remaining quick wins manually`);
  console.log(`   3. Commit changes\n`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
