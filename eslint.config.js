import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import beatKindDomAccess from "./eslint-rules/beat-kind-dom-access.js";
import playRouting from "./eslint-rules/no-hardcoded-play-ids.js";
import noConsoleInSymphonies from "./eslint-rules/no-console-in-symphonies.js";
import sequencesInJson from "./eslint-rules/sequences-in-json.js";
import featureFlags from "./eslint-rules/feature-flags.js";
import validSequenceHandlers from "./eslint-rules/valid-sequence-handlers.js";
import interactionKeys from "./eslint-rules/interaction-keys.js";
import ruleEngineCoverage from "./eslint-rules/rule-engine-coverage.js";
import importCssInjectionCoverage from "./eslint-rules/import-css-injection-coverage.js";
import topicsKeys from "./eslint-rules/topics-keys.js";
import noHardcodedSlotNames from "./eslint-rules/no-hardcoded-slot-names.js";
import noHardcodedLayoutStyles from "./eslint-rules/no-hardcoded-layout-styles.js";
import requireSlotManifestRegistration from "./eslint-rules/require-slot-manifest-registration.js";
import noLayoutLogicInComponents from "./eslint-rules/no-layout-logic-in-components.js";
import requireManifestValidation from "./eslint-rules/require-manifest-validation.js";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      ".vite/**",
      "coverage/**",
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "play-routing": playRouting,
      "symphony-console": noConsoleInSymphonies,
      "sequences-json": sequencesInJson,
      "feature-flags": featureFlags,
      "sequence-handlers": validSequenceHandlers,
      "interaction-keys": interactionKeys,
      "rule-engine-coverage": ruleEngineCoverage,
      "import-css-injection-coverage": importCssInjectionCoverage,
      "topics-keys": topicsKeys,
      "layout-slot-naming": noHardcodedSlotNames,
      "layout-styles": noHardcodedLayoutStyles,
      "layout-slot-registration": requireSlotManifestRegistration,
      "layout-logic": noLayoutLogicInComponents,
      "layout-manifest-validation": requireManifestValidation,
    },
    rules: {
      "play-routing/no-hardcoded-play-ids": "error",
      "symphony-console/no-console-in-symphonies": "error",
      "sequences-json/sequences-in-json": "error",
      "feature-flags/enforce-flag-ids": "error",
      "sequence-handlers/validate-handlers": "error",
      "interaction-keys/valid-keys": "error",
      "topics-keys/valid-topics": "error",
      "rule-engine-coverage/validate-control-panel-rules": "error",
      "import-css-injection-coverage/validate-import-css": "error",
          "layout-slot-naming/no-hardcoded-slot-names": "error",
          "layout-styles/no-hardcoded-layout-styles": "error",
          "layout-slot-registration/require-slot-manifest-registration": "error",
          "layout-logic/no-layout-logic-in-components": "error",
          "layout-manifest-validation/require-manifest-validation": "error",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
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
      "beat-kind": beatKindDomAccess,
    },
    rules: {
      "beat-kind/beat-kind-dom-access": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // UI code: forbid DOM & StageCrew/EventBus
  {
    files: ["plugins/**/ui/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        "document",
        "window",
        "navigator",
        "localStorage",
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "*StageCrew*",
            "**/stage-crew*",
            "**/EventBus*",
            "**/event-bus*",
          ],
          paths: [
            {
              name: "stage-crew",
              message:
                "UI must not import StageCrew. Do DOM/CSS mutations in sequence handlers only.",
            },
            {
              name: "musical-conductor/EventBus",
              message: "UI must not import EventBus. Use conductor.play().",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        // Document access
        {
          selector: "MemberExpression[object.name='document']",
          message:
            "UI code may not access document.* - use stage-crew handlers instead",
        },
        {
          selector: "MemberExpression[object.name='window']",
          message:
            "UI code may not access window.* - use stage-crew handlers instead",
        },
        {
          selector: "CallExpression[callee.object.name='document']",
          message:
            "UI code may not call document APIs - use stage-crew handlers instead",
        },

        // DOM manipulation methods
        {
          selector: "CallExpression[callee.property.name='appendChild']",
          message:
            "UI code may not call appendChild - use stage-crew handlers instead",
        },
        {
          selector: "CallExpression[callee.property.name='removeChild']",
          message:
            "UI code may not call removeChild - use stage-crew handlers instead",
        },
        {
          selector: "CallExpression[callee.property.name='replaceChild']",
          message:
            "UI code may not call replaceChild - use stage-crew handlers instead",
        },
        {
          selector: "CallExpression[callee.property.name='insertBefore']",
          message:
            "UI code may not call insertBefore - use stage-crew handlers instead",
        },

        // Style manipulation
        {
          selector:
            "CallExpression[callee.object.property.name='style'][callee.property.name='setProperty']",
          message:
            "UI code may not call style.setProperty - use stage-crew handlers instead",
        },
        {
          selector: "AssignmentExpression[left.object.property.name='style']",
          message:
            "UI code may not assign to element.style.* - use stage-crew handlers instead",
        },

        // Class manipulation
        {
          selector: "CallExpression[callee.object.property.name='classList']",
          message:
            "UI code may not call classList methods - use stage-crew handlers instead",
        },

        // Attribute manipulation
        {
          selector: "CallExpression[callee.property.name='setAttribute']",
          message:
            "UI code may not call setAttribute - use stage-crew handlers instead",
        },
        {
          selector: "CallExpression[callee.property.name='removeAttribute']",
          message:
            "UI code may not call removeAttribute - use stage-crew handlers instead",
        },

        // Content manipulation
        {
          selector: "AssignmentExpression[left.property.name='innerHTML']",
          message:
            "UI code may not assign to innerHTML - use stage-crew handlers instead",
        },
        {
          selector: "AssignmentExpression[left.property.name='textContent']",
          message:
            "UI code may not assign to textContent - use stage-crew handlers instead",
        },
        {
          selector: "AssignmentExpression[left.property.name='innerText']",
          message:
            "UI code may not assign to innerText - use stage-crew handlers instead",
        },
      ],
    },
  },
  // All plugin code: forbid DOM access outside of stage-crew files
  {
    files: ["plugins/**/*.{ts,tsx,js,jsx}"],
    ignores: ["plugins/**/*.stage-crew.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        "document",
        "window",
        "navigator",
        "localStorage",
      ],
      "no-restricted-syntax": [
        "error",
        // Document access
        {
          selector: "MemberExpression[object.name='document']",
          message:
            "Plugin code may not access document.* - use stage-crew handlers instead",
        },
        {
          selector: "MemberExpression[object.name='window']",
          message:
            "Plugin code may not access window.* - use stage-crew handlers instead",
        },
        {
          selector: "CallExpression[callee.object.name='document']",
          message:
            "Plugin code may not call document APIs - use stage-crew handlers instead",
        },

        // DOM manipulation methods
        {
          selector: "CallExpression[callee.property.name='appendChild']",
          message:
            "Plugin code may not call appendChild - use stage-crew handlers instead",
        },
        {
          selector: "CallExpression[callee.property.name='removeChild']",
          message:
            "Plugin code may not call removeChild - use stage-crew handlers instead",
        },
        {
          selector: "CallExpression[callee.property.name='replaceChild']",
          message:
            "Plugin code may not call replaceChild - use stage-crew handlers instead",
        },
        {
          selector: "CallExpression[callee.property.name='insertBefore']",
          message:
            "Plugin code may not call insertBefore - use stage-crew handlers instead",
        },

        // Style manipulation
        {
          selector:
            "CallExpression[callee.object.property.name='style'][callee.property.name='setProperty']",
          message:
            "Plugin code may not call style.setProperty - use stage-crew handlers instead",
        },
        {
          selector: "AssignmentExpression[left.object.property.name='style']",
          message:
            "Plugin code may not assign to element.style.* - use stage-crew handlers instead",
        },

        // Class manipulation
        {
          selector: "CallExpression[callee.object.property.name='classList']",
          message:
            "Plugin code may not call classList methods - use stage-crew handlers instead",
        },

        // Attribute manipulation
        {
          selector: "CallExpression[callee.property.name='setAttribute']",
          message:
            "Plugin code may not call setAttribute - use stage-crew handlers instead",
        },
        {
          selector: "CallExpression[callee.property.name='removeAttribute']",
          message:
            "Plugin code may not call removeAttribute - use stage-crew handlers instead",
        },

        // Content manipulation
        {
          selector: "AssignmentExpression[left.property.name='innerHTML']",
          message:
            "Plugin code may not assign to innerHTML - use stage-crew handlers instead",
        },
        {
          selector: "AssignmentExpression[left.property.name='textContent']",
          message:
            "Plugin code may not assign to textContent - use stage-crew handlers instead",
        },
        {
          selector: "AssignmentExpression[left.property.name='innerText']",
          message:
            "Plugin code may not assign to innerText - use stage-crew handlers instead",
        },
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
          patterns: ["plugins/**/ui/**", "**/*.io", "**/*.api"],
          message: "Stage-crew handlers must not import UI or IO/API modules.",
        },
      ],
    },
  },
];
