// CommonJS Cypress config to avoid ESM type import issues

const isCI = process.env.CI === 'true' || process.env.CI === '1';
const baseUrl = isCI ? 'http://localhost:4173' : 'http://localhost:5173';

module.exports = {
  e2e: {
    baseUrl,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    chromeWebSecurity: false,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    video: true,
    retries: isCI ? 1 : 0,
    setupNodeEvents(on, config) {
      return config;
    },
  },
};
