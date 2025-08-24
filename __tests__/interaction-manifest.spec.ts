import { describe, it, expect } from 'vitest';
import { buildInteractionManifest } from '../scripts/generate-interaction-manifest';

describe('interaction-manifest generation', () => {
  it('merges per-plugin catalogs and component overrides with override precedence', () => {
    const catalogs = [
      { routes: { 'a': { pluginId: 'P1', sequenceId: 'S1' }, 'b': { pluginId: 'P1', sequenceId: 'S2' } } },
      { routes: { 'c': { pluginId: 'P2', sequenceId: 'S3' } } },
    ];
    const overrides = [
      { 'b': { pluginId: 'P3', sequenceId: 'S9' } },
      { 'd': { pluginId: 'P4', sequenceId: 'S4' } },
    ];

    const manifest = buildInteractionManifest(catalogs as any, overrides as any);
    expect(manifest.routes['a']).toEqual({ pluginId: 'P1', sequenceId: 'S1' });
    expect(manifest.routes['b']).toEqual({ pluginId: 'P3', sequenceId: 'S9' }); // overridden
    expect(manifest.routes['c']).toEqual({ pluginId: 'P2', sequenceId: 'S3' });
    expect(manifest.routes['d']).toEqual({ pluginId: 'P4', sequenceId: 'S4' });
  });
});

