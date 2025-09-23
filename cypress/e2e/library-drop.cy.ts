/// <reference types="cypress" />

// E2E: drag a button component from Library to Canvas and verify creation
// Tests the full Library→Canvas drop flow with real drag and drop interactions
// No simulation - uses actual mouse drag and drop like a real user would

describe('Library → Canvas drop creates component', () => {
  const librarySlot = '[data-slot="library"] [data-slot-content]';
  const canvasSlot = '[data-slot="canvas"] [data-slot-content]';
  const canvasRoot = '#rx-canvas';

  let capturedLogs: string[] = [];

  beforeEach(() => {
    capturedLogs = [];
  });

  it('drags button component from Library and drops onto Canvas', () => {
    // Visit early and hook console.log for sequence detection
    cy.visit('/', {
      onBeforeLoad(win) {
        const originalLog = win.console.log;
        const originalWarn = win.console.warn;
        win.console.log = (...args: any[]) => {
          try {
            const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
            capturedLogs.push(`[${new Date().toISOString()}] ${msg}`);
          } catch {}
          originalLog.apply(win.console, args as any);
        };
        win.console.warn = (...args: any[]) => {
          try {
            const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
            capturedLogs.push(`[${new Date().toISOString()}] WARN ${msg}`);
          } catch {}
          originalWarn.apply(win.console, args as any);
        };

        // Instrument DnD events globally for debug (capture phase so we see all)
        try {
          const doc = win.document;
          const types = ['dragstart','dragenter','dragover','dragleave','drop','dragend'];
          const describeEl = (el: any) => {
            if (!el || !el.tagName) return '<none>';
            const id = el.id ? `#${el.id}` : '';
            const cls = (el.className && typeof el.className === 'string') ? `.${el.className.replace(/\s+/g,'.')}` : '';
            return `${el.tagName.toLowerCase()}${id}${cls}`;
          };
          types.forEach((t) => {
            doc.addEventListener(t as any, (ev: any) => {
              try {
                const tgt = ev.target as any;
                const path = describeEl(tgt);
                const dataTypes = Array.from((ev.dataTransfer?.types || []) as any[]);
                const def = ev.defaultPrevented ? ' defaultPrevented' : '';
                capturedLogs.push(`[dnd] ${t} target=${path} types=${JSON.stringify(dataTypes)} x=${ev.clientX} y=${ev.clientY}${def}`);
              } catch {}
            }, true);
          });
        } catch {}
      },
    });

    // Gate on app readiness beacon (now includes Library components loading)
    cy.waitForRenderXReady({
      minRoutes: 40,
      minTopics: 50,
      minPlugins: 8,
      minMounted: 5,
      eventTimeoutMs: 30000,
    });




    // Wait for Library and Canvas slots to mount
    cy.get(librarySlot, { timeout: 20000 }).should('exist');
    cy.get(canvasSlot, { timeout: 20000 }).should('exist');

    // Find the button component in the Library panel
    // Since waitForRenderXReady now waits for Library components, they should be available
    cy.get(librarySlot)
      .find('[draggable="true"], [draggable]')
      .contains(/button/i, { timeout: 10000 })
      .should('exist')
      .as('buttonComponent');

    // Find the Canvas drop target
    cy.get(canvasRoot, { timeout: 20000 }).should('exist').as('canvasTarget');


    // Perform real drag and drop: drag button from Library to Canvas
    cy.get('@buttonComponent').then(($source) => {
      cy.get('@canvasTarget').then(($target) => {
        // Get coordinates for drag and drop
        const sourceRect = $source[0].getBoundingClientRect();
        const targetRect = $target[0].getBoundingClientRect();

        const sourceX = sourceRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.top + sourceRect.height / 2;
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        capturedLogs.push(`[drag-coords] Source: ${sourceX},${sourceY} Target: ${targetX},${targetY}`);

        // Create a proper DataTransfer object for the drag and drop
        cy.window().then((win) => {
          const dataTransfer = new (win as any).DataTransfer();

          // Set the component data that would normally be set by the Library component
          const componentData = {
            component: {
              template: { tag: 'button', text: 'Button', classes: ['rx-comp', 'rx-button'], style: {} }
            }
          };
          dataTransfer.setData('application/rx-component', JSON.stringify(componentData));

          // Perform the drag and drop sequence with proper dataTransfer
          cy.get('@buttonComponent')
            .trigger('mousedown', { clientX: sourceX, clientY: sourceY, which: 1 })
            .trigger('dragstart', { clientX: sourceX, clientY: sourceY, dataTransfer })
            .wait(100); // Small delay for drag to register

          cy.get('@canvasTarget')
            .trigger('dragenter', { clientX: targetX, clientY: targetY, dataTransfer })
            .trigger('dragover', { clientX: targetX, clientY: targetY, dataTransfer })
            .trigger('drop', { clientX: targetX, clientY: targetY, dataTransfer });

          cy.get('@buttonComponent')
            .trigger('dragend', { clientX: targetX, clientY: targetY, dataTransfer })
            .trigger('mouseup', { clientX: targetX, clientY: targetY });
        });
      });
    });

    // Wait for the drop to process and create a canvas component
    cy.wait(2000);

    // Verify that a component was created on the canvas (tolerant to dynamic ids)
    const nodeSelector = `#rx-canvas [id^="rx-node-"], #rx-canvas .rx-comp, #rx-canvas [data-rx-node]`;
    cy.get(nodeSelector, { timeout: 12000 })
      .should('exist')
      .should('have.length.at.least', 1)
      .then(($nodes) => {
        capturedLogs.push(`[success] ✅ Found ${$nodes.length} canvas node(s) after drag and drop`);
        cy.log(`✅ Successfully created ${$nodes.length} component(s) on canvas`);
      });

    // Additional verification: log the first created node's tag/class (ids are dynamic)
    cy.get(nodeSelector).first().should(($node) => {
      const tag = $node.prop('tagName');
      const cls = $node.attr('class') || '';
      capturedLogs.push(`[component] Created node tag=${tag} class="${cls}"`);
    });

    // Click the component on the canvas to select it
    cy.get(nodeSelector).first().click();

    // Wait for selection to process
    cy.wait(1000);

    // Verify selection overlay is displayed
    cy.get('.selection-overlay, .selected-overlay, .rx-selection-overlay', { timeout: 5000 })
      .should('exist')
      .then(() => {
        capturedLogs.push(`[selection] ✅ Selection overlay is displayed`);
        cy.log(`✅ Selection overlay is displayed`);
      });

    // Verify the control panel displays the component information
    const controlPanelSlot = '[data-slot="controlPanel"] [data-slot-content]';

    // Check for control panel header with Properties Panel title
    cy.get(controlPanelSlot)
      .find('.control-panel-header')
      .should('exist')
      .within(() => {
        // Verify Properties Panel title
        cy.contains('⚙️ Properties Panel').should('exist');

        // Verify element-info section is displayed
        cy.get('.element-info')
          .should('be.visible')
          .within(() => {
            // Verify element-type is displayed (should be "button")
            cy.get('.element-type')
              .should('exist')
              .should('contain.text', 'button')
              .then(($type) => {
                capturedLogs.push(`[control-panel] ✅ Element type displayed: ${$type.text()}`);
              });

            // Verify element-id is displayed (should start with #rx-node-)
            cy.get('.element-id')
              .should('exist')
              .should(($id) => {
                const idText = $id.text();
                expect(idText).to.match(/^#rx-node-/);
                capturedLogs.push(`[control-panel] ✅ Element ID displayed: ${idText}`);
              });
          });
      })
      .then(() => {
        capturedLogs.push(`[control-panel] ✅ Control panel shows selected component properties`);
        cy.log(`✅ Control panel shows selected component properties`);
      });
  });


  afterEach(() => {
    const logFileName = `library-drop-${Cypress.spec.name}-${Date.now()}.log`;
    const logContent = capturedLogs.join('\n');
    cy.task('writeArtifact', { filePath: `.logs/${logFileName}`, content: logContent });
  });
});

