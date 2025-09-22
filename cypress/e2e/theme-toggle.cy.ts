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

    // Confirm initial theme derived from localStorage
    cy.get('html', { timeout: 10000 }).should('have.attr', 'data-theme', 'dark');

    // Ensure app sequences are registered before interacting
    cy.window().its('RenderX').its('sequencesReady').should('eq', true);

    // The toggle button should render in the header
    cy.get(toggleSelector, { timeout: 10000 }).should('be.visible');

    // Snapshot initial theme
    // First toggle → should switch to light
    cy.get(toggleSelector).click({ force: true });
    
    // Debug: wait a moment and check what happened
    cy.wait(1000);
    cy.get('html').then(($html) => {
      cy.log('After click, data-theme is:', $html.attr('data-theme'));
    });
    cy.window().then((win) => {
      cy.log('localStorage theme is:', win.localStorage.getItem('theme'));
    });
    
    cy.get('html', { timeout: 10000 }).should('have.attr', 'data-theme', 'light');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('theme')).to.eq('light');
    });

    // Second toggle → back to dark and persisted
    cy.get(toggleSelector).click({ force: true });
    cy.get('html', { timeout: 10000 }).should('have.attr', 'data-theme', 'dark');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('theme')).to.eq('dark');
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
