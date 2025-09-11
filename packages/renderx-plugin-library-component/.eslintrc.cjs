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
  rules: {
    // Disallow importing from host repo internals (temporary override below)
    'no-restricted-imports': [
      'error',
      { patterns: ['**/plugins/**'] },
    ],
  },
  overrides: [
    {
      files: ['src/index.ts'],
      rules: {
        // Temporary allowance until handlers are internalized into package src/
        'no-restricted-imports': 'off',
      },
    },
  ],
};

