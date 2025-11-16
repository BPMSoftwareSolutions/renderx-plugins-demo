/* eslint-disable play-routing/no-hardcoded-play-ids */
// Script to trigger canvas.component.create from browser console
// This will create a button component on the canvas programmatically

(function() {
  console.log('🎯 Triggering canvas.component.create sequence...');
  
  // Get the conductor instance from the window
  const conductor = window.RenderX?.conductor;
  
  if (!conductor) {
    console.error('❌ Conductor not found. Make sure the app is running.');
    return;
  }
  
  // Create a button component payload
  const payload = {
    component: {
      template: {
        tag: 'button',
        text: 'Test Button',
        classes: ['rx-comp', 'rx-button'],
        style: {
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          backgroundColor: '#007bff',
          color: '#ffffff',
          cursor: 'pointer'
        },
        dimensions: {
          width: 120,
          height: 40
        }
      }
    },
    position: {
      x: 100,
      y: 100
    },
    correlationId: `test-${Date.now()}`
  };
  
  console.log('📦 Payload:', payload);
  
  // Trigger the sequence
  conductor.play('CanvasComponentPlugin', 'canvas-component-create-symphony', payload)
    .then(() => {
      console.log('✅ Sequence completed! Check the canvas for the button.');
    })
    .catch((error) => {
      console.error('❌ Sequence failed:', error);
    });
})();

