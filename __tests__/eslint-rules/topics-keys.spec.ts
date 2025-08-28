import { RuleTester } from "eslint";
import tsparser from "@typescript-eslint/parser";
import topicsKeys from "../../eslint-rules/topics-keys.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, beforeAll, afterAll } from "vitest";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsparser,
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

describe("topics-keys ESLint rule", () => {
  let original: string | null = null;
  let restore: () => void = () => {};

  beforeAll(() => {
    // Provide a tiny topics manifest on disk for the rule
    const cwd = process.cwd();
    const rootManifest = path.join(cwd, "topics-manifest.json");

    if (fs.existsSync(rootManifest)) {
      try {
        original = fs.readFileSync(rootManifest, "utf8");
      } catch {
        original = null;
      }
    }

    const testManifest = JSON.stringify({
      topics: { "canvas.component.drag.move": {} },
    });
    fs.writeFileSync(rootManifest, testManifest, "utf8");

    restore = () => {
      if (original != null) fs.writeFileSync(rootManifest, original, "utf8");
      else
        try {
          fs.unlinkSync(rootManifest);
        } catch {}
    };
  });

  afterAll(() => {
    restore();
  });

  const rule = (topicsKeys as any).rules["valid-topics"];

  ruleTester.run("valid-topics", rule, {
    valid: [
      {
        filename: "plugins/canvas/ui/ok.ts",
        code: `
          import { EventRouter } from "../../src/EventRouter";
          EventRouter.publish("canvas.component.drag.move", { id: "a", position: { x: 0, y: 0 } });
        `,
      },
    ],
    invalid: [
      {
        filename: "plugins/canvas/ui/bad.ts",
        code: `
          import { EventRouter } from "../../src/EventRouter";
          EventRouter.publish("canvas.component.unknown", {});
        `,
        errors: [
          {
            messageId: "unknownTopic",
          },
        ],
      },
    ],
  });
});
