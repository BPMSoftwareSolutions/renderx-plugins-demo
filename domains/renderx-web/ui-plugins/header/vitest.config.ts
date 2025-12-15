import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup/vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@setup': path.resolve(__dirname, './tests/setup'),
    },
  },
});
