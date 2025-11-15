const fs = require('fs');
const path = require('path');

console.log('🔍 Simple Timing Analysis\n');

const logPath = path.join(__dirname, '../.logs/drop-comparison-localhost-1763165911066.log');
const logContent = fs.readFileSync(logPath, 'utf-8');
const lines = logContent.split('\n');

function extractTimestamp(line) {
  const match = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
  return match ? new Date(match[1]) : null;
}

console.log('═'.repeat(70));
console.log('🤖 CLI DROP - Direct Path');
console.log('═'.repeat(70));

// Find CLI drop
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('📨 Received CLI command') && lines[i].includes('canvas-component-create-symphony')) {
    console.log('\nLine', i + ': CLI receives create command');
    
    // Find next conductor.play
    for (let j = i + 1; j < i + 5; j++) {
      if (lines[j].includes('PluginInterfaceFacade.play()') && lines[j].includes('CanvasComponentPlugin')) {
        const time = extractTimestamp(lines[j]);
        console.log('Line', j + ': Conductor.play() called at', time.toISOString());
        console.log('\n✅ IMMEDIATE - No delay!');
        break;
      }
    }
    break;
  }
}

console.log('\n\n' + '═'.repeat(70));
console.log('👤 USER DROP - Library Path');
console.log('═'.repeat(70));

// Find user drop
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('library.component.drop.requested') && lines[i].includes('Routing')) {
    const routingTime = extractTimestamp(lines[i]);
    console.log('\nLine', i + ': Drop requested (EventRouter routing)');
    console.log('  Time:', routingTime ? routingTime.toISOString() : 'No timestamp');
    
    // Find when drop sequence starts
    for (let j = i + 1; j < i + 20; j++) {
      if (lines[j].includes('PluginInterfaceFacade.play()') && lines[j].includes('LibraryComponentPlugin') && lines[j].includes('library-component-drop-symphony')) {
        const dropSeqTime = extractTimestamp(lines[j]);
        console.log('\nLine', j + ': Drop sequence starts');
        console.log('  Time:', dropSeqTime.toISOString());
        if (routingTime) {
          console.log('  ⏱️  Delay from routing to sequence start:', (dropSeqTime - routingTime) + 'ms');
        }
        
        // Find when drop sequence completes
        for (let k = j + 1; k < j + 50; k++) {
          if (lines[k].includes('Library Component Drop') && lines[k].includes('completed in')) {
            const dropCompleteTime = extractTimestamp(lines[k]);
            console.log('\nLine', k + ': Drop sequence completes');
            console.log('  Time:', dropCompleteTime.toISOString());
            console.log('  ⏱️  Drop sequence duration:', (dropCompleteTime - dropSeqTime) + 'ms');
            
            // Find when canvas create starts
            for (let m = k + 1; m < k + 150; m++) {
              if (lines[m].includes('PluginInterfaceFacade.play()') && lines[m].includes('CanvasComponentPlugin') && lines[m].includes('canvas-component-create-symphony')) {
                const createTime = extractTimestamp(lines[m]);
                console.log('\nLine', m + ': Canvas create starts');
                console.log('  Time:', createTime.toISOString());
                console.log('  ⏱️  Delay from drop complete to create start:', (createTime - dropCompleteTime) + 'ms');
                
                console.log('\n🚨 PROBLEM FOUND!');
                console.log('   The drop handler completes at', dropCompleteTime.toISOString());
                console.log('   But canvas create doesn\'t start until', createTime.toISOString());
                console.log('   That\'s a ' + (createTime - dropCompleteTime) + 'ms delay!');
                
                // Check what's in between
                console.log('\n🔍 What happens in between?');
                for (let n = k + 1; n < m; n++) {
                  if (lines[n].trim() && !lines[n].includes('cli-bridge')) {
                    console.log('   Line', n + ':', lines[n].substring(0, 100));
                  }
                }
                
                return;
              }
            }
            break;
          }
        }
        break;
      }
    }
    break;
  }
}

