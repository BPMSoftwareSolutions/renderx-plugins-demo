import { test, expect } from '@playwright/test';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
// Note: Do NOT import resolveInteraction here for use inside page.evaluate.
// In the browser context, use window.RenderX.resolveInteraction instead.

test.describe('Control Panel Selection Guardrail (Headless)', () => {
  let allLogs: string[] = [];
  let testStartTime: number;
  
  test.beforeEach(async ({ page }) => {
    testStartTime = Date.now();
    allLogs = [];
    
    // Capture ALL console output for logging
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      const timestamp = new Date().toISOString();
      
      // Store all logs with timestamps
      allLogs.push(`${timestamp} [${type}] ${text}`);
      
      // Log important events to Node.js console during test execution
      if (text.includes('[SYMPHONY]') || 
          text.includes('[sdk] publish') ||
          text.includes('[TEST]') ||
          text.includes('Startup validation') ||
          text.includes('🎼') ||
          text.includes('🔌') ||
          text.includes('📡') ||
          text.includes('✅') ||
          text.includes('topics') || 
          text.includes('Routing') ||
          text.includes('control.panel') ||
          text.includes('canvas.component.selection') ||
          text.includes('EventRouter') ||
          text.includes('useControlPanelState') ||
          type === 'error' || 
          type === 'warning') {
        console.log(`[browser:${type}] ${text}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for host bridges and plugins to load
    await page.waitForFunction(() => {
      const rx: any = (window as any).RenderX;
      return !!(rx && rx.EventRouter && typeof rx.EventRouter.publish === 'function');
    }, undefined, { timeout: 8000 });

    // Wait for Control Panel to be visible
    await page.waitForSelector('[data-slot="controlPanel"]', { timeout: 8000 });
  });

  test.afterEach(async ({ page: _page }, testInfo) => {
    // Save logs to file after each test
    const logsDir = resolve(process.cwd(), '.logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    
    const testName = testInfo.title.replace(/[^a-zA-Z0-9]/g, '-');
    const logFileName = `e2e-${testName}-${testStartTime}.log`;
    const logFilePath = resolve(logsDir, logFileName);
    
    // Add test metadata to logs
    const testMetadata = [
      `=== E2E Test Log: ${testInfo.title} ===`,
      `Test Started: ${new Date(testStartTime).toISOString()}`,
      `Test Completed: ${new Date().toISOString()}`,
      `Test Status: ${testInfo.status}`,
      `Total Log Entries: ${allLogs.length}`,
      `Browser: ${testInfo.project.name || 'default'}`,
      `===================================`,
      ''
    ];
    
    const fullLog = testMetadata.concat(allLogs).join('\n');
    
    try {
      writeFileSync(logFilePath, fullLog, 'utf8');
      console.log(`\n📋 Test logs saved to: ${logFilePath}`);
      console.log(`📊 Captured ${allLogs.length} log entries`);
    } catch (error) {
      console.error('Failed to save test logs:', error);
    }
  });

  test('canvas.component.selection.changed → control.panel.ui.render.requested → UI updates', async ({ page }) => {
    console.log('\n=== Control Panel Selection Guardrail Test (Headless) ===');
    
    // Wait for Control Panel header to appear with better error handling
    try {
      await page.waitForSelector('.control-panel-header', { timeout: 10000 });
      console.log('✅ Control Panel header mounted');
    } catch (error) {
      console.log('❌ Control Panel header failed to mount:', String(error));
      
      // Check what we have on the page
      const slots = await page.$$('[data-slot]');
      console.log(`Found ${slots.length} slots on page`);
      
      for (const slot of slots) {
        const slotName = await slot.getAttribute('data-slot');
        const content = await slot.textContent();
        console.log(`  - ${slotName}: "${content?.substring(0, 50)}..."`);
      }
      
      throw error;
    }

    // Get initial state with fallback
    let initialState: string | null = null;
    try {
      initialState = await page.locator('.control-panel-header .element-type').first().textContent({ timeout: 2000 });
    } catch {
      // Fallback: check if header exists but no element-type
      const headerExists = await page.locator('.control-panel-header').count() > 0;
      initialState = headerExists ? 'header-exists-no-type' : 'no-header';
    }
        console.log(`📋 Initial Control Panel state: "${initialState}"`);

    // Capture Control Panel HTML before selection
    const controlPanelHtmlBefore = await page.evaluate(() => {
      const controlPanel = document.querySelector('[data-slot="controlPanel"]');
      if (controlPanel) {
        return {
          found: true,
          innerHTML: controlPanel.innerHTML,
          textContent: controlPanel.textContent?.trim() || '',
          childElementCount: controlPanel.childElementCount
        };
      }
      return { found: false };
    });

    console.log(`[TEST] 🏗️ Control Panel HTML BEFORE selection:`);
    console.log(`[TEST] 🏗️ Found: ${controlPanelHtmlBefore.found}`);
    if (controlPanelHtmlBefore.found && 'childElementCount' in controlPanelHtmlBefore) {
      console.log(`[TEST] 🏗️ Child elements: ${controlPanelHtmlBefore.childElementCount}`);
      console.log(`[TEST] 🏗️ Text content: "${controlPanelHtmlBefore.textContent}"`);
      console.log(`[TEST] 🏗️ Inner HTML:\n${controlPanelHtmlBefore.innerHTML}`);
    }

    // Set up event tracking with error handling and symphony loading monitoring
  const eventCapture = await page.evaluate(() => {
      try {
        const events: any[] = [];
        const rx = (window as any).RenderX;
        
        if (!rx?.EventRouter) {
          return { error: 'RenderX.EventRouter not available' };
        }
        
        // PATCH: Check if getTopicDef is now available globally
        try {
          const getTopicDef = (window as any).RenderX?.getTopicDef;
          if (getTopicDef) {
            const topicDef = getTopicDef('canvas.component.selection.changed');
            console.log('[TEST] 🔧 Global getTopicDef result:', JSON.stringify({
              found: !!topicDef,
              routes: topicDef?.routes || [],
              perf: topicDef?.perf || {},
              hasRoutes: !!(topicDef?.routes && topicDef.routes.length > 0),
              routeCount: topicDef?.routes?.length || 0
            }, null, 2));
          } else {
            console.log('[TEST] ⚠️ Global getTopicDef is not available on RenderX');
          }
        } catch (patchError) {
          console.log('[TEST] ⚠️ Error accessing global getTopicDef:', patchError);
        }
        
        // Monitor conductor operations for symphony debugging
        const conductor = (window as any).renderxCommunicationSystem?.conductor;
        if (conductor) {
          // Intercept mount operations to see if symphonies are loading
          const originalMount = conductor.mount;
          if (originalMount) {
            conductor.mount = function(seq: any, handlers: any, pluginId: any) {
              console.log('[TEST] 🎼 Symphony mount attempt:', {
                sequenceId: seq?.id,
                pluginId,
                hasHandlers: !!handlers,
                handlerKeys: handlers ? Object.keys(handlers) : [],
                isSelectionSequence: seq?.id === 'control-panel-selection-show-symphony'
              });
              
              // For selection symphony, log more details
              if (seq?.id === 'control-panel-selection-show-symphony') {
                console.log('[TEST] 🎯 Selection symphony details:', {
                  handlerKeys: handlers ? Object.keys(handlers) : [],
                  notifyUiHandler: typeof handlers?.notifyUi,
                  deriveSelectionModelHandler: typeof handlers?.deriveSelectionModel
                });
              }
              
              return originalMount.call(this, seq, handlers, pluginId);
            };
          }
        }
        
        // Track canvas selection events
        rx.EventRouter.subscribe('canvas.component.selection.changed', (data: any) => {
          events.push({ type: 'canvas.component.selection.changed', data, timestamp: Date.now() });
          console.log('[TEST] 📨 canvas.component.selection.changed:', data);
        });
        
        // Track control panel render requests  
        rx.EventRouter.subscribe('control.panel.ui.render.requested', (data: any) => {
          events.push({ type: 'control.panel.ui.render.requested', data, timestamp: Date.now() });
          console.log('[TEST] 📨 control.panel.ui.render.requested:', data);
        });
        
        // Store events globally for retrieval
        (window as any).__testEvents = events;
        return { setupComplete: true, eventRouterAvailable: true };
      } catch (error) {
        return { error: String(error) };
      }
    });

    if (eventCapture.error) {
      console.log('❌ Event tracking setup failed:', eventCapture.error);
      throw new Error(eventCapture.error);
    }
    
    // Debug the observer store state after initial setup
    const debugInfo = await page.evaluate(() => {
      try {
        const globalStore = (globalThis as any).__RX_CP_OBSERVERS__;
        return {
          hasGlobalStore: !!globalStore,
          globalStoreKeys: globalStore ? Object.keys(globalStore) : [],
          selectionObserver: globalStore?.selection ? 'exists' : 'missing',
          windowRenderX: typeof (window as any).RenderX,
          conductor: typeof (window as any).renderxCommunicationSystem?.conductor
        };
      } catch (error) {
        return { error: String(error) };
      }
    });
    
    console.log('🔍 Observer store debug:', debugInfo);
    
    expect(eventCapture.setupComplete).toBe(true);
    console.log('✅ Event tracking configured');

    // Ensure there is at least one canvas component to select; create one if needed
    const ensureNode = await page.evaluate(async () => {
      try {
        const rx: any = (window as any).RenderX;
        const conductor = (window as any).renderxCommunicationSystem?.conductor;

        // If a node already exists, use it
        const existing = (document.querySelector('[id^="rx-node-"]')
          || document.querySelector('#rx-canvas [id^="rx-node-"]')) as HTMLElement | null;
        if (existing?.id) {
          return { created: false, nodeId: existing.id };
        }

        if (!rx?.EventRouter || !rx?.inventory?.listComponents) {
          return { error: 'RenderX bridge not ready for create (EventRouter/inventory missing)' };
        }

        // Pick a library component and derive a minimal template
        const list = await rx.inventory.listComponents();
        const comp = list?.find((x: any) => x?.id === 'button') ?? list?.[0];
        if (!comp) return { error: 'No library components available to create' };

        const canvasEl = document.querySelector('#rx-canvas') as HTMLElement | null;
        if (!canvasEl) return { error: 'Canvas element #rx-canvas not found' };
        const rect = canvasEl.getBoundingClientRect();
        const position = { x: Math.floor(rect.width / 2), y: Math.floor(rect.height / 2) };

        const type = comp?.metadata?.replaces || comp?.metadata?.type || comp?.id || 'div';
        const tag = type === 'input' ? 'input' : (type || 'div');
        const template = {
          tag,
          text: tag === 'button' ? (comp?.integration?.properties?.defaultValues?.content || 'Click Me') : undefined,
          classes: ['rx-comp', `rx-${tag}`],
          style: {},
        } as any;

        (window as any).__lastCreatedId = null;
        await rx.EventRouter.publish('canvas.component.create.requested', {
          component: { template },
          position,
          onComponentCreated: (node: any) => {
            (window as any).__lastCreatedId = node?.id || null;
          },
        }, conductor);

        // Wait for creation to settle and DOM to update
        const started = Date.now();
        while (Date.now() - started < 6000) {
          const byCallback = (window as any).__lastCreatedId;
          const byQuery = (document.querySelector('[id^="rx-node-"]')
            || document.querySelector('#rx-canvas [id^="rx-node-"]')) as HTMLElement | null;
          const id = byCallback || byQuery?.id;
          if (id) return { created: true, nodeId: id };
          await new Promise(r => setTimeout(r, 100));
        }
        return { error: 'Timed out waiting for canvas component creation' };
      } catch (e) {
        return { error: String(e) };
      }
    });

    if ((ensureNode as any).error) {
      console.log('❌ Failed to ensure canvas node exists:', (ensureNode as any).error);
      throw new Error((ensureNode as any).error);
    }
    console.log(`🧩 Ensure node: ${JSON.stringify(ensureNode)}`);

    // Manually trigger a canvas selection event (like the unit test does)
    const publishResult = await page.evaluate(async (preselectedNodeId?: string) => {
      try {
        const rx = (window as any).RenderX;
        const conductor = (window as any).renderxCommunicationSystem?.conductor;
        
        if (!rx?.EventRouter) {
          return { error: 'RenderX.EventRouter not available' };
        }
        
        if (!conductor) {
          return { error: 'conductor not available' };
        }

        // Use the preselected node id if provided; otherwise try to find one
        let nodeId: string | null = preselectedNodeId || null;
        if (!nodeId) {
          const candidate = (document.querySelector('[id^="rx-node-"]')
            || document.querySelector('#rx-canvas [id^="rx-node-"]')) as HTMLElement | null;
          if (candidate && candidate.id) {
            nodeId = candidate.id;
          }
        }
        if (!nodeId) {
          return { error: 'No canvas component found with id prefix rx-node-' };
        }
        
        // Debug: Check if the selection symphony is actually mounted
        let symphonyMountStatus = 'unknown';
        try {
          if (conductor && conductor.play) {
            // Try to directly invoke the symphony to see if it exists via host resolver
            const resolver = (window as any).RenderX?.resolveInteraction;
            const route = resolver ? resolver("control.panel.selection.show") : null;
            const testResult = route
              ? conductor.play(route.pluginId, route.sequenceId, { id: 'test-direct-invoke' })
              : null;
            symphonyMountStatus = testResult ? 'mounted-and-callable' : 'mounted-but-returned-falsy';
          }
        } catch (e) {
          symphonyMountStatus = `error: ${String(e)}`;
        }
        
        console.log(`[TEST] 🎯 Publishing canvas.component.selection.changed for node: ${nodeId}`);
        console.log(`[TEST] 🎼 Symphony mount status: ${symphonyMountStatus}`);
        
        // Add EventRouter debugging to see if routing is working
        const originalPublish = rx.EventRouter.publish;
        let routingInfo: any = null;
        
        rx.EventRouter.publish = function(topic: string, payload: any, conductor: any) {
          if (topic === 'canvas.component.selection.changed') {
            console.log(`[TEST] 📡 EventRouter.publish called for: ${topic}`);
            console.log(`[TEST] 📡 Payload:`, payload);
            console.log(`[TEST] 📡 Conductor:`, !!conductor);
            
            // Try to catch any errors during publish
            try {
              const result = originalPublish.call(this, topic, payload, conductor);
              console.log(`[TEST] 📡 Publish successful, result:`, result);
              return result;
            } catch (publishError) {
              console.log(`[TEST] 📡 Publish ERROR:`, publishError);
              throw publishError;
            }
          }
          
          return originalPublish.call(this, topic, payload, conductor);
        };
        
        await rx.EventRouter.publish('canvas.component.selection.changed', {
          id: nodeId
        }, conductor);
        
        // Restore original publish
        rx.EventRouter.publish = originalPublish;
        
        return { success: true, nodeId, symphonyMountStatus, routingInfo };
      } catch (error) {
        return { error: String(error) };
      }
    }, (ensureNode as any).nodeId);

    // Wait a moment for any UI updates to propagate
    await page.waitForTimeout(500);

    // Capture Control Panel HTML after selection
    const controlPanelHtml = await page.evaluate(() => {
      const controlPanel = document.querySelector('[data-slot="controlPanel"]');
      if (controlPanel) {
        return {
          found: true,
          outerHTML: controlPanel.outerHTML,
          innerHTML: controlPanel.innerHTML,
          textContent: controlPanel.textContent?.trim() || '',
          childElementCount: controlPanel.childElementCount,
          classList: Array.from(controlPanel.classList),
          attributes: Array.from(controlPanel.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          }))
        };
      }
      return { found: false };
    });

    console.log(`[TEST] 🏗️ Control Panel HTML after selection:`);
    console.log(`[TEST] 🏗️ Found: ${controlPanelHtml.found}`);
    if (controlPanelHtml.found && 'childElementCount' in controlPanelHtml) {
      console.log(`[TEST] 🏗️ Child elements: ${controlPanelHtml.childElementCount}`);
      console.log(`[TEST] 🏗️ Classes: [${controlPanelHtml.classList?.join(', ') || 'none'}]`);
      console.log(`[TEST] 🏗️ Text content: "${controlPanelHtml.textContent}"`);
      console.log(`[TEST] 🏗️ Attributes:`, controlPanelHtml.attributes);
      console.log(`[TEST] 🏗️ Inner HTML:\n${controlPanelHtml.innerHTML}`);
      console.log(`[TEST] 🏗️ Outer HTML:\n${controlPanelHtml.outerHTML}`);
    }

    console.log('📤 Publish result:', publishResult);
    
    if (publishResult.error) {
      console.log('❌ Event publish failed:', publishResult.error);
      throw new Error(publishResult.error);
    }
    
    expect(publishResult.success).toBe(true);

    // Wait for events to propagate and UI to update (shorter timeout)
    let attempts = 0;
    let finalState = '';
    const maxAttempts = 30; // 3 seconds - shorter for headless
    
    while (attempts < maxAttempts) {
      await page.waitForTimeout(100);
      
      // Check UI state
      try {
        const typeEl = page.locator('.control-panel-header .element-type').first();
        finalState = await typeEl.textContent({ timeout: 100 }) || '';
      } catch {
        finalState = ''; // Element might not exist yet
      }
      
      // Check captured events
      const capturedEvents = await page.evaluate(() => (window as any).__testEvents || []);
      
      if (attempts % 10 === 0) { // Log every second
        console.log(`📊 Attempt ${attempts + 1}: UI="${finalState}", Events captured: ${capturedEvents.length}`);
        
        // Log event details
        const selectionEvents = capturedEvents.filter((e: any) => e.type === 'canvas.component.selection.changed');
        const renderEvents = capturedEvents.filter((e: any) => e.type === 'control.panel.ui.render.requested');
        console.log(`   - Selection events: ${selectionEvents.length}, Render events: ${renderEvents.length}`);
      }
      
      // Success conditions: either UI updated OR we saw the expected event flow
      const eventCheck = await page.evaluate(() => (window as any).__testEvents || []);
      const hasSelectionEvent = eventCheck.some((e: any) => e.type === 'canvas.component.selection.changed');
      const hasRenderEvent = eventCheck.some((e: any) => e.type === 'control.panel.ui.render.requested');
      const uiUpdated = finalState && finalState !== 'No Element Selected' && finalState.trim() !== '';
      
      if (hasSelectionEvent && (hasRenderEvent || uiUpdated)) {
        console.log('✅ Success condition met!');
        break;
      }
      
      attempts++;
    }

    // Final verification
    const finalEvents = await page.evaluate(() => (window as any).__testEvents || []);
    const selectionEvents = finalEvents.filter((e: any) => e.type === 'canvas.component.selection.changed');
    const renderEvents = finalEvents.filter((e: any) => e.type === 'control.panel.ui.render.requested');
    
    // Check EventRouter debug trail and instance investigation
    const eventRouterDebug = await page.evaluate(() => {
      const debugTrail = (window as any).__DEBUG_EVENTROUTER || [];
      const eventRouter = (window as any).renderxCommunicationSystem?.eventRouter;
      
      // Let's inspect the EventRouter instance
      const routerInfo = {
        found: !!eventRouter,
        type: typeof eventRouter,
        hasPublish: !!(eventRouter && typeof eventRouter.publish === 'function'),
        publishCode: eventRouter?.publish?.toString?.().substring?.(0, 200) || 'N/A'
      };
      
      return { debugTrail, routerInfo };
    });
    console.log(`🔍 EventRouter investigation:`, eventRouterDebug);
    
    console.log('\n📈 Final Results:');
    console.log(`   UI State: "${finalState}"`);
    console.log(`   Selection Events: ${selectionEvents.length}`);
    console.log(`   Render Events: ${renderEvents.length}`);
    
    // Primary assertion: We should see the selection event (this proves EventRouter works)
    expect(selectionEvents.length).toBeGreaterThan(0);
    console.log('✅ Canvas selection event was published and received');
    
    // Secondary assertion: We should see either render events OR UI updates
    const hasRenderEvents = renderEvents.length > 0;
    const hasUIUpdate = finalState && finalState !== 'No Element Selected' && finalState.trim() !== '';
    
    if (hasRenderEvents) {
      console.log('✅ Control Panel render events were published');
      
      // If we have render events, check the payload
      const lastRenderEvent = renderEvents[renderEvents.length - 1];
      const selectedId = lastRenderEvent.data?.selectedElement?.header?.id || 
                        lastRenderEvent.data?.selectedElement?.id;
      
      if (selectedId) {
        expect(selectedId).toBe(publishResult.nodeId);
        console.log('✅ Render event payload matches published node ID');
      }
    } else if (hasUIUpdate) {
      console.log('✅ Control Panel UI was updated');
      // In browser, we often see "button" as the type
      expect(['button', 'div', 'container', 'component'].some(type => 
        finalState.toLowerCase().includes(type)
      )).toBe(true);
    } else {
      // FAIL THE TEST - this means the UI is not updating properly
      console.log('❌ CRITICAL: Neither render events nor UI updates detected');
      console.log('📋 This indicates Control Panel UI is not responding to selection events');
      console.log('📋 EventRouter topic flow is working but UI reactivity is broken');
      
      // After publishing the selection event, debug the observer store state again
      const postSelectionDebug = await page.evaluate(() => {
        try {
          const globalStore = (globalThis as any).__RX_CP_OBSERVERS__;
          
          // Check if we can directly access the selection observer function
          let selectionObserverType = 'not-found';
          if (globalStore && globalStore.selection) {
            selectionObserverType = typeof globalStore.selection;
          } else if (globalStore && globalStore.selectionObserver) {
            selectionObserverType = typeof globalStore.selectionObserver;
          }
          
          return {
            hasGlobalStore: !!globalStore,
            globalStoreKeys: globalStore ? Object.keys(globalStore) : [],
            selectionObserver: selectionObserverType,
            
            // Try to get observer the same way the symphony does
            symphonySelectionObserver: (() => {
              try {
                // This is the same logic as getSelectionObserver() in the symphony
                return globalStore?.selectionObserver ? 'function-exists' : 'null-or-undefined';
              } catch {
                return 'error-accessing';
              }
            })()
          };
        } catch (error) {
          return { error: String(error) };
        }
      });
      
      console.log('🔍 Post-selection observer store debug:', postSelectionDebug);
      
      // FAIL the test if Control Panel still shows "No Element Selected"
      if (controlPanelHtml.found && 'textContent' in controlPanelHtml && 
          controlPanelHtml.textContent && controlPanelHtml.textContent.includes('No Element Selected')) {
        throw new Error(
          `Control Panel UI did not update after selection event. ` +
          `Expected UI to show selected element details, but still shows "No Element Selected". ` +
          `EventRouter communication is working (${selectionEvents.length} selection events captured) ` +
          `but UI reactivity is broken. This is the real GitHub issue #141.`
        );
      }
      
      // If no "No Element Selected" text but still no proper UI updates, that's also a failure
      throw new Error(
        `Control Panel UI did not properly respond to selection events. ` +
        `Expected either render events (${renderEvents.length}) or UI updates (current state: "${finalState}") ` +
        `but got neither. EventRouter flow works but UI integration is broken.`
      );
    }

    // Verify no "No Element Selected" state (if UI updated)
    if (hasUIUpdate) {
      const noSelection = page.locator('.no-selection');
      await expect(noSelection).toHaveCount(0);
      console.log('✅ No "No Element Selected" state detected');
    }

    console.log('\n🎯 Guardrail test completed - EventRouter flow verified in real browser');
  });
});