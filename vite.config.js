// Vite config: ensure dev prebundle for header + host-sdk; bundle host-sdk in prod so preview works
import path from 'node:path';
import react from '@vitejs/plugin-react';


export default {
  resolve: {
    alias: {
      // Host SDK alias (legacy import name)
      "@renderx/host-sdk": "@renderx-plugins/host-sdk",
      // SDK deep import shims → map to host-provided vendor helpers
      "../../vendor/vendor-symphony-loader": path.resolve(process.cwd(), "src/vendor/vendor-symphony-loader.ts"),
      "../../../data/feature-flags.json": path.resolve(process.cwd(), "data/feature-flags.json"),
    },
    // Ensure a single React instance across host and plugins
    dedupe: ["react", "react-dom", "@renderx-plugins/host-sdk"],
  },
  optimizeDeps: {
    // Allow Vite to discover and pre-bundle dependencies that need CommonJS-to-ESM transformation
    include: [
      // Pre-bundle React plugins that might have CommonJS dependencies
      "@renderx-plugins/header",
      "@renderx-plugins/library",
      "@renderx-plugins/library-component",
      "@renderx-plugins/control-panel",
      // Include any other dependencies that might need transformation
      "musical-conductor"
    ],
    exclude: [
      // Only exclude host-sdk and its subpaths to avoid dynamic import resolution issues
      "@renderx-plugins/host-sdk",
      "@renderx-plugins/host-sdk/core/conductor/conductor",
      "@renderx-plugins/host-sdk/core/conductor/sequence-registration",
      "@renderx-plugins/host-sdk/core/conductor/runtime-loaders",
      "@renderx-plugins/host-sdk/core/manifests/interactionManifest",
      "@renderx-plugins/host-sdk/core/manifests/topicsManifest",
      "@renderx-plugins/host-sdk/core/startup/startupValidation",
      "@renderx-plugins/host-sdk/core/events/EventRouter",
      "@renderx-plugins/host-sdk/core/environment/feature-flags",
      "@renderx-plugins/canvas-component",
      "gif.js.optimized"
    ],
    // Enable discovery but be selective about what gets optimized
    noDiscovery: false,
    esbuildOptions: {
      // Ensure proper CommonJS-to-ESM transformation
      format: 'esm',
      target: 'es2020',
      plugins: [
        {
          name: 'dep-scan-externalize-host-sdk',
          setup(build) {
            build.onResolve({ filter: /^@renderx-plugins\/host-sdk(\/.+)?$/ }, args => ({ external: true }));
            return undefined;
          },
        },
      ],
    },
    // Force dependency re-bundling in CI to avoid stale optimization issues
    force: process.env.CI === "true",
  },
  plugins: [
    react({
      // Ensure consistent JSX runtime between dev and production
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      // Enable fast refresh for better dev experience
      fastRefresh: true
    }),
    {
      name: 'fix-sdk-plugin-manifest-raw',
      enforce: 'pre',
      resolveId(id, importer) {
        // The SDK imports the plugin manifest via a relative path from node_modules:
        //   ../../../public/plugins/plugin-manifest.json?raw
        // In production build, Rollup may fail to resolve this from node_modules. Redirect it to the app's public path.
        if (id.endsWith('public/plugins/plugin-manifest.json?raw')) {
          return path.resolve(process.cwd(), 'public/plugins/plugin-manifest.json?raw');
        }
        // The SDK resolves feature flags via a relative path from within node_modules
        if (id.endsWith('data/feature-flags.json')) {
          return path.resolve(process.cwd(), 'data/feature-flags.json');
        }
        return null;
      },
    },
  ],
  build: {
    rollupOptions: {
      // Include a stable-named vendor entry that bundles the workspace Control Panel for preview/E2E
      input: {
        main: "index.html",
        "vendor-control-panel": "src/vendor/vendor-control-panel.ts",
        // Ensure the test harness page is built and available in preview at /test-plugin-loading.html
        "test-plugin-loading": "src/test-plugin-loading.html",
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === "vendor-control-panel"
            ? "assets/vendor-control-panel.js"
            : "assets/[name]-[hash].js",
      },
      // Do NOT externalize host-sdk for this app; we need it bundled for preview/E2E
      // external: ['@renderx-plugins/host-sdk']
    },
  },
};
