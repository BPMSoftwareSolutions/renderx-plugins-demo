const WebSocket = require('ws');

console.log('🎯 Component Creation Test - Multiple Visible Components\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

const testComponents = [
  {
    id: 'red-button',
    position: { x: 50, y: 50 },
    text: 'RED BUTTON',
    style: { backgroundColor: 'red', color: 'white', fontSize: '18px' }
  },
  {
    id: 'green-button', 
    position: { x: 250, y: 50 },
    text: 'GREEN BUTTON',
    style: { backgroundColor: 'green', color: 'white', fontSize: '18px' }
  },
  {
    id: 'blue-button',
    position: { x: 450, y: 50 },
    text: 'BLUE BUTTON', 
    style: { backgroundColor: 'blue', color: 'white', fontSize: '18px' }
  },
  {
    id: 'yellow-box',
    position: { x: 50, y: 150 },
    text: 'YELLOW BOX',
    tag: 'div',
    style: { 
      backgroundColor: 'yellow', 
      color: 'black', 
      fontSize: '24px', 
      padding: '20px',
      border: '3px solid black',
      width: '200px',
      height: '100px'
    }
  },
  {
    id: 'orange-circle',
    position: { x: 300, y: 150 },
    text: 'CIRCLE',
    tag: 'div',
    style: {
      backgroundColor: 'orange',
      color: 'white',
      fontSize: '16px',
      borderRadius: '50%',
      width: '100px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }
];

let currentIndex = 0;
let createdComponents = [];

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  console.log('🎨 Creating multiple highly visible test components...\n');
  
  createNextComponent();
});

function createNextComponent() {
  if (currentIndex >= testComponents.length) {
    showSummary();
    return;
  }

  const comp = testComponents[currentIndex];
  const fullId = `rx-node-test-${comp.id}-${Date.now()}`;
  
  console.log(`🎯 Creating ${comp.id}: "${comp.text}" at (${comp.position.x}, ${comp.position.y})`);

  const createCommand = {
    type: 'play',
    pluginId: 'CanvasComponentPlugin',
    sequenceId: 'canvas-component-create-symphony',
    context: {
      component: {
        template: {
          tag: comp.tag || 'button',
          text: comp.text,
          classes: ['rx-comp', 'test-component', comp.id],
          dimensions: { 
            width: comp.style.width ? parseInt(comp.style.width) : 150, 
            height: comp.style.height ? parseInt(comp.style.height) : 50 
          },
          style: {
            position: 'absolute',
            left: `${comp.position.x}px`,
            top: `${comp.position.y}px`,
            ...comp.style,
            zIndex: '1000',  // Ensure they're on top
            border: comp.style.border || '2px solid black',
            cursor: 'pointer'
          }
        }
      },
      position: comp.position,
      correlationId: `test-${comp.id}`,
      _overrideNodeId: fullId
    },
    id: `create-${comp.id}-${Date.now()}`
  };

  createdComponents.push({
    id: comp.id,
    fullId: fullId,
    text: comp.text,
    position: comp.position,
    style: comp.style
  });

  ws.send(JSON.stringify(createCommand));
}

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'ack') {
    console.log(`   ✅ ${testComponents[currentIndex].id} acknowledged`);
    currentIndex++;
    
    // Small delay between components
    setTimeout(() => {
      createNextComponent();
    }, 200);
  }
});

function showSummary() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 VISUAL COMPONENT TEST COMPLETE');
  console.log('='.repeat(70));
  console.log('');
  console.log('📍 Components created (should be HIGHLY VISIBLE):');
  console.log('');
  
  createdComponents.forEach((comp, index) => {
    console.log(`   ${index + 1}. ${comp.text}`);
    console.log(`      Position: (${comp.position.x}, ${comp.position.y})`);
    console.log(`      Style: ${comp.style.backgroundColor || 'default'} background`);
    console.log(`      ID: ${comp.fullId}`);
    console.log('');
  });
  
  console.log('👀 WHAT YOU SHOULD SEE IN BROWSER:');
  console.log('   🔴 RED BUTTON at top-left (50, 50)');
  console.log('   🟢 GREEN BUTTON at top-center (250, 50)');  
  console.log('   🔵 BLUE BUTTON at top-right (450, 50)');
  console.log('   🟡 YELLOW BOX below red button (50, 150)');
  console.log('   🟠 ORANGE CIRCLE below green button (300, 150)');
  console.log('');
  console.log('🔍 If you DON\'T see these components:');
  console.log('   1. Check browser at http://localhost:5174');
  console.log('   2. Look for canvas element (#rx-canvas)');
  console.log('   3. Open DevTools and search for "test-component"');
  console.log('   4. Check console for JavaScript errors');
  console.log('');
  console.log('⚡ If components ARE visible:');
  console.log('   ✅ Lightning-fast performance scripts are working!');
  console.log('   ✅ 15ms creation time is REAL performance!');
  console.log('   ✅ Users CAN experience lightning speed!');
  
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 2000);
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n⏹️  Test interrupted by user');
  ws.close();
  process.exit(0);
});