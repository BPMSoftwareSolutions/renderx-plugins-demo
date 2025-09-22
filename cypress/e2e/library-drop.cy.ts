/// <reference types="cypress" />

// E2E: drag a component from Library to Canvas and verify creation + sequence execution
// Tests the full Library→Canvas drop flow with LibraryComponentPlugin and CanvasComponentPlugin
// No fallback simulation - relies on actual plugin loading and sequence execution

describe('Library → Canvas drop creates component', () => {
  const librarySlot = '[data-slot="library"] [data-slot-content]';
  const canvasSlot = '[data-slot="canvas"] [data-slot-content]';
  const canvasRoot = '#rx-canvas';

  let capturedLogs: string[] = [];

  beforeEach(() => {
    capturedLogs = [];
  });

  it('drags from Library and drops onto Canvas (no simulation fallback)', () => {
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

    // Gate on app readiness beacon
    cy.waitForRenderXReady({
      minRoutes: 40,
      minTopics: 50,
      minPlugins: 8,
      minMounted: 2,
      eventTimeoutMs: 20000,
      // Ensure key plugins are mounted (ids come from generated manifests)
      requiredPluginIds: ['LibraryPlugin', 'CanvasComponentPlugin']
    });

    // Ensure runtime sequences we rely on are mounted
    cy.window().should((win) => {
      const mountedSeqs: string[] = (win as any).__RENDERX_MOUNTED_SEQUENCE_IDS || [];
      expect(mountedSeqs, 'runtime sequences mounted').to.be.an('array');
      expect(mountedSeqs).to.include('library-component-drop-symphony');
      expect(mountedSeqs).to.include('canvas-component-create-symphony');
    });

    // Wait for Library and Canvas to mount
    cy.get(librarySlot, { timeout: 20000 }).should('exist');
    cy.get(canvasSlot, { timeout: 20000 }).should('exist');


    // Subscribe to created notification to obtain the actual id deterministically
    cy.window().then((win: any) => {
      win.__TEST_CREATED_ID = undefined;
      win.RenderX.EventRouter.subscribe('canvas.component.created', (p: any) => {
        try { win.__TEST_CREATED_ID = p?.id; } catch {}
      });
    });

    // Prepare a DataTransfer with a minimal valid component payload
    cy.window().then((win) => {
      const dt = new (win as any).DataTransfer();
      const payload = {
        component: {
          template: { tag: 'button', text: 'Button', classes: ['rx-comp', 'rx-button'], style: {} }
        }
      };
      dt.setData('application/rx-component', JSON.stringify(payload));
      cy.wrap(dt).as('dt');
    });

    // Drop directly onto the Canvas root to drive the Library→Canvas forward path
    cy.get('@dt').then((dt: any) => {
      cy.get(canvasRoot, { timeout: 20000 }).should('exist').then(($el) => {
        const rect = ($el[0] as HTMLElement).getBoundingClientRect();
        const clientX = Math.floor(rect.left + rect.width / 2);
        const clientY = Math.floor(rect.top + rect.height / 2);
        cy.wrap($el)
          .trigger('dragover', { dataTransfer: dt, clientX, clientY })
          .trigger('drop', { dataTransfer: dt, clientX, clientY });
      });
    });

    // Wait for the drop to trigger the library-component-drop-symphony
    // which should create a new canvas node via canvas-component-create-symphony
    const nodeSelector = `#rx-canvas [id^="rx-node-"]`;

    // Debug: snapshot canvas HTML before assertion
    cy.window().then((win: any) => {
      try {
        const html = (win.document.getElementById('rx-canvas')?.innerHTML || '').slice(0, 500);
        capturedLogs.push(`[debug] rx-canvas innerHTML (first 500): ${html}`);
        const count = win.document.querySelectorAll('#rx-canvas [id^="rx-node-"]').length;
        capturedLogs.push(`[debug] rx-canvas node count: ${count}`);
      } catch {}
    });

    // Give the StageCrew time to manipulate DOM after sequences complete
    // The logs show sequences execute quickly but DOM update has a delay
    cy.wait(1500);

    // Debug again after a longer delay
    cy.window().then((win: any) => {
      try {
        const html = (win.document.getElementById('rx-canvas')?.innerHTML || '').slice(0, 500);
        capturedLogs.push(`[debug-after] rx-canvas innerHTML (first 500): ${html}`);
        const count = win.document.querySelectorAll('#rx-canvas [id^="rx-node-"]').length;
        capturedLogs.push(`[debug-after] rx-canvas node count: ${count}`);
      } catch {}
    });



    // Wait for the node to appear in the canvas and capture it
    cy.get(nodeSelector, { timeout: 20000 })
      .should('exist')
      .and('be.visible')
      .first()
      .as('createdNode');




    // Verify the create symphony was executed (via routing logs or topics log)
    cy.wrap(null).should(() => {
      const sawCreate = capturedLogs.some((l) =>
        (l.includes('CanvasComponentPlugin') && l.includes('canvas-component-create-symphony')) ||
        l.includes("[topics] Routing 'canvas.component.create'") ||
        l.includes("[topics] Routing 'canvas.component.create.requested'")
      );
      expect(sawCreate, 'canvas-component-create symphony executed').to.eq(true);
    });

    // Selection flow: publish select.requested for the created node and verify selection symphonies execute
    cy.get('@createdNode').invoke('attr', 'id').then((nodeId) => {
      cy.window().then((win: any) => {
        try {
          win.RenderX.EventRouter.publish('canvas.component.select.requested', { id: nodeId });
        } catch {}
      });
    });

    // Assert selection symphonies executed via logs
    cy.wrap(null).should(() => {
      const sawSelectRequested = capturedLogs.some((l) =>
        (l.includes('CanvasComponentPlugin') && l.includes('canvas-component-select-requested-symphony')) ||
        l.includes("[topics] Routing 'canvas.component.select.requested'")
      );
      const sawSelect = capturedLogs.some((l) =>
        (l.includes('CanvasComponentPlugin') && l.includes('canvas-component-select-symphony')) ||
        l.includes("[topics] Routing 'canvas.component.select'")
      );
      expect(sawSelectRequested, 'canvas-component-select-requested symphony executed').to.eq(true);
      expect(sawSelect, 'canvas-component-select symphony executed').to.eq(true);
    });

    // Optional: sanity-check that node id looks like rx-node-*
    cy.get('@createdNode').invoke('attr', 'id').should('match', /^rx-node-/);
  });


  afterEach(() => {
    const logFileName = `library-drop-${Cypress.spec.name}-${Date.now()}.log`;
    const logContent = capturedLogs.join('\n');
    cy.task('writeArtifact', { filePath: `.logs/${logFileName}`, content: logContent });
  });
});

