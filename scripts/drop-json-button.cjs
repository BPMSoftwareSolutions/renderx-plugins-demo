const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

console.log('🎯 Dropping JSON button onto canvas\n');

// Load the button JSON
const buttonJsonPath = path.join(__dirname, '../json-components/button.json');
const buttonJson = JSON.parse(fs.readFileSync(buttonJsonPath, 'utf-8'));

console.log('📄 Loaded button JSON:', buttonJson.metadata.name);
console.log('   Type:', buttonJson.metadata.type);
console.log('   Description:', buttonJson.metadata.description);
console.log('');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

const componentId = `json-button-${Date.now()}`;
const fullId = `rx-node-${componentId}`;

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  console.log('📤 Creating button component at (300, 200)...');
  
  // Transform the JSON button into the format expected by canvas-component-create-symphony
  const createCommand = {
    type: 'play',
    pluginId: 'CanvasComponentPlugin',
    sequenceId: 'canvas-component-create-symphony',
    context: {
      component: {
        template: {
          tag: 'button',
          text: buttonJson.integration.properties.defaultValues.content || 'Click me',
          classes: ['rx-comp', 'rx-button'],
          dimensions: {
            width: buttonJson.integration.canvasIntegration.defaultWidth || 120,
            height: buttonJson.integration.canvasIntegration.defaultHeight || 40
          },
          style: {},
          css: buttonJson.ui.styles.css,
          cssVariables: buttonJson.ui.styles.variables
        }
      },
      position: { x: 300, y: 200 },
      correlationId: componentId,
      _overrideNodeId: fullId
    },
    id: `create-${Date.now()}`
  };
  
  ws.send(JSON.stringify(createCommand));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'ack') {
    console.log('✅ Button created!\n');
    console.log('📤 Verifying button on canvas...');
    
    setTimeout(() => {
      const queryCommand = {
        type: 'eval',
        code: `
          (function() {
            const el = document.getElementById('${fullId}');
            if (!el) return { error: 'Button not found' };
            
            const rect = el.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(el);
            
            return {
              id: el.id,
              tag: el.tagName.toLowerCase(),
              text: el.textContent,
              position: {
                left: el.style.left,
                top: el.style.top
              },
              size: {
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              style: {
                backgroundColor: computedStyle.backgroundColor,
                color: computedStyle.color,
                borderRadius: computedStyle.borderRadius,
                padding: computedStyle.padding
              },
              visible: rect.width > 0 && rect.height > 0,
              classes: Array.from(el.classList)
            };
          })()
        `,
        id: `query-${Date.now()}`
      };
      
      ws.send(JSON.stringify(queryCommand));
    }, 500);
    
  } else if (response.type === 'eval-result') {
    console.log('📨 Button details:\n');
    
    if (response.success) {
      const result = response.result;
      
      if (result.error) {
        console.log('❌ Error:', result.error);
      } else {
        console.log('✅ Button verified on canvas!');
        console.log('   ID:', result.id);
        console.log('   Text:', result.text);
        console.log('   Position:', result.position.left, result.position.top);
        console.log('   Size:', `${result.size.width}x${result.size.height}`);
        console.log('   Background:', result.style.backgroundColor);
        console.log('   Color:', result.style.color);
        console.log('   Border Radius:', result.style.borderRadius);
        console.log('   Classes:', result.classes.join(', '));
        console.log('   Visible:', result.visible ? '✅ Yes' : '❌ No');
        
        console.log('\n' + '='.repeat(70));
        console.log('✅ JSON BUTTON SUCCESSFULLY DROPPED ON CANVAS!');
        console.log('='.repeat(70));
        console.log('\n💡 Check the browser at position (300, 200)!');
      }
    } else {
      console.log('❌ Eval failed:', response.error);
    }
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 500);
  }
});

