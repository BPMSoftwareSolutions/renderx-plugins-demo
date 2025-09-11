// Vite config: ensure dev prebundle for header + host-sdk; bundle host-sdk in prod so preview works
// Also addresses issue #124: Vite Dependency Optimization Interferes with Library Plugin Loading
export default {
  resolve: {
    alias: {
      // Allow code to import '@renderx/host-sdk' while resolving to the installed package
      '@renderx/host-sdk': '@renderx-plugins/host-sdk',
    },
  },
  optimizeDeps: {
    // Ensure dev server prebundles external packages used by header & library plugins
    include: [
      '@renderx-plugins/header',
      '@renderx-plugins/library',
      '@renderx-plugins/host-sdk',
      // Include stable dependencies to prevent optimization interruptions
      'react',
      'react-dom',
      'react-dom/client'
    ],

    // Exclude dynamic imports and plugin modules that should not be pre-bundled
    exclude: [
      'gif.js.optimized', // Mentioned in issue #124 as causing reloads
      '/plugins/',        // Local plugin modules
    ],

    // Reduce optimization churn that causes reloads
    force: false,
    esbuildOptions: {
      // Prevent aggressive optimization that can break plugin loading
      keepNames: true,
    }
  },

  // Server configuration to improve plugin loading stability
  server: {
    // Disable HMR overlay to prevent blocking plugin loading
    hmr: {
      overlay: false,
      // Reduce reload frequency to prevent plugin registration interruption
      port: 24678
    },

    // Configure file watching to be less aggressive
    watch: {
      ignored: ['!**/node_modules/**']
    }
  },

  build: {
    rollupOptions: {
      // Do NOT externalize host-sdk for this app; we need it bundled for preview/E2E
      // external: ['@renderx-plugins/host-sdk']
    },

    // Source maps for better debugging of plugin issues
    sourcemap: true
  },

  // Define configuration for different environments
  define: {
    // Ensure plugin loading works in both dev and production
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
};
