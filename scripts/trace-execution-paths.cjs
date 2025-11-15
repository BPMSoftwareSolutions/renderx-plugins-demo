const fs = require('fs');
const path = require('path');

console.log('🔍 Tracing Execution Paths for Both Drops\n');

const logPath = path.join(__dirname, '../.logs/drop-comparison-localhost-1763165911066.log');
const logContent = fs.readFileSync(logPath, 'utf-8');
const lines = logContent.split('\n');

function extractTimestamp(line) {
  const match = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
  return match ? new Date(match[1]) : null;
}

// Find the CLI drop (script drop)
console.log('═'.repeat(70));
console.log('🤖 CLI DROP (Script) - Execution Path');
console.log('═'.repeat(70));

let cliDropStart = null;
let cliCreateStart = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // CLI command received
  if (line.includes('📨 Received CLI command') && line.includes('canvas-component-create-symphony')) {
    console.log('\n1️⃣  CLI Command Received (no timestamp in this line)');
    console.log('    Line', i + ':', line.substring(0, 120));

    // Find the next PluginInterfaceFacade.play
    for (let j = i + 1; j < i + 10; j++) {
      if (lines[j].includes('PluginInterfaceFacade.play()') && lines[j].includes('CanvasComponentPlugin')) {
        cliCreateStart = extractTimestamp(lines[j]);
        console.log('\n2️⃣  Conductor.play() Called:', cliCreateStart.toISOString());
        console.log('    Line', j + ':', lines[j].substring(0, 120));
        console.log('\n⏱️  CLI drop goes directly to conductor.play() - NO DELAY');
        break;
      }
    }
    break;
  }
}

// Find the user drop (drag from library)
console.log('\n\n' + '═'.repeat(70));
console.log('👤 USER DROP (Drag from Library) - Execution Path');
console.log('═'.repeat(70));

let userDragStart = null;
let userDropStart = null;
let userDropHandlerStart = null;
let userCreateStart = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Library drag start
  if (line.includes('library.component.drag.start.requested') && line.includes('Routing')) {
    userDragStart = extractTimestamp(line);
    console.log('\n1️⃣  Library Drag Start:', userDragStart.toISOString());
    console.log('    Line', i + ':', line.substring(0, 120));
  }
  
  // Library drop requested
  if (line.includes('library.component.drop.requested') && line.includes('Routing')) {
    userDropStart = extractTimestamp(line);
    console.log('\n2️⃣  Library Drop Requested:', userDropStart.toISOString());
    console.log('    Line', i + ':', line.substring(0, 120));
    
    // Find the drop sequence execution
    for (let j = i + 1; j < i + 50; j++) {
      if (lines[j].includes('PluginInterfaceFacade.play()') && lines[j].includes('LibraryComponentPlugin')) {
        const dropSeqStart = extractTimestamp(lines[j]);
        console.log('\n3️⃣  Drop Sequence Started:', dropSeqStart.toISOString());
        console.log('    Line', j + ':', lines[j].substring(0, 120));
        console.log('    ⏱️  Time from drop requested to sequence start:', (dropSeqStart - userDropStart) + 'ms');
        break;
      }
    }
    
    // Find when the drop handler (publishCreateRequested) executes
    for (let j = i + 1; j < i + 100; j++) {
      if (lines[j].includes('library:component:drop') && lines[j].includes('handler=publishCreateRequested')) {
        userDropHandlerStart = extractTimestamp(lines[j]);
        console.log('\n4️⃣  Drop Handler (publishCreateRequested) Executed:', userDropHandlerStart.toISOString());
        console.log('    Line', j + ':', lines[j].substring(0, 120));
        console.log('    ⏱️  Time from drop requested to handler execution:', (userDropHandlerStart - userDropStart) + 'ms');
        break;
      }
    }
    
    // Find when canvas create starts
    for (let j = i + 1; j < i + 200; j++) {
      if (lines[j].includes('PluginInterfaceFacade.play()') && lines[j].includes('CanvasComponentPlugin') && lines[j].includes('canvas-component-create-symphony')) {
        userCreateStart = extractTimestamp(lines[j]);
        console.log('\n5️⃣  Canvas Create Started:', userCreateStart.toISOString());
        console.log('    Line', j + ':', lines[j].substring(0, 120));
        console.log('    ⏱️  Time from drop handler to create start:', (userCreateStart - userDropHandlerStart) + 'ms');
        console.log('    ⏱️  TOTAL time from drop requested to create start:', (userCreateStart - userDropStart) + 'ms');
        break;
      }
    }
    break;
  }
}

console.log('\n\n' + '═'.repeat(70));
console.log('🔍 KEY DIFFERENCE');
console.log('═'.repeat(70));

if (cliCreateStart && userDropStart && userCreateStart) {
  console.log('\nCLI Path:');
  console.log('  CLI command → conductor.play(): IMMEDIATE (no delay)');

  console.log('\nUser Path:');
  if (userDropHandlerStart) {
    console.log('  Drop requested → handler execution:', (userDropHandlerStart - userDropStart) + 'ms');
    console.log('  Handler execution → conductor.play():', (userCreateStart - userDropHandlerStart) + 'ms');
  }
  console.log('  TOTAL:', (userCreateStart - userDropStart) + 'ms');

  if (userDropHandlerStart) {
    console.log('\n🚨 The user path has a ' + (userCreateStart - userDropHandlerStart) + 'ms delay');
    console.log('   between the drop handler executing and conductor.play() being called!');
    console.log('\n💡 This suggests the handler is calling ctx.conductor.play() but something');
    console.log('   is delaying the actual execution by ~2.4 seconds!');
  }
}

