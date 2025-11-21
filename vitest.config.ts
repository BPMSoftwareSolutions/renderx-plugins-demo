import { defineConfig } from "vitest/config";



export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    testTimeout: 60000,
    hookTimeout: 60000,
    // Include tests in the monorepo's legacy __tests__ folder (if any) and the new tests/ folder
    include: [
      "**/__tests__/**/*.spec.ts",
      "**/__tests__/**/*.spec.tsx",
      "**/__tests__/**/*.test.ts",
      "**/__tests__/**/*.test.tsx",
      "tests/**/*.spec.ts",
      "tests/**/*.spec.tsx",
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      // MusicalConductor CLI Bug Detective tests (Vitest-only harness)
      "packages/musical-conductor/tests/unit/cli/**/*.test.ts",
    ],
    // Exclude non-production test files from CI runs
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
      // Exclude test plugin loader tests - these are for development/debugging only
      "tests/test-plugin-loader.spec.tsx",
    ],
    // No setup file for now; will be reintroduced when the new harness lands
    setupFiles: [],
    // Use jsdom for library tests that need DOM/window/document
    environmentMatchGlobs: [
      ["packages/library/__tests__/**", "jsdom"],
      ["packages/control-panel/__tests__/**/*.tsx", "jsdom"],
      ["tests/react-component-communication.spec.ts", "jsdom"],
      ["tests/react-component-e2e.spec.ts", "jsdom"],
      ["tests/react-component-theme-toggle.spec.ts", "jsdom"],
      ["tests/react-component-theme-toggle-e2e.spec.ts", "jsdom"],
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      // Map legacy package name used in tests to the actual dependency
      "@renderx/host-sdk": "@renderx-plugins/host-sdk",

    },
  },
});
