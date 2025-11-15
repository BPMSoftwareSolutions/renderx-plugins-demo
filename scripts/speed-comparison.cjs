const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

console.log('🏁 SPEED COMPARISON: Normal vs Lightning Mode\n');

const buttonJsonPath = path.join(__dirname, '../json-components/button.json');
const buttonJson = JSON.parse(fs.readFileSync(buttonJsonPath, 'utf-8'));

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

const testModes = [
  {
    name: 'Normal Mode',
    emoji: '🐌',
    animations: true,
    transitions: '0.3s ease',
    validations: true,
    feedback: true,
    delay: 200
  },
  {
    name: 'Lightning Mode',
    emoji: '⚡',
    animations: false,
    transitions: 'none',
    validations: false,
    feedback: false,
    delay: 10
  }
];

let currentModeIndex = 0;
let currentButtonIndex = 0;
let results = [];
let modeStartTime = null;

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  runNextMode();
});

function runNextMode() {
  if (currentModeIndex >= testModes.length) {
    showComparisonResults();
    return;
  }

  const mode = testModes[currentModeIndex];
  console.log(`${mode.emoji} Testing ${mode.name}...`);
  console.log(`   Animations: ${mode.animations ? 'Enabled' : 'Disabled'}`);
  console.log(`   Transitions: ${mode.transitions}`);
  console.log(`   Validations: ${mode.validations ? 'Full' : 'Minimal'}`);
  console.log('');

  modeStartTime = Date.now();
  currentButtonIndex = 0;
  createButtonInMode(mode);
}

function createButtonInMode(mode) {
  const buttonsToCreate = 3; // Create 3 buttons per mode for average
  
  if (currentButtonIndex >= buttonsToCreate) {
    // Mode complete
    const modeEndTime = Date.now();
    const modeDuration = modeEndTime - modeStartTime;
    const averagePerButton = modeDuration / buttonsToCreate;
    
    results.push({
      mode: mode.name,
      emoji: mode.emoji,
      totalTime: modeDuration,
      averageTime: averagePerButton,
      buttonsCreated: buttonsToCreate
    });
    
    console.log(`   ✅ ${mode.name} Complete: ${modeDuration}ms total, ${Math.round(averagePerButton)}ms avg\n`);
    
    currentModeIndex++;
    setTimeout(() => {
      runNextMode();
    }, 1000); // Brief pause between modes
    return;
  }

  const componentId = `comparison-${mode.name.toLowerCase().replace(' ', '-')}-${currentButtonIndex}-${Date.now()}`;
  const fullId = `rx-node-${componentId}`;
  const position = { 
    x: 150 + (currentModeIndex * 200) + (currentButtonIndex * 60), 
    y: 150 + (currentButtonIndex * 60) 
  };

  const buttonStartTime = Date.now();

  const createCommand = {
    type: 'play',
    pluginId: 'CanvasComponentPlugin',
    sequenceId: 'canvas-component-create-symphony',
    context: {
      component: {
        template: {
          tag: 'button',
          text: `${mode.emoji} ${currentButtonIndex + 1}`,
          classes: ['rx-comp', 'rx-button', `${mode.name.toLowerCase().replace(' ', '-')}-button`],
          dimensions: {
            width: buttonJson.integration.canvasIntegration.defaultWidth || 120,
            height: buttonJson.integration.canvasIntegration.defaultHeight || 40
          },
          style: {
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            transition: mode.animations ? mode.transitions : 'none',
            animation: mode.animations ? 'fadeIn 0.3s ease' : 'none'
          },
          css: buttonJson.ui.styles.css,
          cssVariables: {
            ...buttonJson.ui.styles.variables,
            '--transition-speed': mode.animations ? '300ms' : '0ms'
          }
        }
      },
      position: position,
      correlationId: componentId,
      _overrideNodeId: fullId,
      _speedMode: !mode.animations,
      _skipAnimations: !mode.animations,
      _skipValidation: !mode.validations,
      _enableFeedback: mode.feedback
    },
    id: `comparison-create-${Date.now()}`,
    priority: mode.animations ? 'NORMAL' : 'HIGH'
  };

  console.log(`   Creating button ${currentButtonIndex + 1}/3...`);
  ws.send(JSON.stringify(createCommand));

  // Store timing for this button
  const buttonData = {
    startTime: buttonStartTime,
    mode: mode.name,
    index: currentButtonIndex
  };

  ws.once('message', (data) => {
    const response = JSON.parse(data.toString());
    
    if (response.type === 'ack') {
      const buttonEndTime = Date.now();
      const buttonDuration = buttonEndTime - buttonData.startTime;
      console.log(`      ✅ Button ${currentButtonIndex + 1} created in ${buttonDuration}ms`);
      
      currentButtonIndex++;
      
      // Wait based on mode before creating next button
      setTimeout(() => {
        createButtonInMode(mode);
      }, mode.delay);
    }
  });
}

function showComparisonResults() {
  const normalMode = results.find(r => r.mode === 'Normal Mode');
  const lightningMode = results.find(r => r.mode === 'Lightning Mode');
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 SPEED COMPARISON RESULTS');
  console.log('='.repeat(80));
  console.log('');
  
  results.forEach(result => {
    console.log(`${result.emoji} ${result.mode}:`);
    console.log(`   Total Time: ${result.totalTime}ms`);
    console.log(`   Average per Button: ${Math.round(result.averageTime)}ms`);
    console.log(`   Buttons Created: ${result.buttonsCreated}`);
    console.log('');
  });
  
  if (normalMode && lightningMode) {
    const speedImprovement = Math.round(normalMode.averageTime / lightningMode.averageTime);
    const timeSaved = normalMode.totalTime - lightningMode.totalTime;
    const percentageFaster = Math.round(((normalMode.averageTime - lightningMode.averageTime) / normalMode.averageTime) * 100);
    
    console.log('🚀 Performance Improvement:');
    console.log(`   Lightning Mode is ${speedImprovement}x faster`);
    console.log(`   Time Saved: ${timeSaved}ms total`);
    console.log(`   Percentage Faster: ${percentageFaster}%`);
    console.log('');
    
    console.log('📈 What This Means:');
    console.log(`   For 100 components: Save ${Math.round(timeSaved * 100 / 3000)}+ seconds`);
    console.log(`   For 1000 components: Save ${Math.round(timeSaved * 1000 / 3000 / 60)}+ minutes`);
  }
  
  console.log('');
  console.log('💡 Check the browser to see both sets of buttons!');
  console.log('   Normal Mode buttons: Left side (slower creation)');
  console.log('   Lightning Mode buttons: Right side (instant creation)');
  
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 2000);
}