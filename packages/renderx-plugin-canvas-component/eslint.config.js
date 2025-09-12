import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Boundary: do not import from repo-level plugins/** or escape the package root
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "**/plugins/**",
            "../../*",
            "../../../*",
            "../../../../*",
          ],
        },
      ],
    },
  },
  // Temporary exceptions for Phase 1 re-export shims until true externalization
  {
    files: ["src/index.ts", "src/symphonies/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

