// Vite config to externalize @renderx-plugins/host-sdk for Rollup
export default {
  resolve: {
    alias: {
      // Allow code to import '@renderx/host-sdk' while resolving to the installed package
      '@renderx/host-sdk': '@renderx-plugins/host-sdk',
    },
  },
  optimizeDeps: {
    // Ensure dev server prebundles external packages used by header plugin
    include: ['@renderx-plugins/header', '@renderx-plugins/host-sdk'],
  },
  build: {
    rollupOptions: {
      external: ['@renderx-plugins/host-sdk']
    }
  }
};
