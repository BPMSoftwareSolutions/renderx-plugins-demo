// Vite config: ensure dev prebundle for header + host-sdk; bundle host-sdk in prod so preview works
import path from 'node:path';

export default {
  resolve: {
    alias: {
      // Host SDK alias (legacy import name)
      '@renderx/host-sdk': '@renderx-plugins/host-sdk',
      // Force Canvas packages to resolve to built artifacts in node_modules (avoid src re-exports)
      '@renderx-plugins/canvas': path.resolve(process.cwd(), 'plugins/canvas/index.ts'),
      '@renderx-plugins/canvas-component': path.resolve(process.cwd(), 'plugins/canvas-component/index.ts'),
      '@renderx-plugins/canvas-component/symphonies': path.resolve(process.cwd(), 'plugins/canvas-component/symphonies'),
    },
  },
  optimizeDeps: {
    // Ensure dev server prebundles external packages used by header & library plugins
    include: ['@renderx-plugins/header', '@renderx-plugins/library', '@renderx-plugins/host-sdk'],
  },
  build: {
    rollupOptions: {
      // Do NOT externalize host-sdk for this app; we need it bundled for preview/E2E
      // external: ['@renderx-plugins/host-sdk']
    }
  }
};
