// Vite config: ensure dev prebundle for header + host-sdk; bundle host-sdk in prod so preview works
export default {
  resolve: {
    alias: {
      // Allow code to import '@renderx/host-sdk' while resolving to the installed package
      '@renderx/host-sdk': '@renderx-plugins/host-sdk',
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
