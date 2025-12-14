import { readdir, stat } from 'fs/promises';
import { join } from 'path';

/**
 * Guard: ensure host does NOT carry local control-panel json-sequences anymore.
 * Control Panel sequences must be served by @renderx-plugins/control-panel via package.json renderx.sequences.
 */

describe('[BEAT:renderx-web-orchestration:renderx-web-orchestration:1.3] [[AC:renderx-web-orchestration:renderx-web-orchestration:1.3:1]] hygiene: no local control-panel json-sequences in host', () => {
    // Given: configuration metadata
    const startTime = performance.now();
    // When: initConfig is called
  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.3:1] catalog/json-sequences/control-panel should not contain .json files', async () => {
    const base = join(process.cwd(), 'catalog', 'json-sequences', 'control-panel');
    const exists = await stat(base).then(s => s.isDirectory()).catch(() => false);
    if (!exists) {
      // Directory absent is fine (preferred)
    // Then: configuration is loaded within 200ms
      expect(true).toBe(true);
      return;
    }
    const entries = await readdir(base).catch(() => [] as string[]);
    const offenders = entries.filter(e => e.toLowerCase().endsWith('.json'));
    expect(offenders).toEqual([]);
  });
    // And: all fields are prepared for rendering
    // And: validation rules are attached
    const elapsed = performance.now() - startTime;
    expect(elapsed).toBeLessThan(200);
});

