import { defineConfig } from "vitest/config";



export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.spec.ts", "__tests__/**/*.spec.tsx"],
    setupFiles: ["tests/setup.sdk-bridge.ts"],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      // Map legacy package name used in tests to the actual dependency
      "@renderx/host-sdk": "@renderx-plugins/host-sdk",

    },
  },
});
