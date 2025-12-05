#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const registry = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../.generated/acs/renderx-web-orchestration.registry.json'), 'utf-8')
);

const handlers = ['initConfig', 'computeCursorOffsets', 'applyTemplateStyles', 'installDragImage'];

console.log('AC IDs for Runtime Test Handlers:\n');

handlers.forEach(handlerName => {
  const acs = registry.acs.filter(ac => ac.handler && ac.handler.includes(handlerName));

  console.log(`${handlerName}: ${acs.length} ACs`);
  acs.forEach((ac, i) => {
    console.log(`  ${i+1}. [AC:${ac.acId}]`);
    console.log(`     Handler: ${ac.handler}`);
    console.log(`     GIVEN: ${ac.given.join(', ')}`);
    console.log(`     WHEN: ${ac.when.join(', ')}`);
    console.log(`     THEN: ${ac.then.join(', ')}`);
  });
  console.log('');
});
