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
    // Disallow importing from host repo internals
    'no-restricted-imports': [
      'error',
      { patterns: ['**/plugins/**'] },
    ],
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      rules: {
        // Disable host-repo-only custom topic validation inside the externalized package
        'topics-keys/valid-topics': 'off',
      },
    },
  ],
};

