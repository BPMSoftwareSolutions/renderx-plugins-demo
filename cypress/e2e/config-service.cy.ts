/// <reference types="cypress" />

describe.skip('Host Configuration Service E2E', () => {
  beforeEach(() => {
    cy.visit('/');

    // Wait for RenderX to be ready
    cy.window().should('have.property', 'RenderX');

    // Wait for config service to be initialized
    cy.window().should((win) => {
      expect(win.RenderX).to.have.property('config');
    });
  });

  describe('Configuration Service Availability', () => {
    it('should expose window.RenderX.config', () => {
      cy.window().then((win) => {
        expect(win.RenderX).to.have.property('config');
        expect(win.RenderX.config).to.have.property('get');
        expect(win.RenderX.config).to.have.property('has');
      });
    });

    it('should have get() method that returns string or undefined', () => {
      cy.window().then((win) => {
        const result = win.RenderX.config.get('OPENAI_API_KEY');
        expect(result).to.satisfy((val: any) => {
          return val === undefined || typeof val === 'string';
        });
      });
    });

    it('should have has() method that returns boolean', () => {
      cy.window().then((win) => {
        const result = win.RenderX.config.has('OPENAI_API_KEY');
        expect(result).to.be.a('boolean');
      });
    });
  });

  describe('Configuration Keys', () => {
    it('should return undefined for non-existent keys', () => {
      cy.window().then((win) => {
        const result = win.RenderX.config.get('NON_EXISTENT_KEY_12345');
        expect(result).to.be.undefined;
      });
    });

    it('should return false for non-existent keys with has()', () => {
      cy.window().then((win) => {
        const result = win.RenderX.config.has('NON_EXISTENT_KEY_12345');
        expect(result).to.be.false;
      });
    });

    it('should support OPENAI_API_KEY configuration', () => {
      cy.window().then((win) => {
        // The key may or may not be configured in the test environment
        // We just verify the API works correctly
        const value = win.RenderX.config.get('OPENAI_API_KEY');
        const hasValue = win.RenderX.config.has('OPENAI_API_KEY');

        if (value && value !== '') {
          // If key is configured, has() should return true
          expect(hasValue).to.be.true;
          expect(value).to.be.a('string');
        } else {
          // If key is not configured, has() should return false
          expect(hasValue).to.be.false;
        }
      });
    });

    it('should support OPENAI_MODEL configuration with default', () => {
      cy.window().then((win) => {
        const model = win.RenderX.config.get('OPENAI_MODEL');
        
        // Should always return a value (default is 'gpt-3.5-turbo')
        expect(model).to.be.a('string');
        expect(model).to.not.be.empty;
        
        // Should be a valid model name
        expect(model).to.match(/^gpt-/);
      });
    });
  });

  describe('Security', () => {
    it('should not expose API keys in the DOM', () => {
      cy.window().then((win) => {
        const apiKey = win.RenderX.config.get('OPENAI_API_KEY');
        
        if (apiKey && apiKey !== '') {
          // Check that the key is not visible in the page body
          cy.get('body').should('not.contain', apiKey);
          
          // Check that the key is not in any visible text
          cy.document().then((doc) => {
            const bodyText = doc.body.textContent || '';
            expect(bodyText).to.not.include(apiKey);
          });
        }
      });
    });

    it('should not log API keys to console', () => {
      cy.window().then((win) => {
        // Spy on console methods
        cy.spy(win.console, 'log');
        cy.spy(win.console, 'info');
        cy.spy(win.console, 'warn');
        cy.spy(win.console, 'error');

        const apiKey = win.RenderX.config.get('OPENAI_API_KEY');

        if (apiKey && apiKey !== '') {
          // Verify the key was not logged
          expect(win.console.log).to.not.have.been.calledWith(
            Cypress.sinon.match(apiKey)
          );
          expect(win.console.info).to.not.have.been.calledWith(
            Cypress.sinon.match(apiKey)
          );
          expect(win.console.warn).to.not.have.been.calledWith(
            Cypress.sinon.match(apiKey)
          );
          expect(win.console.error).to.not.have.been.calledWith(
            Cypress.sinon.match(apiKey)
          );
        }
      });
    });

    it('should handle missing config gracefully', () => {
      cy.window().then((win) => {
        // Should not throw when accessing config
        expect(() => {
          win.RenderX.config.get('ANY_KEY');
          win.RenderX.config.has('ANY_KEY');
        }).to.not.throw();
      });
    });
  });

  describe('Environment Variable Integration', () => {
    it('should read configuration from environment variables', () => {
      cy.window().then((win) => {
        // In CI/E2E environment, if OPENAI_API_KEY is set as env var,
        // it should be accessible via the config service
        const apiKey = win.RenderX.config.get('OPENAI_API_KEY');
        
        // We can't assert the exact value, but we can verify the behavior
        if (Cypress.env('OPENAI_API_KEY')) {
          // If Cypress has the env var, the config should too
          expect(apiKey).to.be.a('string');
          expect(apiKey).to.not.be.empty;
          expect(win.RenderX.config.has('OPENAI_API_KEY')).to.be.true;
        }
      });
    });

    it('should handle empty environment variables', () => {
      cy.window().then((win) => {
        // Test with a key that's likely not set
        const result = win.RenderX.config.get('UNSET_CONFIG_KEY');
        const hasResult = win.RenderX.config.has('UNSET_CONFIG_KEY');
        
        expect(result).to.be.undefined;
        expect(hasResult).to.be.false;
      });
    });
  });

  describe('Plugin Integration', () => {
    it('should be accessible to plugins via window.RenderX', () => {
      cy.window().then((win) => {
        // Verify the config service is part of the global RenderX API
        expect(win.RenderX).to.have.property('config');
        
        // Verify it's the same instance across accesses
        const config1 = win.RenderX.config;
        const config2 = win.RenderX.config;
        expect(config1).to.equal(config2);
      });
    });

    it('should maintain consistent behavior across multiple calls', () => {
      cy.window().then((win) => {
        const key = 'OPENAI_API_KEY';
        
        // Call get() multiple times
        const result1 = win.RenderX.config.get(key);
        const result2 = win.RenderX.config.get(key);
        const result3 = win.RenderX.config.get(key);
        
        // Results should be consistent
        expect(result1).to.equal(result2);
        expect(result2).to.equal(result3);
        
        // Call has() multiple times
        const has1 = win.RenderX.config.has(key);
        const has2 = win.RenderX.config.has(key);
        const has3 = win.RenderX.config.has(key);
        
        // Results should be consistent
        expect(has1).to.equal(has2);
        expect(has2).to.equal(has3);
      });
    });
  });

  describe('Feature Detection', () => {
    it('should allow plugins to detect if AI features are available', () => {
      cy.window().then((win) => {
        // This is how plugins should check for AI availability
        const aiAvailable = win.RenderX.config.has('OPENAI_API_KEY');
        
        expect(aiAvailable).to.be.a('boolean');
        
        if (aiAvailable) {
          // If available, the key should be retrievable
          const apiKey = win.RenderX.config.get('OPENAI_API_KEY');
          expect(apiKey).to.be.a('string');
          expect(apiKey).to.not.be.empty;
        } else {
          // If not available, the key should be undefined
          const apiKey = win.RenderX.config.get('OPENAI_API_KEY');
          expect(apiKey).to.satisfy((val: any) => {
            return val === undefined || val === '';
          });
        }
      });
    });

    it('should support checking multiple configuration keys', () => {
      cy.window().then((win) => {
        const keys = ['OPENAI_API_KEY', 'OPENAI_MODEL', 'ANTHROPIC_API_KEY'];
        
        keys.forEach((key) => {
          // Should not throw for any key
          expect(() => {
            win.RenderX.config.get(key);
            win.RenderX.config.has(key);
          }).to.not.throw();
        });
      });
    });
  });
});

