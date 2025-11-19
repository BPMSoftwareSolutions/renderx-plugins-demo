/**
 * CLI Bridge - Connects browser conductor to CLI via Vite WebSocket
 * Allows CLI to trigger sequences in the running browser
 */

export function initCLIBridge() {
  if (typeof window === 'undefined' || import.meta.env.PROD) {
    return; // Only run in dev mode
  }

  console.log('🎼 Initializing CLI Bridge...');

  // Listen for CLI commands via Vite's HMR WebSocket
  if (import.meta.hot) {
    import.meta.hot.on('conductor:cli-command', async (message: any) => {
      console.log('📨 Received CLI command:', message);

      try {
        const conductor = (window as any).RenderX?.conductor;

        if (message.type === 'play') {
          if (!conductor) {
            console.error('❌ Conductor not found');
            if (import.meta.hot) {
              import.meta.hot.send('conductor:cli-response', {
                id: message.id,
                type: 'play-result',
                error: 'Conductor not found',
                success: false
              });
            }
            return;
          }

          const { pluginId, sequenceId, context } = message;
          console.log(`🎵 Playing sequence: ${pluginId}/${sequenceId}`);

          try {
            const result = await conductor.play(pluginId, sequenceId, context);
            console.log('✅ Sequence completed:', result);

            // Send result back to CLI
            if (import.meta.hot) {
              import.meta.hot.send('conductor:cli-response', {
                id: message.id,
                type: 'play-result',
                result,
                success: true
              });
            }
          } catch (error: any) {
            console.error('❌ Sequence failed:', error);
            if (import.meta.hot) {
              import.meta.hot.send('conductor:cli-response', {
                id: message.id,
                type: 'play-result',
                error: error.message,
                success: false
              });
            }
          }

        } else if (message.type === 'list-sequences') {
          if (!conductor) {
            console.error('❌ Conductor not found');
            if (import.meta.hot) {
              import.meta.hot.send('conductor:cli-response', {
                id: message.id,
                type: 'sequences-list',
                error: 'Conductor not found',
                sequences: [],
                success: false
              });
            }
            return;
          }

          try {
            const sequences = conductor.getRegisteredSequences?.() || [];
            console.log('📋 Registered sequences:', sequences);

            if (import.meta.hot) {
              import.meta.hot.send('conductor:cli-response', {
                id: message.id,
                type: 'sequences-list',
                sequences,
                success: true
              });
            }
          } catch (error: any) {
            console.error('❌ Failed to get sequences:', error);
            if (import.meta.hot) {
              import.meta.hot.send('conductor:cli-response', {
                id: message.id,
                type: 'sequences-list',
                error: error.message,
                sequences: [],
                success: false
              });
            }
          }

        } else if (message.type === 'eval') {
          // Execute JavaScript code in the browser and return the result
          const { code, id } = message;
          console.log(`🔍 Evaluating code from CLI (id: ${id})`);

          try {
            // Execute the code and capture the result
            const result = eval(code);
            console.log('✅ Eval result:', result);

            // Send the result back via the same WebSocket channel
            // We'll use a custom event to send data back to CLI
            if (import.meta.hot) {
              import.meta.hot.send('conductor:cli-response', {
                id,
                type: 'eval-result',
                result,
                success: true
              });
            }
          } catch (error: any) {
            console.error('❌ Eval failed:', error);
            if (import.meta.hot) {
              import.meta.hot.send('conductor:cli-response', {
                id,
                type: 'eval-result',
                error: error.message,
                success: false
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ CLI command failed:', error);
      }
    });

    console.log('✅ CLI Bridge initialized');
  }
}

