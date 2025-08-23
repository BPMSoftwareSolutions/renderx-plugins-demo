import { RuleTester } from "eslint";
import beatKindDomAccess from "../../eslint-rules/beat-kind-dom-access.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

describe("beat-kind-dom-access ESLint rule", () => {
  ruleTester.run("beat-kind-dom-access", beatKindDomAccess, {
    valid: [
      // Valid: DOM access in stage-crew handler
      {
        filename: "test.symphony.ts",
        code: `
          export const sequence = {
            id: "test-symphony",
            movements: [{
              id: "test",
              beats: [
                { beat: 1, handler: "createNode", kind: "stage-crew" },
                { beat: 2, handler: "notifyUi", kind: "pure" }
              ]
            }]
          };
          
          export const handlers = {
            createNode(data, ctx) {
              const el = document.createElement("div");
              el.style.position = "absolute";
              document.getElementById("canvas").appendChild(el);
            },
            notifyUi(data) {
              data.onCreated?.();
            }
          };
        `,
      },
      
      // Valid: No DOM access in pure handler
      {
        filename: "test.symphony.ts", 
        code: `
          export const sequence = {
            id: "test-symphony",
            movements: [{
              id: "test",
              beats: [
                { beat: 1, handler: "processData", kind: "pure" }
              ]
            }]
          };
          
          export const handlers = {
            processData(data, ctx) {
              const result = data.value * 2;
              ctx.payload.result = result;
              return { ok: true };
            }
          };
        `,
      },
      
      // Valid: Non-symphony file with DOM access (should be ignored)
      {
        filename: "test.stage-crew.ts",
        code: `
          export function createNode() {
            const el = document.createElement("div");
            document.body.appendChild(el);
          }
        `,
      },
    ],

    invalid: [
      // Invalid: DOM access in pure handler
      {
        filename: "test.symphony.ts",
        code: `
          export const sequence = {
            id: "test-symphony", 
            movements: [{
              id: "test",
              beats: [
                { beat: 1, handler: "processData", kind: "pure" }
              ]
            }]
          };
          
          export const handlers = {
            processData(data, ctx) {
              const el = document.createElement("div");
              return { ok: true };
            }
          };
        `,
        errors: [
          {
            messageId: "domAccessInNonStageCrew",
            data: {
              pattern: "document.createElement",
              handlerName: "processData", 
              kind: "pure"
            }
          }
        ]
      },
      
      // Invalid: DOM access in io handler
      {
        filename: "test.symphony.ts",
        code: `
          export const sequence = {
            id: "test-symphony",
            movements: [{
              id: "test", 
              beats: [
                { beat: 1, handler: "saveData", kind: "io" }
              ]
            }]
          };
          
          export const handlers = {
            saveData(data, ctx) {
              ctx.io.save(data);
              document.getElementById("status").textContent = "Saved";
            }
          };
        `,
        errors: [
          {
            messageId: "domAccessInNonStageCrew",
            data: {
              pattern: "document.getElementById",
              handlerName: "saveData",
              kind: "io"
            }
          },
          {
            messageId: "domAccessInNonStageCrew", 
            data: {
              pattern: "textContent",
              handlerName: "saveData",
              kind: "io"
            }
          }
        ]
      },
      
      // Invalid: DOM access in handler with no kind specified
      {
        filename: "test.symphony.ts",
        code: `
          export const sequence = {
            id: "test-symphony",
            movements: [{
              id: "test",
              beats: [
                { beat: 1, handler: "doSomething" }
              ]
            }]
          };
          
          export const handlers = {
            doSomething(data, ctx) {
              document.querySelector(".target").style.display = "none";
            }
          };
        `,
        errors: [
          {
            messageId: "domAccessInUnknownKind",
            data: {
              pattern: "document.querySelector",
              handlerName: "doSomething"
            }
          },
          {
            messageId: "domAccessInUnknownKind",
            data: {
              pattern: "style.",
              handlerName: "doSomething"
            }
          }
        ]
      },
      
      // Invalid: DOM access in handler not mapped to any beat
      {
        filename: "test.symphony.ts",
        code: `
          export const sequence = {
            id: "test-symphony",
            movements: [{
              id: "test",
              beats: [
                { beat: 1, handler: "validHandler", kind: "pure" }
              ]
            }]
          };
          
          export const handlers = {
            validHandler(data, ctx) {
              return { ok: true };
            },
            unmappedHandler(data, ctx) {
              const canvas = document.getElementById("canvas");
              canvas.appendChild(document.createElement("div"));
            }
          };
        `,
        errors: [
          {
            messageId: "domAccessInUnmappedHandler",
            data: {
              pattern: "document.getElementById",
              handlerName: "unmappedHandler"
            }
          },
          {
            messageId: "domAccessInUnmappedHandler",
            data: {
              pattern: "appendChild",
              handlerName: "unmappedHandler"
            }
          },
          {
            messageId: "domAccessInUnmappedHandler",
            data: {
              pattern: "document.createElement",
              handlerName: "unmappedHandler"
            }
          }
        ]
      }
    ],
  });
});
