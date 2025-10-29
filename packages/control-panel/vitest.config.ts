import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const r = (...p: string[]) => path.resolve(rootDir, ...p);

export default defineConfig({
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
    alias: [
      { find: '@', replacement: r('src') },
      { find: /^@renderx-plugins\/canvas-component$/, replacement: r('__tests__/__mocks__/@renderx-plugins/canvas-component.ts') },
      { find: /^@renderx-plugins\/canvas-component\//, replacement: r('__tests__/__mocks__/@renderx-plugins/canvas-component/') },

      // Map package imports to source for local testing
      { find: /^@renderx-plugins\/control-panel$/, replacement: r('src') },
      { find: /^@renderx-plugins\/control-panel\/observer\.store$/, replacement: r('src/state/observer.store.ts') },
      { find: /^@renderx-plugins\/control-panel\//, replacement: r('src/') },

      // Map tests' relative json-components imports to local fixtures
      { find: /^\.\.\/\.\.\/\.\.\/json-components\//, replacement: r('__tests__/__fixtures__/json-components/') },
    ],
  },
});
