import { describe, it, expect } from "vitest";
import path from "node:path";
import { ESLint } from "eslint";

const cwd = path.resolve(__dirname, "..");

describe("@renderx-plugins/canvas: ESLint guardrails", () => {
  let ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  it("src is clean under local ESLint config", async () => {
    const eslint = new ESLint({ cwd });
    const results = await eslint.lintFiles(["src/**/*.{ts,tsx,js,jsx}"]);
    const errors = results.reduce((sum, r) => sum + r.errorCount, 0);
    expect(errors).toBe(0);
  }, 30000);

  it("forbids repo-relative/cross-plugin imports", async () => {
    const eslint = new ESLint({ cwd });
    const code = "import x from '../../plugins/other/foo';\nexport const y = x;\n";
    const [{ errorCount, messages }] = await eslint.lintText(code, {
      filePath: path.join(cwd, "src", "guard.ts"),
    });
    expect(errorCount).toBeGreaterThan(0);
    // Ensure it's our restricted-imports rule
    expect(messages.some((m) => /no-restricted-imports/.test(String(m.ruleId)))).toBe(true);
  }, 30000);
});

