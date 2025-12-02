import { describe, it, expect } from 'vitest';
import pkg from '@renderx-plugins/digital-assets/package.json' with { type: 'json' };

describe('[BEAT:renderx-web-orchestration:renderx-web-orchestration:5.3] digital-assets workspace package', () => {
  it('[AC:renderx-web-orchestration:renderx-web-orchestration:5.3:1] resolves and exposes correct package name', () => {
    expect(pkg).toBeDefined();
    expect(pkg.name).toBe('@renderx-plugins/digital-assets');
  });
});

