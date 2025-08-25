import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import sequencesInJson from "../../eslint-rules/sequences-in-json.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

describe("sequences-in-json ESLint rule", () => {
  ruleTester.run("sequences-in-json", sequencesInJson.rules["sequences-in-json"], {
    valid: [
      // Valid: handlers export only
      {
        filename: "plugins/test/test.symphony.ts",
        code: `
          export const handlers = {
            testHandler() {
              return { ok: true };
            }
          };
        `,
      },
      
      // Valid: non-sequence object export
      {
        filename: "plugins/test/test.ts",
        code: `
          export const config = {
            id: "test-config",
            name: "Test Config"
          };
        `,
      },
      
      // Valid: sequence-like object but not exported
      {
        filename: "plugins/test/test.ts",
        code: `
          const sequence = {
            id: "test-sequence",
            movements: [
              { id: "test", beats: [{ beat: 1, event: "test", handler: "test" }] }
            ]
          };
        `,
      },
      
      // Valid: non-plugin file
      {
        filename: "src/test.ts",
        code: `
          export const sequence = {
            id: "test-sequence",
            movements: [
              { id: "test", beats: [{ beat: 1, event: "test", handler: "test" }] }
            ]
          };
        `,
      },
      
      // Valid: test file
      {
        filename: "plugins/test/test.spec.ts",
        code: `
          export const sequence = {
            id: "test-sequence",
            movements: [
              { id: "test", beats: [{ beat: 1, event: "test", handler: "test" }] }
            ]
          };
        `,
      },
    ],
    
    invalid: [
      // Invalid: export const sequence
      {
        filename: "plugins/test/test.symphony.ts",
        code: `
          export const sequence = {
            id: "test-sequence",
            name: "Test Sequence",
            movements: [
              {
                id: "test",
                beats: [
                  { beat: 1, event: "test:event", handler: "testHandler" }
                ]
              }
            ]
          };
        `,
        errors: [
          {
            messageId: "sequenceExportNotAllowed",
            line: 2,
            column: 35,
          },
        ],
      },
      
      // Invalid: export const sequence with TypeScript "as const"
      {
        filename: "plugins/test/test.symphony.ts",
        code: `
          export const sequence = {
            id: "test-sequence",
            movements: [
              {
                id: "test",
                beats: [
                  { beat: 1, event: "test:event", handler: "testHandler" }
                ]
              }
            ]
          } as const;
        `,
        errors: [
          {
            messageId: "sequenceExportNotAllowed",
            line: 2,
            column: 35,
          },
        ],
      },
      
      // Invalid: named export of sequence
      {
        filename: "plugins/test/test.symphony.ts",
        code: `
          const sequence = {
            id: "test-sequence",
            movements: [
              {
                id: "test",
                beats: [
                  { beat: 1, event: "test:event", handler: "testHandler" }
                ]
              }
            ]
          };
          
          export { sequence };
        `,
        errors: [
          {
            messageId: "sequenceExportNotAllowed",
            line: 14,
            column: 20,
          },
        ],
      },
    ],
  });
});
