import { describe, it, expect } from 'vitest';
import pkg from '@renderx-plugins/digital-assets/package.json' with { type: 'json' };

describe('digital-assets workspace package', () => {
  it('resolves and exposes correct package name', () => {
    expect(pkg).toBeDefined();
    expect(pkg.name).toBe('@renderx-plugins/digital-assets');
  });
});

