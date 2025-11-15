const WebSocket = require('ws');

console.log('🎨 Creating a cool SVG component on canvas\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

const componentId = `svg-star-${Date.now()}`;
const fullId = `rx-node-${componentId}`;

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  console.log('📤 Creating animated gradient star SVG...\n');
  
  // Create a cool animated star with gradient
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
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path d="M 100 10 L 120 70 L 180 80 L 130 120 L 145 180 L 100 150 L 55 180 L 70 120 L 20 80 L 80 70 Z" 
          fill="url(#starGradient-${componentId})" 
          stroke="#fff" 
          stroke-width="2"
          filter="url(#glow-${componentId})">
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 100 100"
        to="360 100 100"
        dur="8s"
        repeatCount="indefinite"/>
    </path>
    <circle cx="100" cy="100" r="5" fill="#fff">
      <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
    </circle>
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
          dimensions: { width: 200, height: 200 },
          attributes: {
            viewBox: '0 0 200 200',
            preserveAspectRatio: 'xMidYMid meet'
          },
          svgMarkup: svgMarkup,
          style: {
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }
        }
      },
      position: { x: 800, y: 150 },
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
              position: {
                left: el.style.left,
                top: el.style.top
              },
              size: {
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              attributes: {
                viewBox: el.getAttribute('viewBox'),
                preserveAspectRatio: el.getAttribute('preserveAspectRatio')
              },
              hasAnimations: el.querySelectorAll('animate, animateTransform').length,
              hasGradient: el.querySelectorAll('linearGradient').length > 0,
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
      
      console.log('✅ SVG verified on canvas!\n');
      console.log('🎨 SVG Details:');
      console.log('   ID:', result.id);
      console.log('   Tag:', result.tag);
      console.log('   Position:', result.position.left, result.position.top);
      console.log('   Size:', result.size.width + 'x' + result.size.height);
      console.log('   ViewBox:', result.attributes.viewBox);
      console.log('   Animations:', result.hasAnimations);
      console.log('   Has Gradient:', result.hasGradient ? '✅ Yes' : '❌ No');
      console.log('   Visible:', result.visible ? '✅ Yes' : '❌ No');
      
      console.log('\n' + '='.repeat(70));
      console.log('✨ COOL ANIMATED SVG STAR CREATED ON CANVAS! ✨');
      console.log('='.repeat(70));
      console.log('\n💡 Features:');
      console.log('   🌈 Animated gradient (color cycling)');
      console.log('   🔄 Rotating star (360° in 8 seconds)');
      console.log('   ✨ Glowing effect with filter');
      console.log('   💫 Pulsing center dot');
      console.log('\n📍 Location: (800, 150) on the canvas');
      
    } else {
      console.log('❌ Error:', response.result?.error || 'Unknown error');
    }
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 500);
  }
});

