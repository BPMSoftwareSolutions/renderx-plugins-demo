import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    testTimeout: 60000,
    hookTimeout: 60000,
    reporters: ['default', 'json'],
    outputFile: {
      json: './test-results/unit-results.json'
    },
    include: [
      "**/__tests__/**/*.spec.ts",
      "**/__tests__/**/*.spec.tsx",
      "**/__tests__/**/*.test.ts",
      "**/__tests__/**/*.test.tsx",
      "tests/**/*.spec.ts",
      "tests/**/*.spec.tsx",
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "packages/musical-conductor/tests/unit/cli/**/*.test.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
      "tests/test-plugin-loader.spec.tsx",
    ],
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 50,
        statements: 70,
      },
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@renderx/host-sdk": "@renderx-plugins/host-sdk",
    },
  },
});
