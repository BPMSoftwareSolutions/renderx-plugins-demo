const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

console.log('🎨 Creating SVG component from template\n');

// Load the SVG JSON template
const svgJsonPath = path.join(__dirname, '../json-components/svg.json');
const svgJson = JSON.parse(fs.readFileSync(svgJsonPath, 'utf-8'));

console.log('📄 Loaded SVG template:', svgJson.metadata.name);
console.log('   Description:', svgJson.metadata.description);
console.log('');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

const componentId = `svg-cool-${Date.now()}`;
const fullId = `rx-node-${componentId}`;

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  console.log('📤 Creating animated gradient star SVG...\n');
  
  // Create cool SVG markup with animations
  const svgMarkup = `
    <defs>
      <linearGradient id="starGradient-${componentId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1">
          <animate attributeName="stop-color" values="#ff6b6b;#4ecdc4;#45b7d1;#ff6b6b" dur="4s" repeatCount="indefinite"/>
        </stop>
        <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1">
          <animate attributeName="stop-color" values="#4ecdc4;#45b7d1;#ff6b6b;#4ecdc4" dur="4s" repeatCount="indefinite"/>
        </stop>
      </linearGradient>
      <filter id="glow-${componentId}">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <radialGradient id="bgGradient-${componentId}">
        <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1"/>
        <stop offset="100%" style="stop-color:#0f0f1e;stop-opacity:1"/>
      </radialGradient>
    </defs>
    
    <!-- Background -->
    <rect width="900" height="500" fill="url(#bgGradient-${componentId})"/>
    
    <!-- Animated star -->
    <g transform="translate(450, 250)">
      <path d="M 0 -80 L 20 -20 L 80 -10 L 30 30 L 45 90 L 0 60 L -45 90 L -30 30 L -80 -10 L -20 -20 Z" 
            fill="url(#starGradient-${componentId})" 
            stroke="#fff" 
            stroke-width="3"
            filter="url(#glow-${componentId})">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="8s"
          repeatCount="indefinite"/>
      </path>
      
      <!-- Pulsing center -->
      <circle cx="0" cy="0" r="8" fill="#fff">
        <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      <!-- Orbiting particles -->
      <circle cx="0" cy="-100" r="4" fill="#4ecdc4">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="-100" r="4" fill="#ff6b6b">
        <animateTransform attributeName="transform" type="rotate" from="120 0 0" to="480 0 0" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="-100" r="4" fill="#45b7d1">
        <animateTransform attributeName="transform" type="rotate" from="240 0 0" to="600 0 0" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>
    
    <!-- Title text -->
    <text x="450" y="450" text-anchor="middle" fill="#fff" font-size="24" font-family="Arial, sans-serif" opacity="0.8">
      ✨ Animated Star ✨
    </text>
  `;
  
  const createCommand = {
    type: 'play',
    pluginId: 'CanvasComponentPlugin',
    sequenceId: 'canvas-component-create-symphony',
    context: {
      component: {
        template: {
          tag: 'svg',
          classes: ['rx-comp', 'rx-svg'],
          dimensions: {
            width: svgJson.integration.canvasIntegration.defaultWidth,
            height: svgJson.integration.canvasIntegration.defaultHeight
          },
          attributes: {
            viewBox: svgJson.integration.properties.defaultValues.viewBox,
            preserveAspectRatio: svgJson.integration.properties.defaultValues.preserveAspectRatio
          },
          svgMarkup: svgMarkup,
          css: svgJson.ui.styles.css,
          cssVariables: svgJson.ui.styles.variables || {}
        }
      },
      position: { x: 50, y: 400 },
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
    console.log('✅ SVG component created!\n');
    console.log('📤 Verifying SVG on canvas...\n');
    
    setTimeout(() => {
      const queryCommand = {
        type: 'eval',
        code: `
          (function() {
            const el = document.getElementById('${fullId}');
            if (!el) return { error: 'SVG not found' };
            
            const rect = el.getBoundingClientRect();
            
            return {
              id: el.id,
              tag: el.tagName.toLowerCase(),
              position: { left: el.style.left, top: el.style.top },
              size: { width: Math.round(rect.width), height: Math.round(rect.height) },
              viewBox: el.getAttribute('viewBox'),
              animations: el.querySelectorAll('animate, animateTransform').length,
              gradients: el.querySelectorAll('linearGradient, radialGradient').length,
              visible: rect.width > 0 && rect.height > 0
            };
          })()
        `,
        id: `query-${Date.now()}`
      };
      
      ws.send(JSON.stringify(queryCommand));
    }, 500);
    
  } else if (response.type === 'eval-result') {
    if (response.success && !response.result.error) {
      const result = response.result;
      
      console.log('✅ SVG verified!\n');
      console.log('🎨 Details:');
      console.log('   Position:', result.position.left, result.position.top);
      console.log('   Size:', result.size.width + 'x' + result.size.height);
      console.log('   ViewBox:', result.viewBox);
      console.log('   Animations:', result.animations);
      console.log('   Gradients:', result.gradients);
      console.log('   Visible:', result.visible ? '✅' : '❌');
      
      console.log('\n' + '='.repeat(70));
      console.log('✨ COOL ANIMATED SVG CREATED FROM TEMPLATE! ✨');
      console.log('='.repeat(70));
      console.log('\n💡 Features:');
      console.log('   🌈 Color-cycling gradient star');
      console.log('   🔄 Rotating animation (8s)');
      console.log('   ✨ Glowing effect');
      console.log('   💫 Pulsing center');
      console.log('   🌀 3 orbiting particles');
      console.log('   🌌 Dark gradient background');
      console.log('\n📍 Location: (50, 400)');
    } else {
      console.log('❌ Error:', response.result?.error);
    }
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 500);
  }
});

