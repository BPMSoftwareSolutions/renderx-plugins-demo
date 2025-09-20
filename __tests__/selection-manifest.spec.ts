import { describe, it, expect } from 'vitest';

import fs from 'fs/promises';
import path from 'path';

async function loadJson(p: string) {
  const cwd = (process as any).cwd?.() || process.cwd();
  const full = path.join(cwd, p);
  const txt = await fs.readFile(full, 'utf-8');
  return JSON.parse(txt);
}

describe('interaction-manifest: selection route', () => {
  it('maps canvas.component.select -> canvas-component-select-symphony (no requested)', async () => {
    const manifest = await loadJson('public/interaction-manifest.json');
    const route = manifest?.routes?.['canvas.component.select'];
    expect(route).toBeTruthy();
    expect(route.pluginId).toBe('CanvasComponentPlugin');
    expect(route.sequenceId).toBe('canvas-component-select-symphony');
  });
});

