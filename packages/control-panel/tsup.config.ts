import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/symphonies/**/*.ts',
  ],
  dts: true,
  format: ['esm'],
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  // IMPORTANT: Disable treeshake to avoid DCE of observer notifications inside handlers
  treeshake: false,
  minify: false,
  target: 'es2022',
  skipNodeModulesBundle: true,
  splitting: false,
  shims: false,
  // Keep external deps unbundled
  external: [
    'react',
    'react-dom',
    '@renderx-plugins/host-sdk',
    '@renderx-plugins/manifest-tools',
  ],
});

