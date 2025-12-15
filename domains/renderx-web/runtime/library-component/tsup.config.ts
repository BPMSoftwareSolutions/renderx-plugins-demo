import { defineConfig } from 'tsup';

export default defineConfig({
  tsconfig: 'tsconfig.json',
  entry: ['src/index.ts'],
  dts: true,
  format: ['esm'],
  sourcemap: true,
  clean: true,
  target: 'es2020',
  treeshake: false, // Disable tree-shaking to preserve handlers export
  external: [
    '@renderx-plugins/host-sdk',
    '@renderx-web/library',
    'musical-conductor',
    'react',
    'react-dom',
  ],
});

