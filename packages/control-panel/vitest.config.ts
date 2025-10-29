import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const r = (...p: string[]) => path.resolve(rootDir, ...p);

// Custom plugin to redirect json-components imports to fixtures
const jsonComponentsFixturePlugin = (): Plugin => ({
  name: 'json-components-fixture-redirect',
  enforce: 'pre',
  resolveId(id, importer) {
    // If importing from a test file and the import is for json-components
    if (importer && importer.includes('__tests__') && id.includes('json-components/')) {
      // Extract the filename (e.g., 'html.json' from '../../../json-components/html.json')
      const match = id.match(/json-components\/(.+)$/);
      if (match) {
        const filename = match[1];
        const fixturePath = r(`__tests__/__fixtures__/json-components/${filename}`);
        return fixturePath;
      }
    }
    return null;
  },
});

export default defineConfig({
  plugins: [jsonComponentsFixturePlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],
    reporters: [
      'default',
      ['junit', { outputFile: r('test-results.xml'), suiteNameTemplate: '%s', classNameTemplate: '%s', titleTemplate: '%s' }],
    ],
  },
  resolve: {
    alias: {
      '@': r('src'),
      '@renderx-plugins/canvas-component': r('__tests__/__mocks__/@renderx-plugins/canvas-component.ts'),
      '@renderx-plugins/canvas-component/': r('__tests__/__mocks__/@renderx-plugins/canvas-component/'),
      '@renderx-plugins/control-panel': r('src'),
      '@renderx-plugins/control-panel/observer.store': r('src/state/observer.store.ts'),
      '@renderx-plugins/control-panel/': r('src/'),
    },
  },
});
