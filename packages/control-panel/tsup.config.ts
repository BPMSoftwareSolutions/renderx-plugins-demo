import { defineConfig } from 'tsup';

// Disable DTS generation when running via `npm test` to speed up tests and avoid
// intermittent type bundling races during pretest builds.
const isTestLifecycle = process.env.npm_lifecycle_event === 'test' || !!process.env.VITEST || !!process.env.VITEST_WORKER_ID;

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/state/observer.store.ts', // Separate entry for observer store
    'src/symphonies/**/*.ts',
  ],
  dts: !isTestLifecycle,
  format: ['esm'],
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  treeshake: false,
  minify: false,
  target: 'es2022',
  skipNodeModulesBundle: true,
  splitting: true,
  shims: false,
  // Keep external deps unbundled
  external: [
    'react',
    'react-dom',
    '@renderx-plugins/host-sdk',
    '@renderx-plugins/manifest-tools',
  ],
});

