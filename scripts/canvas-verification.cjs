const WebSocket = require('ws');

console.log('🔍 Canvas Component Verification - Checking what\'s actually on the canvas\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  
  console.log('📤 Step 1: Checking canvas existence and current state...\n');
  
  const canvasCheckCommand = {
    type: 'eval',
    code: `
      (function() {
        // Check if canvas exists
        const canvas = document.getElementById('rx-canvas');
        if (!canvas) {
          return { error: 'Canvas element #rx-canvas not found' };
        }
        
        // Get all elements in canvas
        const allElements = Array.from(canvas.children);
        const buttons = Array.from(canvas.querySelectorAll('button'));
        const allButtons = Array.from(document.querySelectorAll('button'));
        
        // Get elements with rx- classes
        const rxElements = Array.from(canvas.querySelectorAll('[class*="rx-"]'));
        
        // Get elements with specific IDs we've been creating
        const lightningButtons = Array.from(canvas.querySelectorAll('[id*="lightning-button"]'));
        const jsonButtons = Array.from(canvas.querySelectorAll('[id*="json-button"]'));
        const diagButtons = Array.from(canvas.querySelectorAll('[id*="diag-button"]'));
        const speedButtons = Array.from(canvas.querySelectorAll('[class*="speed-mode"]'));
        
        return {
          canvas: {
            exists: true,
            tagName: canvas.tagName,
            id: canvas.id,
            childrenCount: allElements.length,
            innerHTML: canvas.innerHTML.length > 0 ? canvas.innerHTML.substring(0, 200) + '...' : 'EMPTY'
          },
          buttons: {
            inCanvas: buttons.length,
            inDocument: allButtons.length,
            buttonDetails: buttons.map(btn => ({
              id: btn.id,
              text: btn.textContent,
              classes: Array.from(btn.classList),
              position: {
                left: btn.style.left || 'not set',
                top: btn.style.top || 'not set'
              },
              visible: btn.offsetWidth > 0 && btn.offsetHeight > 0,
              rect: {
                x: Math.round(btn.getBoundingClientRect().x),
                y: Math.round(btn.getBoundingClientRect().y),
                width: Math.round(btn.getBoundingClientRect().width),
                height: Math.round(btn.getBoundingClientRect().height)
              }
            }))
          },
          rxElements: {
            count: rxElements.length,
            elements: rxElements.map(el => ({
              tagName: el.tagName,
              id: el.id,
              classes: Array.from(el.classList)
            }))
          },
          specificButtons: {
            lightning: lightningButtons.length,
            json: jsonButtons.length,
            diag: diagButtons.length,
            speed: speedButtons.length
          },
          canvasStyles: {
            display: getComputedStyle(canvas).display,
            visibility: getComputedStyle(canvas).visibility,
            width: getComputedStyle(canvas).width,
            height: getComputedStyle(canvas).height,
            position: getComputedStyle(canvas).position
          }
        };
      })()
    `,
    id: `canvas-check-${Date.now()}`
  };
  
  ws.send(JSON.stringify(canvasCheckCommand));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'eval-result') {
    if (response.success && response.result) {
      const result = response.result;
      
      if (result.error) {
        console.log('❌ Error:', result.error);
      } else {
        console.log('🎨 Canvas Status:');
        console.log(`   Element: <${result.canvas.tagName.toLowerCase()}> with ID "${result.canvas.id}"`);
        console.log(`   Children: ${result.canvas.childrenCount} elements`);
        console.log(`   Content: ${result.canvas.innerHTML === 'EMPTY' ? '❌ EMPTY' : '✅ Has content'}`);
        console.log(`   Dimensions: ${result.canvasStyles.width} x ${result.canvasStyles.height}`);
        console.log(`   Display: ${result.canvasStyles.display}, Visibility: ${result.canvasStyles.visibility}`);
        console.log('');
        
        console.log('🔘 Button Analysis:');
        console.log(`   Total buttons in canvas: ${result.buttons.inCanvas}`);
        console.log(`   Total buttons in document: ${result.buttons.inDocument}`);
        console.log('');
        
        if (result.buttons.buttonDetails.length > 0) {
          console.log('📍 Button Details:');
          result.buttons.buttonDetails.forEach((btn, index) => {
            console.log(`   ${index + 1}. ID: ${btn.id}`);
            console.log(`      Text: "${btn.text}"`);
            console.log(`      Classes: ${btn.classes.join(', ')}`);
            console.log(`      Position: ${btn.position.left}, ${btn.position.top}`);
            console.log(`      Screen Rect: (${btn.rect.x}, ${btn.rect.y}) ${btn.rect.width}x${btn.rect.height}`);
            console.log(`      Visible: ${btn.visible ? '✅ Yes' : '❌ No'}`);
            console.log('');
          });
        } else {
          console.log('   ❌ NO BUTTONS FOUND IN CANVAS');
        }
        
        console.log('🎯 Specific Button Types:');
        console.log(`   Lightning buttons: ${result.specificButtons.lightning}`);
        console.log(`   JSON buttons: ${result.specificButtons.json}`);
        console.log(`   Diagnostic buttons: ${result.specificButtons.diag}`);
        console.log(`   Speed mode buttons: ${result.specificButtons.speed}`);
        console.log('');
        
        console.log('🧩 RenderX Elements:');
        console.log(`   Total rx- elements: ${result.rxElements.count}`);
        if (result.rxElements.elements.length > 0) {
          result.rxElements.elements.slice(0, 5).forEach((el, index) => {
            console.log(`   ${index + 1}. <${el.tagName.toLowerCase()}> ID: ${el.id} Classes: ${el.classes.join(', ')}`);
          });
          if (result.rxElements.elements.length > 5) {
            console.log(`   ... and ${result.rxElements.elements.length - 5} more`);
          }
        }
        
        // Summary
        console.log('\n' + '='.repeat(70));
        if (result.buttons.inCanvas === 0 && result.canvas.innerHTML === 'EMPTY') {
          console.log('❌ CANVAS IS EMPTY - NO COMPONENTS WERE ACTUALLY CREATED');
          console.log('   The scripts may be failing silently or components aren\'t reaching the DOM');
        } else if (result.buttons.inCanvas > 0) {
          console.log('✅ COMPONENTS FOUND ON CANVAS');
          console.log(`   ${result.buttons.inCanvas} button(s) successfully created and visible`);
        } else {
          console.log('⚠️  CANVAS HAS CONTENT BUT NO BUTTONS');
          console.log('   Components may exist but not be button elements');
        }
        console.log('='.repeat(70));
      }
    } else {
      console.log('❌ Canvas check failed:', response.error);
    }
    
    // Now try to create a test component to see if creation works
    console.log('\n📤 Step 2: Testing component creation...\n');
    
    setTimeout(() => {
      const testCreateCommand = {
        type: 'play',
        pluginId: 'CanvasComponentPlugin',
        sequenceId: 'canvas-component-create-symphony',
        context: {
          component: {
            template: {
              tag: 'button',
              text: 'VERIFICATION TEST',
              classes: ['rx-comp', 'rx-button', 'verification-test'],
              dimensions: { width: 150, height: 50 },
              style: {
                backgroundColor: 'red',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            }
          },
          position: { x: 50, y: 50 },
          correlationId: `verify-test-${Date.now()}`,
          _overrideNodeId: `rx-node-verify-test-${Date.now()}`
        },
        id: `verify-create-${Date.now()}`
      };
      
      console.log('📤 Creating verification test button...');
      ws.send(JSON.stringify(testCreateCommand));
    }, 1000);
    
  } else if (response.type === 'ack' && response.id && response.id.includes('verify-create')) {
    console.log('✅ Test button creation acknowledged');
    
    // Check again after creation
    setTimeout(() => {
      console.log('\n📤 Step 3: Re-checking canvas after test creation...\n');
      
      const recheckCommand = {
        type: 'eval',
        code: `
          (function() {
            const canvas = document.getElementById('rx-canvas');
            const buttons = Array.from(canvas.querySelectorAll('button'));
            const testButton = document.querySelector('.verification-test');
            
            return {
              totalButtons: buttons.length,
              testButtonExists: !!testButton,
              testButtonDetails: testButton ? {
                id: testButton.id,
                text: testButton.textContent,
                visible: testButton.offsetWidth > 0 && testButton.offsetHeight > 0,
                rect: testButton.getBoundingClientRect(),
                style: {
                  backgroundColor: testButton.style.backgroundColor,
                  color: testButton.style.color
                }
              } : null,
              canvasHTML: canvas.innerHTML.length > 0 ? canvas.innerHTML.substring(0, 500) : 'EMPTY'
            };
          })()
        `,
        id: `recheck-${Date.now()}`
      };
      
      ws.send(JSON.stringify(recheckCommand));
    }, 2000);
    
  } else if (response.type === 'eval-result' && response.id && response.id.includes('recheck')) {
    if (response.success && response.result) {
      const result = response.result;
      
      console.log('🔍 Post-Creation Analysis:');
      console.log(`   Total buttons now: ${result.totalButtons}`);
      console.log(`   Test button exists: ${result.testButtonExists ? '✅ Yes' : '❌ No'}`);
      
      if (result.testButtonDetails) {
        console.log('   Test button details:');
        console.log(`      ID: ${result.testButtonDetails.id}`);
        console.log(`      Text: "${result.testButtonDetails.text}"`);
        console.log(`      Visible: ${result.testButtonDetails.visible ? '✅ Yes' : '❌ No'}`);
        console.log(`      Position: (${Math.round(result.testButtonDetails.rect.x)}, ${Math.round(result.testButtonDetails.rect.y)})`);
        console.log(`      Size: ${Math.round(result.testButtonDetails.rect.width)}x${Math.round(result.testButtonDetails.rect.height)}`);
      }
      
      console.log('\n🔍 Canvas HTML Sample:');
      console.log(result.canvasHTML === 'EMPTY' ? '❌ STILL EMPTY' : '✅ Has content');
      if (result.canvasHTML !== 'EMPTY') {
        console.log(`Sample: ${result.canvasHTML}`);
      }
      
      console.log('\n' + '='.repeat(70));
      console.log('🔍 VERIFICATION COMPLETE');
      console.log('='.repeat(70));
      
      if (result.testButtonExists) {
        console.log('✅ Component creation is working - test button was created successfully');
        console.log('💡 Previous scripts may have worked but components might be positioned off-screen');
      } else {
        console.log('❌ Component creation is failing - test button was not created');
        console.log('🔧 There may be an issue with the plugin system or canvas element');
      }
    }
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 1000);
  }
});

ws.on('close', () => {
  console.log('🔌 WebSocket connection closed');
});

// Auto-exit after 15 seconds
setTimeout(() => {
  console.log('\n⏰ Verification timeout - exiting');
  ws.close();
  process.exit(0);
}, 15000);