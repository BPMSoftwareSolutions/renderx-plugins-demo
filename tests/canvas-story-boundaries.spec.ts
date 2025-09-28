import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

type UiFile = {
  version: string;
  cssClasses?: Record<string, { name: string; content: string }>;
  components: Array<{
    id: string;
    type: string;
    parentId: string | null;
    template: { tag: string; classRefs?: string[] };
    layout: { x: number; y: number; width: number; height: number };
    content: any;
  }>;
};

const uiPath = path.join(process.cwd(), 'docs', 'digital-assets', 'event-router-story.canvas.ui');

describe('Event Router Story Canvas (.ui) — boundaries enforced', () => {
  it('has containers, nests SVGs inside scene containers, and includes people + bus labels', () => {
    const raw = fs.readFileSync(uiPath, 'utf-8');
    const ui: UiFile = JSON.parse(raw);

    expect(ui.version).toMatch(/^1\.0\./);

    // Containers present with rx-container class available
    expect(ui.cssClasses && ui.cssClasses['rx-container']).toBeTruthy();

    const containers = ui.components.filter(c => c.type === 'container');
    expect(containers.length).toBeGreaterThanOrEqual(3);

    const containerIds = new Set(containers.map(c => c.id));

    // All SVGs must be nested under a container
    const svgs = ui.components.filter(c => c.type === 'svg');
    expect(svgs.length).toBeGreaterThan(0);
    for (const s of svgs) {
      expect(s.parentId).not.toBeNull();
      expect(containerIds.has(s.parentId as string)).toBe(true);
    }

    // Content cues
    const textDump = svgs.map(s => String(s.content?.text || s.content?.content || '')).join(' ');
    expect(textDump).toMatch(/BUS/); // bus label present
    // include people/subscriber hints to show story realism
    expect(textDump).toMatch(/PEOPLE|SUBSCRIBER/i);

    // Scenes named as containers for contextual boundaries
    expect(containers.some(c => /scene-3/.test(c.id))).toBe(true);
    expect(containers.some(c => /scene-4/.test(c.id))).toBe(true);
    expect(containers.some(c => /scene-5/.test(c.id))).toBe(true);
  });
});

