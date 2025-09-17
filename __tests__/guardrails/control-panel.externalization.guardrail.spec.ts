import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('Control Panel externalization guardrails', () => {
  it('does not include host fallback to internal /plugins/control-panel/index.ts', () => {
    const p = path.join(process.cwd(), 'src', 'conductor.ts');
    const txt = readFileSync(p, 'utf-8');
    expect(txt).not.toMatch(/\/plugins\/control-panel\/index\.ts/);
  });

  it('plugin-manifest points ControlPanelPlugin to the package', () => {
    const manifestPath = path.join(process.cwd(), 'public', 'plugins', 'plugin-manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const cp = (manifest.plugins || []).find((p: any) => p?.id === 'ControlPanelPlugin');
    expect(cp).toBeTruthy();
    expect(cp.ui?.module).toBe('@renderx-plugins/control-panel');
    expect(cp.runtime?.module).toBe('@renderx-plugins/control-panel');
  });
});

