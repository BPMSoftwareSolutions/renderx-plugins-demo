const fs = require('fs');
const path = require('path');

const baseDir = 'c:/source/repos/bpm/Internal/renderx-plugins-demo';

const searchDirs = [
  'packages/canvas-component/json-sequences',
  'packages/control-panel/json-sequences',
  'packages/header/json-sequences',
  'packages/library/json-sequences',
  'packages/library-component/json-sequences',
  'packages/orchestration/json-sequences',
  'packages/real-estate-analyzer/json-sequences',
  'packages/self-healing/json-sequences',
  'packages/slo-dashboard/json-sequences'
];

const handlers = {};
const locations = {};

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.json')) {
      try {
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        if (content.beats && Array.isArray(content.beats)) {
          content.beats.forEach(beat => {
            if (beat.handler) {
              const handler = beat.handler;
              handlers[handler] = (handlers[handler] || 0) + 1;
              if (!locations[handler]) locations[handler] = [];
              const relPath = fullPath.replace(/\\/g, '/').split('renderx-plugins-demo/')[1];
              if (!locations[handler].includes(relPath)) {
                locations[handler].push(relPath);
              }
            }
          });
        }
      } catch (e) {
        // skip invalid JSON
      }
    }
  });
}

searchDirs.forEach(dir => {
  const fullDir = path.join(baseDir, dir);
  walkDir(fullDir);
});

const sorted = Object.entries(handlers)
  .sort((a, b) => b[1] - a[1])
  .map(([handler, count]) => ({
    handler,
    count,
    locations: locations[handler] || []
  }));

console.log('=== UNIQUE HANDLERS FOUND ===\n');
sorted.forEach(item => {
  console.log(`${item.handler}: ${item.count} occurrence(s)`);
  item.locations.forEach(loc => {
    console.log(`  - ${loc}`);
  });
  console.log('');
});

console.log('\n=== SUMMARY ===');
console.log(`Total unique handlers: ${sorted.length}`);
console.log(`Total handler occurrences: ${Object.values(handlers).reduce((a, b) => a + b, 0)}`);
