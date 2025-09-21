import { defineConfig } from "vitest/config";



export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Include tests in the monorepo's legacy __tests__ folder (if any) and the new tests/ folder
    include: [
      "**/__tests__/**/*.spec.ts",
      "**/__tests__/**/*.spec.tsx",
      "tests/**/*.spec.ts",
      "tests/**/*.spec.tsx",
    ],
    // No setup file for now; will be reintroduced when the new harness lands
    setupFiles: [],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      // Map legacy package name used in tests to the actual dependency
      "@renderx/host-sdk": "@renderx-plugins/host-sdk",

    },
  },
});
