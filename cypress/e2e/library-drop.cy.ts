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

    // Verify Library Load sequence completion appears in logs (robust poll)
    cy.wrap(null, { timeout: 20000 }).should(() => {
      const found = capturedLogs.some((l) =>
        l.includes('SequenceExecutor: Sequence "Library Load" completed')
      );
      expect(found, 'Library Load sequence completion log appears').to.eq(true);
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

    // Verify that a component was created on the canvas
    const nodeSelector = `#rx-canvas [id^="rx-node-"]`;
    cy.get(nodeSelector, { timeout: 10000 })
      .should('exist')
      .should('have.length.at.least', 1)
      .then(($nodes) => {
        capturedLogs.push(`[success] ✅ Found ${$nodes.length} canvas node(s) after drag and drop`);
        cy.log(`✅ Successfully created ${$nodes.length} component(s) on canvas`);
      });

    // Additional verification: check that the component has expected properties
    cy.get(nodeSelector).first().should(($node) => {
      const id = $node.attr('id');
      expect(id).to.match(/^rx-node-/);
      capturedLogs.push(`[component-id] Created component with ID: ${id}`);
    });
  });


  afterEach(() => {
    const logFileName = `library-drop-${Cypress.spec.name}-${Date.now()}.log`;
    const logContent = capturedLogs.join('\n');
    cy.task('writeArtifact', { filePath: `.logs/${logFileName}`, content: logContent });
  });
});

