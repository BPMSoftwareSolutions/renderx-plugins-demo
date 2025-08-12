module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/modules", "<rootDir>/tests"],
  testMatch: [
    "<rootDir>/tests/**/*.test.ts",
    "<rootDir>/tests/**/*.spec.ts",
    "<rootDir>/modules/**/*.test.ts",
  ],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/modules/$1",
    "^@communication/(.*)$": "<rootDir>/modules/communication/$1",
    "^@test-utils/(.*)$": "<rootDir>/tests/utils/$1",
    "^@fixtures/(.*)$": "<rootDir>/tests/fixtures/$1",
    "^@mocks/(.*)$": "<rootDir>/tests/mocks/$1",
    // Allow importing RenderX app paths directly in tests (e.g., RenderX/src/...)
    "^RenderX/(.*)$": "<rootDir>/RenderX/$1",
    // Map .js extensions to .ts files for ES module compatibility
    "^(.*)\\.js$": "$1",
  },
  resolver: "<rootDir>/jest.resolver.cjs",
  setupFilesAfterEnv: [
    // Plugin & RenderX-specific setups removed in core-only mode
  ],
  collectCoverageFrom: [
    "modules/**/*.ts",
    "!modules/**/*.d.ts",
    "!modules/**/*.test.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
};

