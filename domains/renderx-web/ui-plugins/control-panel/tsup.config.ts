import { defineConfig } from 'tsup';
import { writeFileSync } from 'fs';

// Disable DTS generation when running via `npm test` to speed up tests and avoid
// intermittent type bundling races during pretest builds.
const lifecycle = String(process.env.npm_lifecycle_event || '');
const isTestLifecycle = lifecycle === 'test' || lifecycle === 'pretest' || !!process.env.VITEST || !!process.env.VITEST_WORKER_ID;

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
  onSuccess: async () => {
    // Copy plugin manifest after build
    const manifest = {
      plugins: [
        {
          id: "ControlPanelPlugin",
          ui: {
            slot: "controlPanel",
            module: "@renderx-web/control-panel",
            export: "ControlPanel"
          },
          runtime: {
            module: "@renderx-web/control-panel",
            export: "register"
          }
        }
      ]
    };
    writeFileSync('dist/plugin-manifest.json', JSON.stringify(manifest, null, 2));
    console.log('✅ Plugin manifest created at dist/plugin-manifest.json');
  },
});

