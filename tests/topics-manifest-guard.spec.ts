import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function loadJson(p: string) {
  const raw = readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

describe('Topics manifest guardrails', () => {
  const root = process.cwd();
  const topicsPath = path.join(root, 'topics-manifest.json');
  const pluginManifestPath = path.join(root, 'public', 'plugins', 'plugin-manifest.json');

  const topicsJson = loadJson(topicsPath);
  const topics = topicsJson?.topics || {};
  const keys = Object.keys(topics);

  it('includes critical Control Panel topics with routes', () => {
    const required = [
      'control.panel.ui.init.requested',
      'control.panel.ui.render.requested',
      'control.panel.ui.field.change.requested',
      'control.panel.selection.show.requested',
    ];

    for (const k of required) {
      expect(keys, `topics-manifest contains ${k}`).toContain(k);
      const routes = Array.isArray(topics[k]?.routes) ? topics[k].routes : [];
      expect(routes.length, `${k} routes length`).toBeGreaterThan(0);
      // Control Panel routes should be handled by ControlPanelPlugin
      const pluginIds = routes.map((r: any) => r?.pluginId).filter(Boolean);
      expect(pluginIds, `${k} plugin ids`).toContain('ControlPanelPlugin');
    }
  });

  it('classifies canvas drag topics correctly (start/end notify-only, move routed)', () => {
    // start/end notify-only
    expect(keys).toContain('canvas.component.drag.start');
    expect(keys).toContain('canvas.component.drag.end');
    expect(Array.isArray(topics['canvas.component.drag.start']?.routes) ? topics['canvas.component.drag.start'].routes.length : 0)
      .toBe(0);
    expect(Array.isArray(topics['canvas.component.drag.end']?.routes) ? topics['canvas.component.drag.end'].routes.length : 0)
      .toBe(0);

    // move is routed
    expect(keys).toContain('canvas.component.drag.move');
    const moveRoutes = Array.isArray(topics['canvas.component.drag.move']?.routes) ? topics['canvas.component.drag.move'].routes : [];
    expect(moveRoutes.length).toBeGreaterThan(0);
  });

  it('plugin-manifest contains ControlPanelPlugin (source of truth for runtime)', () => {
    const pluginManifest = loadJson(pluginManifestPath);
    const ids: string[] = Array.isArray(pluginManifest?.plugins)
      ? pluginManifest.plugins.map((p: any) => p?.id).filter((s: any) => typeof s === 'string' && s.length)
      : [];
    expect(ids).toContain('ControlPanelPlugin');
  });
});

