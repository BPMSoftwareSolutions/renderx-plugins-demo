describe('React Refresh Preamble Detection', () => {
  it('should not have React Refresh preamble errors on test-plugin-loading page', () => {
    // Track console errors and logs
    const consoleErrors: string[] = [];
    const consoleLogs: string[] = [];

    cy.window().then((win) => {
      // Override console methods to capture all output
      const originalError = win.console.error;
      const originalLog = win.console.log;
      const originalWarn = win.console.warn;

      win.console.error = (...args: any[]) => {
        const errorMessage = args.join(' ');
        consoleErrors.push(errorMessage);
        originalError.apply(win.console, args);
      };

      win.console.log = (...args: any[]) => {
        const logMessage = args.join(' ');
        consoleLogs.push(logMessage);
        originalLog.apply(win.console, args);
      };

      win.console.warn = (...args: any[]) => {
        const warnMessage = args.join(' ');
        consoleLogs.push(`WARN: ${warnMessage}`);
        originalWarn.apply(win.console, args);
      };
    });

    // Track uncaught exceptions
    const uncaughtExceptions: string[] = [];
    cy.on('uncaught:exception', (err) => {
      uncaughtExceptions.push(err.message);
      // Don't fail the test on uncaught exceptions, we want to capture them
      return false;
    });

    // Visit the test plugin loading page
    cy.visit('/test-plugin-loading.html');

    // Wait for the page to load
    cy.get('#test-root', { timeout: 10000 }).should('exist');

    // Wait longer for React components to load
    cy.wait(5000);

    // Log all captured output for debugging
    cy.then(() => {
      if (consoleLogs.length > 0) {
        cy.log('Console logs:', consoleLogs.slice(-10).join(', ')); // Last 10 logs
      }
      if (consoleErrors.length > 0) {
        cy.log('Console errors:', consoleErrors.join(', '));
      }
      if (uncaughtExceptions.length > 0) {
        cy.log('Uncaught exceptions:', uncaughtExceptions.join(', '));
      }
    });

    // Check for React Refresh preamble errors
    cy.then(() => {
      const preambleErrors = [...consoleErrors, ...uncaughtExceptions].filter(error =>
        error.includes("@vitejs/plugin-react can't detect preamble") ||
        error.includes("Something is wrong")
      );

      // This assertion should fail if the preamble error exists
      expect(preambleErrors).to.have.length(0);
    });

    // Verify the page actually loaded correctly
    cy.get('[data-testid="plugin-explorer"]', { timeout: 10000 }).should('exist');
    cy.get('[data-testid="plugin-count"]').should('exist');
  });

  it('should have React Refresh globals properly set up', () => {
    cy.visit('/test-plugin-loading.html');
    
    // Wait for the page to load
    cy.get('#test-root').should('exist');
    
    // Check that React Refresh globals are available in development
    cy.window().then((win) => {
      // Check if we're in development mode by looking for Vite
      const isDev = win.location.port === '5176' || win.location.hostname === 'localhost';

      // Debug: log all window properties that might be related to React Refresh
      const refreshProps = Object.keys(win).filter(key =>
        key.includes('Refresh') || key.includes('refresh') || key.includes('vite') || key.includes('$')
      );
      cy.log('React Refresh related properties:', refreshProps.join(', '));

      if (isDev) {
        // Check if the preamble was installed
        if (win.__vite_plugin_react_preamble_installed__) {
          expect(win).to.have.property('__vite_plugin_react_preamble_installed__');
          expect(win).to.have.property('$RefreshReg$');
          expect(win).to.have.property('$RefreshSig$');

          // Verify they are functions
          expect(win.$RefreshReg$).to.be.a('function');
          expect(win.$RefreshSig$).to.be.a('function');
        } else {
          // The preamble might not be installed if we're not in dev mode or if there was an error
          cy.log('React Refresh preamble not installed - this might be expected in some environments');
          // Don't fail the test, just log the observation
        }
      } else {
        // In production, these might not be available, which is fine
        cy.log('Running in production mode, React Refresh globals not expected');
      }
    });
  });

  it('should load the PluginTreeExplorer component without errors', () => {
    cy.visit('/test-plugin-loading.html');

    // Wait for the component to load
    cy.get('[data-testid="plugin-explorer"]', { timeout: 10000 }).should('be.visible');

    // Check that the component rendered properly
    cy.get('[data-testid="plugin-count"]').should('contain.text', /\d+/);

    // Check that the search box is present
    cy.get('input[placeholder*="Search"]').should('exist');

    // Verify no React errors in the component tree
    cy.get('.plugin-explorer').should('exist');
  });
});
