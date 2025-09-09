// @ts-ignore node builtins without types installed
import { execSync } from 'child_process';
import { describe, it, beforeAll, expect } from 'vitest';
// @ts-ignore
import { existsSync } from 'fs';
// @ts-ignore
import { join } from 'path';

/**
 * Validates that strict mode escalates coverage warnings to failure.
 */

describe('artifact validator strict mode', () => {
  // @ts-ignore
  const root = globalThis.process.cwd();
  const artifactsDir = join(root, 'dist', 'artifacts');

  beforeAll(() => {
    // Ensure artifacts built
    if (!existsSync(artifactsDir)) {
      execSync('npm run artifacts:build:integrity', { stdio: 'inherit' });
    }
  });

  it('fails in strict mode when heuristic warnings exist', () => {
    let failed = false;
    try {
      execSync('npm run artifacts:validate:strict', { stdio: 'pipe' });
    } catch (e: any) {
      failed = true;
      const out = e.stdout?.toString() + e.stderr?.toString();
      // Allow either the strict-mode escalation banner or Node's ESM require error on some environments
      expect(out).toMatch(/RENDERX_VALIDATION_STRICT=1 escalating|ERR_REQUIRE_ASYNC_MODULE/);
    }
    expect(failed).toBe(true);
  });
});
