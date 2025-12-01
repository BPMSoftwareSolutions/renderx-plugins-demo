const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\source\\repos\\bpm\\Internal\\renderx-plugins-demo';

const searchDirs = [
  'packages\\canvas-component\\json-sequences',
  'packages\\control-panel\\json-sequences',
  'packages\\header\\json-sequences',
  'packages\\library\\json-sequences',
  'packages\\library-component\\json-sequences',
  'packages\\orchestration\\json-sequences',
  'packages\\real-estate-analyzer\\json-sequences',
  'packages\\self-healing\\json-sequences',
  'packages\\slo-dashboard\\json-sequences'
];

const handlers = {};
const locations = {};

function extractHandlersFromContent(content, filePath) {
  // Check if it has movements array (orchestration style)
  if (content.movements && Array.isArray(content.movements)) {
    content.movements.forEach(movement => {
      if (movement.beats && Array.isArray(movement.beats)) {
        movement.beats.forEach(beat => {
          addHandler(beat, filePath);
        });
      }
    });
  }
  
  // Check if it has beats array directly (canvas/control-panel style)
  if (content.beats && Array.isArray(content.beats)) {
    content.beats.forEach(beat => {
      addHandler(beat, filePath);
    });
  }
}

function addHandler(beat, filePath) {
  if (!beat.handler) return;
  
  let handlerName;
  
  // Handler can be a string or an object with a 'name' property
  if (typeof beat.handler === 'string') {
    handlerName = beat.handler;
  } else if (typeof beat.handler === 'object' && beat.handler.name) {
    handlerName = beat.handler.name;
  } else {
    return;
  }
  
  handlers[handlerName] = (handlers[handlerName] || 0) + 1;
  if (!locations[handlerName]) locations[handlerName] = [];
  
  const relPath = filePath.replace(/\\/g, '/').split('renderx-plugins-demo/')[1];
  if (!locations[handlerName].includes(relPath)) {
    locations[handlerName].push(relPath);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      try {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.endsWith('.json')) {
          try {
            const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            extractHandlersFromContent(content, fullPath);
          } catch (e) {
            // skip invalid JSON or read errors
          }
        }
      } catch (e) {
        // skip stat errors
      }
    });
  } catch (e) {
    // skip read directory errors
  }
}

function extractHandlersFromContent(content, filePath) {
  // Check if it has movements array (orchestration style)
  if (content.movements && Array.isArray(content.movements)) {
    content.movements.forEach(movement => {
      if (movement.beats && Array.isArray(movement.beats)) {
        movement.beats.forEach(beat => {
          addHandler(beat, filePath);
        });
      }
    });
  }
  
  // Check if it has beats array directly (canvas/control-panel style)
  if (content.beats && Array.isArray(content.beats)) {
    content.beats.forEach(beat => {
      addHandler(beat, filePath);
    });
  }
}

function addHandler(beat, filePath) {
  if (!beat.handler) return;
  
  let handlerName;
  
  // Handler can be a string or an object with a 'name' property
  if (typeof beat.handler === 'string') {
    handlerName = beat.handler;
  } else if (typeof beat.handler === 'object' && beat.handler.name) {
    handlerName = beat.handler.name;
  } else {
    return;
  }
  
  handlers[handlerName] = (handlers[handlerName] || 0) + 1;
  if (!locations[handlerName]) locations[handlerName] = [];
  
  const relPath = filePath.replace(/\\/g, '/').split('renderx-plugins-demo/')[1];
  if (!locations[handlerName].includes(relPath)) {
    locations[handlerName].push(relPath);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      try {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.endsWith('.json')) {
          try {
            const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            extractHandlersFromContent(content, fullPath);
          } catch (e) {
            // skip invalid JSON or read errors
          }
        }
      } catch (e) {
        // skip stat errors
      }
    });
  } catch (e) {
    // skip read directory errors
  }
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
