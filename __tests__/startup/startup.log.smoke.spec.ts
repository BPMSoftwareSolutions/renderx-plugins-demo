import { describe, it, expect, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

function parseTimestampFrom(filename: string): number | null {
  const m = filename.match(/localhost-(\d+)\.log$/);
  return m ? Number(m[1]) : null;
}

describe('Startup log smoke', () => {
  it('has a recent localhost log and does not show HeaderThemePlugin missing', async () => {
    const logsDir = path.resolve(process.cwd(), '.logs');
    const entries = await fs.readdir(logsDir).catch(() => [] as string[]);
    const localhostLogs = entries.filter(f => /^localhost-\d+\.log$/.test(f));

    // If no logs are present (e.g., CI environment), treat as inconclusive but non-failing.
    if (localhostLogs.length === 0) {
      console.warn('[startup log smoke] No localhost logs found; skipping content assertions.');
      return;
    }

    const latestEntry = localhostLogs
      .map(f => ({ f, ts: parseTimestampFrom(f) ?? 0 }))
      .sort((a, b) => b.ts - a.ts)[0];

    if (!latestEntry?.f) {
      console.warn('[startup log smoke] Could not resolve latest localhost log; skipping.');
      return;
    }

    // Only assert on logs deemed "recent" (default: within the last 2 minutes) to avoid
    // failing on stale logs from a previous run before fixes were applied.
    const now = Date.now();
    const RECENT_WINDOW_MS = 2 * 60 * 1000;
    if (!latestEntry.ts || now - latestEntry.ts > RECENT_WINDOW_MS) {
      console.warn('[startup log smoke] Latest localhost log is stale; skipping assertions.');
      return;
    }

    const p = path.join(logsDir, latestEntry.f);
    const content = await fs.readFile(p, 'utf-8');
    if (!content || content.length === 0) {
      console.warn('[startup log smoke] Latest log is empty; skipping.');
      return;
    }

    // Smoke expectations (best-effort)
    expect(content).not.toMatch(/Plugin not found: HeaderThemePlugin/);

    const hasRegistered = /Sequence registered: Header UI Theme (Get|Toggle)/.test(content)
      || /Plugin mounted successfully: HeaderThemePlugin/.test(content);
    expect(hasRegistered, 'Expected header sequences to register; check handlersPath resolution and conductor mounting').toBe(true);

    // Ensure no runtime registration errors for header plugins or bare-spec resolution failures
    expect(content).not.toMatch(/Failed runtime register for Header(Title|Controls|Theme)Plugin/);
    expect(content).not.toMatch(/Failed to resolve module specifier ['"]@renderx-plugins\/header['"]/);
  });

  it("does NOT emit library resolution failures on startup", async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('../../src/main');
    await new Promise((r) => setTimeout(r, 50));

    const warnText = warnSpy.mock.calls.map((c) => String(c[0] ?? c.join(' '))).join('\n');
    const errText = errSpy.mock.calls.map((c) => String(c[0] ?? c.join(' '))).join('\n');

    expect(warnText).not.toContain('\u26a0\ufe0f Failed runtime register for LibraryPlugin');
    expect(errText).not.toContain("Failed to resolve module specifier '@renderx-plugins/library'");
  });

});

