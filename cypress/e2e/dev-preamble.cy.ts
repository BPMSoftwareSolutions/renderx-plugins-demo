/// <reference types="cypress" />

// This test intentionally fails when the Vite React preamble is not installed
// before TSX modules execute. It visits the dev harness page and asserts that the
// specific uncaught exception is NOT thrown. While the issue persists, this test
// will fail, providing a deterministic reproduction.

describe('Dev preamble presence', () => {
  it('test harness should not trigger Vite React preamble error', () => {
    let uncaughtMessage = '' as string;

    // Capture uncaught exceptions so we can assert on the message after visit
    cy.on('uncaught:exception', (err) => {
      uncaughtMessage = (err && (err.message || String(err))) || '';
      // prevent Cypress from failing immediately; we will assert explicitly
      return false;
    });

    // Visit the static dev harness page that reproduces the issue
    cy.visit('/test-plugin-loading.html').then(() => {
      // Allow initial module evaluation to complete
      cy.wait(150);
    }).then(() => {
      // Assert that the known react preamble error did not occur
      expect(uncaughtMessage, 'no Vite React preamble error').to.not.match(/can\'t detect preamble/i);
    });
  });
});

