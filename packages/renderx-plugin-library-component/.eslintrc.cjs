module.exports = {
  root: false,
  env: { es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist/**'],
  rules: {
    // Disallow importing from host repo internals (temporary override below)
    'no-restricted-imports': [
      'error',
      { patterns: ['**/plugins/**'] },
    ],
  },
  overrides: [
    {
      files: ['src/index.ts', '__tests__/**/*.ts'],
      rules: {
        // Temporary allowance until handlers are internalized into package src/
        // Also allow tests to reach into host repo handlers until we internalize them
        'no-restricted-imports': 'off',
      },
    },
  ],
};

