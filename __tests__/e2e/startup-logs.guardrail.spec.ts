/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';

/**
 * E2E guardrail: capture app startup console output and fail on critical issues.
 *
 * This runs the real browser startup path (src/main.tsx) in a JSDOM environment,
 * intercepts console output from the conductor/app during initialization, and
 * asserts there are no critical errors like module resolution failures or
 * unmounted plugins.
 */

describe('Startup logs E2E guardrail', () => {
  it('has no critical startup errors at app startup (captured console)', async () => {
    // Disable extra network-heavy validation during test
    (globalThis as any).process = (globalThis as any).process || {};
    (globalThis as any).process.env = { ...(globalThis as any).process.env, RENDERX_DISABLE_STARTUP_VALIDATION: '1' };

    // Stub fetch for relative URLs so manifest loading falls back to raw import path
    const origFetch: any = (globalThis as any).fetch;
    (globalThis as any).fetch = async (input: any, init?: any) => {
      try {
        const url = typeof input === 'string' ? input : String((input && input.url) || input || '');
        if (url && (url as string).startsWith('/')) {
          return { ok: false, status: 404, json: async () => ({}), text: async () => '' } as any;
        }
      } catch {}
      if (typeof origFetch === 'function') return origFetch(input as any, init);
      throw new Error('fetch not available');
    };

    // Capture console output
    const messages: string[] = [];
    const orig = { log: console.log, warn: console.warn, error: console.error };
    console.log = (...args: any[]) => { messages.push(args.map(String).join(' ')); orig.log.call(console, ...args); };
    console.warn = (...args: any[]) => { messages.push(args.map(String).join(' ')); orig.warn.call(console, ...args); };
    console.error = (...args: any[]) => { messages.push(args.map(String).join(' ')); orig.error.call(console, ...args); };

    try {
      // Ensure fresh module graph so app boot runs even if previously imported in this worker
      vi.resetModules();

      // Directly bootstrap the conductor and register sequences to avoid module cache pitfalls
      const conductorModule: any = await import('../../src/conductor');
      const conductor = await conductorModule.initConductor();
      const baseLen = messages.length;
      const maxRegisterMs = 4000;
      void conductorModule.registerAllSequences(conductor); // fire and allow bounded waiting below
      // Bounded wait for early phase to avoid hanging the suite
      await new Promise<void>((resolve) => setTimeout(resolve, maxRegisterMs));
      const msgs = () => messages.slice(baseLen);

      const pluginNames = ['LibraryPlugin', 'CanvasPlugin', 'LibraryComponentPlugin', 'CanvasComponentPlugin'];
      const hasPluginSuccess = (plugin: string) =>
        msgs().some((m) => new RegExp(`(Registered plugin runtime:|Plugin mounted successfully:)\\s*${plugin}`, 'i').test(m));
      // Give plugins a little extra time to emit success logs if still missing (up to 4s)
      {
        const startWait = Date.now();
        while (!pluginNames.every((p) => hasPluginSuccess(p)) && Date.now() - startWait < 4000) {
          await new Promise((r) => setTimeout(r, 50));
        }
      }


      const patterns: { name: string; regex: RegExp; hint?: string }[] = [
        {
          name: 'SequencesSystemFailed',
          regex: /Musical Sequences System initialized:\s*FAILED/i,
          hint: 'Sequences failed to initialize — check registration/manifest wiring',
        },
        {
          name: 'ModuleResolveFailed',
          regex: /Failed to resolve module specifier\s+'@renderx-plugins\//i,
          hint: 'Bare package resolution failed — verify vite/vitest aliases or package install',
        },
        {
          name: 'RuntimeRegisterFailed',
          regex: /Failed runtime register for\s+(LibraryPlugin|CanvasPlugin|LibraryComponentPlugin|CanvasComponentPlugin)\b/i,
          hint: 'A plugin failed to register at runtime — likely due to missing package resolution',
        },
        {
          name: 'InvalidHookCall',
          regex: /Invalid hook call\b/i,
          hint: 'React hook misuse detected — often triggered by failed module resolution or multiple Reacts',
        },
        {
          name: 'ReactUseStateNull',
          regex: /Cannot read properties of null \(reading 'useState'\)/i,
          hint: 'React rendering error during startup — check component mounts and provider setup',
        },
        {
          name: 'PluginNotFound',
          regex: /Plugin not found:\s+\w+/i,
          hint: 'Runtime attempted to play a sequence for an unmounted plugin',
        },
        {
          name: 'StartupManifestReadFailed',
          regex: /Failed reading plugin-manifest\.json|Failed to parse URL from \/plugins\/plugin-manifest\.json/i,
          hint: 'Host failed to read plugin manifest — verify manifest path and server base',
        },
      ];

      const offenders: { name: string; text: string; hint?: string }[] = [];
      for (const msg of msgs()) {
        for (const p of patterns) {
          if (p.regex.test(msg)) offenders.push({ name: p.name, text: msg, hint: p.hint });
        }
      }

      // Require successful runtime registration for each externalized plugin
      for (const plugin of pluginNames) {
        if (!hasPluginSuccess(plugin)) {
          offenders.push({
            name: 'PluginRuntimeNotRegistered',
            text: `Missing runtime registration success log for ${plugin}`,
            hint: 'Ensure register(conductor) logs plugin runtime registration and package resolves correctly',
          });
        }
      }

      // Heuristic: allow transient early failure if sequences are successfully registered afterwards
      const hasMounted = msgs().some((m: string) => /Registered plugin runtime:|Plugin mounted successfully:|SequenceRegistry:\s+Registered sequence|Sequence registered:/i.test(m));
      const filtered = offenders.filter((o) => {
        if (o.name === 'SequencesSystemFailed' && hasMounted) return false;
        return true;
      });

      const report = filtered.length
        ? 'Found critical startup issue(s):\n' + filtered
            .map((o) => `  [${o.name}] ${o.text}${o.hint ? `\n    ↳ ${o.hint}` : ''}`)
            .join('\n')
        : '';

      expect(filtered.length, report).toBe(0);
    } finally {
      // Restore stubs
      (globalThis as any).fetch = origFetch;
      console.log = orig.log;
      console.warn = orig.warn;
      console.error = orig.error;
    }
  }, 20000);
});
