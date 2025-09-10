// Vite config to externalize @renderx-plugins/host-sdk for Rollup
export default {
  resolve: {
    alias: {
      // Allow code to import '@renderx/host-sdk' while resolving to the installed package
      '@renderx/host-sdk': '@renderx-plugins/host-sdk',
    },
  },
  optimizeDeps: {
    // Ensure dev server prebundles external header package so dynamic import works reliably in CI
    include: ['@renderx-plugins/header'],
  },
  build: {
    rollupOptions: {
      external: ['@renderx-plugins/host-sdk']
    }
  }
};
