import { defineConfig } from 'cypress';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

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
    env: {
      includeTags: '',
      excludeTags: '',
      requireCapabilities: '', // comma-separated
      minTestApiVersion: '1.0.0',
      maxTestApiVersion: '1.x',
      artifactsDir: 'cypress/artifacts'
    },
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-software-rasterizer');
        }
        return launchOptions;
      });
      on('task', {
        writeArtifact(args) {
          const filePath = args && args.filePath;
          const content = args && args.content;
          try {
            const full = resolve(process.cwd(), filePath);
            mkdirSync(dirname(full), { recursive: true });
            writeFileSync(full, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf8');
            return true;
          } catch (e) {
            console.error('writeArtifact failed', e);
            return false;
          }
        },
      });
      return config;
    },
  },
});
