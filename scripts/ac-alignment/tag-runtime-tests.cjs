#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

// Mapping of test descriptions to AC IDs
const mappings = {
  'tests/control-panel-init-config-runtime.spec.ts': [
    { pattern: /it\('should load configuration within 200ms'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:1.3:1' },
    { pattern: /it\('should handle configuration with minimal overhead'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:1.3:1' },
    { pattern: /it\('should process complex nested configuration'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:1.3:2' },
    { pattern: /it\('should initialize configuration with 100\+ fields within 300ms'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:1.3:3' },
    { pattern: /it\('should handle configuration errors gracefully'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:1.3:4' },
    { pattern: /it\('should apply fallback configuration on error'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:1.3:4' },
    { pattern: /it\('should achieve TTI < 500ms for typical configuration'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:1.3:5' },
    { pattern: /it\('should maintain performance under load'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:1.3:5' },
    { pattern: /it\('should emit telemetry events with latency metrics'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:1.3:1' },
    { pattern: /it\('should log with full context on success'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:1.3:1' }
  ],
  'tests/drag-preview-handlers-runtime.spec.ts': [
    // computeCursorOffsets
    { pattern: /computeCursorOffsets.*it\('should complete successfully within < 1 second'/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.6:1' },
    { pattern: /computeCursorOffsets.*should process valid inputs and conform to schema/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.6:2' },
    { pattern: /computeCursorOffsets.*should handle edge case with null targetEl/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.6:2' },
    { pattern: /computeCursorOffsets.*should handle missing event coordinates/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.6:2' },
    { pattern: /computeCursorOffsets.*should handle getBoundingClientRect errors gracefully/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.6:3' },
    { pattern: /computeCursorOffsets.*should maintain latency consistently within target/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.6:4' },
    { pattern: /computeCursorOffsets.*should enforce all governance rules/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.6:5' },
    // applyTemplateStyles
    { pattern: /applyTemplateStyles.*should complete successfully within < 1 second/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.5:1' },
    { pattern: /applyTemplateStyles.*should process valid template and apply styles/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.5:2' },
    { pattern: /applyTemplateStyles.*should handle CSS variable names without -- prefix/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.5:2' },
    { pattern: /applyTemplateStyles.*should handle null\/undefined template gracefully/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.5:3' },
    { pattern: /applyTemplateStyles.*should handle malformed CSS variables gracefully/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.5:3' },
    { pattern: /applyTemplateStyles.*should apply complex styles within performance budget/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.5:4' },
    // installDragImage
    { pattern: /installDragImage.*should complete successfully within < 1 second/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.7:1' },
    { pattern: /installDragImage.*should process valid inputs correctly/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.7:2' },
    { pattern: /installDragImage.*should handle setDragImage errors with cleanup/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.7:3' },
    { pattern: /installDragImage.*should maintain performance under repeated operations/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.7:4' },
    { pattern: /installDragImage.*should clean up ghost element after drag starts/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.7:5' },
    { pattern: /installDragImage.*should use setTimeout fallback/, tag: 'renderx-web-orchestration:renderx-web-orchestration:5.7:5' }
  ]
};

function addACTags(filePath, tagMappings) {
  const fullPath = path.join(WORKSPACE_ROOT, filePath);
  let content = fs.readFileSync(fullPath, 'utf-8');
  let modifiedCount = 0;

  tagMappings.forEach(({ pattern, tag }) => {
    // Find it() statements that match the pattern and don't already have [AC: tags
    const regex = new RegExp(`(\\s+it\\(['\"])([^'\"]*${pattern.source.replace(/.*it\\(/, '').replace(/\\\\/, '')}[^'\"]*)(['\"],)`, 'g');

    content = content.replace(regex, (match, prefix, testName, suffix) => {
      // Check if already tagged
      if (testName.includes('[AC:')) {
        return match;
      }
      modifiedCount++;
      return `${prefix}[AC:${tag}] ${testName}${suffix}`;
    });
  });

  if (modifiedCount > 0) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Tagged ${modifiedCount} tests in ${filePath}`);
  } else {
    console.log(`ℹ️  No tests tagged in ${filePath} (may already be tagged)`);
  }

  return modifiedCount;
}

function main() {
  console.log('🏷️  Tagging Runtime Tests with AC IDs\n');

  let totalTagged = 0;

  for (const [filePath, tagMappings] of Object.entries(mappings)) {
    totalTagged += addACTags(filePath, tagMappings);
  }

  console.log(`\n✅ Total tests tagged: ${totalTagged}`);
  console.log('\n📋 Next Steps:');
  console.log('   1. Run: node scripts/ac-alignment/validate-test-implementations.cjs');
  console.log('   2. Run: node scripts/ac-alignment/audit-test-quality.cjs');
}

main();
