import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['__tests__/**/*.spec.ts'],
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
  esbuild: {
    target: 'node14'
  },
});

