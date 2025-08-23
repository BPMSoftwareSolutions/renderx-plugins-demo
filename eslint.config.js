import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import beatKindDomAccess from "./eslint-rules/beat-kind-dom-access.js";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["dist/**", "build/**", "node_modules/**", ".vite/**", "coverage/**"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  // Symphony files: enforce DOM access only in stage-crew handlers
  {
    files: ["**/*.symphony.ts", "**/*.symphony.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "beat-kind": beatKindDomAccess
    },
    rules: {
      "beat-kind/beat-kind-dom-access": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  // UI code: forbid DOM & StageCrew/EventBus
  {
    files: ["plugins/**/ui/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-globals": ["error", "document", "window", "navigator", "localStorage"],
      "no-restricted-imports": [
        "error",
        {
          patterns: ["*StageCrew*", "**/stage-crew*", "**/EventBus*", "**/event-bus*"],
          paths: [
            { name: "stage-crew", message: "UI must not import StageCrew. Do DOM/CSS mutations in sequence handlers only." },
            { name: "musical-conductor/EventBus", message: "UI must not import EventBus. Use conductor.play()." },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        { selector: "MemberExpression[object.name='document']", message: "UI code may not access document.*" },
        { selector: "MemberExpression[object.name='window']", message: "UI code may not access window.*" },
        { selector: "CallExpression[callee.object.name='document']", message: "UI code may not call document APIs." },
      ],
    },
  },
  // Stage-crew handlers: allow DOM, forbid UI imports, forbid IO/API here
  {
    files: ["plugins/**/*.{stage-crew}.ts", "plugins/**/*.{stage-crew}.tsx"],
    rules: {
      // Explicitly allow DOM in stage-crew handlers by disabling the global restriction
      "no-restricted-globals": "off",
      // Keep stage-crew clean of UI/IO/API layers
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "plugins/**/ui/**",
            "**/*.io",
            "**/*.api"
          ],
          message: "Stage-crew handlers must not import UI or IO/API modules.",
        },
      ],
    },
  },
  // Non-stage-crew code: forbid direct DOM access
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["plugins/**/*.{stage-crew}.ts", "plugins/**/*.{stage-crew}.tsx"],
    rules: {
      "no-restricted-globals": ["error", "document", "window"],
      "no-restricted-syntax": [
        "error",
        { selector: "MemberExpression[object.name='document']", message: "DOM writes only allowed in *.stage-crew.ts" },
        { selector: "CallExpression[callee.object.name='document']", message: "DOM writes only allowed in *.stage-crew.ts" },
      ],
    },
  },
];

