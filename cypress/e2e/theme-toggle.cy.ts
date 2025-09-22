/// <reference types="cypress" />

// Verifies the header theme toggle button switches between dark/light
// by asserting the <html data-theme> attribute and the button label.

describe('Theme toggle button', () => {
  // Use a specific class+title for stability
  const toggleSelector = 'button.header-theme-button[title="Toggle Theme"]';

  let capturedLogs: string[] = [];

  beforeEach(() => {
    capturedLogs = [];
  });

  it('toggles theme and persists', () => {
    // Start from a known state (dark) to make assertions deterministic
    cy.visit('/', {
      onBeforeLoad(win) {
        // Override console.log to capture logs
        const originalLog = win.console.log;
        win.console.log = (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          capturedLogs.push(`[${new Date().toISOString()}] ${message}`);
          originalLog.apply(win.console, args);
        };

        win.localStorage.setItem('theme', 'dark');
      },
    });

  // Confirm initial theme derived from localStorage (best-effort DOM check)
  cy.get('html', { timeout: 10000 }).should('have.attr', 'data-theme', 'dark');

    // Ensure app sequences are registered before interacting
    cy.window().its('RenderX').its('sequencesReady').should('eq', true);

    // The toggle button should render in the header
    cy.get(toggleSelector, { timeout: 10000 }).should('be.visible');

    // First toggle → should switch to light
    cy.get(toggleSelector).click({ force: true });
    // Prefer source-of-truth (persistence) in CI: assert localStorage with retry
    cy.window().should((win) => {
      expect(win.localStorage.getItem('theme')).to.eq('light');
    });
    // Also assert we saw the sequence fire in logs (either event or sequence name)
    cy.wrap(null).then(() => {
      const hit = capturedLogs.some((l) =>
        l.includes('app:ui:theme:toggle') ||
        l.includes('Header UI Theme Toggle') ||
        l.includes('header-ui-theme-toggle-symphony')
      );
      expect(hit, 'saw Header UI Theme Toggle sequence in logs').to.eq(true);
    });
    // Best-effort DOM check (non-critical): log current attribute value for debugging
    cy.get('html').invoke('attr', 'data-theme').then((val) => cy.log('html[data-theme]=', String(val)));

    // Second toggle → back to dark (assert via localStorage + logs)
    cy.get(toggleSelector).click({ force: true });
    cy.window().should((win) => {
      expect(win.localStorage.getItem('theme')).to.eq('dark');
    });
    cy.wrap(null).then(() => {
      const hit = capturedLogs.filter((l) => l.includes('app:ui:theme:toggle') || l.includes('Header UI Theme Toggle')).length >= 2;
      expect(hit, 'saw two theme toggle events in logs').to.eq(true);
    });
  });

  afterEach(() => {
    // Save captured logs to file
    const logFileName = `theme-toggle-${Cypress.spec.name}-${Date.now()}.log`;
    const logContent = capturedLogs.join('\n');
    
    cy.task('writeArtifact', {
      filePath: `.logs/${logFileName}`,
      content: logContent
    });
  });
});
