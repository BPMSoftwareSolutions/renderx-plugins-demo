// Vite config: ensure dev prebundle for header + host-sdk; bundle host-sdk in prod so preview works

export default {
  resolve: {
    alias: {
      // Host SDK alias (legacy import name)
      "@renderx/host-sdk": "@renderx-plugins/host-sdk",
    },
    // Ensure a single React instance across host and plugins
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Ensure dev server prebundles core external packages; canvas packages load from source via alias
    include: [
      "@renderx-plugins/header",
      "@renderx-plugins/library",
      "@renderx-plugins/library-component",
      "@renderx-plugins/control-panel",
      "@renderx-plugins/host-sdk",
    ],
    // Avoid esbuild trying to load asset query imports like ?url in dependencies
    exclude: ["@renderx-plugins/canvas-component", "gif.js.optimized"],
    // Force dependency re-bundling in CI to avoid stale optimization issues
    force: process.env.CI === "true",
  },
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
