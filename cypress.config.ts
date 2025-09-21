import { defineConfig } from 'cypress';

const isCI = process.env.CI === 'true' || process.env.CI === '1';
const baseUrl = isCI ? 'http://localhost:4173' : 'http://localhost:5173';

export default defineConfig({
  e2e: {
    baseUrl,
    specPattern: 'cypress/e2e/**/*.cy.{ts,js,tsx,jsx}',
    supportFile: 'cypress/support/e2e.ts',
    chromeWebSecurity: false,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    video: true,
    retries: isCI ? 1 : 0,
    setupNodeEvents(on, config) {
      // Add tasks here if you want to persist logs/snapshots as files later
      return config;
    },
  },
});
