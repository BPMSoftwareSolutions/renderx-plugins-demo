const fs = require('fs');

const file = 'packages/musical-conductor/src/symphonies/initialize/initialize.stage-crew.ts';
const content = fs.readFileSync(file, 'utf8');

const pattern = /export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\(/g;

let match;
let count = 0;
while ((match = pattern.exec(content)) !== null) {
  count++;
  console.log(`Match ${count}: ${match[1]} at index ${match.index}`);
}

console.log(`\nTotal matches: ${count}`);
