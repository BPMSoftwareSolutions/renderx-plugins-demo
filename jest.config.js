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
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/modules/$1",
    "^@communication/(.*)$": "<rootDir>/modules/communication/$1",
    "^@test-utils/(.*)$": "<rootDir>/tests/utils/$1",
    "^@fixtures/(.*)$": "<rootDir>/tests/fixtures/$1",
    "^@mocks/(.*)$": "<rootDir>/tests/mocks/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
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
  // Custom matchers for musical timing and event testing
  globalSetup: "<rootDir>/tests/setup/global-setup.ts",
  globalTeardown: "<rootDir>/tests/setup/global-teardown.ts",
};
