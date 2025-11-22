/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { setFlagOverride, clearFlagOverrides, getFlagOverride } from '../src/temp-deps/feature-flags';

// We'll import rule engine dynamically in some tests to reset module state
import * as RuleEngine from '../src/temp-deps/rule-engine';

// sanitize
import { sanitizeHtml } from '../src/temp-deps/sanitizeHtml';

describe('feature-flags getFlagOverride', () => {
  beforeEach(() => {
    clearFlagOverrides();
  });
  it('returns overridden values and undefined when not set', () => {
    expect(getFlagOverride('nonexistent')).toBeUndefined();
    setFlagOverride('enableX', true);
    expect(getFlagOverride('enableX')).toBe(true);
    clearFlagOverrides();
    expect(getFlagOverride('enableX')).toBeUndefined();
  });
});

describe('rule-engine config getters/setters', () => {
  it('setAllRulesConfig then getAllRulesConfig returns same object', () => {
    const cfg = { update: { default: [ { id: 'rule-1' } ] } } as any;
    RuleEngine.setAllRulesConfig(cfg);
    expect(RuleEngine.getAllRulesConfig()).toBe(cfg);
  });

  it('loadAllRulesFromWindow pulls from global RenderX', async () => {
    // reset module state by re-importing
    vi.resetModules();
    (globalThis as any).RenderX = { componentRules: { update: { default: [ { id: 'rule-2' } ] } } };
    const fresh = await import('../src/temp-deps/rule-engine');
    fresh.loadAllRulesFromWindow();
    expect(fresh.getAllRulesConfig()).toEqual((globalThis as any).RenderX.componentRules);
  });
});

describe('sanitizeHtml', () => {
  it('removes scripts and dangerous attributes', () => {
    const dirty = `<div onclick="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">x</a></div>`;
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toMatch(/onclick/);
    expect(clean).not.toMatch(/<script>/i);
    expect(clean).not.toMatch(/javascript:/i);
  });

  it('allows safe data:image and http/https links', () => {
    const dirty = `<img src="data:image/png;base64,AAAA" /><a href="https://example.com">ok</a>`;
    const clean = sanitizeHtml(dirty);
    expect(clean).toMatch(/data:image\/png;base64/i);
    expect(clean).toMatch(/https:\/\/example.com/);
  });
});
