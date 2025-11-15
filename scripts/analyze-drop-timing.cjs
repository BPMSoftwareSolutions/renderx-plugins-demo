const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing Drop Timing Comparison\n');

const logPath = path.join(__dirname, '../.logs/drop-comparison-localhost-1763165911066.log');
const logContent = fs.readFileSync(logPath, 'utf-8');
const lines = logContent.split('\n');

// Find the two Canvas Component Create sequences
const createSequences = [];
let currentSequence = null;

lines.forEach((line, index) => {
  // Start of a create sequence
  if (line.includes('canvas-component-create-symphony') && line.includes('PluginInterfaceFacade.play()')) {
    if (currentSequence) {
      createSequences.push(currentSequence);
    }
    currentSequence = {
      startLine: index,
      startTime: extractTimestamp(line),
      beats: []
    };
  }
  
  // End of a create sequence
  if (currentSequence && line.includes('Canvas Component Create') && line.includes('completed in')) {
    currentSequence.endLine = index;
    currentSequence.endTime = extractTimestamp(line);
    currentSequence.duration = extractDuration(line);
    createSequences.push(currentSequence);
    currentSequence = null;
  }
  
  // Beat timing
  if (currentSequence && line.includes('Beat') && line.includes('completed in')) {
    const beatNum = extractBeatNumber(line);
    const duration = extractDuration(line);
    currentSequence.beats.push({ beat: beatNum, duration });
  }
});

function extractTimestamp(line) {
  const match = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
  return match ? new Date(match[1]) : null;
}

function extractDuration(line) {
  const match = line.match(/(\d+\.?\d*)ms/);
  return match ? parseFloat(match[1]) : null;
}

function extractBeatNumber(line) {
  const match = line.match(/Beat (\d+)/);
  return match ? parseInt(match[1]) : null;
}

console.log('📊 Found', createSequences.length, 'Canvas Component Create sequences\n');

if (createSequences.length >= 2) {
  const scriptDrop = createSequences[0];
  const userDrop = createSequences[1];
  
  console.log('═'.repeat(70));
  console.log('🤖 SCRIPT DROP (CLI)');
  console.log('═'.repeat(70));
  console.log('Start Time:', scriptDrop.startTime?.toISOString());
  console.log('End Time:', scriptDrop.endTime?.toISOString());
  console.log('Total Duration:', scriptDrop.duration + 'ms');
  console.log('\nBeat Timings:');
  scriptDrop.beats.forEach(b => {
    console.log(`  Beat ${b.beat}: ${b.duration}ms`);
  });
  
  console.log('\n' + '═'.repeat(70));
  console.log('👤 USER DROP (Drag from Library)');
  console.log('═'.repeat(70));
  console.log('Start Time:', userDrop.startTime?.toISOString());
  console.log('End Time:', userDrop.endTime?.toISOString());
  console.log('Total Duration:', userDrop.duration + 'ms');
  console.log('\nBeat Timings:');
  userDrop.beats.forEach(b => {
    console.log(`  Beat ${b.beat}: ${b.duration}ms`);
  });
  
  console.log('\n' + '═'.repeat(70));
  console.log('⚡ COMPARISON');
  console.log('═'.repeat(70));
  console.log('Script Drop:', scriptDrop.duration + 'ms');
  console.log('User Drop:', userDrop.duration + 'ms');
  console.log('Difference:', (userDrop.duration - scriptDrop.duration).toFixed(2) + 'ms');
  console.log('User drop is', ((userDrop.duration / scriptDrop.duration) - 1) * 100 + '% slower');
  
  // Now find what happens BEFORE the user drop
  console.log('\n' + '═'.repeat(70));
  console.log('🔍 WHAT HAPPENS BEFORE USER DROP?');
  console.log('═'.repeat(70));
  
  // Find library-component-drop-symphony before the user's create
  const dropStartLine = userDrop.startLine;
  let foundDrop = false;
  
  for (let i = dropStartLine - 1; i >= 0 && i > dropStartLine - 100; i--) {
    const line = lines[i];
    
    if (line.includes('library-component-drop-symphony') && line.includes('PluginInterfaceFacade.play()')) {
      const dropTime = extractTimestamp(line);
      const createTime = userDrop.startTime;
      const delay = createTime - dropTime;
      
      console.log('\n📍 Library Component Drop started at:', dropTime.toISOString());
      console.log('📍 Canvas Component Create started at:', createTime.toISOString());
      console.log('⏱️  DELAY BETWEEN DROP AND CREATE:', delay + 'ms');
      console.log('\n🚨 THIS IS THE PROBLEM! 🚨');
      console.log('The user experiences a ' + delay + 'ms delay between dropping');
      console.log('the component and the create sequence starting!');
      
      foundDrop = true;
      break;
    }
  }
  
  if (!foundDrop) {
    console.log('⚠️  Could not find library-component-drop-symphony before user create');
  }
  
} else {
  console.log('⚠️  Expected 2 create sequences, found', createSequences.length);
}

