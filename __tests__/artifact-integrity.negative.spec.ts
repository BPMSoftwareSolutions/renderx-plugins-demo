// @ts-nocheck temporary: Node types not installed; keeping this lightweight.
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { verifyArtifactsIntegrity } from '../src/core/startup/startupValidation';

// Negative test: ensures tampering with an artifact triggers mismatch logging.
// Current implementation only logs a warning and returns null, so we assert the warning occurs.

function mutateFile(p: string) {
  const orig = readFileSync(p, 'utf-8');
  writeFileSync(p, orig + '\n// tampered');
  return orig;
}

describe('verifyArtifactsIntegrity (negative)', () => {
  let integrityPath: string;
  let oneFile: string | null = null;
  beforeAll(async () => {
    integrityPath = join(process.cwd(), 'dist', 'artifacts', 'artifacts.integrity.json');
    let data: any = null;
    try { data = JSON.parse(readFileSync(integrityPath, 'utf-8')); } catch {}
    if (!data || !data.files) {
      // Skip if integrity artifacts not built (developer didn't run artifacts:build:integrity)
      return;
    }
    const first = Object.keys(data.files)[0];
    if (first) {
      const p = join(process.cwd(), 'dist', 'artifacts', first);
      const orig = mutateFile(p);
      // restore after test
      process.on('exit', () => {
        try { writeFileSync(p, orig); } catch {}
      });
      oneFile = first;
    }
  });

  it('logs mismatch when an artifact hash is altered', async () => {
    if (!oneFile) return; // nothing to test (skip silently)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await verifyArtifactsIntegrity(false);
  const hadMismatch = warnSpy.mock.calls.some((c: any) => /integrity mismatch/i.test(String(c[0])));
    expect(hadMismatch).toBe(true);
    warnSpy.mockRestore();
  });
});
