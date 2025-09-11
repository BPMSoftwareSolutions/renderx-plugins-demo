import { defineConfig } from 'tsup';

export default defineConfig({
  tsconfig: 'tsconfig.build.json',
  entry: ['src/index.ts'],
  // TODO: enable dts once handlers are internalized into src/
  dts: false,
  format: ['esm'],
  sourcemap: true,
  clean: true,
  target: 'es2020',
  treeshake: true,
  external: [
    '@renderx-plugins/host-sdk',
    'react',
    'react-dom',
  ],
});

