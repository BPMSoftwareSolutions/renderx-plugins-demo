import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import allowedImports from "./eslint-rules/allowed-imports.js";

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
    plugins: {
      "allowed-imports": allowedImports,
    },
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
      "allowed-imports/only-allowed": [
        "error",
        { allow: ["@renderx-plugins/host-sdk", "@renderx-plugins/manifest-tools", "react", "react-dom"] },
      ],
    },
  },
  // Temporary exception: re-export shim points to repo plugin source (Phase 1 only)
  {
    files: ["src/index.ts"],
    rules: {
      "no-restricted-imports": "off",
      "allowed-imports/only-allowed": "off",
    },
  },
];

