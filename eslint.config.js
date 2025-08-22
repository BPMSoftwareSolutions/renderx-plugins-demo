import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["dist/**", "build/**", "node_modules/**", ".vite/**", "coverage/**"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
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
];

