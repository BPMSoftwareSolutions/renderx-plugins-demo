import { describe, it, expect } from 'vitest';
import manifest from '../../json-plugins/plugin-manifest.json';

/**
 * TDD: Ensure host manifest references externalized Control Panel package
 * for both UI and runtime entries.
 */
describe('Control Panel plugin manifest uses external package specifier', () => {
  it('points UI and runtime to @renderx-plugins/control-panel', () => {
    const plugins = (manifest as any)?.plugins || [];
    const cp = plugins.find((p: any) => p?.id === 'ControlPanelPlugin');
    expect(cp, 'ControlPanelPlugin entry missing from plugin-manifest.json').toBeTruthy();

    expect(cp.ui?.module).toBe('@renderx-plugins/control-panel');
    expect(cp.ui?.export).toBe('ControlPanel');

    expect(cp.runtime?.module).toBe('@renderx-plugins/control-panel');
    expect(cp.runtime?.export).toBe('register');
  });
});

